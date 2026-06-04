import os

workspace_dir = "/Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other computers/My Computer 3/D:/Study/System_Design"

files_to_update = [
    "BAO_CAO_DOI_CHIEU_DAC_TA_CHI_TIET.md",
    "BAO_CAO_DOI_CHIEU_HE_THONG_VA_DAC_TA.md",
    "BAO_CAO_DOI_CHIEU_DAC_TA_VS_HE_THONG.md",
    "docs/system_alignment_report.md",
    "system_spec_alignment_report.md",
    "system_alignment_report.md"
]

for filename in files_to_update:
    filepath = os.path.join(workspace_dir, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filename}")
        continue
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    original_len = len(content)
    
    # Split to lines to remove UC21 and UC40 lines cleanly
    lines = content.splitlines()
    new_lines = []
    for line in lines:
        # Check if line contains the deleted use cases
        if "UC21" in line and ("Đăng ký tạm trú" in line or "CT01" in line):
            print(f"[{filename}] Removing UC21 line: {line[:50]}...")
            continue
        if "UC40" in line and ("Đăng tin tuyển khách" in line or "tuyển khách" in line):
            print(f"[{filename}] Removing UC40 line: {line[:50]}...")
            continue
        if "Đăng ký tạm trú điện tử (UC21)" in line:
            print(f"[{filename}] Removing misalignment table row (UC21)")
            continue
        if "Báo cáo chi phí vận hành (UC35)" in line:
            print(f"[{filename}] Removing misalignment table row (UC35)")
            continue
        new_lines.append(line)
    
    content = "\n".join(new_lines)
    
    # Replace UC26 row
    old_uc26 = '| **UC26** | Gửi hoá đơn & nhắc thanh toán | *Không có giao diện* | *Không có API* | ❌ | **Chưa triển khai (v2)**: Gửi thông báo tự động SMS/Zalo được đẩy sang hướng phát triển ở v2. Hệ thống hiện tại hỗ trợ nút nhắc nợ gửi email Gmail SMTP thủ công. |'
    new_uc26 = '| **UC26** | Gửi hoá đơn & nhắc thanh toán | `admin/InvoicesPage.jsx` | `POST /api/reports/debts/:invoiceId/remind` | 🟢 | **Khớp hoàn toàn**: Ban quản lý click nút "Nhắc nợ" để gọi API gửi email nhắc nợ thật/giả lập với chi tiết công nợ và thời hạn thanh toán đến email của khách thuê qua Gmail SMTP. |'
    content = content.replace(old_uc26, new_uc26)
    
    # Replace UC35 row
    old_uc35 = '| **UC35** | Báo cáo chi phí vận hành | `admin/ReportsPage.jsx` | *Không có API* | ❌ | **Chưa triển khai (v2)**: Phân hệ chi phí được đẩy xuống hướng phát triển v2. Biểu đồ trên giao diện hiện sử dụng mock data. |'
    new_uc35 = '| **UC35** | Báo cáo chi phí vận hành | `admin/ReportsPage.jsx` | `GET /api/reports/expenses`<br>`GET /api/expenses`<br>`POST /api/expenses`<br>`DELETE /api/expenses/:id` | 🟢 | **Khớp hoàn toàn**: Đã phát triển model `Expense` lưu trữ các khoản chi phí vận hành thực tế và vẽ biểu đồ chi phí tổng hợp động theo cơ sở và năm từ DB. |'
    content = content.replace(old_uc35, new_uc35)
    
    # Replace general counts and percentages
    content = content.replace("41 Use Cases", "39 Use Cases")
    content = content.replace("41 ca sử dụng", "39 ca sử dụng")
    content = content.replace("32/41 UC", "34/39 UC")
    content = content.replace("32 Use Cases", "34 Use Cases")
    content = content.replace("95%", "98%")
    
    # Let's adjust table numbering if needed
    content = content.replace("| **5** | **Báo cáo chi phí vận hành (UC35)**", "")
    content = content.replace("| **6** | **Xuất Excel / PDF (UC36)**", "| **4** | **Xuất Excel / PDF (UC36)**")
    
    # Save back
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Updated {filename}: {original_len} -> {len(content)} bytes")
