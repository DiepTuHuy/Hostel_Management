# Báo cáo Kiểm tra UI — Hệ thống Quản lý Chuỗi Nhà Trọ

> **Ngày kiểm tra:** 22/05/2026  
> **Tài liệu đặc tả gốc:** `Báo cáo PTTKHT - Quản lý chuỗi nhà trọ (đã chỉnh sửa).docx`  
> **Phạm vi kiểm tra:** 4 folder UI — `Admin_UI`, `Manager_UI`, `Tenant_UI`, `Visitor_UI`

---

## 1. Tóm tắt nhanh

| Folder | Tổng màn hình | Đúng | Thừa / Sai role | Thiếu |
|---|:-:|:-:|:-:|:-:|
| Admin_UI | 12 | 9 | 3 | 0 |
| Manager_UI | 12 | 9 | 2 | 1 |
| Tenant_UI | — | — | — | 5 |
| Visitor_UI | 13 | 8 | 3 | 0 |

> **Lưu ý:** Vấn đề hoán đổi màn hình giữa `Tenant_UI` và `Visitor_UI` đã được chủ dự án tự khắc phục (đổi tên folder). Báo cáo này ghi lại toàn bộ phân tích gốc và các việc còn lại cần xử lý.

---

## 2. Tham chiếu đặc tả — Màn hình yêu cầu theo role

### 2.1 Chủ trọ (Admin) — `/admin`

Theo Chương 3 đặc tả và `UI_Design_Brief.md`, Admin cần **8 màn hình**:

| # | Màn hình | Nội dung chính |
|---|---|---|
| 1 | Dashboard tổng quan | 4 KPI cards (doanh thu, lấp đầy, công nợ, chi phí), biểu đồ đường 12 tháng, bản đồ VN đánh marker nhà trọ, bảng Top 5 cơ sở, Activity feed |
| 2 | Nhà trọ & chi nhánh | Card grid từng nhà trọ, modal Thêm/Sửa nhà trọ (form 2 cột + map pick toạ độ) |
| 3 | Người dùng & phân quyền | Table người dùng với tabs, bulk actions, modal tạo Quản lý |
| 4 | Hợp đồng | Filter row, table hợp đồng, slide-over panel xem PDF |
| 5 | Hoá đơn | Sub-tabs: Hoá đơn / Công nợ; filter kỳ/cơ sở/trạng thái; bulk-action phát hành lô |
| 6 | Công nợ | Bảng tổng hợp theo khách thuê, CTA gửi nhắc nợ hàng loạt |
| 7 | Cấu hình dịch vụ & đơn giá | Bảng đơn giá inline-editable, modal thiết lập bậc thang điện |
| 8 | Báo cáo & thống kê | Sidebar filter, tabs Doanh thu/Lấp đầy/Công nợ/Chi phí, biểu đồ + bảng + nút xuất Excel/PDF |
| 9 | Cài đặt hệ thống | Thông tin doanh nghiệp, mẫu hợp đồng, kênh thông báo, tích hợp cổng thanh toán |

### 2.2 Quản lý (Manager) — `/manager`

Đặc tả yêu cầu **6 nhóm màn hình** cho Manager:

| # | Màn hình | Nội dung chính |
|---|---|---|
| 1 | Dashboard chi nhánh | Branch Switcher, 3 KPI cards, lịch tháng, danh sách tác vụ hôm nay |
| 2 | Phòng & tài sản | Grid view phòng (màu theo trạng thái), filter bar, slide-over chi tiết phòng, quản lý tài sản |
| 3 | Khách thuê & hợp đồng | Table hợp đồng (scoped), stepper 3 bước tạo hợp đồng mới |
| 4 | Ghi chỉ số điện nước | Bảng inline-editable, sticky toolbar (Lưu nháp / Cảnh báo / Phát hành lô), cell warning |
| 5 | Xác nhận thu tiền mặt | Danh sách hoá đơn chờ xác nhận, modal xác nhận với upload ảnh biên lai |
| 6 | Thông báo | Inbox dạng feed, filter Tất cả/Chưa đọc/Quan trọng |

### 2.3 Khách thuê (Tenant) — `/tenant` (mobile-first)

Đặc tả yêu cầu **5 màn hình** (ưu tiên mobile 360–767 px):

| # | Màn hình | Nội dung chính |
|---|---|---|
| 1 | Trang chủ | Greeting card, Hero card hoá đơn tháng (tổng tiền lớn + hạn + breakdown + CTA Thanh toán ngay), Thông báo gần đây, Card hợp đồng hiệu lực |
| 2 | Hợp đồng của tôi | Danh sách thẻ hợp đồng (hiện tại + lịch sử), trang chi tiết PDF viewer |
| 3 | Hoá đơn / Lịch sử | Filter chip trạng thái, list items, trang chi tiết hoá đơn (bảng breakdown + chỉ số điện nước) |
| 4 | Thanh toán hoá đơn | Chọn phương thức (VNPay/MoMo/QR/Tiền mặt), redirect cổng hoặc hiển thị mã giao dịch, màn hình thành công + biên lai PDF |
| 5 | Hồ sơ cá nhân | Avatar, thông tin cá nhân, bảo mật (đổi MK, 2FA), cài đặt thông báo, nút Đăng xuất |

