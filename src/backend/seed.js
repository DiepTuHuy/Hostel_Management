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
    password: "admin", // Will hash this
    phone: "0901111111",
    role: "admin",
    status: "active"
  },
  {
    fullName: "Trần Thị Bích",
    email: "manager.q1@boardinghouse.vn",
    password: "manager", // Will hash this
    phone: "0902222222",
    role: "manager",
    status: "active"
  },
  {
    fullName: "Lê Hoàng Cường",
    email: "manager.q3@boardinghouse.vn",
    password: "manager", // Will hash this
    phone: "0903333333",
    role: "manager",
    status: "active"
  },
  {
    fullName: "Phạm Minh Đức",
    email: "duc.pm@gmail.com",
    password: "tenant", // Will hash this
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
    password: "tenant", // Will hash this
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
    password: "tenant", // Will hash this
    phone: "0906666666",
    role: "tenant",
    status: "active",
    tenantProfile: {
      cccd: "079096009999",
      occupation: "Kinh doanh tự do",
      permanentAddress: "789 Quốc Lộ 1A, Biên Hòa, Đồng Nai"
    }
  }
];

const seedDatabase = async () => {
  try {
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
    console.log("Database cleared!");

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
    const tenant1 = seededUsers.find(u => u.email === 'duc.pm@gmail.com');

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
        
        // Randomly assign managers to some branches
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
          occupiedRooms: (dist.code === 'Q1' && i === 1) ? 1 : 0, // Mark 1 occupied room for demo
          managerIds: assignedManagers,
          ownerId: adminUser._id,
          status: "active"
        });

        // Link manager properties back
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
      
      // Seed default Services
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

      // Seed Room Types
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

      // Seed 20 Rooms
      const seededRooms = [];
      for (let floor = 1; floor <= 4; floor++) {
        for (let r = 1; r <= 5; r++) {
          const roomNumber = `${floor}0${r}`;
          const isStudio = floor >= 3; // 3rd & 4th floors are Studios
          const roomType = isStudio ? doubleRoomType : singleRoomType;
          const status = (floor === 1 && r === 1) ? 'rented' : 'empty'; // Room 101 is rented to tenant1

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
              { name: "Máy lạnh Daikin", value: 8000000, condition: "Tốt" },
              { name: "Công tơ điện tử", value: 500000, condition: "Tốt" }
            ]
          });
          seededRooms.push(roomObj);
        }
      }
      console.log(`Seeded ${seededRooms.length} rooms for ${primaryProp.name}.`);

      // 4. Create Contract, Readings, Invoice and Payment for the rented room (Room 101)
      const rentedRoom = seededRooms.find(r => r.roomNumber === '101');
      if (rentedRoom && tenant1) {
        console.log("Setting up active contract, meter reading, and invoice for Room 101...");
        
        // Active contract
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3); // Started 3 months ago
        const endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1); // 1-year contract

        const contract = await Contract.create({
          roomId: rentedRoom._id,
          tenantIds: [tenant1._id],
          startDate,
          endDate,
          deposit: rentedRoom.currentPrice * 2, // 2 months deposit
          status: "active",
          fileUrl: "/contracts/NT-Q1-01-101-signed.pdf"
        });

        // Electricity / Water readings
        const readingPeriod = "2026-05";
        const electReading = await Reading.create({
          roomId: rentedRoom._id,
          serviceId: electricService._id,
          period: readingPeriod,
          oldValue: 1240,
          newValue: 1390,
          consumption: 150
        });

        const waterReading = await Reading.create({
          roomId: rentedRoom._id,
          serviceId: waterService._id,
          period: readingPeriod,
          oldValue: 85,
          newValue: 95,
          consumption: 10
        });

        // Generate Invoice
        const rentAmount = rentedRoom.currentPrice;
        const electricCost = electReading.consumption * electricService.price;
        const waterCost = waterReading.consumption * waterService.price;
        const internetCost = internetService.price;
        const trashCost = trashService.price * 1; // 1 person
        const totalAmount = rentAmount + electricCost + waterCost + internetCost + trashCost;

        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 5);

        const invoice = await Invoice.create({
          contractId: contract._id,
          roomId: rentedRoom._id,
          period: readingPeriod,
          totalAmount,
          deadline,
          status: "pending",
          details: [
            { serviceId: null, name: "Tiền phòng tháng 05/2026", quantity: 1, price: rentAmount, amount: rentAmount },
            { serviceId: electricService._id, name: "Tiền Điện", quantity: electReading.consumption, price: electricService.price, amount: electricCost },
            { serviceId: waterService._id, name: "Tiền Nước", quantity: waterReading.consumption, price: waterService.price, amount: waterCost },
            { serviceId: internetService._id, name: "Internet", quantity: 1, price: internetService.price, amount: internetCost },
            { serviceId: trashService._id, name: "Phí vệ sinh", quantity: 1, price: trashService.price, amount: trashCost }
          ]
        });

        // Notification for invoice
        await Notification.create({
          userId: tenant1._id,
          title: "Thông báo hoá đơn tháng 05/2026",
          content: `Hoá đơn tiền phòng tháng 05/2026 của phòng 101 là ${totalAmount.toLocaleString('vi-VN')}đ đã được tạo. Hạn thanh toán: ${deadline.toLocaleDateString('vi-VN')}.`,
          channel: "push",
          isRead: false
        });

        console.log(`Seeded contract, readings, and pending invoice (Total: ${totalAmount.toLocaleString('vi-VN')}đ) for Room 101.`);
      }
    }

    console.log("\nDatabase seeding completed successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Database seeding failed:", error.message);
    mongoose.connection?.close();
    process.exit(1);
  }
};

// Execute seeding
seedDatabase();

