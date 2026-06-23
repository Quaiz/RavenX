import sys

file_path = 'd:\\ThirdYearsInHell\\miniproject\\RavenX\\backend\\server.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

endpoint_code = """
@app.route("/api/webcam/search", methods=["GET"])
def webcam_search():
    city = request.args.get("city", "Tokyo")
    try:
        import urllib.request
        import urllib.parse
        import re
        query = urllib.parse.quote(f"{city} live cam")
        url = f"https://www.youtube.com/results?search_query={query}&sp=EgJAAQ%253D%253D"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req).read().decode('utf-8')
        video_ids = re.findall(r"watch\?v=(\S{11})", html)
        unique_ids = list(dict.fromkeys(video_ids))
        if unique_ids:
            return jsonify({"videoId": unique_ids[0], "title": f"Live Camera: {city}"})
        return jsonify({"error": "No live cameras found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
"""

if 'def webcam_search(' not in content:
    content = content.replace('if __name__ == "__main__":', endpoint_code + '\nif __name__ == "__main__":')
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Successfully inserted webcam_search endpoint')
else:
    print('Endpoint already exists')