### 2.4 Khách vãng lai (Visitor) — Public site

Đặc tả yêu cầu **4 màn hình** (không cần đăng nhập, tối ưu SEO):

| # | Màn hình | Nội dung chính |
|---|---|---|
| 1 | Trang chủ | Hero + form tìm kiếm nhanh, section Nổi bật (3-4 nhà trọ), section Vì sao chọn chúng tôi, Footer |
| 2 | Tìm phòng | Layout 2 cột (sidebar filter + kết quả grid), toggle Grid/List/Bản đồ, sort |
| 3 | Chi tiết phòng | Gallery ảnh carousel, thông tin phòng, bản đồ, Card đặt cọc sticky |
| 4 | Đặt cọc | Stepper 3 bước (Thông tin → Xác nhận → Thanh toán), màn hình thành công + biên lai |

---

## 3. Kết quả kiểm tra chi tiết

### 3.1 Admin_UI

**Trạng thái chung: ✅ Đủ màn hình chính — có 3 điểm cần xem lại**

| Folder | Tiêu đề màn hình | Trạng thái | Ghi chú |
|---|---|:-:|---|
| `dashboard_t_ng_quan` | Bảng điều khiển | ✅ Đúng | |
| `qu_n_l_nh_tr` | Quản lý nhà trọ | ✅ Đúng | |
| `qu_n_l_ng_i_d_ng` | Quản lý người dùng | ✅ Đúng | |
| `qu_n_l_h_p_ng` | Quản lý Hợp đồng | ✅ Đúng | |
| `qu_n_l_h_a_n` | Quản lý Hóa đơn | ✅ Đúng | |
| `qu_n_l_c_ng_n` | Quản lý công nợ | ✅ Đúng | |
| `qu_n_l_d_ch_v` | Quản lý dịch vụ | ✅ Đúng | |
| `b_o_c_o_th_ng_k` | Báo cáo thống kê | ✅ Đúng | |
| `c_i_t_h_th_ng` | Cài đặt hệ thống | ✅ Đúng | |
| `l_ch_s_thanh_to_n` | Lịch sử giao dịch | ⚠️ Thừa | Đặc tả không có màn hình "Lịch sử giao dịch" riêng cho Admin — nên gộp vào tab Hoá đơn hoặc Công nợ |
| `trung_t_m_th_ng_b_o` | Trung tâm thông báo | ⚠️ Thừa | Đặc tả chỉ có Activity feed nhúng trong Dashboard, không có trang Thông báo riêng cho Admin |
| `qu_n_l_lo_i_ph_ng` | Quản lý loại phòng | ⚠️ Sai role | Theo UC-B đặc tả, quản lý loại phòng & tiện nghi là thao tác của **Manager**, không phải Admin — nên chuyển sang Manager_UI hoặc gộp vào màn hình Phòng của Manager |

---

### 3.2 Manager_UI

**Trạng thái chung: ✅ Đủ màn hình chính — có 2 màn hình nhầm role**

| Folder | Tiêu đề màn hình | Trạng thái | Ghi chú |
|---|---|:-:|---|
| `dashboard_qu_n_l_boardinghouse_pro` | Dashboard Quản lý | ✅ Đúng | |
| `qu_n_l_ph_ng_tr` | Quản lý Phòng trọ | ✅ Đúng | |
| `qu_n_l_t_i_s_n_ph_ng` | Tài sản phòng | ✅ Đúng | Mở rộng hợp lý của màn hình Phòng |
| `qu_n_l_kh_ch_thu` | Quản Lý Khách Thuê | ✅ Đúng | |
| `t_o_h_p_ng_m_i_ng_b_h_th_ng` | Tạo Hợp Đồng — Bước 1 | ✅ Đúng | Stepper tạo hợp đồng |
| `ghi_ch_s_i_n_n_c` | Ghi chỉ số điện nước | ✅ Đúng | |
| `x_c_nh_n_thu_ti_n_m_t` | Thu tiền mặt | ✅ Đúng | |
| `th_ng_b_o_v_n_h_nh` | Trung tâm thông báo | ✅ Đúng | |
| `qu_n_l_h_a_n_manager` | Quản lý Hóa đơn (Manager) | ✅ Đúng | Scoped theo cơ sở phụ trách |
| `bi_n_lai_i_n_t_tenant_portal` | Biên lai điện tử | ❌ Sai role | Tên chứa "tenant_portal" — đây là màn hình của **Tenant**, nên chuyển sang Tenant_UI |
| `c_nh_n_tenant_portal` | Hồ sơ cá nhân | ❌ Sai role | Tên chứa "tenant_portal" — đây là màn hình Hồ sơ của **Tenant**, nên chuyển sang Tenant_UI |
| *(thiếu)* | Quản lý loại phòng | ⚠️ Thiếu | Nên tiếp nhận `qu_n_l_lo_i_ph_ng` từ Admin_UI sang đây (theo đặc tả UC-B) |

