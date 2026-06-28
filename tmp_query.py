import json, urllib.request

# Read env file
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
SUPABASE_URL = SUPABASE_URL.rstrip("/")

ANON_KEY = env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
SERVICE_KEY = env["SUPABASE_SERVICE_ROLE_KEY"]

print(f"URL: {SUPABASE_URL}")
print(f"Anon key len: {len(ANON_KEY)}")
print(f"Service key len: {len(SERVICE_KEY)}")

known_tables = [
    "profiles", "courses", "lessons", "modules", "enrollments",
    "employees", "tests", "user_sessions", "certificates", "branches",
    "programs", "coupons", "program_courses", "lesson_progress",
    "course_reviews", "notifications", "payments", "invoices",
    "wishlist", "categories", "instructors", "student_progress",
    "video_progress", "quiz_results", "assignments", "submissions",
    "attendance", "schedules", "resources", "tags", "course_tags"
]

found = {}
for table in known_tables:
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=*&limit=3"
    req = urllib.request.Request(url, headers={
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}"
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            found[table] = data
            print(f"  {table}: {len(data)} sample rows")
            if data:
                print(f"    Columns: {list(data[0].keys())}")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        if e.code == 404:
            pass  # Table doesn't exist
        else:
            print(f"  {table}: HTTP {e.code} - {body[:100]}")
    except Exception as e:
        print(f"  {table}: error - {str(e)[:100]}")

print(f"\nExisting tables: {list(found.keys())}")

# Get count for each table
print("\n--- ROW COUNTS ---")
for table in found:
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=*&limit=0"
    req = urllib.request.Request(url, headers={
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Prefer": "count=exact"
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            content_range = resp.headers.get("Content-Range", "")
            # Format: */COUNT or 0-0/COUNT
            count = content_range.split("/")[-1] if "/" in content_range else "?"
            print(f"  {table}: {count} rows")
    except:
        print(f"  {table}: count error")

# Save full data for building the doc
with open(r"C:\auto_skillplace\skillplace\tmp_db_data.json", "w") as f:
    json.dump(found, f, indent=2, default=str)
print("\nSaved full data to tmp_db_data.json")
