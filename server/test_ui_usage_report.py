import importlib.util
import io
import json
import os
import tempfile
import unittest
from contextlib import redirect_stdout

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("ui_usage_report", os.path.join(HERE, "ui_usage_report.py"))
rep = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rep)

EVENTS = [
    {"type": "session", "sid": "aaaaaa", "device": "phone1", "ua": "iPhone", "rx": 100},
    {"type": "session", "sid": "bbbbbb", "device": "laptop", "ua": "Mac", "rx": 200},
    {"type": "ui", "via": "cmd", "cmd": "editSetting", "setting": "drag", "value": 0.3, "n": 12, "sid": "aaaaaa", "rx": 101},
    {"type": "ui", "via": "cmd", "cmd": "editSetting", "setting": "drag", "value": 0.1, "sid": "bbbbbb", "rx": 201},
    {"type": "ui", "via": "cmd", "cmd": "evolveStart", "auto": True, "sid": "aaaaaa", "rx": 100},
    {"type": "ui", "via": "click", "el": "button", "label": "Save", "ctx": "File", "sid": "aaaaaa", "rx": 102},
    {"type": "ui", "via": "key", "key": "z", "sid": "aaaaaa", "rx": 103},
    {"type": "sample", "sid": "aaaaaa", "rx": 104},
]


class ReportTest(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp()
        with open(os.path.join(self.dir, "2026-11-10.jsonl"), "w") as fh:
            fh.write("\n".join(json.dumps(e) for e in EVENTS) + "\nnot json\n")

    def rows(self, **kw):
        res = rep.tally(rep.read_events(self.dir), **kw)
        return res, {(r["via"], r["name"]): r for r in res["rows"]}

    def test_counts_one_record_as_one_use(self):
        res, rows = self.rows()
        drag = rows[("cmd", "editSetting:drag")]
        self.assertEqual(drag["uses"], 2)
        self.assertEqual(drag["sessions"], 2)
        self.assertEqual(res["sessions"], 2)
        self.assertIn(("click", "Save  [File]"), rows)
        self.assertIn(("key", "z"), rows)

    def test_auto_counted_apart(self):
        _, rows = self.rows()
        ev = rows[("cmd", "evolveStart")]
        self.assertEqual((ev["uses"], ev["auto"]), (0, 1))

    def test_device_filter(self):
        _, rows = self.rows(device="laptop")
        self.assertEqual(list(rows), [("cmd", "editSetting:drag")])

    def test_never_used(self):
        res, _ = self.rows()
        cmds, settings = rep.unused(res, ["editSetting", "evolveStart", "undo", "snapshotConfigs"], ["drag", "sensorGain"])
        self.assertEqual(cmds, ["evolveStart", "undo"])  # auto-only does not count as used
        self.assertEqual(settings, ["sensorGain"])

    def test_since_skips_older_files(self):
        self.assertEqual(list(rep.read_events(self.dir, since="2026-11-11")), [])

    def test_known_commands_parse_the_real_union(self):
        cmds = rep.known_commands(os.path.join(rep.REPO, "src/orchestrator/commands.ts"))
        self.assertIn("editSetting", cmds)
        self.assertIn("morphPlay", cmds)

    def test_main_prints(self):
        buf = io.StringIO()
        with redirect_stdout(buf):
            rep.main(["--dir", self.dir])
        out = buf.getvalue()
        self.assertIn("editSetting:drag", out)
        self.assertIn("commands never used", out)


if __name__ == "__main__":
    unittest.main()
