import { jsonDbService } from '@/services/jsonDbService';
import type { Venue } from '@/types/mockdata';
import { EnvironmentOutlined, PhoneOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, Input, Rate, Row, Select, Spin, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './courts.scss';

const { Search } = Input;
const { Option } = Select;

const CourtsPage: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const navigate = useNavigate();

  // Lấy danh sách venues từ mock data
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        const venuesData = await jsonDbService.venues.getAll();
        setVenues(venuesData);
        setFilteredVenues(venuesData);
      } catch (error) {
        console.error('Error fetching venues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  // Lọc venues dựa trên search term và filters
  useEffect(() => {
    let filtered = venues;

    if (searchTerm) {
      filtered = filtered.filter(venue =>
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.address.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDistrict) {
      filtered = filtered.filter(venue => venue.address.district === selectedDistrict);
    }

    setFilteredVenues(filtered);
  }, [venues, searchTerm, selectedDistrict]);

  // Lấy danh sách districts unique
  const districts = Array.from(new Set(venues.map(venue => venue.address.district)));

  const handleVenueClick = (venueId: string) => {
    navigate(`/courts/${venueId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getSportTypeFromVenue = (venue: Venue) => {
    // Dựa vào tên venue để xác định loại thể thao
    const name = venue.name.toLowerCase();
    if (name.includes('bóng đá') || name.includes('football')) return 'football';
    if (name.includes('tennis')) return 'tennis';
    if (name.includes('cầu lông') || name.includes('badminton')) return 'badminton';
    return 'other';
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

  if (loading) {
    return (
      <div className="courts-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="courts-page">
      <div className="courts-header">
        <div className="container">
          <h1 className="courts-title">Sports Venues</h1>
          <p className="courts-subtitle">
            Discover high-quality sports venues with full amenities
          </p>
        </div>
      </div>

      <div className="courts-content">
        <div className="container">
          {/* Search and Filters */}
          <div className="courts-filters">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Search
                  placeholder="Search venues..."
                  allowClear
                  size="large"
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Select
                  placeholder="Select district"
                  size="large"
                  style={{ width: '100%' }}
                  allowClear
                  value={selectedDistrict}
                  onChange={setSelectedDistrict}
                >
                  {districts.map(district => (
                    <Option key={district} value={district}>
                      {district}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={24} md={8}>
                <div className="filter-stats">
                  <span>Found {filteredVenues.length} venues</span>
                </div>
              </Col>
            </Row>
          </div>

          {/* Venues Grid */}
          {filteredVenues.length === 0 ? (
            <Empty
              description="No venues found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Row gutter={[24, 24]} className="venues-grid">
              {filteredVenues.map(venue => {
                const sportType = getSportTypeFromVenue(venue);
                return (
                  <Col xs={24} sm={12} lg={8} key={venue._id}>
                    <Card
                      hoverable
                      className="venue-card"
                      cover={
                        <div className="venue-image-container">
                          <img
                            alt={venue.name}
                            src={venue.images[0] || '/placeholder-venue.jpg'}
                            className="venue-image"
                          />
                          <div className="venue-overlay">
                            <div className="sport-icon">
                              {getSportIcon(sportType)}
                            </div>
                            {venue.isVerified && (
                              <Tag color="green" className="verified-tag">
                                Verified
                              </Tag>
                            )}
                          </div>
                        </div>
                      }
                      actions={[
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => handleVenueClick(venue._id)}
                          className="view-courts-btn"
                        >
                          View Courts
                        </Button>
                      ]}
                    >
                      <div className="venue-info">
                        <div className="venue-header">
                          <h3 className="venue-name">{venue.name}</h3>
                          <div className="venue-rating">
                            <Rate
                              disabled
                              value={venue.ratings.average}
                              style={{ fontSize: 12 }}
                            />
                            <span className="rating-text">
                              {venue.ratings.average} ({venue.ratings.count})
                            </span>
                          </div>
                        </div>

                        <div className="venue-description">
                          <p>{venue.description}</p>
                        </div>
                        
                        <div className="venue-details">
                          <div className="venue-location">
                            <EnvironmentOutlined />
                            <span>
                              {venue.address.street}, {venue.address.ward}, {venue.address.district}
                            </span>
                          </div>

                          <div className="venue-contact">
                            <PhoneOutlined />
                            <span>{venue.contactInfo.phone}</span>
                          </div>
                        </div>

                        <div className="venue-stats">
                          <div className="stat-item">
                            <span className="stat-label">Bookings:</span>
                            <span className="stat-value">{venue.totalBookings}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Revenue:</span>
                            <span className="stat-value">
                              {formatPrice(venue.totalRevenue)}
                            </span>
                          </div>
                        </div>

                        <div className="venue-amenities">
                          {venue.amenities.slice(0, 3).map((amenity, index) => (
                            <Tag key={index} className="amenity-tag">
                              {amenity.name}
                            </Tag>
                          ))}
                          {venue.amenities.length > 3 && (
                            <Tag className="amenity-tag">
                              +{venue.amenities.length - 3} more
                            </Tag>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourtsPage;
