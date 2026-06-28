import json, urllib.request

env = {}
with open(r"C:\auto_skillplace\skillplace\.env.local", "r") as f:
    for line in f:
        line = line.strip()
        if "=" in line and not line.startswith("#"):
            key, val = line.split("=", 1)
            env[key.strip()] = val.strip()

SUPABASE_URL = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
if SUPABASE_URL.endswith("/rest/v1"):
    SUPABASE_URL = SUPABASE_URL[:-7]
SERVICE_KEY = env["SUPABASE_SERVICE_ROLE_KEY"]

tables = [
    "profiles", "courses", "lessons", "modules", "enrollments",
    "employees", "tests", "user_sessions", "certificates", "branches",
    "coupons", "program_courses", "notifications"
]

all_data = {}
for table in tables:
    # Fetch ALL rows (no limit)
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=*&limit=1000"
    req = urllib.request.Request(url, headers={
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}"
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
            all_data[table] = data
            print(f"{table}: {len(data)} rows fetched")
    except Exception as e:
        print(f"{table}: error - {e}")
        all_data[table] = []

# Get test questions if they exist in a separate table
for extra in ["test_questions", "questions", "quiz_questions", "test_answers", "options", "question_options"]:
    url = f"{SUPABASE_URL}/rest/v1/{extra}?select=*&limit=1000"
    req = urllib.request.Request(url, headers={
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}"
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            all_data[extra] = data
            print(f"{extra}: {len(data)} rows fetched")
    except urllib.error.HTTPError:
        pass
    except Exception:
        pass

with open(r"C:\auto_skillplace\skillplace\tmp_db_data.json", "w") as f:
    json.dump(all_data, f, indent=2, default=str)
print("\nDone! All data saved.")
