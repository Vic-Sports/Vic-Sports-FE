import React, { useState } from "react";
import CommunityHubStatus from "../CommunityHubStatus";
import {
  FaHeart,
  FaComment,
  FaShare,
  FaUser,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaCalendar,
  FaTh,
  FaList,
  FaBars,
  FaEdit,
} from "react-icons/fa";
import {
  likePostAPI,
  acceptJoinRequestAPI,
  rejectJoinRequestAPI,
  closePostAPI,
} from "@/services/communityApi";
import type { IPost } from "@/services/communityApi";
import { message } from "antd";
import { useCurrentApp } from "../../context/app.context"; // Corrected import path
import { useNavigate } from "react-router-dom"; // Import navigation hook
import CreatePostModal from "./CreatePostModal";
import "../../../styles/community/community.scss";

interface CommunityListProps {
  filter?: string;
  posts: IPost[];
}

const CommunityList: React.FC<CommunityListProps> = ({ posts: propPosts }) => {
  const { user } = useCurrentApp(); // Move hook to component scope
  const navigate = useNavigate(); // Initialize navigate function

  // Use posts from props (API only - no mock data)
  const [posts, setPosts] = useState<IPost[]>(propPosts);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [joiningPosts, setJoiningPosts] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid");

  // Edit post modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<IPost | null>(null);

  // Update posts when props change
  React.useEffect(() => {
    setPosts(propPosts);
  }, [propPosts]);

  // Initialize liked posts based on current user
  React.useEffect(() => {
    if (!user?.id || !posts.length) return;

    const userLikedPosts: string[] = [];
    posts.forEach((post) => {
      // Check if post.likes is an array and contains current user's ID
      if (Array.isArray(post.likes) && post.likes.includes(user.id)) {
        userLikedPosts.push(post._id);
      }
    });

    setLikedPosts(userLikedPosts);
  }, [posts, user?.id]);

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();

    const isAlreadyLiked = likedPosts.includes(postId);

    try {
      const response = await likePostAPI(postId);
      if (response.success) {
        console.log("Like response:", response);

        // Toggle local state
        if (isAlreadyLiked) {
          // Remove from liked posts (unlike)
          setLikedPosts((prev) => prev.filter((id) => id !== postId));
        } else {
          // Add to liked posts (like)
          setLikedPosts((prev) => [...prev, postId]);
        }

        // Update post likes count from server response
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post._id === postId && response.data) {
              return { ...post, likes: response.data.likes || response.data };
            }
            return post;
          })
        );

        message.success(isAlreadyLiked ? "Đã bỏ like" : "Đã like bài viết");
      }
    } catch (error: any) {
      console.error("Error liking post:", error);
      message.error("Không thể thực hiện!");
    }
  };

  const handleJoinActivity = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (joiningPosts.includes(postId)) return;

    try {
      setJoiningPosts((prev) => [...prev, postId]);

      const userId = user?.id;
      if (!userId) {
        console.error("User ID is missing. Cannot join activity.");
        message.error("User ID is missing. Please log in again.");
        return;
      }

      const post = posts.find((p) => p._id === postId);
      if (!post || !post.user?._id) {
        console.error("Post or post owner is missing.");
        message.error("Post or post owner is missing.");
        return;
      }

      const ownerId = post.user._id;

      // Navigate to the /chat page with postId and ownerId as state
      navigate("/chat", { state: { postId, ownerId } });
    } catch (error: any) {
      console.error("Error navigating to chat page:", error);
      message.error("Cannot navigate to chat page!");
    } finally {
      setJoiningPosts((prev) => prev.filter((id) => id !== postId));
    }
  };

  const handleEditPost = (post: IPost, e: React.MouseEvent) => {
    e.preventDefault();
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  const handleUpdatePost = async (updatedPost: any) => {
    // Check if post should be closed (participants full)
    // Use currentParticipants (manual count) instead of participants.length
    const currentCount =
      updatedPost.currentParticipants || updatedPost.participants?.length || 0;
    const maxParticipants = updatedPost.maxParticipants || 0;

    // Update the post in the local state
    // Merge with existing post to preserve fields like 'user' that backend might not return
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p._id === updatedPost._id ? { ...p, ...updatedPost } : p
      )
    );
    message.success("Cập nhật bài viết thành công!");

    // Check if post is now full and close it
    if (currentCount >= maxParticipants && updatedPost.status !== "closed") {
      try {
        await closePostAPI(updatedPost._id);
        message.info("Bài viết đã đủ người và được đóng.");

        // Update status to closed
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === updatedPost._id ? { ...post, status: "closed" } : post
          )
        );
      } catch (error) {
        console.error("Error closing post:", error);
      }
    }

    setIsEditModalOpen(false);
    setEditingPost(null);
  };

  const handleAcceptRequest = async (postId: string, userId: string) => {
    try {
      const response: any = await acceptJoinRequestAPI(postId, userId);
      if (response.success) {
        message.success("Yêu cầu tham gia đã được chấp nhận.");

        const updatedPost = response.data;
        // Use currentParticipants (manual count) instead of participants.length
        const currentCount =
          updatedPost.currentParticipants ||
          updatedPost.participants?.length ||
          0;
        const maxParticipants = updatedPost.maxParticipants || 0;

        // Update post participants count
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  currentParticipants: updatedPost.currentParticipants,
                  participants: updatedPost.participants,
                  pendingRequests: post.pendingRequests?.filter(
                    (req) => req.userId !== userId
                  ),
                  status: updatedPost.status,
                }
              : post
          )
        );

        // Check if post is now full and close it
        if (
          currentCount >= maxParticipants &&
          updatedPost.status !== "closed"
        ) {
          try {
            await closePostAPI(postId);
            message.info("Bài viết đã đủ người và được đóng.");

            // Update status to closed
            setPosts((prevPosts) =>
              prevPosts.map((post) =>
                post._id === postId ? { ...post, status: "closed" } : post
              )
            );
          } catch (error) {
            console.error("Error closing post:", error);
          }
        }
      }
    } catch (error: any) {
      console.error("Error accepting join request:", error);
      message.error("Không thể chấp nhận yêu cầu tham gia!");
    }
  };

  const handleRejectRequest = async (postId: string, userId: string) => {
    try {
      const response: any = await rejectJoinRequestAPI(postId, userId);
      if (response.success) {
        message.success("Yêu cầu tham gia đã bị từ chối.");

        // Remove the request from pendingRequests
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  pendingRequests: post.pendingRequests?.filter(
                    (req) => req.userId !== userId
                  ),
                }
              : post
          )
        );
      }
    } catch (error: any) {
      console.error("Error rejecting join request:", error);
      message.error("Không thể từ chối yêu cầu tham gia!");
    }
  };

  const getSportIcon = (sport: string) => {
    switch (sport.toLowerCase()) {
      case "football":
        return "⚽";
      case "basketball":
        return "🏀";
      case "tennis":
        return "🎾";
      case "badminton":
        return "🏸";
      default:
        return "🎯";
    }
  };

  // Helper to get likes count (handle both number and array)
  const getLikesCount = (likes: any): number => {
    if (typeof likes === "number") {
      return likes;
    }
    if (Array.isArray(likes)) {
      return likes.length;
    }
    return 0;
  };

  // Helper to check if current user is the post owner
  // Handle both cases: user as string (ID) or user as object
  const isPostOwner = (post: IPost): boolean => {
    if (!user?.id) return false;

    // If post.user is a string (user ID)
    if (typeof post.user === "string") {
      return user.id === post.user;
    }

    // If post.user is an object with _id
    if (typeof post.user === "object" && post.user?._id) {
      return user.id === post.user._id;
    }

    return false;
  };

  // Helper to get current participants count
  const getCurrentParticipants = (post: IPost): number => {
    // Always use currentParticipants if available (whether open or closed)
    // This preserves the actual count when reopening a closed post
    if (
      post.currentParticipants !== undefined &&
      post.currentParticipants > 0
    ) {
      return post.currentParticipants;
    }

    // Fall back to participants array length (registered users)
    return post.participants?.length || 0;
  };

  const renderPendingRequests = (post: IPost) => {
    if (!post.pendingRequests || post.pendingRequests.length === 0) return null;

    return (
      <div className="pending-requests">
        <h4>Pending Requests</h4>
        {post.pendingRequests.map((req) => (
          <div key={req.userId} className="request-item">
            <span>User ID: {req.userId}</span>
            <button
              className="accept-btn"
              onClick={() => handleAcceptRequest(post._id, req.userId)}
            >
              Accept
            </button>
            <button
              className="reject-btn"
              onClick={() => handleRejectRequest(post._id, req.userId)}
            >
              Reject
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderPostCard = (post: IPost, isCompact = false) => {
    if (isCompact) {
      return (
        <div className="compact-post-card" key={post._id}>
          <div className="compact-header">
            <div className="user-info-compact">
              <div className="user-avatar-small">
                {post.user?.avatar ? (
                  <img src={post.user.avatar} alt={post.user.fullName} />
                ) : (
                  <div className="avatar-placeholder">
                    <FaUser />
                  </div>
                )}
              </div>
              <div>
                <h6 className="user-name-compact">
                  {post.user?.fullName || "Anonymous"}
                </h6>
                <span className="post-time-compact">
                  {new Date(post.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
            <div className="compact-badges">
              <span className="sport-badge-small">
                {getSportIcon(post.sport)} {post.sport}
              </span>
              <span className={`status-badge-small status-${post.status}`}>
                {post.status}
              </span>
            </div>
          </div>
          <h4 className="compact-title">{post.title}</h4>
          <p className="compact-description">{post.description}</p>
          <div className="compact-info">
            <span>
              <FaMapMarkerAlt /> {post.location}
            </span>
            <span>
              <FaClock /> {post.timeSlot.start}
            </span>
            <span>
              <FaUsers /> {getCurrentParticipants(post)}/{post.maxParticipants}
            </span>
          </div>
          <div className="compact-actions">
            <button
              className={`action-btn-compact ${
                likedPosts.includes(post._id) ? "liked" : ""
              }`}
              onClick={(e) => handleLike(post._id, e)}
            >
              <FaHeart /> {getLikesCount(post.likes)}
            </button>
            {isPostOwner(post) ? (
              <button
                className="edit-btn-compact"
                onClick={(e) => handleEditPost(post, e)}
              >
                <FaEdit /> Chỉnh sửa
              </button>
            ) : post.status === "closed" ? (
              <button className="closed-btn-compact" disabled>
                Hoạt động đã đóng
              </button>
            ) : (
              <button
                className="join-btn-compact"
                onClick={(e) => handleJoinActivity(post._id, e)}
                disabled={joiningPosts.includes(post._id)}
              >
                <FaUsers />{" "}
                {joiningPosts.includes(post._id) ? "Joining..." : "Join"}
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="futuristic-post-card" key={post._id}>
        <div className="post-glow"></div>

        {/* Post Header */}
        <div className="post-header">
          <div className="user-info">
            <div className="user-avatar">
              {post.user?.avatar ? (
                <img src={post.user.avatar} alt={post.user.fullName} />
              ) : (
                <div className="avatar-placeholder">
                  <FaUser />
                </div>
              )}
            </div>
            <div className="user-details">
              <h6 className="user-name">
                {post.user?.fullName || "Anonymous"}
              </h6>
              <span className="post-time">
                {new Date(post.createdAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
          <div className="post-badges">
            <span className="sport-badge">
              <span className="sport-icon">{getSportIcon(post.sport)}</span>
              {post.sport}
            </span>
            <span className={`status-badge status-${post.status}`}>
              {post.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Post Content */}
        <div className="post-content">
          <h3 className="post-title">{post.title}</h3>
          <p className="post-description">{post.description}</p>

          {/* Post Images */}
          {post.images && post.images.length > 0 && (
            <div className="post-images-gallery">
              {post.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Post Image ${idx + 1}`}
                  className="post-image"
                />
              ))}
            </div>
          )}

          {/* Post Info Cards */}
          <div className="post-info-grid">
            <div className="info-card">
              <div className="info-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="info-content">
                <span className="info-label">Địa điểm</span>
                <span className="info-value">{post.location}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <FaCalendar />
              </div>
              <div className="info-content">
                <span className="info-label">Ngày</span>
                <span className="info-value">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <FaClock />
              </div>
              <div className="info-content">
                <span className="info-label">Thời gian</span>
                <span className="info-value">
                  {post.timeSlot.start} - {post.timeSlot.end}
                </span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <FaUsers />
              </div>
              <div className="info-content">
                <span className="info-label">Người tham gia</span>
                <span className="info-value">
                  {getCurrentParticipants(post)}/{post.maxParticipants}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Post Footer */}
        <div className="post-footer">
          <div className="post-actions">
            <button
              className={`action-btn ${
                likedPosts.includes(post._id) ? "liked" : ""
              }`}
              onClick={(e) => handleLike(post._id, e)}
            >
              <FaHeart />
              <span>{getLikesCount(post.likes)}</span>
            </button>
            <button className="action-btn">
              <FaComment />
              <span>{post.comments || 0}</span>
            </button>
            <button className="action-btn">
              <FaShare />
              <span>Chia sẻ</span>
            </button>
          </div>
          {isPostOwner(post) ? (
            <button
              className="edit-btn"
              onClick={(e) => handleEditPost(post, e)}
            >
              <FaEdit className="me-2" />
              Chỉnh sửa bài đăng
            </button>
          ) : post.status === "closed" ? (
            <button className="closed-btn" disabled>
              Hoạt động đã đóng
            </button>
          ) : (
            <button
              className="join-btn"
              onClick={(e) => handleJoinActivity(post._id, e)}
              disabled={joiningPosts.includes(post._id)}
            >
              <FaUsers className="me-2" />
              {joiningPosts.includes(post._id)
                ? "Đang tham gia..."
                : "Tham gia hoạt động"}
            </button>
          )}
        </div>

        {/* Pending Requests */}
        {renderPendingRequests(post)}
      </div>
    );
  };

  return (
    <div className="futuristic-community-list">
      {/* View Mode Toggle */}
      <div className="view-mode-controls">
        <div className="view-mode-buttons">
          <button
            className={`view-mode-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Grid View"
          >
            <FaTh /> Grid
          </button>
          <button
            className={`view-mode-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            title="List View"
          >
            <FaList /> List
          </button>
          <button
            className={`view-mode-btn ${
              viewMode === "compact" ? "active" : ""
            }`}
            onClick={() => setViewMode("compact")}
            title="Compact View"
          >
            <FaBars /> Compact
          </button>
        </div>
      </div>

      <CommunityHubStatus
        loading={false}
        error={null}
        onRetry={() => window.location.reload()}
      >
        {posts.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "rgba(255, 255, 255, 0.6)",
            }}
          >
            <h3 style={{ fontSize: "24px", marginBottom: "12px" }}>
              Chưa có bài viết nào
            </h3>
            <p style={{ fontSize: "16px" }}>
              Hãy tạo bài viết đầu tiên để tìm bạn chơi thể thao!
            </p>
          </div>
        ) : (
          <div className={`posts-feed posts-feed-${viewMode}`}>
            {posts.map((post) =>
              viewMode === "compact"
                ? renderPostCard(post, true)
                : renderPostCard(post, false)
            )}
          </div>
        )}
      </CommunityHubStatus>

      {/* Edit Post Modal */}
      {editingPost && (
        <CreatePostModal
          open={isEditModalOpen}
          onCancel={() => {
            setIsEditModalOpen(false);
            setEditingPost(null);
          }}
          onCreate={handleUpdatePost}
          initialData={{
            _id: editingPost._id,
            title: editingPost.title,
            description: editingPost.description,
            sport: editingPost.sport,
            courtId:
              typeof editingPost.court === "string"
                ? editingPost.court
                : editingPost.court._id,
            location: editingPost.location,
            date: editingPost.date,
            startTime: editingPost.timeSlot?.start,
            endTime: editingPost.timeSlot?.end,
            maxParticipants: editingPost.maxParticipants,
            currentParticipants: getCurrentParticipants(editingPost),
            registeredCount: editingPost.participants?.length || 0,
            status: editingPost.status,
          }}
        />
      )}
    </div>
  );
};

export default CommunityList;
