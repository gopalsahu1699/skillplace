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

# Check tables that exist in live DB but not in schema.sql
extra = ["branches", "employees", "coupons", "training_programs", "program_courses",
         "user_sessions", "categories", "payments", "leads", "testimonials",
         "lesson_progress", "student_projects",
         "course_progress"]  # different from lesson_progress?

for table in extra:
    # Get count
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=*&limit=1"
    req = urllib.request.Request(url, headers={
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Prefer": "count=exact"
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            cr = resp.headers.get("Content-Range", "?")
            count = cr.split("/")[-1] if "/" in cr else "?"
            cols = list(data[0].keys()) if data else "empty"
            print(f"{table}: {count} rows | Cols: {cols}")
    except urllib.error.HTTPError as e:
        print(f"{table}: HTTP {e.code}")
    except Exception as e:
        print(f"{table}: error - {e}")
