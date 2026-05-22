import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import { User } from './models/User.js';
import { Property } from './models/Property.js';
import { RoomType } from './models/RoomType.js';
import { Room } from './models/Room.js';
import { Service } from './models/Service.js';
import { Contract } from './models/Contract.js';
import { Invoice } from './models/Invoice.js';
import { Payment } from './models/Payment.js';
import { Notification } from './models/Notification.js';
import { Reading } from './models/Reading.js';

dotenv.config();

const HCMC_DISTRICTS_DATA = [
  { name: "Quận 1", code: "Q1", streets: ["Nguyễn Huệ", "Lê Lợi", "Nguyễn Du", "Trần Hưng Đạo", "Bùi Viện", "Nguyễn Cư Trinh", "Mạc Đĩnh Chi", "Lê Thánh Tôn"] },
  { name: "Quận 3", code: "Q3", streets: ["Võ Văn Tần", "Cách Mạng Tháng 8", "Điện Biên Phủ", "Nam Kỳ Khởi Nghĩa", "Lê Văn Sỹ", "Nguyễn Đình Chiểu", "Trần Quốc Thảo"] },
  { name: "Quận 4", code: "Q4", streets: ["Hoàng Diệu", "Khánh Hội", "Bến Vân Đồn", "Tôn Đản", "Đoàn Văn Bơ", "Vĩnh Hội"] },
  { name: "Quận 5", code: "Q5", streets: ["Trần Hưng Đạo", "An Dương Vương", "Nguyễn Trãi", "Hồng Bàng", "Lão Tử", "Hải Thượng Lãn Ông"] },
  { name: "Quận 6", code: "Q6", streets: ["Hậu Giang", "Bình Phú", "Lê Quang Sung", "Minh Phụng", "An Dương Vương", "Kinh Dương Vương"] },
  { name: "Quận 7", code: "Q7", streets: ["Nguyễn Văn Linh", "Huỳnh Tấn Phát", "Nguyễn Thị Thập", "Lâm Văn Bền", "Trần Xuân Soạn", "Lê Văn Lương"] },
  { name: "Quận 8", code: "Q8", streets: ["Phạm Thế Hiển", "Tạ Quang Bửu", "Hưng Phú", "Dương Bá Trạc", "Cao Lỗ", "Liên Tỉnh 5"] },
  { name: "Quận 10", code: "Q10", streets: ["Ba Tháng Hai", "Tô Hiến Thành", "Sư Vạn Hạnh", "Lý Thường Kiệt", "Thất Sơn", "Ngô Gia Tự", "Vĩnh Viễn"] },
  { name: "Quận 11", code: "Q11", streets: ["Lãnh Binh Thăng", "Lê Đại Hành", "Hòa Bình", "Minh Phụng", "Đội Cung", "Tôn Thất Hiệp"] },
  { name: "Quận 12", code: "Q12", streets: ["Trường Chinh", "Tô Ký", "Phan Văn Hớn", "Hà Huy Giáp", "Nguyễn Ảnh Thủ", "Lê Văn Khương"] },
  { name: "Quận Bình Tân", code: "BTan", streets: ["Tên Lửa", "Kinh Dương Vương", "Mã Lò", "Lê Văn Quới", "Hồ Học Lãm", "Tỉnh Lộ 10"] },
  { name: "Quận Bình Thạnh", code: "BThanh", streets: ["Xô Viết Nghệ Tĩnh", "Điện Biên Phủ", "Bạch Đằng", "Lê Quang Định", "Nơ Trang Long", "Phan Văn Trị", "D2"] },
  { name: "Quận Gò Vấp", code: "GV", streets: ["Quang Trung", "Nguyễn Oanh", "Phan Văn Trị", "Lê Đức Thọ", "Phạm Văn Chiêu", "Thống Nhất"] },
  { name: "Quận Phú Nhuận", code: "PN", streets: ["Phan Xích Long", "Nguyễn Văn Trỗi", "Huỳnh Văn Bánh", "Lê Văn Sỹ", "Thích Quảng Đức", "Phan Đăng Lưu"] },
  { name: "Quận Tân Bình", code: "TB", streets: ["Cộng Hòa", "Trường Chinh", "Hoàng Văn Thụ", "Út Tịch", "Phổ Quang", "Bạch Đằng", "Âu Cơ"] },
  { name: "Quận Tân Phú", code: "TP", streets: ["Lũy Bán Bích", "Tân Sơn Nhì", "Độc Lập", "Hòa Bình", "Thoại Ngọc Hầu", "Tây Thạnh"] },
  { name: "Thành phố Thủ Đức", code: "TD", streets: ["Võ Văn Ngân", "Xa Lộ Hà Nội", "Lê Văn Việt", "Kha Vạn Cân", "Đỗ Xuân Hợp", "Phạm Văn Đồng", "Hiệp Bình"] },
  { name: "Huyện Bình Chánh", code: "BChanh", streets: ["Quốc Lộ 1A", "Nguyễn Văn Linh", "Trần Đại Nghĩa", "Trung Sơn", "Phạm Hùng"] },
  { name: "Huyện Cần Giờ", code: "CG", streets: ["Duyên Hải", "Rừng Sác", "Tắc Xuất", "Thạnh Thới"] },
  { name: "Huyện Củ Chi", code: "CC", streets: ["Tỉnh Lộ 8", "Quốc Lộ 22", "Nguyễn Văn Khạ", "Liêu Bình Hương"] },
  { name: "Huyện Hóc Môn", code: "HM", streets: ["Tô Ký", "Lý Thường Kiệt", "Quốc Lộ 22", "Nguyễn Ảnh Thủ", "Lê Thị Hà"] },
  { name: "Huyện Nhà Bè", code: "NB", streets: ["Huỳnh Tấn Phát", "Nguyễn Hữu Thọ", "Lê Văn Lương", "Phạm Hữu Lầu"] }
];

