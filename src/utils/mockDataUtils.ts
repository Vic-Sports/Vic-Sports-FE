// Helper functions và utilities cho JSON Database
import type { Booking, Coach, Tournament, User, Venue } from '../types/mockdata';

// Date utilities
export const dateUtils = {
  formatDate: (date: string | Date): string => {
    return new Date(date).toLocaleDateString('vi-VN');
  },

  formatDateTime: (date: string | Date): string => {
    return new Date(date).toLocaleString('vi-VN');
  },

  formatTime: (time: string): string => {
    return time.substring(0, 5); // HH:MM format
  },

  isToday: (date: string | Date): boolean => {
    const today = new Date();
    const targetDate = new Date(date);
    return today.toDateString() === targetDate.toDateString();
  },

  isPast: (date: string | Date): boolean => {
    return new Date(date) < new Date();
  },

  isFuture: (date: string | Date): boolean => {
    return new Date(date) > new Date();
  },

  addDays: (date: string | Date, days: number): string => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString();
  },

  getTimeSlots: (startTime: string, endTime: string, duration: number = 60): string[] => {
    const slots: string[] = [];
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    let current = new Date(start);
    while (current < end) {
      const next = new Date(current.getTime() + duration * 60000);
      if (next <= end) {
        slots.push(`${current.toTimeString().substring(0, 5)}-${next.toTimeString().substring(0, 5)}`);
      }
      current = next;
    }
    
    return slots;
  }
};

// Currency utilities
export const currencyUtils = {
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  },

  formatNumber: (amount: number): string => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  },

  calculateDiscount: (originalPrice: number, discountType: 'percentage' | 'amount', discountValue: number): number => {
    if (discountType === 'percentage') {
      return originalPrice * (discountValue / 100);
    }
    return discountValue;
  },

  calculateFinalPrice: (originalPrice: number, discountAmount: number): number => {
    return Math.max(0, originalPrice - discountAmount);
  }
};

// User utilities
export const userUtils = {
  getFullName: (user: User): string => {
    return user.fullName;
  },

  getInitials: (user: User): string => {
    return user.fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  },

  getDisplayRole: (role: string): string => {
    const roleMap: Record<string, string> = {
      'customer': 'Khách hàng',
      'owner': 'Chủ sân',
      'admin': 'Quản trị viên',
      'coach': 'Huấn luyện viên'
    };
    return roleMap[role] || role;
  },

  getDisplayStatus: (status: string): string => {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'Hoạt động',
      'INACTIVE': 'Không hoạt động',
      'BANNED': 'Bị cấm'
    };
    return statusMap[status] || status;
  },

  getDisplayTier: (tier: string): string => {
    const tierMap: Record<string, string> = {
      'Bronze': 'Đồng',
      'Silver': 'Bạc',
      'Gold': 'Vàng',
      'Diamond': 'Kim cương'
    };
    return tierMap[tier] || tier;
  },

  getTierColor: (tier: string): string => {
    const colorMap: Record<string, string> = {
      'Bronze': '#CD7F32',
      'Silver': '#C0C0C0',
      'Gold': '#FFD700',
      'Diamond': '#B9F2FF'
    };
    return colorMap[tier] || '#666';
  },

  isOnline: (user: User): boolean => {
    return user.isOnline;
  },

  getLastSeenText: (user: User): string => {
    if (user.isOnline) return 'Đang online';
    
    const lastSeen = new Date(user.lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa mới';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return dateUtils.formatDate(lastSeen);
  }
};

// Venue utilities
export const venueUtils = {
  getFullAddress: (venue: Venue): string => {
    const { street, ward, district, city } = venue.address;
    return `${street}, ${ward}, ${district}, ${city}`;
  },

  getShortAddress: (venue: Venue): string => {
    const { district, city } = venue.address;
    return `${district}, ${city}`;
  },

  getOperatingStatus: (venue: Venue): { isOpen: boolean; nextOpenTime?: string } => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().substring(0, 5);
    
    const todayHours = venue.operatingHours.find(hours => hours.dayOfWeek === currentDay);
    
    if (!todayHours || !todayHours.isOpen) {
      return { isOpen: false };
    }
    
    const isOpen = currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
    
    if (!isOpen && currentTime < todayHours.openTime) {
      return { isOpen: false, nextOpenTime: todayHours.openTime };
    }
    
    return { isOpen };
  },

  getRatingStars: (rating: number): string => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + 
           (hasHalfStar ? '☆' : '') + 
           '☆'.repeat(emptyStars);
  },

  getAmenityIcon: (amenityName: string): string => {
    const iconMap: Record<string, string> = {
      'Parking': '🚗',
      'Shower': '🚿',
      'Cafe': '☕',
      'Equipment': '🏓',
      'Air Conditioning': '❄️',
      'Locker': '🔒',
      'WiFi': '📶',
      'Food': '🍽️',
      'Drinks': '🥤'
    };
    return iconMap[amenityName] || '🏢';
  }
};

