"""Static file server for the Revision Tracker.

Serves the project folder over http:// — which the app genuinely requires.
Opened straight off the disk as file:///..., browsers refuse to start the
PDF.js web worker and block it fetching the PDF bytes, so every PDF panel
renders blank. Served over http:// none of that applies.

Run it via "Start Revision Tracker.bat" in the project root, or directly.
Safe to run twice: if the port is already serving, it just opens the browser.
"""

import functools
import http.server
import os
import socket
import sys
import webbrowser

# Always serve the project root (the parent of this .claude folder), never
# whatever directory the shortcut happened to launch us from.
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PORT = int(os.environ.get("PORT", "8777"))
# Opt-in: the .bat launcher passes --open. Left off, so tooling that starts
# this server in the background does not fling browser windows open.
OPEN_BROWSER = "--open" in sys.argv


def port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.4)
        return s.connect_ex(("127.0.0.1", port)) == 0


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # The app's assets are cache-busted with ?v=NN, but PDFs and the page
        # itself are not — tell the browser to always revalidate so an edit
        # never leaves a stale copy on screen.
        self.send_header("Cache-Control", "no-cache, must-revalidate")
        super().end_headers()

    def log_message(self, fmt, *args):
        # Keep the window readable: report failures, stay quiet about every 200.
        status = str(args[1]) if len(args) > 1 else ""
        if status.startswith(("4", "5")):
            sys.stderr.write("  missing: %s\n" % (args[0] if args else "?"))


url = "http://localhost:%d/" % PORT

if port_in_use(PORT):
    print("Already running at %s" % url)
    if OPEN_BROWSER:
        webbrowser.open(url)
    raise SystemExit(0)

handler = functools.partial(Handler, directory=ROOT)

try:
    httpd = http.server.ThreadingHTTPServer(("", PORT), handler)
except OSError as e:
    print("Could not start on port %d: %s" % (PORT, e))
    raise SystemExit(1)

print("AS Maths Revision Tracker")
print("Serving %s" % ROOT)
print("Open: %s" % url)
print("")
print("Keep this window open while you study. Closing it stops the site.")
print("")

if OPEN_BROWSER:
    webbrowser.open(url)

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nStopped.")
