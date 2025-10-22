import {
  MoreOutlined,
  PaperClipOutlined,
  PhoneOutlined,
  PlusOutlined,
  SearchOutlined,
  SendOutlined,
  SettingOutlined,
  SmileOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import {
  message as antMessage,
  Avatar,
  Badge,
  Button,
  Input,
  List,
  Space,
  Tooltip,
  Typography,
} from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSocket } from "../../../hooks/useSocket";
import { chatApi } from "../../../services/chatApi";
import {
  acceptJoinRequestAPI,
  rejectJoinRequestAPI,
} from "../../../services/communityApi";
import { useCurrentApp } from "../../context/app.context";
import ChatMessage from "./ChatMessage";
import "./ChatPage.scss";
import ChatSettings from "./ChatSettings";
import CreateGroupModal from "./CreateGroupModal";
import StartDirectChatModal from "./StartDirectChatModal";

const { Text, Title } = Typography;

interface Chat {
  _id: string;
  type: "direct" | "group";
  name?: string;
  participants: any[];
  lastMessage?: {
    content: string;
    senderId: any;
    sentAt: string;
  };
  unreadCount: number;
  isGroup: boolean;
  admins: any[];
  createdBy: any;
}

interface Message {
  _id: string;
  content: string;
  type: "text" | "image" | "file" | "system";
  senderId: any;
  sentAt: string;
  isEdited: boolean;
  editedAt?: string;
  reactions: any[];
  replyTo?: any;
  attachments: any[];
  status?: string; // Added status field
}

