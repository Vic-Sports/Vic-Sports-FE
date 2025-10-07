import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ITournament, tournamentApi } from '../../services/tournamentApi';
import './tournament-detail.scss';

const TournamentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<ITournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const loadTournamentDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Tournament Detail - ID from URL:', id);
      
      if (!id) {
        setError('Tournament ID is required');
        return;
      }

      console.log('🔍 Calling API with ID:', id);
      const response = await tournamentApi.getTournamentById(id);
      console.log('🔍 API Response:', response);
      
      if (response.success) {
        setTournament(response.data);
      } else {
        setError(response.error || 'Failed to load tournament details');
      }
    } catch (err) {
      setError('Failed to load tournament details');
      console.error('Error loading tournament:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournamentDetail();
  }, [id]);

  const handleJoinTournament = async () => {
    if (!tournament || !id) return;

    try {
      setJoining(true);
      const response = await tournamentApi.joinTournament(id);
      
      if (response.success) {
        alert('Đăng ký thành công!');
        // Reload tournament data to update participant count
        loadTournamentDetail();
      } else {
        alert(response.error || 'Failed to join tournament');
      }
    } catch (err) {
      alert('Failed to join tournament');
      console.error('Error joining tournament:', err);
    } finally {
      setJoining(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'upcoming': { text: 'SẮP DIỄN RA', class: 'status-upcoming' },
      'registration_open': { text: 'MỞ ĐĂNG KÝ', class: 'status-open' },
      'registration_closed': { text: 'ĐÓNG ĐĂNG KÝ', class: 'status-closed' },
      'ongoing': { text: 'ĐANG DIỄN RA', class: 'status-ongoing' },
      'completed': { text: 'HOÀN THÀNH', class: 'status-completed' },
      'cancelled': { text: 'ĐÃ HỦY', class: 'status-cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming;
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getSportIcon = (sportType: string) => {
    const sportIcons: { [key: string]: string } = {
      'football': '⚽',
      'basketball': '🏀',
      'tennis': '🎾',
      'badminton': '🏸',
      'volleyball': '🏐',
      'table-tennis': '🏓'
    };
    return sportIcons[sportType] || '🏆';
  };

  const getSportName = (sportType: string) => {
    const sportNames: { [key: string]: string } = {
      'football': 'Bóng đá',
      'basketball': 'Bóng rổ',
      'tennis': 'Tennis',
      'badminton': 'Cầu lông',
      'volleyball': 'Bóng chuyền',
      'table-tennis': 'Bóng bàn'
    };
    return sportNames[sportType] || sportType;
  };

  const getTournamentTypeName = (type: string) => {
    const typeNames: { [key: string]: string } = {
      'single_elimination': 'Loại trực tiếp',
      'double_elimination': 'Loại kép',
      'round_robin': 'Vòng tròn',
      'swiss': 'Thụy Sĩ'
    };
    return typeNames[type] || type;
  };

  if (loading) {
    return (
      <div className="tournament-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin giải đấu...</p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="tournament-detail-page">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3>Không thể tải thông tin giải đấu</h3>
          <p>{error || 'Tournament not found'}</p>
          <button onClick={() => navigate('/tournaments')} className="back-btn">
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tournament-detail-page">
      <div className="container">
        {/* Header Section */}
        <div className="tournament-header">
          <div className="header-content">
            <div className="tournament-title-section">
              <h1 className="tournament-title">{tournament.name}</h1>
              <div className="tournament-meta">
                <div className="sport-info">
                  <span className="sport-icon">{getSportIcon(tournament.sportType)}</span>
                  <span className="sport-name">{getSportName(tournament.sportType)}</span>
                </div>
                {getStatusBadge(tournament.status)}
              </div>
            </div>
            
            <div className="tournament-actions">
              <button 
                className="back-btn"
                onClick={() => navigate('/tournaments')}
              >
                ← Quay lại
              </button>
              {tournament.canJoin && (
                <button 
                  className="join-btn"
                  onClick={handleJoinTournament}
                  disabled={joining}
                >
                  {joining ? 'Đang đăng ký...' : 'Đăng ký ngay'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="tournament-content">
          <div className="content-grid">
            {/* Left Column - Main Info */}
            <div className="main-info">
              {/* Description */}
              <div className="info-section">
                <h3>Mô tả giải đấu</h3>
                <p className="description">{tournament.description}</p>
              </div>

              {/* Tournament Details */}
              <div className="info-section">
                <h3>Thông tin chi tiết</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="label">Loại giải đấu:</span>
                    <span className="value">{getTournamentTypeName(tournament.tournamentType)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Số người tham gia:</span>
                    <span className="value">
                      {tournament.currentParticipants}/{tournament.maxParticipants}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Kích thước đội:</span>
                    <span className="value">{tournament.teamSize} người</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Phí tham gia:</span>
                    <span className="value">
                      {tournament.registrationFee === 0 ? 'Miễn phí' : formatCurrency(tournament.registrationFee)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Giải thưởng:</span>
                    <span className="value">{formatCurrency(tournament.prizePool)}</span>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="info-section">
                <h3>Lịch trình</h3>
                <div className="schedule-timeline">
                  <div className="timeline-item">
                    <div className="timeline-marker registration"></div>
                    <div className="timeline-content">
                      <h4>Mở đăng ký</h4>
                      <p>{formatDate(tournament.registrationStartDate)}</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-marker registration-end"></div>
                    <div className="timeline-content">
                      <h4>Đóng đăng ký</h4>
                      <p>{formatDate(tournament.registrationEndDate)}</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-marker start"></div>
                    <div className="timeline-content">
                      <h4>Bắt đầu giải đấu</h4>
                      <p>{formatDate(tournament.startDate)}</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-marker end"></div>
                    <div className="timeline-content">
                      <h4>Kết thúc giải đấu</h4>
                      <p>{formatDate(tournament.endDate)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rules */}
              {tournament.rules && tournament.rules.length > 0 && (
                <div className="info-section">
                  <h3>Quy định</h3>
                  <ul className="rules-list">
                    {tournament.rules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prize Distribution */}
              {tournament.prizeDistribution && tournament.prizeDistribution.length > 0 && (
                <div className="info-section">
                  <h3>Phân bổ giải thưởng</h3>
                  <div className="prize-distribution">
                    {tournament.prizeDistribution.map((prize, index) => (
                      <div key={index} className="prize-item">
                        <div className="prize-position">{prize.position}</div>
                        <div className="prize-amount">{formatCurrency(prize.amount)}</div>
                        <div className="prize-description">{prize.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="sidebar">
              {/* Venue Info */}
              <div className="sidebar-section">
                <h3>Địa điểm</h3>
                <div className="venue-info">
                  <h4>{tournament.venueId?.name}</h4>
                  <p className="venue-address">
                    {tournament.venueId?.address?.street}, {tournament.venueId?.address?.ward}, 
                    {tournament.venueId?.address?.district}, {tournament.venueId?.address?.city}
                  </p>
                  {tournament.venueId?.contactInfo?.phone && (
                    <p className="venue-phone">📞 {tournament.venueId.contactInfo.phone}</p>
                  )}
                </div>
              </div>

              {/* Organizer Info */}
              <div className="sidebar-section">
                <h3>Người tổ chức</h3>
                <div className="organizer-info">
                  <div className="organizer-avatar">
                    {tournament.organizerId?.avatar ? (
                      <img src={tournament.organizerId.avatar} alt="Organizer" />
                    ) : (
                      <div className="avatar-placeholder">
                        {tournament.organizerId?.fullName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="organizer-details">
                    <h4>{tournament.organizerId?.fullName}</h4>
                    <p>{tournament.organizerId?.email}</p>
                  </div>
                </div>
              </div>

              {/* Participants */}
              <div className="sidebar-section">
                <h3>Người tham gia ({tournament.participantsCount})</h3>
                <div className="participants-list">
                  {tournament.participants && tournament.participants.length > 0 ? (
                    tournament.participants.slice(0, 5).map((participant: any, index: number) => (
                      <div key={index} className="participant-item">
                        <div className="participant-avatar">
                          {participant.user?.avatar ? (
                            <img src={participant.user.avatar} alt="Participant" />
                          ) : (
                            <div className="avatar-placeholder">
                              {participant.user?.fullName?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="participant-name">{participant.user?.fullName}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-participants">Chưa có người tham gia</p>
                  )}
                  {tournament.participantsCount > 5 && (
                    <p className="more-participants">
                      +{tournament.participantsCount - 5} người khác
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="sidebar-section">
                <h3>Thống kê nhanh</h3>
                <div className="quick-stats">
                  <div className="stat-item">
                    <span className="stat-label">Còn lại:</span>
                    <span className="stat-value">
                      {tournament.maxParticipants - tournament.currentParticipants} chỗ
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Còn:</span>
                    <span className="stat-value">
                      {tournament.daysUntilRegistrationEnd} ngày để đăng ký
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Bắt đầu sau:</span>
                    <span className="stat-value">
                      {tournament.daysUntilStart} ngày
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetail;
