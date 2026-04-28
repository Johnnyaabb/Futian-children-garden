from flask import Flask, send_file, jsonify, request
from flask_cors import CORS
import sqlite3, os

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.expanduser("~/福田儿童公园数据库/futian_poi.db")

@app.route("/")
def index():
    return send_file("index.html")

@app.route("/<path:filename>")
def static_files(filename):
    return send_file(filename)

@app.route("/api/poi/search")
def search_poi():
    q = request.args.get("q", "").strip()
    limit = min(int(request.args.get("limit", 100)), 300)
    if not q or len(q) < 1:
        return jsonify([])
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("""
        SELECT name, address, small_type, big_type, wgs84_lng, wgs84_lat
        FROM poi
        WHERE (name LIKE ? OR small_type LIKE ? OR big_type LIKE ? OR address LIKE ?)
          AND wgs84_lng != '' AND wgs84_lat != ''
          AND CAST(wgs84_lng AS REAL) BETWEEN 113.95 AND 114.12
          AND CAST(wgs84_lat AS REAL) BETWEEN 22.48 AND 22.62
        LIMIT ?
    """, [f"%{q}%"]*4 + [limit])
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    # 过滤掉无效坐标
    result = []
    for r in rows:
        try:
            lat, lng = float(r["wgs84_lat"]), float(r["wgs84_lng"])
            result.append({"name": r["name"], "addr": r["address"],
                           "type": r["small_type"], "cat": r["big_type"],
                           "lat": round(lat,6), "lng": round(lng,6)})
        except:
            pass
    return jsonify(result)

if __name__ == "__main__":
    app.run(port=3737, debug=False)