const mockUsers = [
  {
    fullName: "Nguyễn Văn An",
    email: "admin@boardinghouse.vn",
    password: "admin",
    phone: "0901111111",
    role: "admin",
    status: "active"
  },
  {
    fullName: "Trần Thị Bích",
    email: "manager.q1@boardinghouse.vn",
    password: "manager",
    phone: "0902222222",
    role: "manager",
    status: "active"
  },
  {
    fullName: "Lê Hoàng Cường",
    email: "manager.q3@boardinghouse.vn",
    password: "manager",
    phone: "0903333333",
    role: "manager",
    status: "active"
  },
  {
    fullName: "Phạm Minh Đức",
    email: "duc.pm@gmail.com",
    password: "tenant",
    phone: "0904444444",
    role: "tenant",
    status: "active",
    tenantProfile: {
      cccd: "079096001234",
      occupation: "Lập trình viên",
      permanentAddress: "123 Đường 3/2, Quận 10, TP.HCM"
    }
  },
  {
    fullName: "Hoàng Thuỳ Linh",
    email: "linh.ht@gmail.com",
    password: "tenant",
    phone: "0905555555",
    role: "tenant",
    status: "active",
    tenantProfile: {
      cccd: "079096005678",
      occupation: "Sinh viên",
      permanentAddress: "456 Lê Lợi, TP. Huế"
    }
  },
  {
    fullName: "Vũ Quang Huy",
    email: "huy.vq@gmail.com",
    password: "tenant",
    phone: "0906666666",
    role: "tenant",
    status: "active",
    tenantProfile: {
      cccd: "079096009999",
      occupation: "Kinh doanh tự do",
      permanentAddress: "789 Quốc Lộ 1A, Biên Hòa, Đồng Nai"
    }
  },
  // Kịch bản Trả muộn (Late Payment)
  {
    fullName: "Trần Văn Muộn",
    email: "tramuon@gmail.com",
    password: "tenant",
    phone: "0907777777",
    role: "tenant",
    status: "active",
    tenantProfile: {
      cccd: "079096001111",
      occupation: "Nhân viên văn phòng",
      permanentAddress: "12 Lũy Bán Bích, Quận Tân Phú, TP.HCM"
    }
  },
  // Kịch bản Gọi dịch vụ sửa chữa (Requesting Repair Service)
  {
    fullName: "Nguyễn Văn Sửa",
    email: "suachua@gmail.com",
    password: "tenant",
    phone: "0908888888",
    role: "tenant",
    status: "active",
    tenantProfile: {
      cccd: "079096002222",
      occupation: "Kỹ sư cơ khí",
      permanentAddress: "34 Nguyễn Hữu Thọ, Huyện Nhà Bè, TP.HCM"
    }
  },
  // Kịch bản Hợp đồng đã kết thúc / Trả phòng (Terminated/Left Tenant)
  {
    fullName: "Lê Văn Hủy",
    email: "dahuy@gmail.com",
    password: "tenant",
    phone: "0909999999",
    role: "tenant",
    status: "active",
    tenantProfile: {
      cccd: "079096003333",
      occupation: "Lao động tự do",
      permanentAddress: "56 Cộng Hòa, Quận Tân Bình, TP.HCM"
    }
  },
  // Kịch bản Đặt cọc giữ phòng, chưa ký hợp đồng chính thức (Deposit/Draft Contract)
  {
    fullName: "Phạm Thị Cọc",
    email: "dactn@gmail.com",
    password: "tenant",
    phone: "0901234567",
    role: "tenant",
    status: "active",
    tenantProfile: {
      cccd: "079096004444",
      occupation: "Kế toán trưởng",
      permanentAddress: "78 Võ Văn Tần, Quận 3, TP.HCM"
    }
  }
];

