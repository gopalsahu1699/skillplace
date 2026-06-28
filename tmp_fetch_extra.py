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

tables = {
    "training_programs": None,
    "course_progress": None,
    "test_attempts": None,
    "live_classes": None,
}

for table in tables:
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=*&limit=1000"
    req = urllib.request.Request(url, headers={
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}"
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
            tables[table] = data
            print(f"{table}: {len(data)} rows")
            if data:
                for row in data:
                    print(json.dumps(row, indent=2))
    except Exception as e:
        print(f"{table}: error - {e}")

# Also get column info for empty tables by describing them
for table in ["course_progress", "test_attempts", "live_classes"]:
    if not tables[table]:
        # Try inserting a dummy row to see required columns from error
        # Or use the OpenAPI spec endpoint
        url = f"{SUPABASE_URL}/rest/v1/{table}?select=*&limit=0"
        req = urllib.request.Request(url, headers={
            "apikey": SERVICE_KEY,
            "Authorization": f"Bearer {SERVICE_KEY}"
        })
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                # Empty response but we can see column names from the range header
                print(f"\n{table} (empty): columns unknown from empty result")
        except Exception as e:
            print(f"{table}: describe error - {e}")

print("\nDone!")
