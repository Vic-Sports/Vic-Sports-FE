import {
  DeleteOutlined,
  EditOutlined,
  MessageOutlined,
  MoreOutlined,
  SmileOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Popover,
  Space,
  Tooltip,
  Typography,
  Card,
  Spin,
} from "antd";
import { formatDistanceToNow } from "date-fns";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPostByIdAPI,
  type IPost,
  checkRejectionStatusAPI,
} from "@/services/communityApi";

const { Text } = Typography;

interface Message {
  _id: string;
  content: string;
  type: "text" | "image" | "file" | "system";
  senderId: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  sentAt: string;
  isEdited: boolean;
  editedAt?: string;
  status?: string; // Added for tracking request status (accepted, rejected, etc.)
  reactions: Array<{
    userId: string;
    emoji: string;
    addedAt: string;
  }>;
  replyTo?: {
    _id: string;
    content: string;
    senderId: {
      fullName: string;
    };
    type: string;
  };
  attachments: Array<{
    fileUrl: string;
    fileName: string;
    fileType: string;
  }>;
}

interface ChatMessageProps {
  message: Message;
  currentUserId?: string;
  onAccept?: (postId: string, requesterId: string) => void;
  onReject?: (postId: string, requesterId: string) => void;
  requestStatus?: string;
  onReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (message: Message) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  currentUserId,
  onAccept,
  onReject,
  requestStatus,
  onReaction,
  onRemoveReaction,
  onDelete,
  onReply,
}) => {
  const navigate = useNavigate();
  const [showReactions, setShowReactions] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [postData, setPostData] = useState<IPost | null>(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const [isRejectedByBackend, setIsRejectedByBackend] = useState(false);

  const isCurrentUser = message.senderId._id === currentUserId;
  const isSystemMessage = message.type === "system";

  // Check if current user is the post owner (from fetched post data)
  const isPostOwner =
    postData?.user?._id === currentUserId || postData?.user === currentUserId;

  // Check if requester is already a participant in the post
  const isAlreadyParticipant =
    postData?.participants?.includes(message.senderId._id) || false;

  // Use message.status from database if available (persistent across reloads)
  // Or check backend rejection status, or fall back to local requestStatus prop
  const finalRequestStatus =
    message.status || (isRejectedByBackend ? "rejected" : requestStatus);

  // Debug log
  console.log("🔍 ChatMessage render:", {
    messageId: message._id,
    requestStatus,
    messageStatus: message.status,
    isRejectedByBackend,
    isPostOwner,
    isAlreadyParticipant,
    finalRequestStatus,
  });

  // Check if this message is a post join request
  const isPostRequest = message.content.includes(
    "muốn tham gia hoạt động từ bài viết"
  );

  // Extract postId from message content
  const extractPostId = (content: string): string | null => {
    const match = content.match(/#([a-f0-9]+)/);
    return match ? match[1] : null;
  };

  const postId = isPostRequest ? extractPostId(message.content) : null;

  // Fetch post data when message is a post request
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;

      try {
        setLoadingPost(true);
        const response = await getPostByIdAPI(postId);
        if (response.success && response.data) {
          setPostData(response.data);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoadingPost(false);
      }
    };

    fetchPost();
  }, [postId]);

  // Check rejection status from backend (after post data is loaded)
  useEffect(() => {
    const checkStatus = async () => {
      if (!postId || !postData || !message.senderId._id) return;

      try {
        const response = await checkRejectionStatusAPI(
          postId,
          message.senderId._id
        );
        if (response.success && response.data) {
          setIsRejectedByBackend(response.data.isRejected);
        }
      } catch (error) {
        console.error("Error checking rejection status:", error);
      }
    };

    checkStatus();
  }, [postId, postData, message.senderId._id]);

  // Navigate to post detail
  const handlePostClick = () => {
    if (postId) {
      navigate(`/community/post/${postId}`);
    }
  };

  // Group reactions by emoji
  const reactionGroups = message.reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, typeof message.reactions>);

  const handleReaction = (emoji: string) => {
    if (onReaction) {
      onReaction(message._id, emoji);
    }
    setShowReactions(false);
  };

  const handleRemoveReaction = () => {
    if (onRemoveReaction) {
      onRemoveReaction(message._id);
    }
  };

  const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  const reactionContent = (
    <div className="reaction-picker">
      <div className="common-emojis">
        {commonEmojis.map((emoji) => (
          <Button
            key={emoji}
            type="text"
            size="small"
            onClick={() => handleReaction(emoji)}
            style={{ fontSize: "16px" }}
          >
            {emoji}
          </Button>
        ))}
      </div>
    </div>
  );

  const actionsContent = (
    <div className="message-actions">
      <Button
        type="text"
        size="small"
        icon={<MessageOutlined />}
        onClick={() => {
          onReply?.(message);
          setShowActions(false);
        }}
      >
        Reply
      </Button>
      {isCurrentUser && (
        <>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              // Handle edit
              setShowActions(false);
            }}
          >
            Edit
          </Button>
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              onDelete?.(message._id);
              setShowActions(false);
            }}
          >
            Delete
          </Button>
        </>
      )}
    </div>
  );

  if (isSystemMessage) {
    return (
      <div className="message system-message">
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {message.content}
        </Text>
      </div>
    );
  }

  return (
    <div className={`message ${isCurrentUser ? "current-user" : "other-user"}`}>
      {!isCurrentUser && (
        <Avatar
          src={message.senderId.avatar}
          size={32}
          style={{ marginRight: 8 }}
        >
          {message.senderId.fullName.charAt(0)}
        </Avatar>
      )}

      <div className="message-content">
        {!isCurrentUser && (
          <Text strong style={{ fontSize: "12px", color: "#666" }}>
            {message.senderId.fullName}
          </Text>
        )}

        {message.replyTo && (
          <div className="reply-preview">
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Replying to {message.replyTo.senderId.fullName}
            </Text>
            <div className="reply-content">
              <Text ellipsis style={{ fontSize: "12px" }}>
                {message.replyTo.content}
              </Text>
            </div>
          </div>
        )}

        <div className="message-bubble">
          {message.attachments && message.attachments.length > 0 && (
            <div className="attachments">
              {message.attachments.map((attachment, index) => (
                <div key={index} className="attachment">
                  {attachment.fileType.startsWith("image/") ? (
                    <img
                      src={attachment.fileUrl}
                      alt={attachment.fileName}
                      style={{ maxWidth: "200px", maxHeight: "200px" }}
                    />
                  ) : (
                    <div className="file-attachment">
                      <Text>{attachment.fileName}</Text>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <Text>{message.content}</Text>

          {message.isEdited && (
            <Text type="secondary" style={{ fontSize: "10px", marginLeft: 8 }}>
              (edited)
            </Text>
          )}

          {/* Post Information Card */}
          {isPostRequest && (
            <div style={{ marginTop: "12px" }}>
              {loadingPost ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Spin />
                </div>
              ) : postData ? (
                <Card
                  size="small"
                  hoverable
                  onClick={handlePostClick}
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
                    border: "1px solid #667eea30",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <Text strong style={{ fontSize: "14px", color: "#000" }}>
                      {postData.title}
                    </Text>

                    <Text style={{ fontSize: "12px", color: "#000" }}>
                      {postData.description}
                    </Text>

                    <Space
                      direction="vertical"
                      size={2}
                      style={{ width: "100%" }}
                    >
                      <Space size="small">
                        <EnvironmentOutlined style={{ color: "#000" }} />
                        <Text style={{ fontSize: "12px", color: "#000" }}>
                          {postData.location}
                        </Text>
                      </Space>

                      <Space size="small">
                        <CalendarOutlined style={{ color: "#000" }} />
                        <Text style={{ fontSize: "12px", color: "#000" }}>
                          {new Date(postData.date).toLocaleDateString("vi-VN")}
                        </Text>
                      </Space>

                      <Space size="small">
                        <ClockCircleOutlined style={{ color: "#000" }} />
                        <Text style={{ fontSize: "12px", color: "#000" }}>
                          {postData.timeSlot.start} - {postData.timeSlot.end}
                        </Text>
                      </Space>

                      <Space size="small">
                        <TeamOutlined style={{ color: "#000" }} />
                        <Text style={{ fontSize: "12px", color: "#000" }}>
                          {postData.currentParticipants}/
                          {postData.maxParticipants} người
                        </Text>
                      </Space>
                    </Space>
                  </Space>
                </Card>
              ) : (
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Không thể tải thông tin bài viết
                </Text>
              )}
            </div>
          )}

          {/* Post Request Actions */}
          {isPostRequest && postData && (
            <div
              style={{
                marginTop: "12px",
                paddingTop: "12px",
                borderTop: "1px solid #e8e8e8",
              }}
            >
              {isPostOwner &&
              !isAlreadyParticipant &&
              finalRequestStatus !== "rejected" ? (
                // Owner view: Show Accept/Reject buttons (only if not already rejected)
                <Space size="small">
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => onAccept?.(postId!, message.senderId._id)}
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                    }}
                  >
                    Chấp nhận
                  </Button>
                  <Button
                    danger
                    size="small"
                    onClick={() => onReject?.(postId!, message.senderId._id)}
                  >
                    Từ chối
                  </Button>
                </Space>
              ) : (
                // Requester view OR already participant OR rejected: Show status
                <div>
                  {finalRequestStatus === "rejected" ? (
                    <Text type="danger" style={{ fontWeight: 500 }}>
                      ❌ Yêu cầu đã bị từ chối
                    </Text>
                  ) : isAlreadyParticipant ? (
                    <Text type="success" style={{ fontWeight: 500 }}>
                      ✅ Đã tham gia hoạt động
                    </Text>
                  ) : (
                    <Text type="secondary" style={{ fontWeight: 500 }}>
                      ⏳ Đang chờ phản hồi...
                    </Text>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="message-footer">
          <Text type="secondary" style={{ fontSize: "10px" }}>
            {formatDistanceToNow(new Date(message.sentAt), { addSuffix: true })}
          </Text>

          {Object.keys(reactionGroups).length > 0 && (
            <div className="message-reactions">
              {Object.entries(reactionGroups).map(([emoji, reactions]) => (
                <Tooltip
                  key={emoji}
                  title={reactions.map((r) => r.userId).join(", ")}
                >
                  <Button
                    type="text"
                    size="small"
                    style={{ fontSize: "12px", padding: "2px 4px" }}
                    onClick={() => handleReaction(emoji)}
                  >
                    {emoji} {reactions.length}
                  </Button>
                </Tooltip>
              ))}
            </div>
          )}

          <Space size="small">
            <Popover
              content={reactionContent}
              title="Add Reaction"
              trigger="click"
              open={showReactions}
              onOpenChange={setShowReactions}
            >
              <Button
                type="text"
                size="small"
                icon={<SmileOutlined />}
                style={{ opacity: 0.6 }}
              />
            </Popover>

            <Popover
              content={actionsContent}
              title="Message Actions"
              trigger="click"
              open={showActions}
              onOpenChange={setShowActions}
            >
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined />}
                style={{ opacity: 0.6 }}
              />
            </Popover>
          </Space>
        </div>
      </div>

      {isCurrentUser && (
        <Avatar
          src={message.senderId.avatar}
          size={32}
          style={{ marginLeft: 8 }}
        >
          {message.senderId.fullName.charAt(0)}
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