// Booking utilities
export const bookingUtils = {
  getDisplayStatus: (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'cancelled': 'Đã hủy',
      'completed': 'Hoàn thành',
      'no-show': 'Không đến'
    };
    return statusMap[status] || status;
  },

  getStatusColor: (status: string): string => {
    const colorMap: Record<string, string> = {
      'pending': '#FFA500',
      'confirmed': '#32CD32',
      'cancelled': '#FF4500',
      'completed': '#008000',
      'no-show': '#DC143C'
    };
    return colorMap[status] || '#666';
  },

  getPaymentStatusText: (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'Chờ thanh toán',
      'paid': 'Đã thanh toán',
      'failed': 'Thanh toán thất bại',
      'refunded': 'Đã hoàn tiền'
    };
    return statusMap[status] || status;
  },

  getPaymentMethodText: (method: string): string => {
    const methodMap: Record<string, string> = {
      'cash': 'Tiền mặt',
      'card': 'Thẻ',
      'transfer': 'Chuyển khoản',
      'wallet': 'Ví điện tử'
    };
    return methodMap[method] || method;
  },

  calculateDuration: (startTime: string, endTime: string): number => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
  },

  isUpcoming: (booking: Booking): boolean => {
    const bookingDate = new Date(booking.bookingDate);
    const now = new Date();
    return bookingDate > now && booking.status === 'confirmed';
  },

  isPast: (booking: Booking): boolean => {
    const bookingDate = new Date(booking.bookingDate);
    const now = new Date();
    return bookingDate < now;
  },

  canCancel: (booking: Booking): boolean => {
    const bookingDate = new Date(booking.bookingDate);
    const now = new Date();
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return booking.status === 'confirmed' && hoursUntilBooking > 2;
  }
};

// Coach utilities
export const coachUtils = {
  getExperienceText: (experience: number): string => {
    if (experience < 1) return 'Dưới 1 năm';
    if (experience < 3) return '1-3 năm';
    if (experience < 5) return '3-5 năm';
    if (experience < 10) return '5-10 năm';
    return 'Trên 10 năm';
  },

  getSpecializedSportsText: (sports: string[]): string => {
    const sportMap: Record<string, string> = {
      'football': 'Bóng đá',
      'tennis': 'Tennis',
      'badminton': 'Cầu lông',
      'basketball': 'Bóng rổ',
      'volleyball': 'Bóng chuyền',
      'table-tennis': 'Bóng bàn'
    };
    
    return sports.map(sport => sportMap[sport] || sport).join(', ');
  },

  getHourlyRateText: (rate: number): string => {
    return `${currencyUtils.formatCurrency(rate)}/giờ`;
  },

  isAvailableNow: (coach: Coach): boolean => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().substring(0, 5);
    
    const todayAvailability = coach.availability.find(avail => avail.dayOfWeek === currentDay);
    
    if (!todayAvailability) return false;
    
    return currentTime >= todayAvailability.startTime && currentTime <= todayAvailability.endTime;
  }
};

// Tournament utilities
export const tournamentUtils = {
  getDisplayStatus: (status: string): string => {
    const statusMap: Record<string, string> = {
      'draft': 'Bản nháp',
      'registration_open': 'Mở đăng ký',
      'registration_closed': 'Đóng đăng ký',
      'ongoing': 'Đang diễn ra',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  },

  getStatusColor: (status: string): string => {
    const colorMap: Record<string, string> = {
      'draft': '#808080',
      'registration_open': '#32CD32',
      'registration_closed': '#FFA500',
      'ongoing': '#1E90FF',
      'completed': '#008000',
      'cancelled': '#DC143C'
    };
    return colorMap[status] || '#666';
  },

  getTournamentTypeText: (type: string): string => {
    const typeMap: Record<string, string> = {
      'single_elimination': 'Loại trực tiếp',
      'double_elimination': 'Loại kép',
      'round_robin': 'Vòng tròn',
      'swiss': 'Thụy Sĩ'
    };
    return typeMap[type] || type;
  },

  getSkillLevelText: (level: string): string => {
    const levelMap: Record<string, string> = {
      'beginner': 'Cơ bản',
      'intermediate': 'Trung bình',
      'advanced': 'Nâng cao',
      'all': 'Tất cả'
    };
    return levelMap[level] || level;
  },

  getRegistrationStatus: (tournament: Tournament): { canRegister: boolean; status: string } => {
    const now = new Date();
    const regStart = new Date(tournament.registrationStartDate);
    const regEnd = new Date(tournament.registrationEndDate);
    
    if (now < regStart) {
      return { canRegister: false, status: 'Chưa mở đăng ký' };
    }
    
    if (now > regEnd) {
      return { canRegister: false, status: 'Đã đóng đăng ký' };
    }
    
    if (tournament.currentParticipants >= tournament.maxParticipants) {
      return { canRegister: false, status: 'Đã đủ người' };
    }
    
    return { canRegister: true, status: 'Có thể đăng ký' };
  },

  getProgressPercentage: (tournament: Tournament): number => {
    return Math.round((tournament.currentParticipants / tournament.maxParticipants) * 100);
  }
};

// Validation utilities
export const validationUtils = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^0((3[2-9])|(5[6|8|9])|(7[0|6-9])|(8[1-5|8|9])|(9[0-9]))\d{7}$/;
    return phoneRegex.test(phone);
  },

  isValidPassword: (password: string): boolean => {
    return password.length >= 6;
  },

  isValidName: (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 50;
  },

  isValidPrice: (price: number): boolean => {
    return price > 0 && price <= 10000000; // Max 10M VND
  },

  isValidRating: (rating: number): boolean => {
    return rating >= 1 && rating <= 5;
  }
};

// Export all utilities
export const utils = {
  date: dateUtils,
  currency: currencyUtils,
  user: userUtils,
  venue: venueUtils,
  booking: bookingUtils,
  coach: coachUtils,
  tournament: tournamentUtils,
  validation: validationUtils
};

export default utils;
