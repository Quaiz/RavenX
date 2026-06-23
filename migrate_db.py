import sqlite3
import libsql_client

URL = "https://ravenx-quainz.aws-us-east-1.turso.io"
TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODAyNjA4MDYsImlkIjoiMDE5ZTdmZDAtMDAwMS03ZmMwLTlmYTEtOTZjMDE2MDA2M2Q1IiwicmlkIjoiOTRiYWJhMmYtNTc5YS00NDFiLTlhM2ItOTU1ZmE4OGFkYzJiIn0.dG1SYLDOkx87RvD5elF5zudN8Lf8pZN6hJgTZlNtvyOja7nHLdK7ixXcstJud-7FEgNIBrGAoLoLbu0UGhrQAQ"

# Local DB
conn = sqlite3.connect(r'd:\ThirdYearsInHell\miniproject\RavenX\backend\ravenx.db')
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# Get data
cur.execute("SELECT id, username, password_hash, created_at FROM users")
users = cur.fetchall()

cur.execute("SELECT user_id, token, created_at FROM sessions")
sessions = cur.fetchall()

cur.execute("SELECT user_id, layout_json, updated_at FROM user_layouts")
layouts = cur.fetchall()

client = libsql_client.create_client_sync(url=URL, auth_token=TOKEN)

try:
    print("Creating tables on Turso...")
    client.batch([
        '''CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''',
        '''CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )''',
        '''CREATE TABLE IF NOT EXISTS user_layouts (
            user_id INTEGER PRIMARY KEY,
            layout_json TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )'''
    ])
    print("Tables created.")
    
    if users:
        print(f"Migrating {len(users)} users...")
        stmts = []
        for u in users:
            stmts.append(libsql_client.Statement("INSERT OR REPLACE INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)", [u['id'], u['username'], u['password_hash'], u['created_at']]))
        client.batch(stmts)
        
    if sessions:
        print(f"Migrating {len(sessions)} sessions...")
        stmts = []
        for s in sessions:
            stmts.append(libsql_client.Statement("INSERT OR REPLACE INTO sessions (user_id, token, created_at) VALUES (?, ?, ?)", [s['user_id'], s['token'], s['created_at']]))
        client.batch(stmts)
        
    if layouts:
        print(f"Migrating {len(layouts)} layouts...")
        stmts = []
        for l in layouts:
            stmts.append(libsql_client.Statement("INSERT OR REPLACE INTO user_layouts (user_id, layout_json, updated_at) VALUES (?, ?, ?)", [l['user_id'], l['layout_json'], l['updated_at']]))
        client.batch(stmts)

    print("Migration completed successfully!")
except Exception as e:
    print(f"Migration failed: {e}")
finally:
    client.close()
    conn.close()
