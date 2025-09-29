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
  VideoCameraOutlined
} from '@ant-design/icons';
import {
  message as antMessage,
  Avatar,
  Badge,
  Button,
  Input,
  List,
  Space,
  Tooltip,
  Typography
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../../hooks/useSocket';
import { chatApi } from '../../../services/chatApi';
import { useCurrentApp } from '../../context/app.context';
import ChatMessage from './ChatMessage';
import './ChatPage.scss';
import ChatSettings from './ChatSettings';
import CreateGroupModal from './CreateGroupModal';
import StartDirectChatModal from './StartDirectChatModal';

const { Text, Title } = Typography;

interface Chat {
  _id: string;
  type: 'direct' | 'group';
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
  type: 'text' | 'image' | 'file' | 'system';
  senderId: any;
  sentAt: string;
  isEdited: boolean;
  editedAt?: string;
  reactions: any[];
  replyTo?: any;
  attachments: any[];
}

const ChatPage: React.FC = () => {
  const { user } = useCurrentApp();
  const { socket, isConnected } = useSocket();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{userId: string; userName: string}[]>([]);
  
  // Modals
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isStartDirectChatModalOpen, setIsStartDirectChatModalOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load user chats
  useEffect(() => {
    loadChats();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join user's chat rooms
    socket.emit('join_chats');

    // Listen for new messages
    socket.on('new_message', (data: { message: Message; chatId: string }) => {
      if (selectedChat && data.chatId === selectedChat._id) {
        setMessages(prev => [...prev, data.message]);
      }
      
      // Update chat list
      updateChatLastMessage(data.chatId, data.message);
    });

    // Listen for chat updates
    socket.on('chat_updated', (data: { chat: Chat }) => {
      setChats(prev => prev.map(chat => 
        chat._id === data.chat._id ? data.chat : chat
      ));
      
      // Update selected chat if it's the one being updated
      if (selectedChat && selectedChat._id === data.chat._id) {
        setSelectedChat(data.chat);
      }
    });

    // Listen for new chat creation
    socket.on('chat_created', (data: { chat: Chat }) => {
      console.log('Chat created via socket:', data.chat); // Debug log
      setChats(prev => [data.chat, ...prev]);
    });

    // Listen for typing indicators
    socket.on('user_typing', (data: { userId: string; userName: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUsers(prev => [
          ...prev.filter(user => user.userId !== data.userId), 
          { userId: data.userId, userName: data.userName }
        ]);
      } else {
        setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
      }
    });

    // Listen for reactions
    socket.on('reaction_added', (data: { messageId: string; message: Message }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId ? data.message : msg
      ));
    });

    socket.on('reaction_removed', (data: { messageId: string; message: Message }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId ? data.message : msg
      ));
    });

    // Listen for read receipts
    socket.on('messages_read', (_data: { chatId: string; userId: string; userName: string }) => {
      // Update read status in UI if needed
    });

    // Listen for errors
    socket.on('error', (error: { message: string }) => {
      antMessage.error(error.message);
    });

    return () => {
      socket.off('new_message');
      socket.off('chat_updated');
      socket.off('chat_created');
      socket.off('user_typing');
      socket.off('reaction_added');
      socket.off('reaction_removed');
      socket.off('messages_read');
      socket.off('error');
    };
  }, [socket, isConnected, selectedChat]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const response = await chatApi.getUserChats();
      console.log('Chats response:', response.data); // Debug log
      setChats(response.data.chats || []);
    } catch (error) {
      console.error('Failed to load chats:', error);
      antMessage.error('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      setIsLoading(true);
      const response = await chatApi.getChatMessages(chatId);
      setMessages(response.data.messages);
      
      // Join chat room
      if (socket) {
        socket.emit('join_chat', chatId);
      }
    } catch (error) {
      antMessage.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !socket) return;

    try {
      socket.emit('send_message', {
        chatId: selectedChat._id,
        content: newMessage.trim(),
        type: 'text'
      });
      
      setNewMessage('');
      
      // Stop typing indicator
      if (socket) {
        socket.emit('typing_stop', { chatId: selectedChat._id });
      }
    } catch (error) {
      antMessage.error('Failed to send message');
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!socket || !selectedChat) return;

    // Start typing indicator
    if (value && !isTyping) {
      setIsTyping(true);
      socket.emit('typing_start', { chatId: selectedChat._id });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && selectedChat) {
        socket.emit('typing_stop', { chatId: selectedChat._id });
        setIsTyping(false);
      }
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const updateChatLastMessage = (chatId: string, message: Message) => {
    setChats(prev => prev.map(chat => 
      chat._id === chatId 
        ? { 
            ...chat, 
            lastMessage: {
              content: message.content,
              senderId: message.senderId,
              sentAt: message.sentAt
            }
          }
        : chat
    ));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    loadMessages(chat._id);
    
    // Mark messages as read
    if (socket) {
      socket.emit('mark_read', { chatId: chat._id });
    }
  };

  const handleCreateGroup = async (groupData: {
    name: string;
    description?: string;
    participantIds: string[];
  }) => {
    try {
      const response = await chatApi.createGroupChat(groupData);
      console.log('Create group response:', response.data); // Debug log
      const newChat = response.data.chat;
      
      // Update chats list
      setChats(prev => [newChat, ...prev]);
      
      // Auto select the new chat
      setSelectedChat(newChat);
      
      // Load messages for the new chat
      await loadMessages(newChat._id);
      
      // Join the chat room via socket
      if (socket) {
        socket.emit('join_chat', newChat._id);
      }
      
      setIsCreateGroupModalOpen(false);
      antMessage.success('Tạo nhóm chat thành công');
    } catch (error) {
      console.error('Create group error:', error);
      antMessage.error('Không thể tạo nhóm chat');
    }
  };

  const handleStartDirectChat = async (userId: string) => {
    try {
      const response = await chatApi.createDirectChat({ participantId: userId });
      console.log('Create direct chat response:', response.data); // Debug log
      const newChat = response.data.chat;
      
      // Update chats list
      setChats(prev => [newChat, ...prev]);
      
      // Auto select the new chat
      setSelectedChat(newChat);
      
      // Load messages for the new chat
      await loadMessages(newChat._id);
      
      // Join the chat room via socket
      if (socket) {
        socket.emit('join_chat', newChat._id);
      }
      
      antMessage.success('Bắt đầu chat thành công');
    } catch (error) {
      console.error('Create direct chat error:', error);
      antMessage.error('Không thể bắt đầu chat');
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    chat.participants.some(p => 
      p.fullName?.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const getChatName = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.name || 'Group Chat';
    }
    
    const otherParticipant = chat.participants.find(p => p.id !== user?.id);
    return otherParticipant?.fullName || 'Unknown User';
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.avatar || '/default-group-avatar.png';
    }
    
    const otherParticipant = chat.participants.find(p => p.id !== user?.id);
    return otherParticipant?.avatar || '/default-avatar.png';
  };

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <div className="chat-header">
          <Title level={4} style={{ margin: 0 }}>Tin nhắn</Title>
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
                className={`chat-item ${selectedChat?._id === chat._id ? 'selected' : ''}`}
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
                          ? new Date(chat.lastMessage.sentAt).toLocaleTimeString()
                          : ''
                        }
                      </Text>
                    </div>
                  }
                  description={
                    <div className="chat-item-content">
                      <Text className="chat-last-message" ellipsis>
                        {chat.lastMessage?.content || 'No messages yet'}
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
          console.log('Rendering chat for:', selectedChat._id, selectedChat) || (
          <>
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
                    {selectedChat.type === 'group' 
                      ? `${selectedChat.participants.length} members`
                      : selectedChat.participants.find(p => p.id !== user?.id)?.isOnline 
                        ? 'Online' 
                        : 'Offline'
                    }
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

            <div className="chat-messages">
              {isLoading && messages.length === 0 ? (
                <div className="loading-messages">
                  <Text>Loading messages...</Text>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <ChatMessage
                      key={msg._id}
                      message={msg}
                      currentUserId={user?.id}
                      onReaction={(messageId, emoji) => {
                        if (socket) {
                          socket.emit('add_reaction', { messageId, emoji });
                        }
                      }}
                      onRemoveReaction={(messageId) => {
                        if (socket) {
                          socket.emit('remove_reaction', { messageId });
                        }
                      }}
                    />
                  ))}
                  
                  {typingUsers.length > 0 && (
                    <div className="typing-indicator">
                      <Text type="secondary">
                        {typingUsers.length === 1 
                          ? `${typingUsers[0].userName} đang nhập...`
                          : `${typingUsers.length} người đang nhập...`
                        }
                      </Text>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="chat-input">
              <Space.Compact style={{ width: '100%' }}>
                <Button type="text" icon={<PaperClipOutlined />} 
                style={{ 
                    height: '48px', 
                    width: '48px'
                  }}/>
                <Input
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  suffix={
                    <Button type="text" icon={<SmileOutlined />} />
                  }
                />
                <Button 
                  type="primary" 
                  icon={<SendOutlined />} 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  style={{ 
                    height: '48px', 
                    width: '48px'
                  }}
                />
              </Space.Compact>
            </div>
          </>
          )
        ) : (
          <div className="chat-placeholder">
            <Title level={3}>Chọn cuộc trò chuyện để bắt đầu</Title>
            <Text type="secondary">
              Chọn một cuộc trò chuyện từ thanh bên hoặc tạo nhóm chat mới
            </Text>
          </div>
        )}
      </div>

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
  );
};

export default ChatPage;
