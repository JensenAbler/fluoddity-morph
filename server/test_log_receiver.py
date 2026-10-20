import json
import os
import tempfile
import threading
import unittest
import urllib.request
from http.server import ThreadingHTTPServer

import importlib.util

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("log_receiver", os.path.join(HERE, "log_receiver.py"))
lr = importlib.util.module_from_spec(spec)
spec.loader.exec_module(lr)


class ReceiverTest(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp()
        lr.LOG_DIR = self.dir
        self.srv = ThreadingHTTPServer(("127.0.0.1", 0), lr.Handler)
        threading.Thread(target=self.srv.serve_forever, daemon=True).start()
        self.url = f"http://127.0.0.1:{self.srv.server_address[1]}"

    def tearDown(self):
        self.srv.shutdown()

    def post(self, body):
        req = urllib.request.Request(self.url + "/api/log", data=body, method="POST",
                                     headers={"Content-Type": "application/json"})
        try:
            return urllib.request.urlopen(req).status
        except urllib.error.HTTPError as e:
            return e.code

    def test_writes_jsonl(self):
        body = json.dumps({"sid": "abc123", "events": [{"type": "mark", "mark": "up"}]}).encode()
        self.assertEqual(self.post(body), 204)
        files = os.listdir(self.dir)
        self.assertEqual(len(files), 1)
        line = json.loads(open(os.path.join(self.dir, files[0])).read().strip())
        self.assertEqual(line["mark"], "up")
        self.assertEqual(line["sid"], "abc123")
        self.assertIn("rx", line)

    def test_rejects_bad_shapes(self):
        self.assertEqual(self.post(b"not json"), 400)
        self.assertEqual(self.post(json.dumps({"sid": "../x", "events": []}).encode()), 400)
        self.assertEqual(self.post(json.dumps({"sid": "abc123", "events": "x"}).encode()), 400)
        self.assertEqual(os.listdir(self.dir), [])


if __name__ == "__main__":
    unittest.main()
