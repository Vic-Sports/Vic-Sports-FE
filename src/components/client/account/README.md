# Profile Management Components

## Tổng quan

Bộ component quản lý profile người dùng với giao diện đẹp và đầy đủ tính năng, được thiết kế dựa trên model User từ backend.

## Các Component

### 1. ManageAccount (index.tsx)
- Component chính quản lý toàn bộ profile
- Sử dụng Modal với Tabs để tổ chức các phần khác nhau
- Giao diện responsive và modern

### 2. UserStats (user-stats.tsx)
- Hiển thị thống kê tổng quan của người dùng
- Bao gồm:
  - Thông tin profile cơ bản
  - Điểm thưởng và rank (Bronze, Silver, Gold, Diamond)
  - Tổng lượt đặt sân
  - Tổng chi tiêu
  - Thông tin bổ sung (ngày sinh, giới tính, địa chỉ)

### 3. UserInfo (user.info.tsx)
- Form cập nhật thông tin cá nhân
- Bao gồm:
  - Avatar upload
  - Thông tin cơ bản (email, tên, số điện thoại)
  - Ngày sinh, giới tính
  - Địa chỉ chi tiết (tỉnh, quận, phường, đường)

### 4. UserPreferences (user-preferences.tsx)
- Quản lý sở thích và cài đặt
- Bao gồm:
  - Môn thể thao yêu thích
  - Ngày thích chơi
  - Khung giờ thích chơi
  - Giới thiệu bản thân (bio)
  - Liên hệ khẩn cấp
  - Cài đặt thông báo

### 5. ChangePassword (change.password.tsx)
- Form đổi mật khẩu
- Validation và bảo mật

## Tính năng chính

### 1. Giao diện đẹp và hiện đại
- Sử dụng Ant Design components
- Layout responsive
- Icons và màu sắc phù hợp
- Card layout cho từng section

### 2. Quản lý thông tin đầy đủ
- Dựa trên model User từ backend
- Hỗ trợ tất cả các trường trong schema
- Validation và error handling

### 3. Upload Avatar
- Tích hợp với Cloudinary
- Preview và crop
- Progress indicator

### 4. Hệ thống điểm và rank
- Hiển thị rank hiện tại
- Progress bar cho rank tiếp theo
- Tính toán điểm cần thiết

### 5. Sở thích thể thao
- Multi-select cho môn thể thao
- Multi-select cho ngày trong tuần
- Time picker cho khung giờ

### 6. Cài đặt thông báo
- Toggle switches cho email, push, SMS
- Lưu preferences vào database

## API Endpoints

### 1. updateUserInfoAPI
```typescript
updateUserInfoAPI(
  _id: string,
  avatar: string,
  userData: {
    fullName: string;
    phone: string;
    dateOfBirth?: string;
    gender?: string;
    address?: {
      province: string;
      district: string;
      ward: string;
      street: string;
    };
  }
)
```

### 2. updateUserPreferencesAPI
```typescript
updateUserPreferencesAPI(
  _id: string,
  preferences: {
    favoriteSports?: string[];
    preferredDays?: string[];
    preferredTimeRange?: {
      from: string;
      to: string;
    };
    bio?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    notificationSettings?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  }
)
```

## Cách sử dụng

```tsx
import ManageAccount from "@/components/client/account";

const MyComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <ManageAccount 
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
    />
  );
};
```

## Dependencies

- Ant Design
- dayjs (cho date/time handling)
- React hooks
- Axios (cho API calls)

## Notes

- Component sử dụng context để quản lý state user
- Tất cả API calls đều có error handling
- Responsive design cho mobile và desktop
- Tích hợp với hệ thống authentication
