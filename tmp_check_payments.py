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

# Check if payments table already exists
url = f"{SUPABASE_URL}/rest/v1/payments?select=*&limit=1"
req = urllib.request.Request(url, headers={
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}"
})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read())
        print(f"payments table EXISTS, {len(data)} rows")
except urllib.request.HTTPError as e:
    if e.code == 404:
        print("payments table DOES NOT EXIST - need to create via SQL Editor")
    else:
        print(f"Error: HTTP {e.code}")
except Exception as e:
    print(f"Error: {e}")
