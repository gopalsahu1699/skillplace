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

# Search for more tables
extra_tables = [
    "training_programs", "course_programs", "payments", "invoices",
    "payment_records", "orders", "transactions", "razorpay_payments",
    "reviews", "course_reviews", "progress", "lesson_progress",
    "course_progress", "student_progress", "video_progress",
    "quiz_attempts", "test_attempts", "test_results", "quiz_results",
    "assignments", "submissions", "attendance", "schedules",
    "resources", "tags", "course_tags", "categories",
    "instructors", "course_instructors", "student_courses",
    "user_courses", "wishlist", "bookmarks", "settings",
    "site_settings", "app_settings", "features", "feature_flags",
    "email_templates", "email_logs", "audit_logs",
    "content_pages", "pages", "blog_posts", "faqs",
    "support_tickets", "ticket_messages", "chat_messages",
    "live_classes", "recordings", "webinars"
]

found = []
for table in extra_tables:
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=*&limit=1"
    req = urllib.request.Request(url, headers={
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}"
    })
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read())
            found.append(table)
            print(f"  {table}: {len(data)} rows - Columns: {list(data[0].keys()) if data else 'empty'}")
    except urllib.error.HTTPError:
        pass
    except:
        pass

print(f"\nAdditional tables found: {found}")
print(f"Total additional: {len(found)}")
