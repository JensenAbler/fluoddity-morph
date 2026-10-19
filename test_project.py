"""Validation for fluoddity-morph: the app's own TypeScript checks and test suite.

The project template's validation command is `python3 -m unittest discover`,
so this wraps the real checks (tsc + node --test) rather than duplicating them.
"""
import os
import subprocess
import unittest

ROOT = os.path.dirname(os.path.abspath(__file__))


class AppChecks(unittest.TestCase):
    def run_npm(self, *args):
        if not os.path.isdir(os.path.join(ROOT, 'node_modules')):
            subprocess.run(['npm', 'ci', '--no-audit', '--no-fund'], cwd=ROOT, check=True)
        return subprocess.run(['npm', *args], cwd=ROOT, capture_output=True, text=True)

    def test_typecheck(self):
        r = self.run_npm('run', 'typecheck')
        self.assertEqual(r.returncode, 0, r.stdout[-4000:] + r.stderr[-4000:])

    def test_suite(self):
        r = self.run_npm('test')
        self.assertEqual(r.returncode, 0, r.stdout[-4000:] + r.stderr[-4000:])


if __name__ == '__main__':
    unittest.main()
