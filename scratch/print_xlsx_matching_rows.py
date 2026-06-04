import openpyxl

file_path = "/Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other computers/My Computer 3/D:/Study/System_Design/tests/Testing_Document.xlsx"
wb = openpyxl.load_workbook(file_path)
ws = wb.active

matching_rows = [10, 15, 17, 18, 19, 126]
for r in matching_rows:
    row_vals = [cell.value for cell in ws[r]]
    print(f"\n--- Row {r} (ID: {row_vals[0]}, Function: {row_vals[1]}) ---")
    print(f"Steps:\n{row_vals[2]}")
    print(f"Input:\n{row_vals[3]}")
    print(f"Expected:\n{row_vals[4]}")
    print(f"Actual:\n{row_vals[5]}")
    print(f"Status:\n{row_vals[6]}")