---

### 3.3 Tenant_UI

**Trạng thái chung: ❌ Thiếu hầu hết màn hình — toàn bộ 5 màn hình cốt lõi chưa có**

> Vấn đề hoán đổi folder với Visitor_UI đã được khắc phục. Sau khi đổi tên lại, Tenant_UI cần bổ sung các màn hình sau:

| Màn hình cần tạo | Nội dung theo đặc tả | Ưu tiên |
|---|---|:-:|
| Trang chủ Tenant | Greeting card + Hero card hoá đơn tháng (tổng tiền to, hạn TT, breakdown, CTA "Thanh toán ngay") + Thông báo gần đây + Card hợp đồng tóm tắt | 🔴 Cao |
| Hoá đơn / Lịch sử | Filter chip (Chưa TT / Đã TT / Tất cả), list hoá đơn, trang chi tiết (bảng breakdown điện-nước-dịch vụ, nút Thanh toán hoặc Tải biên lai) | 🔴 Cao |
| Hợp đồng của tôi | Danh sách thẻ hợp đồng (mã, phòng, thời hạn, trạng thái), CTA "Xem PDF" + "Yêu cầu gia hạn", PDF viewer full-screen | 🔴 Cao |
| Thanh toán hoá đơn | Bước 1: chọn phương thức (VNPay/MoMo/QR/Tiền mặt); Bước 2a: redirect cổng; Bước 2b (tiền mặt): hiển thị mã giao dịch; Màn hình thành công + biên lai PDF | 🔴 Cao |
| Hồ sơ cá nhân | Avatar + thông tin cá nhân, đổi MK, bật 2FA, toggle thông báo (email/SMS/Zalo/push), nút Đăng xuất | 🟡 Trung bình |

**Màn hình có thể tái sử dụng từ chỗ khác:**

| Nguồn | Màn hình | Hành động |
|---|---|---|
| `Manager_UI/bi_n_lai_i_n_t_tenant_portal` | Biên lai điện tử | ✅ Chuyển sang Tenant_UI (đây là biên lai cho Tenant xem sau khi thanh toán) |
| `Manager_UI/c_nh_n_tenant_portal` | Hồ sơ cá nhân | ✅ Chuyển sang Tenant_UI (màn hình hồ sơ của Tenant) |
| `Visitor_UI/trang_ch_tenant_portal` | Trang chủ Tenant Portal | ✅ Chuyển sang Tenant_UI sau khi đổi tên folder |
| `Visitor_UI/danh_s_ch_h_a_n_tenant_portal` | Danh sách hoá đơn | ✅ Chuyển sang Tenant_UI |
| `Visitor_UI/chi_ti_t_h_a_n_tenant_portal` | Chi tiết hoá đơn | ✅ Chuyển sang Tenant_UI |

---

### 3.4 Visitor_UI

**Trạng thái chung: ✅ Luồng chính đầy đủ — có 3 màn hình nhầm của Tenant**

| Folder | Tiêu đề màn hình | Trạng thái | Ghi chú |
|---|---|:-:|---|
| `trang_ch_proptech_portal` | Trang chủ (Landing page) | ✅ Đúng | Hero + tìm kiếm nhanh + phòng nổi bật |
| `t_m_ki_m_ph_ng_proptech_portal` | Tìm kiếm phòng | ✅ Đúng | Sidebar filter + grid kết quả |
| `chi_ti_t_ph_ng_proptech_portal` | Chi tiết phòng | ✅ Đúng | Gallery + thông tin + bản đồ + Card đặt cọc |
| `t_c_c_gi_ph_ng_proptech_portal` | Đặt cọc giữ phòng | ✅ Đúng | Stepper đặt cọc |
| `thanh_to_n_t_c_c_proptech_portal` | Thanh toán đặt cọc | ✅ Đúng | Chọn cổng thanh toán |
| `k_t_qu_giao_d_ch_proptech_portal` | Kết quả giao dịch | ✅ Đúng | Màn hình thành công sau đặt cọc |
| `gi_i_thi_u_h_th_ng_proptech_portal` | Giới thiệu hệ thống | ✅ Bonus | Không có trong đặc tả nhưng hợp lý |
| `li_n_h_proptech_portal` | Liên hệ | ✅ Bonus | Không có trong đặc tả nhưng hợp lý |
| `trang_ch_tenant_portal` | Trang chủ Tenant Portal | ❌ Sai role | Nội dung là Dashboard hoá đơn của Tenant — nên chuyển sang Tenant_UI |
| `danh_s_ch_h_a_n_tenant_portal` | Danh sách hoá đơn | ❌ Sai role | Màn hình của Tenant — nên chuyển sang Tenant_UI |
| `chi_ti_t_h_a_n_tenant_portal` | Chi tiết hoá đơn | ❌ Sai role | Màn hình của Tenant — nên chuyển sang Tenant_UI |
| `pro_management_core` | DESIGN.md | ⚠️ Lạc chỗ | Chỉ là file design token, không phải màn hình; không cần thiết trong Visitor_UI |
| `proptech_portal_core` | — | ℹ️ Core | File thiết kế hệ thống chung |

