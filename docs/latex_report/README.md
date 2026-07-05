# Báo cáo LaTeX — Hệ thống Quản lý Chuỗi Nhà trọ

Bản LaTeX của `docs/Báo cáo PTTKHT - Quản lý chuỗi nhà trọ (đã chỉnh sửa).docx`,
trang bìa thiết kế theo mẫu khung viền hoa văn + logo UTH, dùng 19 sơ đồ đã
kiểm chứng khớp hệ thống trong `docs/diagrams/`.

## Biên dịch

```bash
xelatex main.tex && xelatex main.tex   # chạy 2 lần để cập nhật mục lục
```

Yêu cầu: TeX Live với XeLaTeX (font TeX Gyre Termes có sẵn trong TeX Live).
Overleaf: chọn Compiler = XeLaTeX trong Menu.

## Sửa thông tin trang bìa

Mở `main.tex`, tìm khối `>>> THÔNG TIN TRANG BÌA — SỬA TẠI ĐÂY <<<`:
GVHD, SVTH (kiểm tra dấu tên), MSSV, Lớp, năm.

## Cập nhật sơ đồ (quan trọng)

Ảnh trong `images/diagrams/` đang là bản render CŨ. Sau khi render 19 PNG mới
từ `docs/diagrams/urls.txt` (lưu vào `docs/diagrams/png/`), chạy:

```bash
./update_diagrams.sh    # copy PNG mới vào images/diagrams/ rồi dịch lại
```

## Cấu trúc

| Đường dẫn | Nội dung |
|---|---|
| `main.tex` | Preamble, trang bìa, mục lục, ghép chương |
| `chapters/0_tomtat.tex` | Tóm tắt đồ án |
| `chapters/0_vietTat.tex` | Danh mục từ viết tắt |
| `chapters/1_khaosat.tex` … `4_tongket.tex` | Chương 1–4 |
| `chapters/5_tailieu.tex` | Tài liệu tham khảo |
| `images/cover/` | Khung viền + logo trang bìa |
| `images/diagrams/` | 19 sơ đồ (từ `docs/diagrams/png/`) |
| `images/ui/` | Ảnh chụp giao diện (từ file Word gốc) |

Số hiệu hình giữ nguyên như bản Word (kể cả Hình 2.6b) — dùng lệnh thủ công
thay vì đánh số tự động của LaTeX.
