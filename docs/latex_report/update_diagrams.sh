#!/bin/bash
# Copy 19 PNG sơ đồ mới nhất từ docs/diagrams/png/ vào project rồi dịch lại PDF
set -e
cd "$(dirname "$0")"
cp ../docs/diagrams/png/*.png images/diagrams/
xelatex -interaction=nonstopmode main.tex >/dev/null
xelatex -interaction=nonstopmode main.tex >/dev/null
echo "Đã cập nhật sơ đồ và dịch lại: main.pdf"
