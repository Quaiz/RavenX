import sys

file_path = 'd:\\ThirdYearsInHell\\miniproject\\RavenX\\backend\\server.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

endpoint_code = """
@app.route("/api/trace", methods=["GET"])
def trace_ip():
    target = request.args.get('q')
    if not target:
        return jsonify({"error": "Missing target"}), 400
    try:
        # Resolve hostname to IP using socket if it's a domain, but ip-api supports domains natively.
        r = requests.get(f"http://ip-api.com/json/{target}", timeout=5)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
"""

if 'def trace_ip(' not in content:
    content = content.replace('if __name__ == "__main__":', endpoint_code + '\nif __name__ == "__main__":')
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Successfully inserted /api/trace endpoint')
else:
    print('Endpoint already exists')
