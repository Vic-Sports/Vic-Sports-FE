import {
  DeleteOutlined,
  EditOutlined,
  MessageOutlined,
  MoreOutlined,
  SmileOutlined
} from '@ant-design/icons';
import { Avatar, Button, Popover, Space, Tooltip, Typography } from 'antd';
import { formatDistanceToNow } from 'date-fns';
import React, { useState } from 'react';

const { Text } = Typography;

interface Message {
  _id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  senderId: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  sentAt: string;
  isEdited: boolean;
  editedAt?: string;
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
  onReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (message: Message) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  currentUserId,
  onReaction,
  onRemoveReaction,
  onEdit,
  onDelete,
  onReply
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const isCurrentUser = message.senderId._id === currentUserId;
  const isSystemMessage = message.type === 'system';

  // Group reactions by emoji
  const reactionGroups = message.reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, typeof message.reactions>);

  const handleReaction = (emoji: string) => {
    onReaction(message._id, emoji);
    setShowReactions(false);
  };

  const handleRemoveReaction = () => {
    onRemoveReaction(message._id);
  };

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  const reactionContent = (
    <div className="reaction-picker">
      <div className="common-emojis">
        {commonEmojis.map(emoji => (
          <Button
            key={emoji}
            type="text"
            size="small"
            onClick={() => handleReaction(emoji)}
            style={{ fontSize: '16px' }}
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
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {message.content}
        </Text>
      </div>
    );
  }

  return (
    <div className={`message ${isCurrentUser ? 'current-user' : 'other-user'}`}>
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
          <Text strong style={{ fontSize: '12px', color: '#666' }}>
            {message.senderId.fullName}
          </Text>
        )}

        {message.replyTo && (
          <div className="reply-preview">
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Replying to {message.replyTo.senderId.fullName}
            </Text>
            <div className="reply-content">
              <Text ellipsis style={{ fontSize: '12px' }}>
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
                  {attachment.fileType.startsWith('image/') ? (
                    <img
                      src={attachment.fileUrl}
                      alt={attachment.fileName}
                      style={{ maxWidth: '200px', maxHeight: '200px' }}
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
            <Text type="secondary" style={{ fontSize: '10px', marginLeft: 8 }}>
              (edited)
            </Text>
          )}
        </div>

        <div className="message-footer">
          <Text type="secondary" style={{ fontSize: '10px' }}>
            {formatDistanceToNow(new Date(message.sentAt), { addSuffix: true })}
          </Text>

          {Object.keys(reactionGroups).length > 0 && (
            <div className="message-reactions">
              {Object.entries(reactionGroups).map(([emoji, reactions]) => (
                <Tooltip
                  key={emoji}
                  title={reactions.map(r => r.userId).join(', ')}
                >
                  <Button
                    type="text"
                    size="small"
                    style={{ fontSize: '12px', padding: '2px 4px' }}
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
