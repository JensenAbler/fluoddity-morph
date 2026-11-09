#!/usr/bin/env python3
"""Tally the UI usage log: which controls get touched, how often, when last.

Reads the telemetry receiver's daily JSONL (default /var/lib/fluoddity-morph/logs)
and summarizes the `type: "ui"` lines written by src/telemetry/uiUsage.ts.

READ-ONLY, AND NOT A VERDICT. It shows what has and has not been used so far,
over the sessions that had the logging -- the evidence for simplifying the UI
later. Commands tagged `auto` (no real input just before) are counted apart.

    python3 server/ui_usage_report.py                 # everything, every device
    python3 server/ui_usage_report.py --devices       # list devices to filter by
    python3 server/ui_usage_report.py --device ID --since 2026-11-10
    python3 server/ui_usage_report.py --json          # machine-readable

The "never used" lists compare against the Command union in
src/orchestrator/commands.ts and the setting fields in src/ui/settingsSpec.ts.
"""
import argparse
import glob
import json
import os
import re
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
DEFAULT_DIR = os.environ.get("LOG_DIR", "/var/lib/fluoddity-morph/logs")


def read_events(log_dir, since=None):
    for path in sorted(glob.glob(os.path.join(log_dir, "*.jsonl"))):
        day = os.path.basename(path)[:10]
        if since and day < since:
            continue
        with open(path, encoding="utf-8", errors="replace") as fh:
            for line in fh:
                try:
                    ev = json.loads(line)
                except ValueError:
                    continue
                if isinstance(ev, dict):
                    yield ev


def row_name(ev):
    via = ev.get("via")
    if via == "cmd":
        target = ev.get("setting") or ev.get("field") or ev.get("layer") or ev.get("mode") or ev.get("surface")
        if target is None and isinstance(ev.get("settings"), dict):
            target = ",".join(sorted(ev["settings"]))
        return f"{ev.get('cmd')}:{target}" if target is not None else str(ev.get("cmd"))
    if via in ("click", "change"):
        name = ev.get("label") or "?"
        ctx = ev.get("ctx")
        return f"{name}  [{ctx}]" if ctx else name
    if via == "key":
        return str(ev.get("key"))
    if via == "canvas":
        return f"button {ev.get('button')} ({ev.get('pointer')})" + (f" {ev['el']}" if ev.get("el") else "")
    return json.dumps(ev, sort_keys=True)[:80]


def tally(events, device=None):
    """Aggregate ui events. Returns a dict: devices, rows, span, sessions."""
    events = list(events)
    sid_device = {}
    devices = {}
    for ev in events:
        if ev.get("type") == "session":
            dev = ev.get("device") or "(none)"
            sid_device[ev.get("sid")] = dev
            d = devices.setdefault(dev, {"sessions": 0, "ua": ev.get("ua", ""), "last": 0})
            d["sessions"] += 1
            d["last"] = max(d["last"], ev.get("rx", 0))
    rows = {}
    sessions = set()
    first = last = None
    for ev in events:
        if ev.get("type") != "ui":
            continue
        if device is not None and sid_device.get(ev.get("sid"), "(none)") != device:
            continue
        when = ev.get("rx") or (ev.get("t", 0) / 1000.0)
        first = when if first is None else min(first, when)
        last = when if last is None else max(last, when)
        sessions.add(ev.get("sid"))
        key = (ev.get("via"), row_name(ev))
        r = rows.setdefault(key, {"via": key[0], "name": key[1], "uses": 0, "auto": 0,
                                  "sessions": set(), "first": when, "last": when, "cmd": ev.get("cmd"),
                                  "setting": ev.get("setting")})
        if ev.get("auto"):
            r["auto"] += 1
        else:
            r["uses"] += 1
        r["sessions"].add(ev.get("sid"))
        r["first"] = min(r["first"], when)
        r["last"] = max(r["last"], when)
    for r in rows.values():
        r["sessions"] = len(r["sessions"])
    return {"devices": devices, "rows": list(rows.values()), "first": first, "last": last,
            "sessions": len(sessions)}


def known_commands(path):
    try:
        src = open(path, encoding="utf-8").read()
    except OSError:
        return []
    start = src.find("export type Command =")
    return sorted(set(re.findall(r"readonly kind: '(\w+)'", src[start:] if start >= 0 else src)))


def known_settings(path):
    try:
        src = open(path, encoding="utf-8").read()
    except OSError:
        return []
    return sorted(set(re.findall(r"\bfield: '(\w+)'", src)))


PLUMBING = {"snapshotConfigs", "restoreConfigs", "clearSaveError"}


def unused(result, commands, settings):
    used_cmds = {r["cmd"] for r in result["rows"] if r["via"] == "cmd" and r["uses"] > 0}
    used_settings = {r["setting"] for r in result["rows"] if r["via"] == "cmd" and r["uses"] > 0 and r["setting"]}
    return ([c for c in commands if c not in used_cmds and c not in PLUMBING],
            [s for s in settings if s not in used_settings])


def day(ts):
    return time.strftime("%Y-%m-%d", time.localtime(ts)) if ts else "-"


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dir", default=DEFAULT_DIR)
    ap.add_argument("--since", help="YYYY-MM-DD, by log file day")
    ap.add_argument("--device", help="only sessions from this device id (see --devices)")
    ap.add_argument("--devices", action="store_true", help="list devices and exit")
    ap.add_argument("--commands", default=os.path.join(REPO, "src/orchestrator/commands.ts"))
    ap.add_argument("--settings", default=os.path.join(REPO, "src/ui/settingsSpec.ts"))
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args(argv)

    result = tally(read_events(args.dir, args.since), args.device)
    if args.devices:
        for dev, d in sorted(result["devices"].items(), key=lambda kv: -kv[1]["last"]):
            print(f"{dev:14} {d['sessions']:4} sessions, last {day(d['last'])}  {d['ua'][:70]}")
        return 0
    never_cmds, never_settings = unused(result, known_commands(args.commands), known_settings(args.settings))
    if args.json:
        json.dump({**result, "neverUsedCommands": never_cmds, "neverUsedSettings": never_settings},
                  sys.stdout, indent=1, default=str)
        print()
        return 0

    print(f"UI usage {day(result['first'])} .. {day(result['last'])}, {result['sessions']} logged sessions"
          + (f", device {args.device}" if args.device else ""))
    for via in ("cmd", "click", "change", "key", "canvas"):
        rows = sorted((r for r in result["rows"] if r["via"] == via), key=lambda r: (-r["uses"], r["name"]))
        if not rows:
            continue
        print(f"\n== {via} ==   uses  auto  sessions  last")
        for r in rows:
            print(f"  {r['uses']:6} {r['auto']:5} {r['sessions']:8}  {day(r['last'])}  {r['name']}")
    print(f"\n== commands never used ({len(never_cmds)}) ==")
    print("  " + (", ".join(never_cmds) or "none"))
    print(f"\n== settings never edited ({len(never_settings)}) ==")
    print("  " + (", ".join(never_settings) or "none"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
