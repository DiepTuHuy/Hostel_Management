import docx

doc_path = "/Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other computers/My Computer 3/D:/Study/System_Design/docs/Báo cáo PTTKHT - Quản lý chuỗi nhà trọ (đã chỉnh sửa).docx"
doc = docx.Document(doc_path)

print("=== Table 16 Rows ===")
for r_idx, row in enumerate(doc.tables[16].rows):
    print(f"Row {r_idx:02d} | Col 0: '{row.cells[0].text.strip()}' | Col 1: '{row.cells[1].text.strip()[:100]}'")
