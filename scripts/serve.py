"""Local web server for trying the app on your computer.

Run:  npm start          (or: python3 scripts/serve.py 8000)
Then open http://localhost:8000 in your browser. Press Ctrl+C to stop.

It is Python's built-in `http.server`, plus one change: it tells the browser not
to reuse old copies of files, so your edits (e.g. to content/tips.js) always show
up when you reload. Phones on the same Wi-Fi can open http://<this computer's IP>:8000.
"""

import functools
import http.server
import sys
from pathlib import Path


class FreshFilesHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".webmanifest": "application/manifest+json",
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")  # always check for a newer file
        super().end_headers()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    app_folder = Path(__file__).resolve().parent.parent
    handler = functools.partial(FreshFilesHandler, directory=str(app_folder))
    print(f"Serving the app at http://localhost:{port}  (press Ctrl+C to stop)")
    http.server.ThreadingHTTPServer(("", port), handler).serve_forever()


if __name__ == "__main__":
    main()
