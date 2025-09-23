import { jsonDbService } from '@/services/jsonDbService';
import type { Court, Venue } from '@/types/mockdata';
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    StarOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Badge,
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Empty,
    Image,
    Rate,
    Row,
    Space,
    Spin,
    Tag,
    Typography
} from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './court-detail.scss';

const { Title, Text, Paragraph } = Typography;

const CourtDetailPage: React.FC = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!venueId) return;

      try {
        setLoading(true);
        const [venueData, courtsData] = await Promise.all([
          jsonDbService.venues.getById(venueId),
          jsonDbService.courts.getByVenue(venueId)
        ]);
        
        setVenue(venueData);
        setCourts(courtsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [venueId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getSportIcon = (sportType: string) => {
    switch (sportType) {
      case 'football':
        return '⚽';
      case 'tennis':
        return '🎾';
      case 'badminton':
        return '🏸';
      default:
        return '🏟️';
    }
  };

  const getSportName = (sportType: string) => {
    switch (sportType) {
      case 'football':
        return 'Bóng đá';
      case 'tennis':
        return 'Tennis';
      case 'badminton':
        return 'Cầu lông';
      default:
        return 'Thể thao';
    }
  };

  const getCourtTypeName = (courtType: string) => {
    switch (courtType) {
      case '7v7':
        return '7 vs 7';
      case '5v5':
        return '5 vs 5';
      case 'singles':
        return 'Đơn';
      case 'doubles':
        return 'Đôi';
      default:
        return courtType;
    }
  };

  const getMinPrice = (pricing: any[]) => {
    if (!pricing || pricing.length === 0) return 0;
    return Math.min(...pricing.map(p => p.pricePerHour));
  };

  const getMaxPrice = (pricing: any[]) => {
    if (!pricing || pricing.length === 0) return 0;
    return Math.max(...pricing.map(p => p.pricePerHour));
  };

  const handleBookCourt = (courtId: string) => {
    navigate(`/booking?courtId=${courtId}`);
  };

  if (loading) {
    return (
      <div className="court-detail-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="court-detail-error">
        <Empty
          description="Venue not found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className="court-detail-page">
      {/* Header */}
      <div className="court-detail-header">
        <div className="container">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/courts')}
            className="back-button"
          >
            Back
          </Button>
          
          <div className="venue-hero">
            <div className="venue-info">
              <div className="venue-title-section">
                <Title level={1} className="venue-name">
                  {venue.name}
                </Title>
                {venue.isVerified && (
                  <Badge 
                    count="Verified" 
                    style={{ backgroundColor: '#52c41a' }}
                    className="verified-badge"
                  />
                )}
              </div>
              
              <Paragraph className="venue-description">
                {venue.description}
              </Paragraph>

              <div className="venue-meta">
                <Space size="large" wrap>
                  <div className="meta-item">
                    <EnvironmentOutlined />
                    <span>
                      {venue.address.street}, {venue.address.ward}, {venue.address.district}
                    </span>
                  </div>
                  <div className="meta-item">
                    <PhoneOutlined />
                    <span>{venue.contactInfo.phone}</span>
                  </div>
                  <div className="meta-item">
                    <StarOutlined />
                  <span>
                    {venue.ratings.average} ({venue.ratings.count} reviews)
                  </span>
                  </div>
                </Space>
              </div>
            </div>

            <div className="venue-image-gallery">
              <Image.PreviewGroup>
                <Row gutter={[8, 8]}>
                  {venue.images.slice(0, 4).map((image, index) => (
                    <Col span={index === 0 ? 24 : 12} key={index}>
                      <Image
                        src={image}
                        alt={`${venue.name} - ${index + 1}`}
                        className="venue-gallery-image"
                      />
                    </Col>
                  ))}
                </Row>
              </Image.PreviewGroup>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="court-detail-content">
        <div className="container">
          <Row gutter={[24, 24]}>
            {/* Venue Details */}
            <Col xs={24} lg={8}>
              <Card title="Venue Information" className="venue-details-card">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Address">
                    {venue.address.street}, {venue.address.ward}, {venue.address.district}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">
                    {venue.contactInfo.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {venue.contactInfo.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Rating">
                    <Rate disabled value={venue.ratings.average} style={{ fontSize: 14 }} />
                    <span style={{ marginLeft: 8 }}>
                      {venue.ratings.average} ({venue.ratings.count} reviews)
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Bookings">
                    {venue.totalBookings}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <div className="amenities-section">
                  <Title level={5}>Amenities</Title>
                  <div className="amenities-grid">
                    {venue.amenities.map((amenity, index) => (
                      <div key={index} className="amenity-item">
                        <div className="amenity-icon">
                          {amenity.icon === 'car' && '🚗'}
                          {amenity.icon === 'shower' && '🚿'}
                          {amenity.icon === 'coffee' && '☕'}
                          {amenity.icon === 'air-conditioning' && '❄️'}
                          {amenity.icon === 'equipment' && '🏓'}
                          {amenity.icon === 'locker' && '🔒'}
                        </div>
                        <div className="amenity-info">
                          <div className="amenity-name">{amenity.name}</div>
                          <div className="amenity-description">{amenity.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Divider />

                <div className="parking-info">
                  <Title level={5}>Parking</Title>
                  {venue.parking.available ? (
                    <div>
                      <Text>Capacity: {venue.parking.capacity} cars</Text>
                      <br />
                      <Text>
                        Fee: {venue.parking.fee ? formatPrice(venue.parking.fee) : 'Free'}
                      </Text>
                    </div>
                  ) : (
                    <Text type="secondary">No parking available</Text>
                  )}
                </div>
              </Card>
            </Col>

            {/* Courts List */}
            <Col xs={24} lg={16}>
              <div className="courts-section">
                <div className="courts-header">
                  <Title level={2}>Available Courts</Title>
                  <Text type="secondary">
                    {courts.length} courts available in this venue
                  </Text>
                </div>

                {courts.length === 0 ? (
                  <Empty
                    description="No courts available in this venue"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <Row gutter={[16, 16]} className="courts-grid">
                    {courts.map(court => {
                      const minPrice = getMinPrice(court.pricing);
                      const maxPrice = getMaxPrice(court.pricing);
                      const isPriceRange = minPrice !== maxPrice;

                      return (
                        <Col xs={24} sm={12} key={court._id}>
                          <Card
                            hoverable
                            className="court-card"
                            cover={
                              <div className="court-image-container">
                                <img
                                  alt={court.name}
                                  src={court.images[0] || '/placeholder-court.jpg'}
                                  className="court-image"
                                />
                                <div className="court-overlay">
                                  <div className="sport-icon">
                                    {getSportIcon(court.sportType)}
                                  </div>
                                  <Tag color="blue" className="sport-tag">
                                    {getSportName(court.sportType)}
                                  </Tag>
                                </div>
                              </div>
                            }
                            actions={[
                              <Button
                                type="primary"
                                size="large"
                                onClick={() => handleBookCourt(court._id)}
                                className="book-court-btn"
                                icon={<CalendarOutlined />}
                              >
                                Book Court
                              </Button>
                            ]}
                          >
                            <div className="court-info">
                              <div className="court-header">
                                <div className="court-title-section">
                                  <Title level={4} className="court-name">
                                    {court.name}
                                  </Title>
                                  <div className="court-type">
                                    <Tag>{getCourtTypeName(court.courtType || '')}</Tag>
                                  </div>
                                </div>
                                <div className="court-rating">
                                  <Rate
                                    disabled
                                    value={court.ratings.average}
                                    style={{ fontSize: 12 }}
                                  />
                                  <span className="rating-text">
                                    {court.ratings.average} ({court.ratings.count})
                                  </span>
                                </div>
                              </div>

                              <div className="court-details">
                                <div className="detail-row">
                                  <UserOutlined />
                                  <span>Capacity: {court.capacity} people</span>
                                </div>
                                <div className="detail-row">
                                  <EnvironmentOutlined />
                                  <span>Surface: {court.surface}</span>
                                </div>
                                <div className="detail-row">
                                  <ClockCircleOutlined />
                                  <span>
                                    Dimensions: {court.dimensions.length}m × {court.dimensions.width}m
                                  </span>
                                </div>
                              </div>

                              <div className="court-pricing">
                                <div className="price-section">
                                  <DollarOutlined />
                                  <span className="price-label">Price:</span>
                                  <span className="price-value">
                                    {isPriceRange 
                                      ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
                                      : formatPrice(minPrice)
                                    }
                                    <Text type="secondary" className="price-unit">/hour</Text>
                                  </span>
                                </div>
                              </div>

                              <div className="court-stats">
                                <div className="stat-item">
                                  <span className="stat-label">Bookings:</span>
                                  <span className="stat-value">{court.totalBookings}</span>
                                </div>
                                <div className="stat-item">
                                  <span className="stat-label">Revenue:</span>
                                  <span className="stat-value">
                                    {formatPrice(court.totalRevenue)}
                                  </span>
                                </div>
                              </div>

                              <div className="court-equipment">
                                <Text type="secondary" className="equipment-label">
                                  Available Equipment:
                                </Text>
                                <div className="equipment-tags">
                                  {court.equipment.slice(0, 3).map((item, index) => (
                                    <Tag key={index} size="small">
                                      {item}
                                    </Tag>
                                  ))}
                                  {court.equipment.length > 3 && (
                                    <Tag size="small">
                                      +{court.equipment.length - 3} more
                                    </Tag>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default CourtDetailPage;