---

## 4. Danh sách việc cần làm (Action Items)

### Ưu tiên cao — Cần thực hiện ngay

- [ ] **[Tenant_UI]** Tạo mới màn hình **Trang chủ Tenant** (hoá đơn tháng, CTA thanh toán) — mobile-first
- [ ] **[Tenant_UI]** Tạo mới màn hình **Hoá đơn & Lịch sử** (list + chi tiết breakdown)
- [ ] **[Tenant_UI]** Tạo mới màn hình **Hợp đồng của tôi** (list + PDF viewer)
- [ ] **[Tenant_UI]** Tạo mới màn hình **Thanh toán hoá đơn** (flow chọn cổng → thành công)
- [ ] **[Tenant_UI]** Di chuyển `bi_n_lai_i_n_t_tenant_portal` từ Manager_UI → Tenant_UI
- [ ] **[Tenant_UI]** Di chuyển `c_nh_n_tenant_portal` từ Manager_UI → Tenant_UI
- [ ] **[Visitor_UI]** Di chuyển `trang_ch_tenant_portal`, `danh_s_ch_h_a_n_tenant_portal`, `chi_ti_t_h_a_n_tenant_portal` → Tenant_UI

### Ưu tiên trung bình

- [ ] **[Tenant_UI]** Tạo mới màn hình **Hồ sơ cá nhân Tenant** (avatar, bảo mật, thông báo, đăng xuất)
- [ ] **[Admin_UI]** Xem xét `qu_n_l_lo_i_ph_ng` — chuyển sang Manager_UI (theo đúng phân quyền đặc tả UC-B)
- [ ] **[Admin_UI]** Xem xét `l_ch_s_thanh_to_n` — gộp vào tab Hoá đơn thay vì trang riêng

### Ưu tiên thấp — Có thể để sau

- [ ] **[Admin_UI]** Xem xét `trung_t_m_th_ng_b_o` — có thể giữ lại nếu UX cần, nhưng cần note là không có trong đặc tả gốc
- [ ] **[Visitor_UI]** Dọn `pro_management_core` (DESIGN.md) nếu không cần thiết trong thư mục này

---

## 5. Ma trận màn hình — Đặc tả vs Hiện trạng

| Màn hình | Admin | Manager | Tenant | Visitor |
|---|:-:|:-:|:-:|:-:|
| Dashboard | ✅ | ✅ | ❌ cần tạo | — |
| Nhà trọ / Chi nhánh | ✅ | — | — | — |
| Người dùng & phân quyền | ✅ | — | — | — |
| Hợp đồng | ✅ | ✅ | ❌ cần tạo | — |
| Hoá đơn | ✅ | ✅ | ❌ cần tạo | — |
| Công nợ | ✅ | — | — | — |
| Cấu hình dịch vụ & đơn giá | ✅ | — | — | — |
| Báo cáo & thống kê | ✅ | — | — | — |
| Cài đặt hệ thống | ✅ | — | — | — |
| Phòng & tài sản | ⚠️ thừa (loại phòng) | ✅ | — | — |
| Ghi chỉ số điện nước | — | ✅ | — | — |
| Xác nhận thu tiền mặt | — | ✅ | — | — |
| Thông báo | ⚠️ thừa (Admin) | ✅ | — | — |
| Thanh toán hoá đơn | — | — | ❌ cần tạo | — |
| Hồ sơ cá nhân | — | — | ❌ cần tạo | — |
| Biên lai điện tử | — | ⚠️ nhầm chỗ | ❌ cần chuyển về | — |
| Trang chủ công khai | — | — | — | ✅ |
| Tìm phòng | — | — | — | ✅ |
| Chi tiết phòng | — | — | — | ✅ |
| Đặt cọc | — | — | — | ✅ |

---

*Tài liệu này được tạo tự động từ kết quả so sánh giữa file đặc tả `(đã chỉnh sửa).docx` và cấu trúc thực tế của 4 folder UI ngày 22/05/2026.*
