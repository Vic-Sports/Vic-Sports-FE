# JSON Database System cho Vic Sports Frontend

Hệ thống JSON Database được thiết kế để thay thế database thực trong quá trình phát triển và demo local. Mỗi model được lưu trữ trong file JSON riêng biệt để dễ quản lý và mở rộng.

## 📁 Cấu trúc thư mục

```
src/
├── types/
│   └── mockdata.ts          # TypeScript interfaces
├── data/
│   ├── users.json          # Dữ liệu người dùng
│   ├── venues.json         # Dữ liệu sân thể thao
│   ├── courts.json         # Dữ liệu sân con
│   ├── bookings.json       # Dữ liệu đặt sân
│   ├── coaches.json        # Dữ liệu huấn luyện viên
│   ├── reviews.json        # Dữ liệu đánh giá
│   ├── tournaments.json    # Dữ liệu giải đấu
│   └── owners.json         # Dữ liệu chủ sân
├── services/
│   └── jsonDbService.ts    # Service chính để thao tác dữ liệu
└── utils/
    └── mockDataUtils.ts     # Helper functions và utilities
```

## 🚀 Cách sử dụng

### 1. Import service

```typescript
import { jsonDbService } from '../services/jsonDbService';
```

### 2. Sử dụng các service

#### User Service
```typescript
// Lấy tất cả users
const users = await jsonDbService.users.getAll();

// Lấy user theo ID
const user = await jsonDbService.users.getById('507f1f77bcf86cd799439011');

// Tạo user mới
const newUser = await jsonDbService.users.create({
  fullName: 'Nguyễn Văn A',
  email: 'nguyenvana@gmail.com',
  role: 'customer',
  status: 'ACTIVE',
  // ... các field khác
});

// Cập nhật user
const updatedUser = await jsonDbService.users.update('507f1f77bcf86cd799439011', {
  fullName: 'Nguyễn Văn B'
});

// Xóa user
const deleted = await jsonDbService.users.delete('507f1f77bcf86cd799439011');

// Tìm kiếm users
const searchResults = await jsonDbService.users.search('Nguyễn');

// Lấy users theo role
const customers = await jsonDbService.users.getByRole('customer');
```

#### Venue Service
```typescript
// Lấy tất cả venues
const venues = await jsonDbService.venues.getAll();

// Lấy venue theo ID
const venue = await jsonDbService.venues.getById('507f1f77bcf86cd799439012');

// Lấy venues theo owner
const ownerVenues = await jsonDbService.venues.getByOwner('507f1f77bcf86cd799439012');

// Lấy venues đang hoạt động
const activeVenues = await jsonDbService.venues.getActive();

// Tìm kiếm venues
const searchResults = await jsonDbService.venues.search('Sân bóng');
```

#### Booking Service
```typescript
// Lấy tất cả bookings
const bookings = await jsonDbService.bookings.getAll();

// Lấy bookings theo customer
const customerBookings = await jsonDbService.bookings.getByCustomer('507f1f77bcf86cd799439011');

// Lấy bookings theo venue
const venueBookings = await jsonDbService.bookings.getByVenue('507f1f77bcf86cd799439012');

// Lấy bookings theo status
const confirmedBookings = await jsonDbService.bookings.getByStatus('confirmed');

// Tạo booking mới
const newBooking = await jsonDbService.bookings.create({
  customerId: '507f1f77bcf86cd799439011',
  courtId: '507f1f77bcf86cd799439015',
  venueId: '507f1f77bcf86cd799439012',
  bookingDate: '2024-01-25T00:00:00Z',
  timeSlot: { start: '18:00', end: '20:00' },
  duration: 2,
  pricePerHour: 250000,
  totalPrice: 500000,
  finalPrice: 500000,
  paymentMethod: { type: 'card', status: 'pending' },
  paymentStatus: 'pending',
  status: 'pending',
  checkedIn: false,
  checkedOut: false,
  pointsEarned: 0,
  pointsUsed: 0,
  weatherImpacted: false,
  isTournamentMatch: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});
```

### 3. Sử dụng Utilities