const ChatPage: React.FC = () => {
  const { user } = useCurrentApp();
  const { socket, isConnected } = useSocket();
  const { state } = useLocation();

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<
    { userId: string; userName: string }[]
  >([]);
  const [messageRefreshKey, setMessageRefreshKey] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(false); // Track if there are more messages to load
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false); // Track loading state for "Load More"
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const allMessagesCache = useRef<Message[]>([]); // Cache all messages for client-side pagination
  const hasInitializedChat = useRef<string | null>(null); // Track if we've already initialized a specific chat (ownerId-postId)
  const previousMessageCountRef = useRef(0); // Track previous message count
  const isInitialLoadRef = useRef(true); // Track if this is the first load (page mount)
  const shouldScrollOnLoadRef = useRef(false); // Track if we should scroll after loading messages

  // Modals
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isStartDirectChatModalOpen, setIsStartDirectChatModalOpen] =
    useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null); // Reference to chat-messages container
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load user chats
  useEffect(() => {
    loadChats();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join user's chat rooms
    socket.emit("join_chats");

    // Listen for new messages
    socket.on("new_message", (data: { message: Message; chatId: string }) => {
      if (selectedChat && data.chatId === selectedChat._id) {
        setMessages((prev) => [...prev, data.message]);
      }

      // Update chat list
      updateChatLastMessage(data.chatId, data.message);
    });

    // Listen for chat updates
    socket.on("chat_updated", (data: { chat: Chat }) => {
      setChats((prev) =>
        prev.map((chat) => (chat._id === data.chat._id ? data.chat : chat))
      );

      // Update selected chat if it's the one being updated
      if (selectedChat && selectedChat._id === data.chat._id) {
        setSelectedChat(data.chat);
      }
    });

    // Listen for new chat creation
    socket.on("chat_created", (data: { chat: Chat }) => {
      console.log("Chat created via socket:", data.chat); // Debug log
      setChats((prev) => [data.chat, ...prev]);
    });

    // Listen for typing indicators
    socket.on(
      "user_typing",
      (data: { userId: string; userName: string; isTyping: boolean }) => {
        if (data.isTyping) {
          setTypingUsers((prev) => [
            ...prev.filter((user) => user.userId !== data.userId),
            { userId: data.userId, userName: data.userName },
          ]);
        } else {
          setTypingUsers((prev) =>
            prev.filter((user) => user.userId !== data.userId)
          );
        }
      }
    );

    // Listen for reactions
    socket.on(
      "reaction_added",
      (data: { messageId: string; message: Message }) => {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === data.messageId ? data.message : msg))
        );
      }
    );

    socket.on(
      "reaction_removed",
      (data: { messageId: string; message: Message }) => {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === data.messageId ? data.message : msg))
        );
      }
    );

    // Listen for read receipts
    socket.on("messages_read", () => {
      // Update read status in UI if needed
    });

    // Listen for errors
    socket.on("error", (error: { message: string }) => {
      antMessage.error(error.message);
    });

    return () => {
      socket.off("new_message");
      socket.off("chat_updated");
      socket.off("chat_created");
      socket.off("user_typing");
      socket.off("reaction_added");
      socket.off("reaction_removed");
      socket.off("messages_read");
      socket.off("error");
    };
  }, [socket, isConnected, selectedChat]);

  // Auto scroll to bottom in specific scenarios
  useEffect(() => {
    const currentMessageCount = messages.length;
    const previousMessageCount = previousMessageCountRef.current;

    // Scenario 1: Initial page load - don't scroll
    if (isInitialLoadRef.current && currentMessageCount > 0) {
      isInitialLoadRef.current = false;
      previousMessageCountRef.current = currentMessageCount;

      // BUT if shouldScrollOnLoadRef is true (user clicked a chat), scroll anyway
      if (shouldScrollOnLoadRef.current) {
        setTimeout(() => scrollToBottom(), 100); // Small delay to ensure render
        shouldScrollOnLoadRef.current = false;
      }
      return;
    }

    // Scenario 2: User manually selected a chat - scroll to bottom
    if (shouldScrollOnLoadRef.current && currentMessageCount > 0) {
      setTimeout(() => scrollToBottom(), 100); // Small delay to ensure render
      shouldScrollOnLoadRef.current = false;
      previousMessageCountRef.current = currentMessageCount;
      return;
    }

    // Scenario 3: New messages arrived - scroll if count increased
    if (currentMessageCount > previousMessageCount && currentMessageCount > 0) {
      scrollToBottom();
    }

    // Update previous count
    previousMessageCountRef.current = currentMessageCount;
  }, [messages]);

  const loadChats = async () => {
    try {
      const response = await chatApi.getUserChats();
      console.log("Chats response:", response.data); // Debug log
      setChats(response.data.chats || []);
    } catch (error) {
      console.error("Failed to load chats:", error);
      antMessage.error("Failed to load chats");
    }
  };

  const loadMessages = useCallback(
    async (chatId: string, page = 1, limit = 10) => {
      try {
        console.log(
          `🔄 Loading messages: chatId=${chatId}, page=${page}, limit=${limit}`
        );
        const response = await chatApi.getChatMessages(chatId, { page, limit });
        console.log("📩 Load messages response:", response.data); // Debug log
        console.log("📊 Pagination object:", response.data.pagination); // Debug pagination

        // Handle different response structures
        let displayMessages: Message[] = [];
        let totalMessages = 0;

        // Check if backend supports pagination
        if (
          response.data.pagination ||
          response.data.total ||
          response.data.totalMessages
        ) {
          // ✅ Backend supports pagination
          console.log("✅ Backend supports pagination");
          displayMessages = response.data.messages || response.data || [];
          totalMessages =
            response.data.pagination?.totalMessages || // ← Try this FIRST!
            response.data.pagination?.total ||
            response.data.pagination?.totalItems ||
            response.data.total ||
            response.data.totalMessages ||
            0;

          // Set messages (replace for first page, prepend for subsequent pages)
          if (page === 1) {
            setMessages(displayMessages);
          } else {
            setMessages((prev) => [...displayMessages, ...prev]);
          }
        } else {
          // ⚠️ Backend doesn't support pagination - do it client-side
          console.warn(
            "⚠️ Backend doesn't support pagination, implementing client-side"
          );
          const allMessages = response.data.messages || response.data || [];

          if (page === 1) {
            // First load: cache all messages and show last 10
            allMessagesCache.current = allMessages;
            totalMessages = allMessages.length;

            // Show last `limit` messages (newest)
            displayMessages = allMessages.slice(-limit);
            setMessages(displayMessages);
          } else {
            // Load more: get older messages from cache
            const currentDisplayCount = messages.length;
            const startIndex = Math.max(
              0,
              allMessagesCache.current.length - currentDisplayCount - limit
            );
            const endIndex =
              allMessagesCache.current.length - currentDisplayCount;

            displayMessages = allMessagesCache.current.slice(
              startIndex,
              endIndex
            );
            totalMessages = allMessagesCache.current.length;

            // Prepend older messages
            setMessages((prev) => [...displayMessages, ...prev]);
          }
        }

        console.log(
          `📊 Page ${page}: Loaded ${displayMessages.length} messages, Total: ${totalMessages}`
        );

        // Check if there are more messages to load
        const loadedCount = page * limit;
        const hasMore = loadedCount < totalMessages;

        console.log(`🔍 Debug hasMore calculation:`, {
          page,
          limit,
          loadedCount,
          totalMessages,
          hasMore,
          calculation: `${loadedCount} < ${totalMessages} = ${hasMore}`,
        });

        setHasMoreMessages(hasMore);
        setCurrentPage(page);

        console.log(
          `✅ Has more messages: ${hasMore} (loaded: ${loadedCount}, total: ${totalMessages})`
        );

        // Join chat room via socket (only on first page)
        if (socket && page === 1) {
          socket.emit("join_chat", chatId);
        }
      } catch (error) {
        console.error("❌ Error loading messages:", error);
        antMessage.error("Failed to load messages.");
      }
    },
    [socket, messages.length]
  );

  const loadMoreMessages = async () => {
    if (!selectedChat || loadingMoreMessages || !hasMoreMessages) return;

    setLoadingMoreMessages(true);
    try {
      const nextPage = currentPage + 1;
      await loadMessages(selectedChat._id, nextPage, 10);
    } finally {
      setLoadingMoreMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !socket) return;

    try {
      socket.emit("send_message", {
        chatId: selectedChat._id,
        content: newMessage.trim(),
        type: "text",
      });

      setNewMessage("");

      // Stop typing indicator
      if (socket) {
        socket.emit("typing_stop", { chatId: selectedChat._id });
      }
    } catch {
      antMessage.error("Failed to send message");
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!socket || !selectedChat) return;

    // Start typing indicator
    if (value && !isTyping) {
      setIsTyping(true);
      socket.emit("typing_start", { chatId: selectedChat._id });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && selectedChat) {
        socket.emit("typing_stop", { chatId: selectedChat._id });
        setIsTyping(false);
      }
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const updateChatLastMessage = (chatId: string, message: Message) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat._id === chatId
          ? {
              ...chat,
              lastMessage: {
                content: message.content,
                senderId: message.senderId,
                sentAt: message.sentAt,
              },
            }
          : chat
      )
    );
  };

  const scrollToBottom = () => {
    // Scroll only the chat-messages container, not the whole page
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);

    // Reset pagination and cache when switching chats
    setCurrentPage(1);
    setHasMoreMessages(false);
    allMessagesCache.current = []; // Clear cache

    loadMessages(chat._id, 1, 10); // Load first page

    // When user clicks a chat, we want to scroll to bottom after loading
    shouldScrollOnLoadRef.current = true;

    // Mark messages as read
    if (socket) {
      socket.emit("mark_read", { chatId: chat._id });
    }
  };

  const handleCreateGroup = async (groupData: {
    name: string;
    description?: string;
    participantIds: string[];
  }) => {
    try {
      const response = await chatApi.createGroupChat(groupData);
      console.log("Create group response:", response.data); // Debug log
      const newChat = response.data.chat;

      // Update chats list
      setChats((prev) => [newChat, ...prev]);

      // Auto select the new chat
      setSelectedChat(newChat);

      // Scroll to bottom when loading new chat
      shouldScrollOnLoadRef.current = true;

      // Reset pagination for new chat
      setCurrentPage(1);
      setHasMoreMessages(false);

      // Load messages for the new chat
      await loadMessages(newChat._id, 1, 10);

      // Join the chat room via socket
      if (socket) {
        socket.emit("join_chat", newChat._id);
      }

      setIsCreateGroupModalOpen(false);
      antMessage.success("Tạo nhóm chat thành công");
    } catch (error) {
      console.error("Create group error:", error);
      antMessage.error("Không thể tạo nhóm chat");
    }
  };

  const handleStartDirectChat = async (userId: string) => {
    try {
      const response = await chatApi.createDirectChat({
        participantId: userId,
      });
      console.log("Create direct chat response:", response.data); // Debug log
      const newChat = response.data.chat;

      // Update chats list
      setChats((prev) => [newChat, ...prev]);

      // Auto select the new chat
      setSelectedChat(newChat);

      // Scroll to bottom when loading new chat
      shouldScrollOnLoadRef.current = true;

      // Reset pagination for new chat
      setCurrentPage(1);
      setHasMoreMessages(false);

      // Load messages for the new chat
      await loadMessages(newChat._id, 1, 10);

      // Join the chat room via socket
      if (socket) {
        socket.emit("join_chat", newChat._id);
      }

      antMessage.success("Bắt đầu chat thành công");
    } catch (error) {
      console.error("Create direct chat error:", error);
      antMessage.error("Không thể bắt đầu chat");
    }
  };

  const filteredChats = chats.filter(
    (chat) =>
      chat.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      chat.participants.some((p) =>
        p.fullName?.toLowerCase().includes(searchText.toLowerCase())
      )
  );

  const getChatName = (chat: Chat) => {
    if (chat.type === "group") {
      return chat.name || "Group Chat";
    }

    const otherParticipant = chat.participants.find((p) => p.id !== user?.id);
    return otherParticipant?.fullName || "Unknown User";
  };

  const getChatAvatar = (chat: Chat) => {
    return chat.type === "group"
      ? "/default-group-avatar.png"
      : "/default-avatar.png";
  };

  useEffect(() => {
    const initializeChat = async () => {
      if (!state || !state.ownerId || !state.postId) {
        return;
      }

      const { ownerId, postId } = state;

      // Create a unique key for this specific chat initialization
      const chatKey = `${ownerId}-${postId}`;

      // Prevent re-initialization of the SAME chat request
      if (hasInitializedChat.current === chatKey) {
        console.log("Same chat request already initialized, skipping...");
        return;
      }

      try {
        // Load user chats
        const response = await chatApi.getUserChats();
        const existingChats: Chat[] = response.data.chats || [];
        setChats(existingChats);

        // Check if a chat with the owner already exists
        let chat = existingChats.find(
          (c: Chat) =>
            c.type === "direct" &&
            c.participants.some((p: any) => p.id === ownerId)
        );

        // If no chat exists, create a new one
        if (!chat) {
          const createResponse = await chatApi.createDirectChat({
            participantId: ownerId,
          });
          chat = createResponse.data.chat;
          if (chat) {
            setChats((prev) => [chat as Chat, ...prev]);
          }
        }

        // Select the chat and load its messages
        if (chat) {
          setSelectedChat(chat);

          // Scroll to bottom when loading chat from community page
          shouldScrollOnLoadRef.current = true;

          // Reset pagination
          setCurrentPage(1);
          setHasMoreMessages(false);

          await loadMessages(chat._id, 1, 10);

          // Send a summary message whenever user requests to join activity (regardless of chat being new or existing)
          if (postId && socket) {
            const summaryMessage = `Người dùng ${user?.fullName} muốn tham gia hoạt động từ bài viết #${postId}.`;
            socket.emit("send_message", {
              chatId: chat._id,
              content: summaryMessage,
              type: "text",
            });
          }

          // Mark this specific chat request as initialized
          hasInitializedChat.current = chatKey;
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        antMessage.error("Failed to initialize chat.");
      }
    };

    initializeChat();
  }, [state, loadMessages, socket, user]);

  useEffect(() => {
    console.log("Navigation state:", state);
  }, [state]);

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <div className="chat-header">
          <Title level={4} style={{ margin: 0 }}>
            Tin nhắn
          </Title>
          <Space>
            <Tooltip title="Bắt đầu chat">
              <Button
                type="text"
                icon={<UserOutlined />}
                onClick={() => setIsStartDirectChatModalOpen(true)}
              />
            </Tooltip>
            <Tooltip title="Tạo nhóm">
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateGroupModalOpen(true)}
              />
            </Tooltip>
            <Tooltip title="Cài đặt">
              <Button
                type="text"
                icon={<SettingOutlined />}
                onClick={() => setIsSettingsModalOpen(true)}
              />
            </Tooltip>
          </Space>
        </div>

        <div className="chat-search">
          <Input
            placeholder="Tìm kiếm cuộc trò chuyện..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="chat-list">
          <List
            dataSource={filteredChats}
            renderItem={(chat) => (
              <List.Item
                className={`chat-item ${
                  selectedChat?._id === chat._id ? "selected" : ""
                }`}
                onClick={() => handleChatSelect(chat)}
              >
                <List.Item.Meta
                  avatar={
                    <Badge count={chat.unreadCount} offset={[-5, 5]}>
                      <Avatar
                        src={getChatAvatar(chat)}
                        icon={<UserOutlined />}
                        size={48}
                      />
                    </Badge>
                  }
                  title={
                    <div className="chat-item-header">
                      <Text strong>{getChatName(chat)}</Text>
                      <Text className="chat-time">
                        {chat.lastMessage?.sentAt
                          ? new Date(
                              chat.lastMessage.sentAt
                            ).toLocaleTimeString()
                          : ""}
                      </Text>
                    </div>
                  }
                  description={
                    <div className="chat-item-content">
                      <Text className="chat-last-message" ellipsis>
                        {chat.lastMessage?.content || "No messages yet"}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      </div>

      <div className="chat-main">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-info">
                <Avatar
                  src={getChatAvatar(selectedChat)}
                  icon={<UserOutlined />}
                  size={40}
                />
                <div className="chat-details">
                  <Text strong>{getChatName(selectedChat)}</Text>
                  <Text type="secondary">
                    {selectedChat.type === "group"
                      ? `${selectedChat.participants.length} members`
                      : selectedChat.participants.find((p) => p.id !== user?.id)
                          ?.isOnline
                      ? "Online"
                      : "Offline"}
                  </Text>
                </div>
              </div>
              <Space>
                <Tooltip title="Voice Call">
                  <Button type="text" icon={<PhoneOutlined />} />
                </Tooltip>
                <Tooltip title="Video Call">
                  <Button type="text" icon={<VideoCameraOutlined />} />
                </Tooltip>
                <Tooltip title="More">
                  <Button type="text" icon={<MoreOutlined />} />
                </Tooltip>
              </Space>
            </div>

            {/* Chat Messages */}
            <div className="chat-messages" ref={messagesContainerRef}>
              {/* Load More Button */}
              {(() => {
                console.log(
                  "🎨 Rendering chat messages, hasMoreMessages:",
                  hasMoreMessages,
                  "messages.length:",
                  messages.length
                );
                return null;
              })()}
              {hasMoreMessages && (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <Button
                    type="default"
                    onClick={loadMoreMessages}
                    loading={loadingMoreMessages}
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                      color: "#fff",
                      fontWeight: 500,
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                    }}
                  >
                    {loadingMoreMessages
                      ? "Đang tải..."
                      : "Xem thêm tin nhắn cũ hơn"}
                  </Button>
                </div>
              )}

              {messages.map((msg) => (
                <ChatMessage
                  key={`${msg._id}-${messageRefreshKey}`}
                  message={msg}
                  currentUserId={user?.id}
                  onAccept={async (postId: string, requesterId: string) => {
                    try {
                      // Call API to accept request
                      const response = await acceptJoinRequestAPI(
                        postId,
                        requesterId
                      );

                      if (response.success) {
                        antMessage.success("Đã chấp nhận yêu cầu tham gia!");

                        // Force re-render ChatMessage components to re-fetch post data
                        setMessageRefreshKey((prev) => prev + 1);

                        // Also emit socket event for real-time update
                        if (socket) {
                          socket.emit("accept_request", {
                            chatId: selectedChat?._id,
                            requestId: msg._id,
                            postId,
                            requesterId,
                          });
                        }
                      }
                    } catch (error: any) {
                      console.error("Error accepting request:", error);
                      antMessage.error(
                        error?.response?.data?.message ||
                          "Không thể chấp nhận yêu cầu!"
                      );
                    }
                  }}
                  onReject={async (postId: string, requesterId: string) => {
                    try {
                      // Call API to reject request
                      console.log("🚫 Rejecting request:", {
                        postId,
                        requesterId,
                      });
                      const response = await rejectJoinRequestAPI(
                        postId,
                        requesterId
                      );
                      console.log("🚫 Reject response:", response);

                      if (response.success) {
                        antMessage.success(
                          response.message || "Đã từ chối yêu cầu tham gia!"
                        );

                        // Update message status locally
                        console.log(
                          "🔄 Updating message status to rejected for msg._id:",
                          msg._id
                        );
                        setMessages((prevMessages) => {
                          const updated = prevMessages.map((m) =>
                            m._id === msg._id ? { ...m, status: "rejected" } : m
                          );
                          console.log(
                            "📝 Messages after reject update:",
                            updated
                          );
                          return updated;
                        });

                        // Also emit socket event for real-time update
                        if (socket) {
                          socket.emit("reject_request", {
                            chatId: selectedChat?._id,
                            requestId: msg._id,
                            postId,
                            requesterId,
                          });
                        }
                      }
                    } catch (error: any) {
                      console.error("Error rejecting request:", error);
                      antMessage.error(
                        error?.response?.data?.message ||
                          "Không thể từ chối yêu cầu!"
                      );
                    }
                  }}
                  requestStatus={msg.status}
                />
              ))}

              {typingUsers.length > 0 && (
                <div className="typing-indicator">
                  <Text type="secondary">
                    {typingUsers.length === 1
                      ? `${typingUsers[0].userName} đang nhập...`
                      : `${typingUsers.length} người đang nhập...`}
                  </Text>
                </div>
              )}
            </div>

            {/* Post Information Section */}
            {state?.postId && (
              <div
                className="post-info"
                style={{
                  background: "#f5f5f5",
                  padding: "16px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              ></div>
            )}

            {/* Chat Input */}
            <div className="chat-input">
              <Space.Compact style={{ width: "100%" }}>
                <Button
                  type="text"
                  icon={<PaperClipOutlined />}
                  style={{
                    height: "48px",
                    width: "48px",
                  }}
                />
                <Input
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  suffix={<Button type="text" icon={<SmileOutlined />} />}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  style={{
                    height: "48px",
                    width: "48px",
                  }}
                />
              </Space.Compact>
            </div>
          </>
        ) : (
          <div className="chat-placeholder">
            <Title level={3}>Chọn cuộc trò chuyện để bắt đầu</Title>
            <Text type="secondary">
              Chọn một cuộc trò chuyện từ thanh bên hoặc tạo nhóm chat mới
            </Text>
          </div>
        )}

        <CreateGroupModal
          open={isCreateGroupModalOpen}
          onCancel={() => setIsCreateGroupModalOpen(false)}
          onCreate={handleCreateGroup}
        />

        <ChatSettings
          open={isSettingsModalOpen}
          onCancel={() => setIsSettingsModalOpen(false)}
        />

        <StartDirectChatModal
          open={isStartDirectChatModalOpen}
          onCancel={() => setIsStartDirectChatModalOpen(false)}
          onStartChat={handleStartDirectChat}
        />
      </div>
    </div>
  );
};

export default ChatPage;
