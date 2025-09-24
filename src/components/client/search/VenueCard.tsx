import { Card, Rate, Tag, Button } from "antd";
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  CarOutlined,
  WifiOutlined,
  ClockCircleOutlined,
  VerifiedOutlined,
} from "@ant-design/icons";
import type { IVenue } from "@/types/venue";
import "./VenueCard.scss";

interface VenueCardProps {
  venue: IVenue;
  onViewDetails?: (venueId: string) => void;
  onViewCourts?: (venueId: string) => void;
}

const VenueCard: React.FC<VenueCardProps> = ({
  venue,
  onViewDetails,
  onViewCourts,
}) => {
  const formatAddress = (address: IVenue["address"]) => {
    return `${address.street}, ${address.ward}, ${address.district}, ${address.city}`;
  };

  const getOperatingHoursToday = () => {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const todayHours = venue.operatingHours.find(
      (hours) => hours.dayOfWeek === today
    );

    if (!todayHours || !todayHours.isOpen) {
      return "Đóng cửa hôm nay";
    }

    return `${todayHours.openTime} - ${todayHours.closeTime}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Card className="venue-card" hoverable>
      <div className="venue-header">
        <div className="venue-images">
          {venue.images.length > 0 ? (
            <img
              src={venue.images[0]}
              alt={venue.name}
              className="venue-main-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-venue.jpg";
              }}
            />
          ) : (
            <div className="venue-placeholder">
              <span>🏟️</span>
            </div>
          )}
          {venue.isVerified && (
            <div className="verified-badge">
              <VerifiedOutlined />
              <span>Đã xác thực</span>
            </div>
          )}
        </div>

        <div className="venue-info">
          <h3 className="venue-name">{venue.name}</h3>

          <div className="venue-rating">
            <Rate disabled value={venue.ratings.average} allowHalf />
            <span className="rating-text">
              {venue.ratings.average} ({venue.ratings.count} đánh giá)
            </span>
          </div>

          <div className="venue-location">
            <EnvironmentOutlined />
            <span>{formatAddress(venue.address)}</span>
          </div>

          <div className="venue-hours">
            <ClockCircleOutlined />
            <span>Hôm nay: {getOperatingHoursToday()}</span>
          </div>
        </div>
      </div>

      <div className="venue-description">
        <p>{venue.description}</p>
      </div>

      <div className="venue-amenities">
        <h4>Tiện ích:</h4>
        <div className="amenities-list">
          {venue.amenities.slice(0, 4).map((amenity, index) => (
            <Tag key={index} className="amenity-tag">
              {amenity.icon === "wifi" && <WifiOutlined />}
              {amenity.icon === "parking" && <CarOutlined />}
              {amenity.name}
            </Tag>
          ))}
          {venue.amenities.length > 4 && (
            <Tag className="amenity-more">
              +{venue.amenities.length - 4} khác
            </Tag>
          )}
        </div>
      </div>

      <div className="venue-contact">
        <div className="contact-item">
          <PhoneOutlined />
          <span>{venue.contactInfo.phone}</span>
        </div>
        <div className="contact-item">
          <MailOutlined />
          <span>{venue.contactInfo.email}</span>
        </div>
      </div>

      <div className="venue-stats">
        <div className="stat-item">
          <span className="stat-label">Tổng đặt sân:</span>
          <span className="stat-value">{venue.totalBookings}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Phí gửi xe:</span>
          <span className="stat-value">
            {venue.parking.available
              ? formatCurrency(venue.parking.fee)
              : "Miễn phí"}
          </span>
        </div>
      </div>

      <div className="venue-actions">
        <Button
          type="default"
          onClick={() => onViewDetails?.(venue._id)}
          className="action-button"
        >
          Xem chi tiết
        </Button>
        <Button
          type="primary"
          onClick={() => onViewCourts?.(venue._id)}
          className="action-button primary"
        >
          Xem danh sách sân
        </Button>
      </div>
    </Card>
  );
};

export default VenueCard;
