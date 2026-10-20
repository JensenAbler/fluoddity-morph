#!/usr/bin/env python3
"""Telemetry receiver for fluoddity-morph.

Accepts POST /api/log with {"sid": "...", "events": [...]} from the app (see
src/telemetry/telemetry.ts) and appends one JSON object per event to a daily
log: $LOG_DIR/YYYY-MM-DD.jsonl. Each line gets the server receive time and the
session id. GET /api/health answers "ok".

Stdlib only. Listens on 127.0.0.1 behind nginx, which also rate-limits and caps
body size; this process caps the body again and validates the shape, so a bad
or hostile request costs nothing and writes nothing.
"""
import json
import os
import re
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

LOG_DIR = os.environ.get("LOG_DIR", "/var/lib/fluoddity-morph/logs")
PORT = int(os.environ.get("PORT", "8787"))
MAX_BODY = 256 * 1024
MAX_EVENTS = 1000
SID = re.compile(r"^[0-9a-f]{6,32}$")
_lock = threading.Lock()


def append(sid, events):
    now = time.time()
    day = time.strftime("%Y-%m-%d", time.gmtime(now))
    path = os.path.join(LOG_DIR, f"{day}.jsonl")
    lines = []
    for ev in events[:MAX_EVENTS]:
        if not isinstance(ev, dict):
            continue
        ev = dict(ev)
        ev["sid"] = sid
        ev["rx"] = round(now, 3)
        lines.append(json.dumps(ev, separators=(",", ":"), ensure_ascii=False))
    if not lines:
        return 0
    with _lock:
        with open(path, "a", encoding="utf-8") as fh:
            fh.write("\n".join(lines) + "\n")
    return len(lines)


class Handler(BaseHTTPRequestHandler):
    server_version = "fm-log/1"

    def _reply(self, code, body=b""):
        self.send_response(code)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/api/health":
            self._reply(200, b"ok\n")
        else:
            self._reply(404)

    def do_POST(self):
        if self.path != "/api/log":
            return self._reply(404)
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            return self._reply(400)
        if length <= 0 or length > MAX_BODY:
            return self._reply(413)
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            return self._reply(400)
        if not isinstance(payload, dict):
            return self._reply(400)
        sid = payload.get("sid")
        events = payload.get("events")
        if not isinstance(sid, str) or not SID.match(sid) or not isinstance(events, list):
            return self._reply(400)
        written = append(sid, events)
        self._reply(204 if written else 400)

    def log_message(self, fmt, *args):  # quiet: the jsonl is the record
        pass


def main():
    os.makedirs(LOG_DIR, exist_ok=True)
    srv = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"fm-log listening on 127.0.0.1:{PORT}, writing {LOG_DIR}", file=sys.stderr, flush=True)
    srv.serve_forever()


if __name__ == "__main__":
    main()
