import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ITournament, tournamentApi } from '../../services/tournamentApi';
import './tournaments-list.scss';

const TournamentsList: React.FC = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<ITournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sportType: '',
    sortBy: 'startDate',
    sortOrder: 'desc'
  });
  const [availableFilters, setAvailableFilters] = useState({
    sportTypes: [],
    statuses: []
  });

  const loadTournaments = async (page = 1, newFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: 12,
        ...newFilters
      };

      const response = await tournamentApi.getAllTournamentsList(params);
      
      if (response.success) {
        setTournaments(response.data.tournaments);
        setCurrentPage(response.data.pagination.currentPage);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.totalItems);
        setAvailableFilters(response.data.filters);
      } else {
        setError(response.error || 'Failed to load tournaments');
      }
    } catch (err) {
      setError('Failed to load tournaments');
      console.error('Error loading tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    loadTournaments(1, newFilters);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadTournaments(1, filters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadTournaments(page, filters);
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
      year: 'numeric'
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

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          ←
        </button>
        {pages}
        <button
          className="pagination-btn"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          →
        </button>
      </div>
    );
  };

  if (loading && tournaments.length === 0) {
    return (
      <div className="tournaments-list-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách giải đấu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tournaments-list-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1>DANH SÁCH GIẢI ĐẤU</h1>
          <p>Tìm kiếm và tham gia các giải đấu thể thao hấp dẫn</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Tìm kiếm giải đấu..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                🔍
              </button>
            </div>
          </form>

          <div className="filter-controls">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả trạng thái (loại trừ hủy/kết thúc)</option>
              <option value="all">Tất cả trạng thái (bao gồm hủy/kết thúc)</option>
              {availableFilters.statuses.map((status: string) => (
                <option key={status} value={status}>
                  {status === 'upcoming' && 'Sắp diễn ra'}
                  {status === 'registration_open' && 'Mở đăng ký'}
                  {status === 'registration_closed' && 'Đóng đăng ký'}
                  {status === 'ongoing' && 'Đang diễn ra'}
                  {status === 'completed' && 'Hoàn thành'}
                  {status === 'cancelled' && 'Đã hủy'}
                </option>
              ))}
            </select>

            <select
              value={filters.sportType}
              onChange={(e) => handleFilterChange('sportType', e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả môn thể thao</option>
              {availableFilters.sportTypes.map((sport: string) => (
                <option key={sport} value={sport}>
                  {sport === 'football' && 'Bóng đá'}
                  {sport === 'basketball' && 'Bóng rổ'}
                  {sport === 'tennis' && 'Tennis'}
                  {sport === 'badminton' && 'Cầu lông'}
                  {sport === 'volleyball' && 'Bóng chuyền'}
                  {sport === 'table-tennis' && 'Bóng bàn'}
                </option>
              ))}
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="filter-select"
            >
              <option value="startDate">Sắp xếp theo ngày</option>
              <option value="name">Sắp xếp theo tên</option>
              <option value="registrationFee">Sắp xếp theo phí</option>
              <option value="createdAt">Sắp xếp theo ngày tạo</option>
            </select>

            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="filter-select"
            >
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="results-info">
          <p>Tìm thấy <strong>{totalItems}</strong> giải đấu</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => loadTournaments(currentPage)} className="retry-btn">
              Thử lại
            </button>
          </div>
        )}

        {/* Tournaments Grid */}
        {tournaments.length > 0 ? (
          <div className="tournaments-grid">
            {tournaments.map((tournament) => (
              <div key={tournament._id} className="tournament-card">
                <div className="tournament-header">
                  <h3 className="tournament-name">{tournament.name}</h3>
                  {getStatusBadge(tournament.status)}
                </div>

                <div className="tournament-sport">
                  <span className="sport-icon">{getSportIcon(tournament.sportType)}</span>
                  <span className="sport-name">
                    {tournament.sportType === 'football' && 'Bóng đá'}
                    {tournament.sportType === 'basketball' && 'Bóng rổ'}
                    {tournament.sportType === 'tennis' && 'Tennis'}
                    {tournament.sportType === 'badminton' && 'Cầu lông'}
                    {tournament.sportType === 'volleyball' && 'Bóng chuyền'}
                    {tournament.sportType === 'table-tennis' && 'Bóng bàn'}
                  </span>
                </div>

                <div className="tournament-details">
                  <div className="detail-item">
                    <span className="label">Địa điểm:</span>
                    <span className="value">{tournament.venueId?.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Ngày bắt đầu:</span>
                    <span className="value">{formatDate(tournament.startDate)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Phí tham gia:</span>
                    <span className="value">
                      {tournament.registrationFee === 0 ? 'Miễn phí' : formatCurrency(tournament.registrationFee)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Số người tham gia:</span>
                    <span className="value">
                      {tournament.currentParticipants}/{tournament.maxParticipants}
                    </span>
                  </div>
                </div>

                <div className="tournament-description">
                  <p>{tournament.description}</p>
                </div>

                <div className="tournament-actions">
                  <button
                    className="view-details-btn"
                    onClick={() => navigate(`/tournament/${tournament._id}`)}
                  >
                    Xem chi tiết
                  </button>
                  {tournament.status === 'registration_open' && (
                    <button
                      className="register-btn"
                      onClick={() => navigate(`/tournament/${tournament._id}`)}
                    >
                      Đăng ký ngay
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🏆</div>
            <h3>Không tìm thấy giải đấu nào</h3>
            <p>Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            <button
              onClick={() => {
                setFilters({
                  search: '',
                  status: '',
                  sportType: '',
                  sortBy: 'startDate',
                  sortOrder: 'desc'
                });
                loadTournaments(1, {
                  search: '',
                  status: '',
                  sportType: '',
                  sortBy: 'startDate',
                  sortOrder: 'desc'
                });
              }}
              className="reset-filters-btn"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && renderPagination()}
      </div>
    </div>
  );
};

export default TournamentsList;