const seedDatabase = async () => {
  try {
    // Đảm bảo cấu hình DNS Google để kết nối Atlas thành công trên Windows
    const dns = await import('dns');
    dns.setServers(['8.8.8.8', '8.8.4.4']);

    await connectDB();

    console.log("Cleaning existing database collections...");
    await User.deleteMany({});
    await Property.deleteMany({});
    await RoomType.deleteMany({});
    await Room.deleteMany({});
    await Service.deleteMany({});
    await Contract.deleteMany({});
    await Invoice.deleteMany({});
    await Payment.deleteMany({});
    await Notification.deleteMany({});
    await Reading.deleteMany({});
    console.log("Database cleared successfully!");

    // 1. Seed Users (with secure hashing)
    console.log("Seeding users...");
    const seededUsers = [];
    for (const u of mockUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(u.password, salt);
      const newUser = await User.create({
        ...u,
        password: hashedPassword
      });
      seededUsers.push(newUser);
    }
    console.log(`Successfully seeded ${seededUsers.length} users.`);

    const adminUser = seededUsers.find(u => u.role === 'admin');
    const managerQ1 = seededUsers.find(u => u.email === 'manager.q1@boardinghouse.vn');
    const managerQ3 = seededUsers.find(u => u.email === 'manager.q3@boardinghouse.vn');
    
    const tenantNormal1 = seededUsers.find(u => u.email === 'duc.pm@gmail.com');
    const tenantNormal2 = seededUsers.find(u => u.email === 'huy.vq@gmail.com');
    const tenantNormal3 = seededUsers.find(u => u.email === 'linh.ht@gmail.com');
    const tenantLate = seededUsers.find(u => u.email === 'tramuon@gmail.com');
    const tenantRepair = seededUsers.find(u => u.email === 'suachua@gmail.com');
    const tenantLeft = seededUsers.find(u => u.email === 'dahuy@gmail.com');
    const tenantDeposit = seededUsers.find(u => u.email === 'dactn@gmail.com');

    // 2. Seed 220 Properties (10 per district in HCMC)
    console.log("Seeding 220 hostel facilities (10 per HCMC district)...");
    const seededProperties = [];
    let branchCounter = 0;

    for (const dist of HCMC_DISTRICTS_DATA) {
      for (let i = 1; i <= 10; i++) {
        branchCounter++;
        const street = dist.streets[(i - 1) % dist.streets.length];
        const addressNo = i * 15 + (i % 3);
        const address = `${addressNo} ${street}, Phường ${i + 1}`;
        const codeSuffix = i < 10 ? `0${i}` : `${i}`;
        const code = `NT-${dist.code}-${codeSuffix}`;
        const name = `Nhà trọ ${dist.name} — Cơ sở ${codeSuffix}`;
        
        let assignedManagers = [];
        if (dist.code === 'Q1' && i === 1) {
          assignedManagers = [managerQ1._id];
        } else if (dist.code === 'Q3' && i === 1) {
          assignedManagers = [managerQ3._id];
        }

        const prop = await Property.create({
          code,
          name,
          address,
          district: dist.name,
          city: "TP. Hồ Chí Minh",
          image: `https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&sig=${branchCounter}`,
          totalRooms: 20,
          occupiedRooms: (dist.code === 'Q1' && i === 1) ? 5 : 0, // 5 occupied rooms for primary property Q1
          managerIds: assignedManagers,
          ownerId: adminUser._id,
          status: "active"
        });

        if (dist.code === 'Q1' && i === 1) {
          await User.findByIdAndUpdate(managerQ1._id, { $push: { propertyIds: prop._id } });
        } else if (dist.code === 'Q3' && i === 1) {
          await User.findByIdAndUpdate(managerQ3._id, { $push: { propertyIds: prop._id } });
        }

        seededProperties.push(prop);
      }
    }
    console.log(`Successfully seeded ${seededProperties.length} facilities across HCMC.`);

    // 3. Seed Services, Room Types, and Rooms for a primary property (Q1 Facility 1)
    const primaryProp = seededProperties.find(p => p.code === 'NT-Q1-01');
    if (primaryProp) {
      console.log(`Setting up sample rooms and services for primary property: ${primaryProp.name}...`);
      
      const electricService = await Service.create({
        propertyId: primaryProp._id,
        name: "Điện",
        unit: "kWh",
        price: 3500,
        type: "metered"
      });
      const waterService = await Service.create({
        propertyId: primaryProp._id,
        name: "Nước",
        unit: "m3",
        price: 15000,
        type: "metered"
      });
      const internetService = await Service.create({
        propertyId: primaryProp._id,
        name: "Internet",
        unit: "phòng",
        price: 100000,
        type: "fixed"
      });
      const trashService = await Service.create({
        propertyId: primaryProp._id,
        name: "Vệ sinh",
        unit: "người",
        price: 30000,
        type: "fixed"
      });

      const singleRoomType = await RoomType.create({
        propertyId: primaryProp._id,
        name: "Phòng đơn Standard",
        area: 18,
        basePrice: 3500000,
        amenities: ["Máy lạnh", "Gác lửng", "Kệ bếp"]
      });

      const doubleRoomType = await RoomType.create({
        propertyId: primaryProp._id,
        name: "Phòng đôi Studio",
        area: 25,
        basePrice: 5000000,
        amenities: ["Máy lạnh", "Tủ lạnh", "Gác lửng", "Tủ quần áo", "Máy giặt chung"]
      });

      // Seed 20 Rooms, map specific room numbers to specific test scenario cases
      const seededRooms = [];
      for (let floor = 1; floor <= 4; floor++) {
        for (let r = 1; r <= 5; r++) {
          const roomNumber = `${floor}0${r}`;
          const isStudio = floor >= 3;
          const roomType = isStudio ? doubleRoomType : singleRoomType;
          
          let status = 'empty';
          if (roomNumber === '101') status = 'rented';     // Normal tenant 1
          else if (roomNumber === '102') status = 'deposit'; // Deposit tenant
          else if (roomNumber === '103') status = 'rented';  // Normal tenant 2
          else if (roomNumber === '104') status = 'rented';  // Late payment tenant
          else if (roomNumber === '105') status = 'maintenance'; // Repair service request
          // Room 106 will be 'empty' since tenant Left (Terminated contract)

          const roomObj = await Room.create({
            propertyId: primaryProp._id,
            roomTypeId: roomType._id,
            roomNumber,
            floor,
            currentPrice: roomType.basePrice,
            price: roomType.basePrice,
            area: roomType.area,
            code: `${primaryProp.code}-${roomNumber}`,
            status,
            assets: [
              { name: "Máy lạnh Daikin 1.5 HP", value: 8000000, condition: roomNumber === '105' ? "Hỏng (Không lạnh)" : "Tốt" },
              { name: "Công tơ điện tử thông minh", value: 500000, condition: "Tốt" },
              { name: "Bếp từ âm đôi", value: 4500000, condition: "Tốt" }
            ]
          });
          seededRooms.push(roomObj);
        }
      }
      console.log(`Seeded ${seededRooms.length} rooms for ${primaryProp.name}.`);

      // 4. Create contracts, readings, and invoices for each scenario

      // SCENARIO 1: Normal Active Tenant 1 (Room 101 - Phạm Minh Đức)
      const room101 = seededRooms.find(r => r.roomNumber === '101');
      if (room101 && tenantNormal1) {
        const contract = await Contract.create({
          roomId: room101._id,
          tenantIds: [tenantNormal1._id],
          startDate: new Date("2026-02-01"),
          endDate: new Date("2027-02-01"),
          deposit: room101.currentPrice * 2,
          status: "active",
          fileUrl: "/contracts/NT-Q1-01-101-signed.pdf"
        });

        // 101 Readings
        await Reading.create({ roomId: room101._id, serviceId: electricService._id, period: "2026-05", oldValue: 1000, newValue: 1150, consumption: 150 });
        await Reading.create({ roomId: room101._id, serviceId: waterService._id, period: "2026-05", oldValue: 50, newValue: 60, consumption: 10 });

        // Invoice (Pending, deadline in the future)
        const rentAmount = room101.currentPrice;
        const total = rentAmount + (150 * electricService.price) + (10 * waterService.price) + internetService.price + trashService.price;
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 10); // 10 days in the future

        await Invoice.create({
          contractId: contract._id,
          roomId: room101._id,
          period: "2026-05",
          totalAmount: total,
          deadline,
          status: "pending",
          details: [
            { name: "Tiền phòng tháng 05/2026", quantity: 1, price: rentAmount, amount: rentAmount },
            { name: "Tiền Điện", quantity: 150, price: electricService.price, amount: 150 * electricService.price },
            { name: "Tiền Nước", quantity: 10, price: waterService.price, amount: 10 * waterService.price },
            { name: "Internet cố định", quantity: 1, price: internetService.price, amount: internetService.price },
            { name: "Phí vệ sinh", quantity: 1, price: trashService.price, amount: trashService.price }
          ]
        });

        await Notification.create({
          userId: tenantNormal1._id,
          title: "Thông báo hoá đơn tháng 05/2026",
          content: `Hệ thống đã phát hành hoá đơn tháng 05/2026 trị giá ${total.toLocaleString('vi-VN')}đ cho phòng 101. Hạn thanh toán: ${deadline.toLocaleDateString('vi-VN')}.`,
          channel: "push",
          isRead: false
        });
      }

      // SCENARIO 2: Deposit / Draft Contract (Room 102 - Phạm Thị Cọc)
      const room102 = seededRooms.find(r => r.roomNumber === '102');
      if (room102 && tenantDeposit) {
        // Contract is in Draft state (pending signature)
        await Contract.create({
          roomId: room102._id,
          tenantIds: [tenantDeposit._id],
          startDate: new Date("2026-06-01"),
          endDate: new Date("2027-06-01"),
          deposit: room102.currentPrice * 1.5,
          status: "draft",
          fileUrl: "/contracts/NT-Q1-01-102-draft.pdf"
        });

        await Notification.create({
          userId: tenantDeposit._id,
          title: "Lời mời ký kết hợp đồng điện tử",
          content: "Yêu cầu đặt cọc phòng 102 của bạn đã được phê duyệt. Vui lòng xem và ký duyệt hợp đồng điện tử dự thảo trước ngày 28/05/2026.",
          channel: "push",
          isRead: false
        });
      }

      // SCENARIO 3: Normal Active Tenant 2 (Room 103 - Vũ Quang Huy)
      const room103 = seededRooms.find(r => r.roomNumber === '103');
      if (room103 && tenantNormal2) {
        const contract = await Contract.create({
          roomId: room103._id,
          tenantIds: [tenantNormal2._id],
          startDate: new Date("2026-01-15"),
          endDate: new Date("2027-01-15"),
          deposit: room103.currentPrice * 2,
          status: "active",
          fileUrl: "/contracts/NT-Q1-01-103-signed.pdf"
        });

        // Invoice already Paid
        const rentAmount = room103.currentPrice;
        const total = rentAmount + internetService.price + trashService.price;
        const paidInvoice = await Invoice.create({
          contractId: contract._id,
          roomId: room103._id,
          period: "2026-05",
          totalAmount: total,
          deadline: new Date(),
          status: "paid",
          details: [
            { name: "Tiền phòng tháng 05/2026", quantity: 1, price: rentAmount, amount: rentAmount },
            { name: "Internet cố định", quantity: 1, price: internetService.price, amount: internetService.price },
            { name: "Phí vệ sinh", quantity: 1, price: trashService.price, amount: trashService.price }
          ]
        });

        await Payment.create({
          invoiceId: paidInvoice._id,
          method: "vnpay",
          amount: total,
          status: "success"
        });

        await Notification.create({
          userId: tenantNormal2._id,
          title: "Xác nhận thanh toán thành công",
          content: `Hóa đơn phòng 103 trị giá ${total.toLocaleString('vi-VN')}đ đã thanh toán thành công qua cổng VNPay. Xin cảm ơn quý khách!`,
          channel: "push",
          isRead: true
        });
      }

      // SCENARIO 4: Late Payment / Overdue Invoice (Room 104 - Trần Văn Muộn)
      const room104 = seededRooms.find(r => r.roomNumber === '104');
      if (room104 && tenantLate) {
        const contract = await Contract.create({
          roomId: room104._id,
          tenantIds: [tenantLate._id],
          startDate: new Date("2025-10-01"),
          endDate: new Date("2026-10-01"),
          deposit: room104.currentPrice * 2,
          status: "active",
          fileUrl: "/contracts/NT-Q1-01-104-signed.pdf"
        });

        await Reading.create({ roomId: room104._id, serviceId: electricService._id, period: "2026-05", oldValue: 1520, newValue: 1720, consumption: 200 });
        await Reading.create({ roomId: room104._id, serviceId: waterService._id, period: "2026-05", oldValue: 80, newValue: 95, consumption: 15 });

        // Overdue Invoice (Deadline was May 5th, current is May 22nd)
        const rentAmount = room104.currentPrice;
        const electricCost = 200 * electricService.price;
        const waterCost = 15 * waterService.price;
        const total = rentAmount + electricCost + waterCost + internetService.price + trashService.price;
        
        const overdueDeadline = new Date();
        overdueDeadline.setDate(overdueDeadline.getDate() - 17); // 17 days ago

        await Invoice.create({
          contractId: contract._id,
          roomId: room104._id,
          period: "2026-05",
          totalAmount: total,
          deadline: overdueDeadline,
          status: "overdue",
          details: [
            { name: "Tiền phòng tháng 05/2026", quantity: 1, price: rentAmount, amount: rentAmount },
            { name: "Tiền Điện (chỉ số 1520 -> 1720)", quantity: 200, price: electricService.price, amount: electricCost },
            { name: "Tiền Nước (chỉ số 80 -> 95)", quantity: 15, price: waterService.price, amount: waterCost },
            { name: "Internet cố định", quantity: 1, price: internetService.price, amount: internetService.price },
            { name: "Phí vệ sinh", quantity: 1, price: trashService.price, amount: trashService.price }
          ]
        });

        // Notifications alerting late payment
        await Notification.create({
          userId: tenantLate._id,
          title: "CẢNH BÁO QUÁ HẠN THANH TOÁN (Trễ 17 ngày)",
          content: `Hóa đơn phòng 104 trị giá ${total.toLocaleString('vi-VN')}đ đã quá hạn 17 ngày (Hạn chót: ${overdueDeadline.toLocaleDateString('vi-VN')}). Vui lòng thanh toán ngay để tránh bị phạt tiền và khóa cổng ra vào tự động.`,
          channel: "push",
          isRead: false
        });

        await Notification.create({
          userId: tenantLate._id,
          title: "Nhắc nhở đóng tiền trọ lần 2",
          content: "Yêu cầu thanh toán tiền thuê trọ kỳ tháng 05/2026. Nếu có khó khăn đột xuất, vui lòng liên hệ trực tiếp với quản lý cơ sở để được hỗ trợ giãn hạn.",
          channel: "email",
          isRead: false
        });
      }

      // SCENARIO 5: Repair Service / Maintenance Request (Room 105 - Nguyễn Văn Sửa)
      const room105 = seededRooms.find(r => r.roomNumber === '105');
      if (room105 && tenantRepair) {
        const contract = await Contract.create({
          roomId: room105._id,
          tenantIds: [tenantRepair._id],
          startDate: new Date("2026-03-01"),
          endDate: new Date("2027-03-01"),
          deposit: room105.currentPrice * 2,
          status: "active",
          fileUrl: "/contracts/NT-Q1-01-105-signed.pdf"
        });

        // Notifications representing repair status updates
        await Notification.create({
          userId: tenantRepair._id,
          title: "Báo cáo sự cố sửa chữa đã tiếp nhận",
          content: "Yêu cầu gọi thợ sửa máy lạnh Daikin (bị lỗi không lạnh) tại phòng 105 của bạn đã được quản lý tiếp nhận thành công.",
          channel: "push",
          isRead: true
        });

        await Notification.create({
          userId: tenantRepair._id,
          title: "Đặt lịch hẹn kỹ thuật sửa chữa",
          content: "Lịch sửa chữa điều hòa phòng 105 đã được đặt: Kỹ thuật viên Nguyễn Văn Bình sẽ đến kiểm tra và xử lý lúc 09:00 sáng mai (23/05/2026). Điện thoại liên hệ: 0912345678.",
          channel: "push",
          isRead: false
        });

        await Notification.create({
          userId: tenantRepair._id,
          title: "Nhắc lịch bảo trì thiết bị phòng",
          content: "Vui lòng chuẩn bị người ở phòng hoặc bàn giao chìa khóa cho quản lý trước thời điểm thợ đến kiểm tra sửa chữa điều hòa.",
          channel: "zalo",
          isRead: false
        });
      }

      // SCENARIO 6: Terminated Contract / Left Tenant (Room 106 - Lê Văn Hủy)
      const room106 = seededRooms.find(r => r.roomNumber === '106');
      if (room106 && tenantLeft) {
        // Contract has been terminated
        await Contract.create({
          roomId: room106._id,
          tenantIds: [tenantLeft._id],
          startDate: new Date("2025-01-01"),
          endDate: new Date("2026-01-01"),
          deposit: room106.currentPrice * 2,
          status: "terminated",
          fileUrl: "/contracts/NT-Q1-01-106-terminated.pdf"
        });

        await Notification.create({
          userId: tenantLeft._id,
          title: "Biên bản thanh lý hợp đồng & trả cọc",
          content: "Hợp đồng phòng 106 đã được thanh lý hoàn tất vào ngày 01/01/2026. Số tiền đặt cọc đã được khấu trừ dịch vụ cuối cùng và hoàn trả đầy đủ cho bạn.",
          channel: "push",
          isRead: true
        });
      }
    }

    console.log("\nDatabase seeding completed successfully!");
    mongoose.connection.close();
    console.log("Database connection closed cleanly.");
    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed:", error.message);
    mongoose.connection?.close();
    process.exit(1);
  }
};

// Khởi chạy seeding
seedDatabase();
