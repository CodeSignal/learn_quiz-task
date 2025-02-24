from http.server import HTTPServer, SimpleHTTPRequestHandler
import json

class RequestHandler(SimpleHTTPRequestHandler):
    def send_json_response(self, status_code: int, data: dict) -> None:
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')  # Configure as needed
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_GET(self):
        return SimpleHTTPRequestHandler.do_GET(self)
    
    def do_POST(self):
        if self.path == '/answers':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            data = json.loads(post_data)
            formatted_data = json.dumps(data, indent=2)
            with open('answers.json', 'w') as f:
                f.write(formatted_data)
            
            self.send_json_response(200, {'status': 'success'})
        else:
            self.send_json_response(404, {'error': 'Not Found'})

def run_server(port: int = 3000) -> None:
    try:
        server_address = ('', port)
        httpd = HTTPServer(server_address, RequestHandler)
        print(f"Server running on port {port}...")
        httpd.serve_forever()
    except Exception as e:
        print(f"Failed to start server: {str(e)}")
        exit(1)

if __name__ == '__main__':
    run_server()
