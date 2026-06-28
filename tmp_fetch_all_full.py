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

# Fetch ALL rows from every existing table
all_tables = [
    "profiles", "employees", "branches", "courses", "modules", "lessons",
    "training_programs", "program_courses", "enrollments", "tests",
    "test_questions", "test_attempts", "certificates", "coupons",
    "leads", "testimonials", "user_sessions", "notifications",
    "lesson_progress", "live_classes", "student_projects", "course_progress"
]

all_data = {}
table_counts = {}
for table in all_tables:
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=*&limit=5000"
    req = urllib.request.Request(url, headers={
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Prefer": "count=exact"
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
            cr = resp.headers.get("Content-Range", "")
            count = cr.split("/")[-1] if "/" in cr else str(len(data))
            all_data[table] = data
            table_counts[table] = count
            cols = list(data[0].keys()) if data else []
            print(f"{table}: {count} rows, cols={cols}")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print(f"{table}: NOT FOUND")
        else:
            print(f"{table}: HTTP {e.code}")
    except Exception as e:
        print(f"{table}: error - {e}")

# Save full data
with open(r"C:\auto_skillplace\skillplace\tmp_full_dump.json", "w", encoding="utf-8") as f:
    json.dump(all_data, f, indent=2, default=str, ensure_ascii=False)

print(f"\nSaved to tmp_full_dump.json")
print(f"\nSummary of tables WITH data:")
for t, c in sorted(table_counts.items()):
    if int(c) > 0 if c.isdigit() else all_data.get(t):
        print(f"  {t}: {c} rows")
