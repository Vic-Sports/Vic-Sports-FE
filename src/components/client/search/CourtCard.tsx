import { Card, Rate, Tag, Button, Badge } from "antd";
import {
  TeamOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  HomeOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { ICourt } from "@/types/court";
import "./CourtCard.scss";

interface CourtCardProps {
  court: ICourt;
  selectedDate?: string;
  selectedTimeSlot?: { start: string; end: string };
  onBook?: (courtId: string) => void;
  onViewDetails?: (courtId: string) => void;
}

const CourtCard: React.FC<CourtCardProps> = ({
  court,
  selectedDate,
  selectedTimeSlot,
  onBook,
  onViewDetails,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  const getSportIcon = (sportType: string) => {
    switch (sportType.toLowerCase()) {
      case "football":
      case "bóng đá":
        return "⚽";
      case "tennis":
        return "🎾";
      case "badminton":
      case "cầu lông":
        return "🏸";
      case "basketball":
      case "bóng rổ":
        return "🏀";
      case "volleyball":
      case "bóng chuyền":
        return "🏐";
      default:
        return "🏟️";
    }
  };

  const getCourtTypeIcon = (courtType: string) => {
    return courtType === "trong nhà" ? (
      <HomeOutlined />
    ) : (
      <ThunderboltOutlined />
    );
  };

  const getCurrentPrice = () => {
    if (!selectedTimeSlot) {
      // Return minimum price if no time slot selected
      const prices = court.pricing.map((p) => p.pricePerHour);
      return Math.min(...prices);
    }

    // Find price for selected time slot
    const pricing = court.pricing.find((p) => {
      return (
        selectedTimeSlot.start >= p.timeSlot.start &&
        selectedTimeSlot.end <= p.timeSlot.end
      );
    });

    return pricing?.pricePerHour || court.pricing[0]?.pricePerHour || 0;
  };

  const isAvailable = () => {
    // This would normally check real availability
    // For demo, we'll assume it's available
    return Math.random() > 0.3; // 70% chance of being available
  };

  const available = isAvailable();

  return (
    <Card
      className={`court-card ${!available ? "unavailable" : ""}`}
      hoverable={available}
    >
      <div className="court-header">
        <div className="court-images">
          {court.images.length > 0 ? (
            <img
              src={court.images[0]}
              alt={court.name}
              className="court-main-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-court.jpg";
              }}
            />
          ) : (
            <div className="court-placeholder">
              <span>{getSportIcon(court.sportType)}</span>
            </div>
          )}

          <div className="court-badges">
            <Badge
              status={available ? "success" : "error"}
              text={available ? "Có sẵn" : "Đã đặt"}
              className="availability-badge"
            />
            <div className="sport-badge">
              <span className="sport-icon">
                {getSportIcon(court.sportType)}
              </span>
              <span>{court.sportType}</span>
            </div>
          </div>
        </div>

        <div className="court-info">
          <h3 className="court-name">{court.name}</h3>

          <div className="court-rating">
            <Rate
              disabled
              value={court.ratings.average}
              allowHalf
              style={{ fontSize: "14px" }}
            />
            <span className="rating-text">
              {court.ratings.average} ({court.ratings.count} đánh giá)
            </span>
          </div>

          <div className="court-details">
            <div className="detail-item">
              {getCourtTypeIcon(court.courtType)}
              <span>{court.courtType}</span>
            </div>
            <div className="detail-item">
              <TeamOutlined />
              <span>{court.capacity} người</span>
            </div>
          </div>

          {selectedDate && selectedTimeSlot && (
            <div className="booking-info">
              <ClockCircleOutlined />
              <span>
                {selectedDate} | {selectedTimeSlot.start} -{" "}
                {selectedTimeSlot.end}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="court-specifications">
        <div className="spec-grid">
          <div className="spec-item">
            <span className="spec-label">Kích thước:</span>
            <span className="spec-value">
              {court.dimensions.length}x{court.dimensions.width}m
            </span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Mặt sân:</span>
            <span className="spec-value">{court.surface}</span>
          </div>
        </div>
      </div>

      <div className="court-equipment">
        <h4>Trang thiết bị:</h4>
        <div className="equipment-list">
          {court.equipment.slice(0, 3).map((item, index) => (
            <Tag key={index} className="equipment-tag">
              <CheckCircleOutlined />
              {item}
            </Tag>
          ))}
          {court.equipment.length > 3 && (
            <Tag className="equipment-more">
              +{court.equipment.length - 3} khác
            </Tag>
          )}
        </div>
      </div>

      <div className="court-pricing">
        <div className="price-section">
          <div className="current-price">
            <span className="price-amount">
              {formatCurrency(getCurrentPrice())}
            </span>
            <span className="price-unit">/giờ</span>
          </div>
          {court.pricing.length > 1 && (
            <div className="price-range">
              <span>
                Từ{" "}
                {formatCurrency(
                  Math.min(...court.pricing.map((p) => p.pricePerHour))
                )}{" "}
                -
                {formatCurrency(
                  Math.max(...court.pricing.map((p) => p.pricePerHour))
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="court-stats">
        <div className="stat-item">
          <span className="stat-value">{court.totalBookings}</span>
          <span className="stat-label">Lượt đặt</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{court.capacity}</span>
          <span className="stat-label">Sức chứa</span>
        </div>
      </div>

      <div className="court-actions">
        <Button
          type="default"
          onClick={() => onViewDetails?.(court.venueId)}
          className="action-button"
          disabled={!available}
        >
          Chi tiết
        </Button>
        <Button
          type="primary"
          onClick={() => onBook?.(court.venueId)}
          className="action-button primary"
          disabled={!available}
        >
          {available ? "Đặt sân" : "Đã đặt"}
        </Button>
      </div>
    </Card>
  );
};

export default CourtCard;
