import sys

file_path = 'd:\\ThirdYearsInHell\\miniproject\\RavenX\\backend\\server.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

endpoint_code = """
import platform
import psutil
import threading

START_TIME = time.time()

@app.route("/api/logs", methods=["GET"])
def get_system_logs():
    try:
        uptime_seconds = int(time.time() - START_TIME)
        m, s = divmod(uptime_seconds, 60)
        h, m = divmod(m, 60)
        uptime_str = f"{h:02d}h {m:02d}m {s:02d}s"
        
        process = psutil.Process()
        mem_info = process.memory_info()
        
        return jsonify({
            "os": f"{platform.system()} {platform.release()}",
            "python_version": platform.python_version(),
            "uptime": uptime_str,
            "active_threads": threading.active_count(),
            "memory_usage_mb": round(mem_info.rss / 1024 / 1024, 2)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
"""

if 'def get_system_logs(' not in content:
    content = content.replace('if __name__ == "__main__":', endpoint_code + '\nif __name__ == "__main__":')
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Successfully inserted /api/logs endpoint')
else:
    print('Endpoint already exists')
