import docx
import os

doc_path = "/Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other computers/My Computer 3/D:/Study/System_Design/docs/Báo cáo PTTKHT - Quản lý chuỗi nhà trọ (đã chỉnh sửa).docx"
doc = docx.Document(doc_path)

png_dir = "/Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other computers/My Computer 3/D:/Study/System_Design/docs/diagrams/png"

mapping = {
    'rId9': '2.04_uc_contract.png',
    'rId62': '2.06b_uc_utilities.png',
}

print("Replacing new Use Case diagrams in docx...")
for rId, filename in mapping.items():
    img_path = os.path.join(png_dir, filename)
    if not os.path.exists(img_path):
        print(f"❌ Error: Image {filename} not found in {png_dir}!")
        continue
    
    if rId in doc.part.related_parts:
        part = doc.part.related_parts[rId]
        with open(img_path, 'rb') as f:
            part._blob = f.read()
        print(f"✅ Replaced relationship {rId} with {filename}")
    else:
        print(f"❌ Error: rId {rId} not found in document parts!")

doc.save(doc_path)
print("🎉 Word document images updated successfully!")