```typescript
import { utils } from '../utils/mockDataUtils';

// Date utilities
const formattedDate = utils.date.formatDate('2024-01-15T10:30:00Z');
const isToday = utils.date.isToday('2024-01-15T10:30:00Z');

// Currency utilities
const formattedPrice = utils.currency.formatCurrency(500000);

// User utilities
const displayRole = utils.user.getDisplayRole('customer');
const tierColor = utils.user.getTierColor('Gold');

// Venue utilities
const fullAddress = utils.venue.getFullAddress(venue);
const ratingStars = utils.venue.getRatingStars(4.5);

// Booking utilities
const statusText = utils.booking.getDisplayStatus('confirmed');
const canCancel = utils.booking.canCancel(booking);

// Validation utilities
const isValidEmail = utils.validation.isValidEmail('test@gmail.com');
const isValidPhone = utils.validation.isValidPhone('0901234567');
```

### 4. Statistics Service

```typescript
// Lấy thống kê tổng quan
const overview = await jsonDbService.statistics.getOverview();
console.log(overview);
// {
//   totalUsers: 5,
//   totalVenues: 3,
//   totalCourts: 4,
//   totalBookings: 5,
//   totalCoaches: 2,
//   totalReviews: 3,
//   totalTournaments: 3,
//   totalOwners: 2,
//   activeUsers: 4,
//   activeVenues: 3,
//   activeCourts: 4,
//   verifiedCoaches: 2,
//   verifiedOwners: 1,
//   totalRevenue: 35000000
// }

// Lấy thống kê users
const userStats = await jsonDbService.statistics.getUserStats();

// Lấy thống kê venues
const venueStats = await jsonDbService.statistics.getVenueStats();
```

## 📊 Dữ liệu mẫu

Hệ thống đã được cung cấp sẵn dữ liệu mẫu:

- **5 Users**: Bao gồm customer, owner, coach, admin
- **3 Venues**: Sân bóng đá, tennis, cầu lông
- **4 Courts**: Các sân con trong venues
- **5 Bookings**: Các đặt sân với trạng thái khác nhau
- **2 Coaches**: Huấn luyện viên chuyên nghiệp
- **3 Reviews**: Đánh giá từ khách hàng
- **3 Tournaments**: Giải đấu các môn thể thao
- **2 Owners**: Chủ sân thể thao

## 🔧 Tính năng

### ✅ Đã có
- CRUD operations cho tất cả models
- Tìm kiếm và lọc dữ liệu
- Thống kê và báo cáo
- Utilities và helper functions
- TypeScript support đầy đủ
- Simulate API delay
- Dữ liệu mẫu phong phú

### ⚠️ Hạn chế
- Dữ liệu chỉ tồn tại trong memory (mất khi reload)
- Không có persistence thực sự
- Không có validation phức tạp
- Không có authentication/authorization
- Không có real-time updates

## 🎯 Sử dụng trong Demo

### 1. Thay thế API calls
```typescript
// Thay vì gọi API thật
// const response = await fetch('/api/users');

// Sử dụng JSON DB service
const users = await jsonDbService.users.getAll();
```

### 2. Trong React components
```typescript
import React, { useState, useEffect } from 'react';
import { jsonDbService } from '../services/jsonDbService';

const UserList: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await jsonDbService.users.getAll();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {users.map(user => (
        <div key={user._id}>
          <h3>{user.fullName}</h3>
          <p>{user.email}</p>
          <span>{utils.user.getDisplayRole(user.role)}</span>
        </div>
      ))}
    </div>
  );
};
```

### 3. Trong Redux/Context
```typescript
// actions/userActions.ts
export const fetchUsers = () => async (dispatch: any) => {
  dispatch({ type: 'FETCH_USERS_START' });
  
  try {
    const users = await jsonDbService.users.getAll();
    dispatch({ type: 'FETCH_USERS_SUCCESS', payload: users });
  } catch (error) {
    dispatch({ type: 'FETCH_USERS_ERROR', payload: error.message });
  }
};
```

## 🔄 Migration sang Database thật

Khi chuyển sang database thật, chỉ cần:

1. Thay thế `jsonDbService` bằng API service thật
2. Giữ nguyên interface và function signatures
3. Cập nhật error handling và loading states
4. Thêm authentication/authorization

## 📝 Lưu ý

- Tất cả operations đều có delay để simulate API calls
- Dữ liệu được lưu trong memory, không persist
- IDs được generate tự động bằng timestamp + random
- Có thể thêm/sửa/xóa dữ liệu trong runtime
- Phù hợp cho development và demo, không phù hợp cho production

## 🤝 Đóng góp

Để thêm dữ liệu mẫu mới:
1. Cập nhật file JSON tương ứng trong `src/data/`
2. Thêm helper functions trong `src/utils/mockDataUtils.ts` nếu cần
3. Cập nhật documentation

---

**Happy Coding! 🚀**
