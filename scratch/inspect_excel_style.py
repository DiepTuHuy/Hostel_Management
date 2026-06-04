import openpyxl

file_path = "/Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other computers/My Computer 3/D:/Study/System_Design/tests/Testing_Document.xlsx"
wb = openpyxl.load_workbook(file_path)
ws = wb.active

# Inspect cell style of header (Row 1) and data (Row 2)
for r_idx in [1, 2]:
    cell = ws.cell(r_idx, 1)
    print(f"Row {r_idx} Cell style:")
    print(f" - Value: {cell.value}")
    print(f" - Font: Name={cell.font.name}, Size={cell.font.size}, Bold={cell.font.bold}, Color={cell.font.color.rgb if cell.font.color else None}")
    print(f" - Fill: FillType={cell.fill.fill_type}, StartColor={cell.fill.start_color.rgb if cell.fill.start_color else None}")
    print(f" - Alignment: Horizontal={cell.alignment.horizontal}, Vertical={cell.alignment.vertical}")
    print(f" - Border: Top={cell.border.top.style if cell.border.top else None}, Left={cell.border.left.style if cell.border.left else None}")
