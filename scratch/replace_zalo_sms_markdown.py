import os

workspace_dir = "/Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other computers/My Computer 3/D:/Study/System_Design"

files_to_update = [
    "BAO_CAO_DOI_CHIEU_DAC_TA_CHI_TIET.md",
    "BAO_CAO_DOI_CHIEU_HE_THONG_VA_DAC_TA.md",
    "BAO_CAO_DOI_CHIEU_DAC_TA_VS_HE_THONG.md",
    "docs/system_alignment_report.md",
    "system_spec_alignment_report.md",
    "system_alignment_report.md",
    "README.md",
    "UI_Audit_Report.md",
    "UI_Design_Brief - Quản lý chuỗi nhà trọ.md"
]

replacements = [
    ("Các kênh SMS/Zalo được đẩy sang v2", "Kênh thông báo qua Telegram Bot và Email hoạt động thực tế"),
    ("kênh SMS/Zalo đẩy sang v2", "kênh Telegram Bot và Email"),
    ("kênh SMS/Zalo", "kênh Telegram và Email"),
    ("SMS/Zalo/Email", "Telegram/Email"),
    ("SMS/Zalo", "Telegram"),
    ("Zalo/SMS/Email", "Telegram/Email"),
    ("Zalo/SMS", "Telegram"),
    ("Zalo OA", "Telegram Bot"),
    ("Zalo", "Telegram"),
    ("SMS Brandname", "Telegram Bot"),
    ("SMS Brand", "Telegram Bot"),
    ("SMS", "Telegram"),
    ("OTP qua Telegram", "OTP qua Email"),
    ("OTP gửi qua email/Telegram", "OTP gửi qua email"),
    ("OTP qua email/Telegram", "OTP qua email"),
]

for filename in files_to_update:
    filepath = os.path.join(workspace_dir, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filename}")
        continue
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    original = content
    for old, new in replacements:
        content = content.replace(old, new)
        
    if original != content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✅ Updated {filename}")
    else:
        print(f"ℹ️ No changes needed for {filename}")
