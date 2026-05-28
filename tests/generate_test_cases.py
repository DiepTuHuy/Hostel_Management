import csv
import os

def generate_csv():
    # Define test cases for all 40 Use Cases (UC01 - UC40)
    test_cases = [
        # UC01
        {
            "Test Case ID": "TC01_UC01",
            "Function": "Đăng ký tài khoản - UC01",
            "Test Steps": "1. Truy cập trang đăng ký tài khoản (/register)\n2. Nhập đầy đủ thông tin: Họ tên, Số điện thoại, Email, Mật khẩu và Nhập lại mật khẩu hợp lệ\n3. Click nút 'Đăng ký'",
            "Input Data": "Họ tên: Nguyễn Văn A\nSĐT: 0912345678\nEmail: vana@gmail.com\nMật khẩu: Matkhau123\nNhập lại mật khẩu: Matkhau123",
            "Expected Result": "Hệ thống thông báo đăng ký tài khoản thành công và chuyển hướng người dùng sang trang xác thực OTP."
        },
        {
            "Test Case ID": "TC02_UC01",
            "Function": "Đăng ký tài khoản - UC01",
            "Test Steps": "1. Truy cập trang đăng ký tài khoản (/register)\n2. Nhập số điện thoại đã tồn tại trong hệ thống\n3. Click nút 'Đăng ký'",
            "Input Data": "Họ tên: Nguyễn Văn B\nSĐT: 0912345678 (đã tồn tại)\nEmail: vanb@gmail.com\nMật khẩu: Matkhau123\nNhập lại mật khẩu: Matkhau123",
            "Expected Result": "Hệ thống báo lỗi 'Số điện thoại đã được sử dụng' và yêu cầu người dùng nhập số điện thoại khác."
        },
        # UC02
        {
            "Test Case ID": "TC01_UC02",
            "Function": "Đăng nhập (kèm OTP) - UC02",
            "Test Steps": "1. Truy cập trang đăng nhập (/login)\n2. Nhập tên đăng nhập/email và mật khẩu đúng\n3. Click nút 'Đăng nhập'\n4. Nhập mã OTP chính xác được gửi về thiết bị\n5. Click 'Xác nhận OTP'",
            "Input Data": "Tài khoản: admin@boardinghouse.vn\nMật khẩu: admin123\nMã OTP: 123456 (OTP mặc định cho môi trường test)",
            "Expected Result": "Hệ thống xác thực thành công, đăng nhập thành công và chuyển hướng người dùng vào Dashboard quản trị (Admin)."
        },
        {
            "Test Case ID": "TC02_UC02",
            "Function": "Đăng nhập (kèm OTP) - UC02",
            "Test Steps": "1. Truy cập trang đăng nhập (/login)\n2. Nhập tài khoản và mật khẩu đúng\n3. Nhập sai mã OTP\n4. Click 'Xác nhận OTP'",
            "Input Data": "Tài khoản: tenant@boardinghouse.vn\nMật khẩu: tenant123\nMã OTP: 999999 (OTP sai)",
            "Expected Result": "Hệ thống báo lỗi 'Mã OTP không hợp lệ hoặc đã hết hạn' và giữ nguyên tại màn hình nhập OTP."
        },
        # UC03
        {
            "Test Case ID": "TC01_UC03",
            "Function": "Đăng xuất - UC03",
            "Test Steps": "1. Đang đăng nhập tài khoản bất kỳ\n2. Click vào ảnh đại diện hoặc menu góc trên bên phải\n3. Chọn nút 'Đăng xuất'",
            "Input Data": "Trạng thái: Đang đăng nhập tài khoản Tenant",
            "Expected Result": "Hệ thống xóa thông tin phiên đăng nhập (token/session), hiển thị thông báo đăng xuất thành công và chuyển về trang đăng nhập (/login)."
        },
        # UC04
        {
            "Test Case ID": "TC01_UC04",
            "Function": "Quên mật khẩu - UC04",
            "Test Steps": "1. Tại trang đăng nhập, click liên kết 'Quên mật khẩu'\n2. Nhập địa chỉ Email đã đăng ký trong hệ thống\n3. Click nút 'Gửi yêu cầu'",
            "Input Data": "Email: tenant@boardinghouse.vn (đã tồn tại)",
            "Expected Result": "Hệ thống hiển thị thông báo đã gửi link khôi phục mật khẩu vào hòm thư điện tử của người dùng."
        },
        {
            "Test Case ID": "TC02_UC04",
            "Function": "Quên mật khẩu - UC04",
            "Test Steps": "1. Tại trang đăng nhập, click liên kết 'Quên mật khẩu'\n2. Nhập địa chỉ Email chưa đăng ký trong hệ thống\n3. Click nút 'Gửi yêu cầu'",
            "Input Data": "Email: notfound@example.com (chưa đăng ký)",
            "Expected Result": "Hệ thống báo lỗi 'Email không tồn tại trong hệ thống'."
        },
        # UC05
        {
            "Test Case ID": "TC01_UC05",
            "Function": "Đặt lại mật khẩu - UC05",
            "Test Steps": "1. Nhấp vào đường link khôi phục mật khẩu được gửi trong Email\n2. Nhập Mật khẩu mới và Nhập lại mật khẩu mới khớp nhau\n3. Click 'Đặt lại mật khẩu'",
            "Input Data": "Mật khẩu mới: Newpassword123\nNhập lại mật khẩu mới: Newpassword123",
            "Expected Result": "Hệ thống cập nhật mật khẩu mới thành công, thông báo đặt lại mật khẩu thành công và chuyển hướng về trang đăng nhập."
        },
        # UC06
        {
            "Test Case ID": "TC01_UC06",
            "Function": "Cập nhật hồ sơ cá nhân - UC06",
            "Test Steps": "1. Đăng nhập với tư cách Khách thuê\n2. Truy cập vào trang 'Hồ sơ cá nhân'\n3. Thay đổi thông tin Họ tên, Ngày sinh, CCCD\n4. Click nút 'Lưu thay đổi'",
            "Input Data": "Họ tên mới: Nguyễn Văn A (Sửa đổi)\nNgày sinh: 20/10/1998\nCCCD: 030098012345",
            "Expected Result": "Hệ thống lưu trữ thông tin mới thành công và hiển thị thông báo 'Cập nhật hồ sơ cá nhân thành công'."
        },
        # UC07
        {
            "Test Case ID": "TC01_UC07",
            "Function": "Khoá/Mở khoá tài khoản - UC07",
            "Test Steps": "1. Đăng nhập tài khoản Admin\n2. Truy cập trang quản lý người dùng ('Quản lý tài khoản')\n3. Tìm kiếm tài khoản cần khóa\n4. Click vào biểu tượng 'Khóa tài khoản'\n5. Xác nhận hành động khóa",
            "Input Data": "Tài khoản cần khóa: baduser@example.com",
            "Expected Result": "Trạng thái tài khoản đổi sang 'Bị khóa'. Tài khoản này sẽ không thể đăng nhập vào hệ thống ở các lần sau."
        },
        # UC08
        {
            "Test Case ID": "TC01_UC08",
            "Function": "Phân quyền vai trò - UC08",
            "Test Steps": "1. Đăng nhập tài khoản Admin\n2. Truy cập trang 'Phân quyền' hoặc 'Quản lý tài khoản'\n3. Chọn tài khoản cần gán quyền\n4. Thay đổi vai trò (Role) từ 'Tenant' sang 'Manager'\n5. Click nút 'Cập nhật'",
            "Input Data": "Tài khoản: staff01@boardinghouse.vn\nVai trò mới: Manager",
            "Expected Result": "Tài khoản được cập nhật vai trò mới thành công. Khi đăng nhập, tài khoản này sẽ có quyền truy cập vào các màn hình chức năng của Manager."
        },
        # UC09
        {
            "Test Case ID": "TC01_UC09",
            "Function": "Thêm/sửa/ngừng nhà trọ - UC09",
            "Test Steps": "1. Đăng nhập tài khoản Admin\n2. Truy cập trang 'Quản lý nhà trọ'\n3. Click nút 'Thêm nhà trọ'\n4. Nhập Tên nhà trọ, Địa chỉ, Số tầng và thông tin chi tiết\n5. Click nút 'Thêm mới'",
            "Input Data": "Tên: Nhà trọ Sunrise\nĐịa chỉ: 123 Đường Láng, Đống Đa, Hà Nội\nSố tầng: 5",
            "Expected Result": "Hệ thống lưu thông tin nhà trọ mới và hiển thị nhà trọ này trong danh sách hoạt động toàn hệ thống."
        },
        # UC10
        {
            "Test Case ID": "TC01_UC10",
            "Function": "Phân công quản lý - UC10",
            "Test Steps": "1. Đăng nhập tài khoản Admin\n2. Truy cập trang 'Quản lý nhà trọ' hoặc 'Phân công'\n3. Chọn nhà trọ cần phân công quản lý\n4. Chọn một tài khoản thuộc vai trò 'Manager' từ danh sách thả xuống\n5. Click nút 'Xác nhận phân công'",
            "Input Data": "Nhà trọ: Nhà trọ Sunrise\nQuản lý chỉ định: Nguyễn Văn B (Manager)",
            "Expected Result": "Hệ thống phân công quản lý thành công. Tài khoản Manager được chỉ định sẽ có quyền quản lý và cập nhật số liệu của nhà trọ này."
        },
        # UC11
        {
            "Test Case ID": "TC01_UC11",
            "Function": "Quản lý loại phòng & tiện nghi - UC11",
            "Test Steps": "1. Đăng nhập tài khoản Admin hoặc Manager\n2. Truy cập trang 'Quản lý loại phòng'\n3. Click 'Thêm loại phòng mới'\n4. Nhập tên loại phòng, diện tích, giá thuê gốc và chọn các tiện nghi kèm theo (Điều hòa, Nóng lạnh, Tủ lạnh)\n5. Click 'Lưu'",
            "Input Data": "Tên loại phòng: Phòng VIP có gác lửng\nDiện tích: 25m2\nGiá thuê: 3.500.000 VNĐ\nTiện nghi: Điều hòa, Máy giặt, Nóng lạnh",
            "Expected Result": "Hệ thống tạo loại phòng mới thành công, hiển thị trong danh mục cấu hình khi thiết lập thông tin phòng trọ."
        },
        # UC12
        {
            "Test Case ID": "TC01_UC12",
            "Function": "CRUD phòng trọ - UC12",
            "Test Steps": "1. Đăng nhập tài khoản Manager\n2. Truy cập trang 'Quản lý phòng'\n3. Click nút 'Thêm phòng mới'\n4. Nhập mã phòng, chọn loại phòng, nhập tầng và mô tả\n5. Click 'Thêm phòng'",
            "Input Data": "Số phòng: 301\nTầng: 3\nLoại phòng: Phòng VIP có gác lửng\nGiá thuê: 3.500.000 VNĐ",
            "Expected Result": "Hệ thống lưu thông tin phòng mới thành công và hiển thị phòng 301 ở trạng thái 'Trống' trong danh sách phòng."
        },
        # UC13
        {
            "Test Case ID": "TC01_UC13",
            "Function": "Cập nhật trạng thái phòng - UC13",
            "Test Steps": "1. Đăng nhập tài khoản Manager\n2. Truy cập trang 'Quản lý phòng'\n3. Chọn phòng cần bảo trì\n4. Thay đổi trạng thái phòng từ 'Trống' sang 'Đang bảo trì/sửa chữa'\n5. Click nút 'Cập nhật'",
            "Input Data": "Phòng: 301\nTrạng thái mới: Đang bảo trì",
            "Expected Result": "Hệ thống lưu trạng thái mới thành công, đổi màu hiển thị của phòng trên sơ đồ phòng sang màu cảnh báo bảo trì."
        },
        # UC14
        {
            "Test Case ID": "TC01_UC14",
            "Function": "Quản lý tài sản trong phòng - UC14",
            "Test Steps": "1. Đăng nhập tài khoản Manager\n2. Truy cập trang chi tiết phòng (ví dụ: Phòng 301)\n3. Chọn tab 'Tài sản / Trang thiết bị'\n4. Thêm tài sản: nhập tên tài sản, số lượng, tình trạng sử dụng\n5. Click nút 'Cập nhật danh mục tài sản'",
            "Input Data": "Tài sản: Điều hòa Panasonic 12000BTU\nSố lượng: 1\nTình trạng: Mới 95%",
            "Expected Result": "Hệ thống lưu thông tin tài sản vào cơ sở dữ liệu và hiển thị chi tiết trong biên bản bàn giao phòng của hợp đồng."
        },
        # UC15
        {
            "Test Case ID": "TC01_UC15",
            "Function": "Thêm hồ sơ khách - UC15",
            "Test Steps": "1. Đăng nhập tài khoản Manager\n2. Truy cập trang 'Quản lý khách thuê'\n3. Click nút 'Thêm hồ sơ khách thuê'\n4. Nhập đầy đủ thông tin: Họ tên, Ngày sinh, CCCD, Số điện thoại, Quê quán và tải lên ảnh chân dung, ảnh chụp CCCD mặt trước/sau\n5. Click 'Lưu hồ sơ'",
            "Input Data": "Họ tên: Trần Thị C\nSĐT: 0987654321\nCCCD: 030099009876\nQuê quán: Nam Định",
            "Expected Result": "Hồ sơ khách thuê được lưu thành công trên hệ thống và hiển thị trong danh sách để liên kết khi tạo hợp đồng thuê."
        },
        # UC16
        {
            "Test Case ID": "TC01_UC16",
            "Function": "Lập hợp đồng thuê - UC16",
            "Test Steps": "1. Đăng nhập tài khoản Manager\n2. Truy cập trang 'Quản lý hợp đồng'\n3. Click nút 'Tạo hợp đồng mới'\n4. Chọn phòng trọ, chọn khách thuê (Trần Thị C), nhập giá thuê thỏa thuận, tiền cọc, ngày bắt đầu và kết thúc hợp đồng\n5. Click 'Tạo hợp đồng'",
            "Input Data": "Phòng thuê: 301\nKhách thuê: Trần Thị C\nGiá thuê: 3.500.000 VNĐ/tháng\nTiền đặt cọc: 3.500.000 VNĐ\nThời hạn: 12 tháng (từ 01/06/2026 đến 01/06/2027)",
            "Expected Result": "Hệ thống sinh dự thảo hợp đồng ở trạng thái 'Chờ ký', tự động gửi thông báo yêu cầu ký số đến tài khoản của khách thuê Trần Thị C."
        },
        # UC17
        {
            "Test Case ID": "TC01_UC17",
            "Function": "Ký số / xác nhận hợp đồng - UC17",
            "Test Steps": "1. Đăng nhập tài khoản Khách thuê (Trần Thị C)\n2. Truy cập trang 'Hợp đồng của tôi'\n3. Chọn hợp đồng đang ở trạng thái 'Chờ ký' và đọc kỹ điều khoản\n4. Click nút 'Ký số hợp đồng'\n5. Nhập mã OTP xác nhận gửi về số điện thoại và click 'Xác nhận'",
            "Input Data": "Tài khoản: tranthic@gmail.com\nMã OTP xác thực ký số: 123456",
            "Expected Result": "Hợp đồng chuyển sang trạng thái 'Đã ký / Hiệu lực'. Hệ thống cập nhật trạng thái phòng 301 sang 'Đã thuê' và tự động khóa tiền cọc."
        },
        # UC18
        {
            "Test Case ID": "TC01_UC18",
            "Function": "Gia hạn hợp đồng - UC18",
            "Test Steps": "1. Đăng nhập tài khoản Manager\n2. Truy cập trang 'Quản lý hợp đồng'\n3. Tìm kiếm hợp đồng sắp hết hạn của phòng 301\n4. Click nút 'Gia hạn'\n5. Nhập thời gian gia hạn mới và cập nhật giá thuê (nếu có)\n6. Click 'Gửi yêu cầu gia hạn'",
            "Input Data": "Phòng: 301\nThời gian gia hạn thêm: 6 tháng\nGiá thuê mới: 3.600.000 VNĐ/tháng",
            "Expected Result": "Hệ thống sinh phụ lục gia hạn hợp đồng mới, gửi thông báo yêu cầu xác nhận tới tài khoản khách thuê."
        },
        # UC19
        {
            "Test Case ID": "TC01_UC19",
            "Function": "Sửa đổi hợp đồng - UC19",
            "Test Steps": "1. Đăng nhập tài khoản Manager\n2. Truy cập trang 'Quản lý hợp đồng'\n3. Chọn hợp đồng phòng 301 đang có hiệu lực\n4. Click nút 'Sửa đổi hợp đồng / Phụ lục'\n5. Chỉnh sửa thông tin số lượng người ở hoặc điều khoản bổ sung\n6. Click 'Lưu và gửi phê duyệt'",
            "Input Data": "Nội dung sửa đổi: Thêm thành viên ở ghép (Nguyễn Văn D, CCCD: 030099123456)",
            "Expected Result": "Hệ thống tạo một bản dự thảo phụ lục sửa đổi hợp đồng và chờ xác nhận từ hai bên."
        },
        # UC20
        {
            "Test Case ID": "TC01_UC20",
            "Function": "Chấm dứt hợp đồng / trả phòng - UC20",
            "Test Steps": "1. Đăng nhập tài khoản Manager\n2. Truy cập trang 'Quản lý hợp đồng'\n3. Chọn hợp đồng phòng 301 và click nút 'Chấm dứt hợp đồng/Trả phòng'\n4. Nhập ngày trả phòng thực tế, tính toán tiền điện nước lẻ đến ngày trả phòng và kiểm tra hư hỏng tài sản để khấu trừ cọc\n5. Xác nhận tất toán công nợ và trả cọc\n6. Click 'Hoàn tất thanh lý hợp đồng'",
            "Input Data": "Ngày trả phòng: 31/05/2027\nKhấu trừ tài sản hỏng: 500.000 VNĐ (làm hỏng cửa tủ quần áo)\nSố tiền cọc hoàn lại: 3.000.000 VNĐ",
            "Expected Result": "Trạng thái hợp đồng chuyển thành 'Đã chấm dứt'. Phòng 301 được chuyển về trạng thái 'Trống'. Số dư cọc được hoàn trả theo biên bản thanh lý."
        },
        # UC21
        {
            "Test Case ID": "TC01_UC21",
            "Function": "Đăng ký tạm trú - UC21",
            "Test Steps": "1. Đăng nhập tài khoản Khách thuê\n2. Truy cập trang 'Hợp đồng của tôi' hoặc 'Hồ sơ cá nhân'\n3. Chọn nút 'Đăng ký tạm trú đi kèm'\n4. Nhập đầy đủ thông tin cư trú cũ, thông tin cá nhân và lý do tạm trú\n5. Click 'Nộp tờ khai CT01'",
            "Input Data": "Thông tin thường trú: Xã X, Huyện Y, Tỉnh Z\nNơi tạm trú: Phòng 301, Nhà trọ Sunrise\nLý do: Đi học/Đi làm",
            "Expected Result": "Hệ thống tự động điền và kết xuất file biểu mẫu CT01 (định dạng PDF/Word) theo chuẩn Bộ Công an và gửi yêu cầu đăng ký tạm trú cho bộ phận hành chính xử lý."
        },
        # UC22
        {
            "Test Case ID": "TC01_UC22",
            "Function": "Cấu hình đơn giá dịch vụ - UC22",
            "Test Steps": "1. Đăng nhập tài khoản Admin\n2. Truy cập trang 'Cấu hình & Dịch vụ'\n3. Thiết lập đơn giá dịch vụ: Điện (chọn biểu giá lũy tiến 6 bậc EVN), Nước (20.000đ/m3), Internet (100.000đ/phòng)\n4. Click nút 'Lưu cấu hình dịch vụ'",
            "Input Data": "Bậc 1 Điện (0-50kWh): 1.806đ/kWh\nBậc 2 Điện (51-100kWh): 1.866đ/kWh\nBậc 3 Điện (101-200kWh): 2.167đ/kWh\nNước: 20.000 VNĐ/m3",
            "Expected Result": "Hệ thống lưu cấu hình đơn giá mới thành công và áp dụng cho các hóa đơn sinh ra ở các tháng tiếp theo."
        },
        # UC23
        {
            "Test Case ID": "TC01_UC23",
            "Function": "Ghi chỉ số điện nước - UC23",
            "Test Steps": "1. Đăng nhập tài khoản Manager\n2. Truy cập trang 'Ghi số điện nước' (/meters)\n3. Chọn nhà trọ, chọn kỳ hóa đơn (Tháng 5/2026)\n4. Nhập chỉ số điện mới và chỉ số nước mới của phòng 301\n5. Tải lên hình ảnh đồng hồ điện/nước làm đối chứng\n6. Click nút 'Lưu và Gửi phê duyệt'",
            "Input Data": "Phòng: 301\nKỳ: Tháng 5/2026\nChỉ số điện cũ: 1050 - Chỉ số điện mới: 1250 (Tiêu thụ 200 kWh)\nChỉ số nước cũ: 240 - Chỉ số nước mới: 248 (Tiêu thụ 8 m3)",
            "Expected Result": "Hệ thống lưu chỉ số mới ghi nhận thành công, chuyển trạng thái ghi số của phòng thành 'Đã ghi nhận'."
        },
        # UC24
        {
            "Test Case ID": "TC01_UC24",
            "Function": "Tính tiền dịch vụ - UC24",
            "Test Steps": "1. Hệ thống tự động kích hoạt tính toán ngay sau khi chỉ số điện nước mới được cập nhật\n2. Đối chiếu số lượng tiêu thụ điện nước với cấu hình đơn giá\n3. Kiểm tra kết quả tính toán điện theo bậc lũy tiến EVN: 50 * 1806 + 50 * 1866 + 100 * 2167 = 400.300 VNĐ (chưa VAT)\n4. Kiểm tra kết quả tính tiền nước: 8m3 * 20000 = 160.000 VNĐ",
            "Input Data": "Tiêu thụ: 200 kWh điện, 8 m3 nước\nĐơn giá: Cấu hình bậc thang EVN và nước 20k/m3",
            "Expected Result": "Hệ thống tính toán chính xác chi phí từng dịch vụ và lưu vào bảng kê chi tiết hóa đơn."
        },
        # UC25
        {
            "Test Case ID": "TC01_UC25",
            "Function": "Tạo hoá đơn - UC25",
            "Test Steps": "1. Đăng nhập tài khoản Manager hoặc Admin\n2. Truy cập trang 'Quản lý hóa đơn'\n3. Chọn phòng 301, click 'Tạo hóa đơn tháng'\n4. Kiểm tra thông tin các khoản tiền phòng (3.500.000), tiền điện (400.300), tiền nước (160.000) và các dịch vụ khác\n5. Click nút 'Tạo hóa đơn'",
            "Input Data": "Kỳ thanh toán: Tháng 05/2026\nTổng số tiền: 4.160.300 VNĐ (Tiền phòng + Tiền điện + Tiền nước)",
            "Expected Result": "Hóa đơn được tạo thành công dưới dạng bản nháp và gán mã hóa đơn duy nhất (ví dụ: HD-202605-301)."
        },
        # UC26
        {
            "Test Case ID": "TC01_UC26",
            "Function": "Gửi hoá đơn & nhắc thanh toán - UC26",
            "Test Steps": "1. Tại trang chi tiết hóa đơn nháp HD-202605-301\n2. Click nút 'Phát hành & Gửi thông báo'\n3. Hệ thống gửi email tự động và tin nhắn thông báo đẩy (push notification) trên app tới khách thuê Trần Thị C\n4. Hóa đơn chuyển trạng thái sang 'Chờ thanh toán'",
            "Input Data": "Mã hóa đơn: HD-202605-301\nEmail gửi đến: tranthic@gmail.com",
            "Expected Result": "Khách thuê nhận được email thông báo chứa link hóa đơn và file chi tiết, kèm theo thông báo nhắc nợ trên ứng dụng điện thoại."
        },
        # UC27
        {
            "Test Case ID": "TC01_UC27",
            "Function": "Thanh toán online - UC27",
            "Test Steps": "1. Đăng nhập tài khoản Khách thuê (Trần Thị C)\n2. Truy cập trang 'Hóa đơn của tôi'\n3. Chọn hóa đơn HD-202605-301 đang 'Chờ thanh toán'\n4. Click nút 'Thanh toán trực tuyến (VNPay)'\n5. Tại trang giả lập VNPay, chọn ngân hàng test, nhập mã thẻ và OTP giả lập\n6. Click 'Thanh toán' và đợi chuyển hướng trở lại hệ thống",
            "Input Data": "Thẻ test VNPay: 97041985261377022 (Ngân hàng NCB)\nTên chủ thẻ: NGUYEN VAN A\nMã OTP: 123456",
            "Expected Result": "Thanh toán thành công. Hóa đơn HD-202605-301 tự động chuyển sang trạng thái 'Đã thanh toán (Online VNPay)' và hệ thống tự động sinh biên lai điện tử."
        },
        # UC28
        {
            "Test Case ID": "TC01_UC28",
            "Function": "Xác nhận thu tiền mặt - UC28",
            "Test Steps": "1. Đăng nhập tài khoản Manager\n2. Truy cập trang 'Quản lý thu chi / Phiếu thu'\n3. Tìm kiếm hóa đơn của khách thuê trả tiền mặt (ví dụ: HD-202605-302)\n4. Click nút 'Xác nhận thu tiền mặt'\n5. Nhập số tiền thực tế nhận được và ghi chú\n6. Click 'Tạo phiếu thu'",
            "Input Data": "Mã hóa đơn: HD-202605-302\nSố tiền nhận: 4.160.300 VNĐ\nNgười nộp: Trần Thị C",
            "Expected Result": "Hệ thống ghi nhận trạng thái hóa đơn là 'Đã thanh toán (Tiền mặt)', sinh phiếu thu tiền mặt và cập nhật vào quỹ tiền mặt của chi nhánh."
        },
        # UC29
        {
            "Test Case ID": "TC01_UC29",
            "Function": "Tra cứu lịch sử hoá đơn - UC29",
            "Test Steps": "1. Đăng nhập tài khoản Khách thuê\n2. Truy cập trang 'Lịch sử hóa đơn'\n3. Chọn khoảng thời gian cần tra cứu (ví dụ: từ 01/01/2026 đến nay)\n4. Xem danh sách hóa đơn và click vào hóa đơn HD-202605-301 để xem chi tiết",
            "Input Data": "Bộ lọc thời gian: 01/01/2026 - 31/12/2026",
            "Expected Result": "Hệ thống hiển thị danh sách tất cả các hóa đơn đã phát hành kèm trạng thái và chi tiết thanh toán của từng kỳ."
        },
        # UC30
        {
            "Test Case ID": "TC01_UC30",
            "Function": "Quản lý công nợ - UC30",
            "Test Steps": "1. Đăng nhập tài khoản Admin\n2. Truy cập trang 'Quản lý công nợ' (/debts)\n3. Xem danh sách phòng nợ quá hạn thanh toán\n4. Chọn phòng nợ lâu nhất và click nút 'Gửi cảnh báo công nợ'",
            "Input Data": "Bộ lọc: Hóa đơn quá hạn > 10 ngày\nPhòng chọn: Phòng 102 (Nợ 5.200.000 VNĐ)",
            "Expected Result": "Hệ thống tổng hợp số tiền nợ và gửi cảnh báo nợ tự động qua SMS/Zalo/Email tới khách thuê phòng 102."
        },
        # UC31
        {
            "Test Case ID": "TC01_UC31",
            "Function": "Dashboard tổng quan - UC31",
            "Test Steps": "1. Đăng nhập tài khoản Admin hoặc Manager\n2. Xem trang Dashboard chính\n3. Kiểm tra sự thay đổi của các biểu đồ đường doanh thu, tỷ lệ phòng trống và số lượng khách thuê thực tế",
            "Input Data": "Quyền truy cập: Admin",
            "Expected Result": "Dashboard tải dữ liệu thành công, hiển thị các biểu đồ trực quan, số liệu thực tế được cập nhật theo thời gian thực từ cơ sở dữ liệu."
        },
        # UC32
        {
            "Test Case ID": "TC01_UC32",
            "Function": "Báo cáo doanh thu - UC32",
            "Test Steps": "1. Đăng nhập tài khoản Admin\n2. Truy cập trang 'Báo cáo & Thống kê' -> chọn tab 'Doanh thu'\n3. Lọc theo năm 2026 và chọn so sánh giữa các chi nhánh nhà trọ\n4. Xem biểu đồ doanh thu cột",
            "Input Data": "Bộ lọc: Năm 2026, tất cả chi nhánh",
            "Expected Result": "Hệ thống hiển thị tổng doanh thu từ tiền phòng, dịch vụ và biểu đồ so sánh chi tiết giữa các nhà trọ trong chuỗi."
        },
        # UC33
        {
            "Test Case ID": "TC01_UC33",
            "Function": "Báo cáo tỉ lệ lấp đầy - UC33",
            "Test Steps": "1. Đăng nhập tài khoản Admin hoặc Manager\n2. Truy cập trang 'Báo cáo & Thống kê' -> chọn tab 'Tỷ lệ lấp đầy'\n3. Lọc theo tháng hiện tại",
            "Input Data": "Bộ lọc: Tháng 05/2026",
            "Expected Result": "Hiển thị tỷ lệ phần trăm phòng đã thuê (ví dụ: 85%) và số phòng còn trống trên tổng số phòng đang vận hành."
        },
        # UC34
        {
            "Test Case ID": "TC01_UC34",
            "Function": "Báo cáo công nợ - UC34",
            "Test Steps": "1. Đăng nhập tài khoản Admin\n2. Truy cập trang 'Báo cáo & Thống kê' -> chọn tab 'Báo cáo công nợ'\n3. Lọc danh sách khách nợ theo từng chi nhánh",
            "Input Data": "Chi nhánh: Cơ sở Quận Đống Đa",
            "Expected Result": "Hiển thị tổng nợ chưa thu của chi nhánh Đống Đa và danh sách chi tiết số tiền nợ phân theo từng phòng trọ."
        },
        # UC35
        {
            "Test Case ID": "TC01_UC35",
            "Function": "Báo cáo chi phí vận hành - UC35",
            "Test Steps": "1. Đăng nhập tài khoản Admin\n2. Truy cập trang 'Báo cáo & Thống kê' -> chọn tab 'Báo cáo chi phí'\n3. Kiểm tra số tiền chi cho bảo trì thiết bị và lương nhân viên",
            "Input Data": "Kỳ báo cáo: Quý I/2026",
            "Expected Result": "Hệ thống xuất bảng tổng hợp chi phí đầu vào và tính ra lợi nhuận ròng sau khi trừ chi phí vận hành."
        },
        # UC36
        {
            "Test Case ID": "TC01_UC36",
            "Function": "Xuất Excel/PDF - UC36",
            "Test Steps": "1. Tại trang Báo cáo doanh thu hoặc hóa đơn bất kỳ\n2. Click nút 'Xuất báo cáo Excel' hoặc 'Xuất PDF'\n3. Tải file về thiết bị và mở kiểm tra cấu trúc dữ liệu",
            "Input Data": "Nội dung: Báo cáo Doanh thu năm 2026",
            "Expected Result": "Hệ thống kết xuất file Excel/PDF đúng định dạng mẫu, dữ liệu hiển thị chính xác không bị lỗi font chữ tiếng Việt."
        },
        # UC37
        {
            "Test Case ID": "TC01_UC37",
            "Function": "Gửi thông báo tự động - UC37",
            "Test Steps": "1. Đăng nhập tài khoản Manager\n2. Vào trang 'Quản lý thông báo' -> click 'Tạo thông báo mới'\n3. Nhập tiêu đề, nội dung và chọn đối tượng nhận là 'Toàn bộ khách thuê tòa nhà A'\n4. Click nút 'Gửi thông báo'",
            "Input Data": "Tiêu đề: Bảo trì hệ thống điện ngày 25/05\nNội dung: Cúp điện từ 9h00 đến 11h00",
            "Expected Result": "Hệ thống tự động phát đi thông báo qua hệ thống đẩy trên web/app và email cho toàn bộ cư dân trong tòa nhà A."
        },
        # UC38
        {
            "Test Case ID": "TC01_UC38",
            "Function": "Tìm kiếm phòng - UC38",
            "Test Steps": "1. Truy cập trang chủ dưới vai trò Khách vãng lai (không cần đăng nhập)\n2. Vào trang 'Tìm kiếm phòng'\n3. Nhập từ khóa khu vực (Đống Đa), khoảng giá (2 - 4 triệu) và diện tích mong muốn\n4. Click nút 'Tìm kiếm'",
            "Input Data": "Khu vực: Đống Đa\nGiá thuê: 2.000.000 VNĐ - 4.000.000 VNĐ",
            "Expected Result": "Hệ thống lọc và hiển thị danh sách các phòng trống thỏa mãn điều kiện lọc kèm hình ảnh và thông tin chi tiết."
        },
        # UC39
        {
            "Test Case ID": "TC01_UC39",
            "Function": "Đặt cọc giữ phòng online - UC39",
            "Test Steps": "1. Tại trang chi tiết phòng trống cần thuê\n2. Click nút 'Đặt cọc giữ phòng trực tuyến'\n3. Điền thông tin cá nhân và nhập số tiền cọc mong muốn (tối thiểu bằng 1 tháng tiền phòng)\n4. Click 'Xác nhận và Thanh toán qua VNPay'",
            "Input Data": "Phòng đặt cọc: Phòng 301\nSố tiền cọc: 3.500.000 VNĐ\nHọ tên khách: Nguyễn Văn E",
            "Expected Result": "Giao dịch VNPay thành công. Trạng thái phòng 301 tự động chuyển sang 'Đã đặt cọc' và hệ thống gửi biên lai cọc qua email cho khách hàng."
        },
        # UC40
        {
            "Test Case ID": "TC01_UC40",
            "Function": "Đăng tin tuyển khách - UC40",
            "Test Steps": "1. Đăng nhập tài khoản Manager\n2. Vào trang quản lý phòng hoặc danh sách tin đăng\n3. Chọn phòng trống cần cho thuê, click 'Đăng tin cho thuê'\n4. Chỉnh sửa nội dung mô tả, tải lên hình ảnh phòng thực tế và click 'Phát hành tin đăng'",
            "Input Data": "Mã phòng: 301\nTiêu đề: Cho thuê phòng VIP gác lửng giá rẻ Đống Đa\nẢnh: 3 ảnh chụp thực tế phòng",
            "Expected Result": "Tin tuyển khách được duyệt tự động và xuất hiện trên giao diện trang chủ tìm kiếm phòng dành cho khách vãng lai."
        }
    ]

    # Target CSV Path
    csv_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(csv_dir, exist_ok=True)
    csv_path = os.path.join(csv_dir, "danh_sach_test_cases.csv")

    # CSV headers matching Testing Document Template.xlsx
    headers = ["Test Case ID", "Function", "Test Steps", "Input Data", "Expected Result"]

    # Write using utf-8-sig (UTF-8 with BOM) for Excel compatibility
    with open(csv_path, mode="w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        for tc in test_cases:
            writer.writerow(tc)

    print(f"Generated {len(test_cases)} test cases in: {csv_path}")

if __name__ == "__main__":
    generate_csv()
