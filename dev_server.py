#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys

PORT = 8080

class FirebaseEmulatorHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Strip query parameters and anchors
        clean_path = self.path.split('?')[0].split('#')[0]

        # 1. Emulate "rewrites": /admin -> /admin/index.html
        if clean_path == '/admin' or clean_path == '/admin/':
            self.path = '/admin/index.html'
            return super().do_GET()

        # 2. Emulate "cleanUrls": true
        # If accessing a path like /contact, serve /contact.html if it exists
        if not clean_path.endswith('/') and not '.' in os.path.basename(clean_path):
            potential_file = clean_path.lstrip('/') + '.html'
            if os.path.exists(potential_file):
                self.path = clean_path + '.html'

        return super().do_GET()

    def end_headers(self):
        # 3. Emulate custom headers from firebase.json
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        
        # CSP rule matching firebase.json
        csp_value = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com https://www.gstatic.com https://cdn.emailjs.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https: blob:; "
            "connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com wss://firestore.googleapis.com https://api.emailjs.com; "
            "frame-src https://www.google.com; "
            "frame-ancestors 'none'"
        )
        self.send_header('Content-Security-Policy', csp_value)
        self.send_header('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')

        # Cache control emulator: disable caching for local development so edits take effect immediately
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')

        super().end_headers()

def run_server():
    # Allow port reuse to avoid "Address already in use" errors on restarts
    socketserver.TCPServer.allow_reuse_address = True
    
    try:
        with socketserver.TCPServer(("", PORT), FirebaseEmulatorHandler) as httpd:
            print("==================================================")
            print(f"🔥 Firebase-like Dev Server started successfully!")
            print(f"👉 Local URL: http://localhost:{PORT}")
            print(f"👉 Admin URL: http://localhost:{PORT}/admin")
            print("==================================================")
            print("Press Ctrl+C to stop the server.")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        sys.exit(0)
    except Exception as e:
        print(f"\nError starting server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    run_server()
