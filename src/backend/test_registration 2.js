/**
 * Script kiểm thử đăng ký tài khoản trực tiếp vào MongoDB Atlas qua API.
 * Chạy bằng cách mở server trước, sau đó chạy: node test_registration.js
 */
const runTest = async () => {
  try {
    console.log("Đang kết nối tới server API để test luồng đăng ký...");
    const mockUserData = {
      fullName: "Nguyễn Văn Khách Thuê Test",
      email: `tnt.test.${Math.floor(Math.random() * 10000)}@gmail.com`,
      password: "tenantpassword123",
      phone: "0999888777",
      role: "tenant",
      tenantProfile: {
        cccd: "079096123456",
        occupation: "Kỹ sư phần mềm",
        permanentAddress: "456 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM"
      }
    };

    console.log(`Đang gửi yêu cầu đăng ký với email: ${mockUserData.email}`);
    const res = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockUserData)
    });
    
    const data = await res.json();
    console.log("\n[Phản hồi từ Server] Status Code:", res.status);
    console.log("Content:", JSON.stringify(data, null, 2));
    
    if (res.status === 201) {
      console.log("\n===> KIỂM THỬ THÀNH CÔNG: Tài khoản đã được băm mật khẩu và lưu trực tiếp vào CSDL MongoDB Atlas!");
    } else {
      console.log("\n===> KIỂM THỬ THẤT BẠI: Vui lòng kiểm tra lại log của backend server.");
    }
  } catch (error) {
    console.error("Không thể kết nối đến backend server. Hãy chắc chắn rằng bạn đã chạy 'npm start' ở cổng 5001.", error.message);
  }
};

runTest();
