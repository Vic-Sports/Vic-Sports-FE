import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { message, Spin } from "antd";
import { useLocation } from "react-router-dom";
import CommunityList from "../../../components/client/community/CommunityList";
import CreatePostModal from "../../../components/client/community/CreatePostModal";
import CustomSelect from "../../../components/client/community/CustomSelect";
import {
  FaFire,
  FaUsers,
  FaHeart,
  FaFilter,
  FaPlus,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { getPostsAPI, type IPost } from "../../../services/communityApi";
import { useCurrentApp } from "components/context/app.context"; // Corrected import path
import "./CommunityPage.scss";

const CommunityPage: React.FC = () => {
  const location = useLocation();
  const { user } = useCurrentApp(); // Get current user
  const [activeFilter, setActiveFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [allPosts, setAllPosts] = useState<IPost[]>([]); // Store all posts for filtering
  const [loading, setLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const [initialPostData, setInitialPostData] = useState<any>(null);

  // Advanced filter states
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const filters = [
    { id: "all", label: "All Activities", icon: <FaFire /> },
    { id: "popular", label: "Popular", icon: <FaUsers /> },
    { id: "favorites", label: "Favorites", icon: <FaHeart /> },
  ];

  // Extract unique values from posts for filters
  const uniqueLocations = useMemo(() => {
    const locations = Array.from(
      new Set(allPosts.map((post) => post.location).filter(Boolean))
    );
    return locations.sort();
  }, [allPosts]);

  const uniqueSports = useMemo(() => {
    const sports = Array.from(
      new Set(allPosts.map((post) => post.sport).filter(Boolean))
    );
    return sports.sort();
  }, [allPosts]);

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params: any = {};

      console.log("Fetching posts with params:", params);
      const response = await getPostsAPI(params);
      console.log("Get posts response:", response);

      if (response.success) {
        // Response.data is array directly, not nested object
        setAllPosts(response.data);
        setPosts(response.data);
        setTotalPosts(response.data.length);
        console.log("Posts loaded:", response.data.length);
      } else {
        console.error("Failed to fetch posts:", response);
        message.error("Không thể tải danh sách bài viết!");
      }
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response,
        data: error?.response?.data,
      });

      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể kết nối đến server. Vui lòng kiểm tra backend!";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to posts
  useEffect(() => {
    let filtered = [...allPosts];

    // Filter by main category
    if (activeFilter === "popular") {
      filtered = filtered.filter((post) => post.status === "open");
      // Sort by likes or participants
      filtered.sort((a, b) => {
        const aLikes =
          typeof a.likes === "number" ? a.likes : a.likes?.length || 0;
        const bLikes =
          typeof b.likes === "number" ? b.likes : b.likes?.length || 0;
        return bLikes - aLikes;
      });
    } else if (activeFilter === "favorites") {
      // This would require user's favorite posts from backend
      // For now, just filter posts user has liked
      filtered = filtered.filter(
        (post) =>
          Array.isArray(post.likes) && user?.id && post.likes.includes(user.id)
      );
    }

    // Filter by sport
    if (selectedSport !== "all") {
      filtered = filtered.filter(
        (post) => post.sport.toLowerCase() === selectedSport.toLowerCase()
      );
    }

    // Filter by location
    if (selectedLocation !== "all") {
      filtered = filtered.filter((post) => post.location === selectedLocation);
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((post) => post.status === selectedStatus);
    }

    // Filter by time range
    if (selectedTimeRange !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((post) => {
        const postDate = new Date(post.date);
        const postDay = new Date(
          postDate.getFullYear(),
          postDate.getMonth(),
          postDate.getDate()
        );

        switch (selectedTimeRange) {
          case "today":
            return postDay.getTime() === today.getTime();
          case "tomorrow": {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return postDay.getTime() === tomorrow.getTime();
          }
          case "this-week": {
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() + 7);
            return postDay >= today && postDay <= weekEnd;
          }
          case "this-month":
            return (
              postDate.getMonth() === now.getMonth() &&
              postDate.getFullYear() === now.getFullYear()
            );
          default:
            return true;
        }
      });
    }

    setPosts(filtered);
    setTotalPosts(filtered.length);
  }, [
    allPosts,
    activeFilter,
    selectedSport,
    selectedLocation,
    selectedStatus,
    selectedTimeRange,
    user,
  ]);

  // Load posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // Check for initial data from navigation state (from history page)
  useEffect(() => {
    if (location.state?.initialPostData) {
      console.log(
        "Received initial post data from navigation:",
        location.state.initialPostData
      );
      setInitialPostData(location.state.initialPostData);
      setIsCreateModalOpen(true);

      // Clear the state to prevent re-opening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Handle create post success
  const handleCreatePost = (newPost: IPost) => {
    setAllPosts([newPost, ...allPosts]);
    setPosts([newPost, ...posts]);
    setTotalPosts(totalPosts + 1);
    setIsCreateModalOpen(false);
  };

  // Refresh posts list
  const handleRefreshPosts = () => {
    fetchPosts();
  };

  // Clear all filters
  const handleClearFilters = () => {
    setActiveFilter("all");
    setSelectedSport("all");
    setSelectedLocation("all");
    setSelectedStatus("all");
    setSelectedTimeRange("all");
  };

  // Check if any advanced filters are active
  const hasActiveFilters =
    selectedSport !== "all" ||
    selectedLocation !== "all" ||
    selectedStatus !== "all" ||
    selectedTimeRange !== "all";

  return (
    <div className="futuristic-community-page">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>

      {/* Hero Section */}
      <section className="community-hero">
        <Container>
          <div className="text-center fade-in">
            <div className="hero-badge mb-4">
              <span>🌐 COMMUNITY HUB</span>
            </div>

            <h1 className="hero-title">
              <span className="title-line-1">CONNECT</span>
              <br />
              <span className="title-line-2">& PLAY</span>
            </h1>

            <p className="hero-description">
              Discover sports activities, find players, and join exciting
              matches in your community
            </p>

            {/* Stats */}
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">{totalPosts}+</div>
                <div className="stat-label">ACTIVE POSTS</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">2K+</div>
                <div className="stat-label">COMMUNITY MEMBERS</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100+</div>
                <div className="stat-label">DAILY MATCHES</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="community-content">
        <Container>
          <Row className="g-4">
            {/* Sidebar Filters */}
            <Col lg={3}>
              <div className="community-sidebar">
                <div className="sidebar-header">
                  <h3 className="sidebar-title">Filters</h3>
                  <button
                    className="create-post-btn"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <FaPlus /> New Post
                  </button>
                </div>

                {/* Main Category Filters */}
                <div className="filter-list">
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      className={`filter-item ${
                        activeFilter === filter.id ? "active" : ""
                      }`}
                      onClick={() => setActiveFilter(filter.id)}
                    >
                      <span className="filter-icon">{filter.icon}</span>
                      <span className="filter-label">{filter.label}</span>
                    </button>
                  ))}
                </div>

                {/* Advanced Filters Toggle */}
                <div className="sidebar-section">
                  <button
                    className="advanced-filter-toggle"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  >
                    <FaFilter />
                    <span>Advanced Filters</span>
                    <span
                      className={`toggle-icon ${
                        showAdvancedFilters ? "open" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {showAdvancedFilters && (
                    <div className="advanced-filters">
                      {/* Sport Filter */}
                      <div className="filter-group">
                        <label className="filter-label-text">
                          <FaUsers className="label-icon" />
                          Sport
                        </label>
                        <CustomSelect
                          value={selectedSport}
                          onChange={setSelectedSport}
                          options={[
                            { value: "all", label: "All Sports" },
                            ...uniqueSports.map((sport) => ({
                              value: sport,
                              label: sport,
                            })),
                          ]}
                          placeholder="Select Sport"
                          icon={<FaUsers />}
                        />
                      </div>

                      {/* Location Filter */}
                      <div className="filter-group">
                        <label className="filter-label-text">
                          <FaMapMarkerAlt className="label-icon" />
                          Location
                        </label>
                        <CustomSelect
                          value={selectedLocation}
                          onChange={setSelectedLocation}
                          options={[
                            { value: "all", label: "All Locations" },
                            ...uniqueLocations.map((location) => ({
                              value: location,
                              label: location,
                            })),
                          ]}
                          placeholder="Select Location"
                          icon={<FaMapMarkerAlt />}
                        />
                      </div>

                      {/* Status Filter */}
                      <div className="filter-group">
                        <label className="filter-label-text">
                          <FaCheckCircle className="label-icon" />
                          Status
                        </label>
                        <CustomSelect
                          value={selectedStatus}
                          onChange={setSelectedStatus}
                          options={[
                            { value: "all", label: "All Status" },
                            { value: "open", label: "Open" },
                            { value: "closed", label: "Closed" },
                            { value: "full", label: "Full" },
                          ]}
                          placeholder="Select Status"
                          icon={<FaCheckCircle />}
                        />
                      </div>

                      {/* Time Range Filter */}
                      <div className="filter-group">
                        <label className="filter-label-text">
                          <FaClock className="label-icon" />
                          Time Range
                        </label>
                        <CustomSelect
                          value={selectedTimeRange}
                          onChange={setSelectedTimeRange}
                          options={[
                            { value: "all", label: "All Time" },
                            { value: "today", label: "Today" },
                            { value: "tomorrow", label: "Tomorrow" },
                            { value: "this-week", label: "This Week" },
                            { value: "this-month", label: "This Month" },
                          ]}
                          placeholder="Select Time Range"
                          icon={<FaClock />}
                        />
                      </div>

                      {/* Clear Filters Button */}
                      {hasActiveFilters && (
                        <button
                          className="clear-filters-btn"
                          onClick={handleClearFilters}
                        >
                          <FaTimesCircle />
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Active Filters Summary */}
                {hasActiveFilters && (
                  <div className="sidebar-section">
                    <h4 className="section-title">Active Filters</h4>
                    <div className="active-filter-tags">
                      {selectedSport !== "all" && (
                        <span className="active-filter-tag">
                          Sport: {selectedSport}
                          <button onClick={() => setSelectedSport("all")}>
                            ×
                          </button>
                        </span>
                      )}
                      {selectedLocation !== "all" && (
                        <span className="active-filter-tag">
                          Location: {selectedLocation}
                          <button onClick={() => setSelectedLocation("all")}>
                            ×
                          </button>
                        </span>
                      )}
                      {selectedStatus !== "all" && (
                        <span className="active-filter-tag">
                          Status: {selectedStatus}
                          <button onClick={() => setSelectedStatus("all")}>
                            ×
                          </button>
                        </span>
                      )}
                      {selectedTimeRange !== "all" && (
                        <span className="active-filter-tag">
                          Time: {selectedTimeRange.replace("-", " ")}
                          <button onClick={() => setSelectedTimeRange("all")}>
                            ×
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Col>

            {/* Main Feed */}
            <Col lg={9}>
              <div className="community-feed-header">
                <h2 className="feed-title">
                  <span className="gradient-text">Community Activities</span>
                </h2>
                <button className="filter-toggle">
                  <FaFilter /> Sort
                </button>
              </div>

              {loading ? (
                <div
                  className="loading-container"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "400px",
                  }}
                >
                  <Spin size="large" tip="Đang tải bài viết..." />
                </div>
              ) : (
                <CommunityList filter={activeFilter} posts={posts} />
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* Create Post Modal */}
      <CreatePostModal
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          setInitialPostData(null); // Clear initial data on close
        }}
        onCreate={handleCreatePost}
        onRefresh={handleRefreshPosts}
        initialData={initialPostData}
      />
    </div>
  );
};

export default CommunityPage;
