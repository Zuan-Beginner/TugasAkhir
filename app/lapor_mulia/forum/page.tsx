'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth-context';

type Reply = {
  id: string;
  author: string;
  avatar: string;
  message: string;
  timestamp: string;
  likes: number;
  likedBy: string[];
};

type Message = {
  id: string;
  author: string;
  avatar: string;
  message: string;
  timestamp: string;
  likes: number;
  likedBy: string[];
  replies: Reply[];
  isPinned?: boolean;
  starredBy?: string[];
};

const STORAGE_KEY = 'muliaForumMessages';
const USER_KEY = 'muliaForumUser';
const ADMIN_KEY = 'muliaAdminSession';
const ADMIN_USERS = ['admin', 'administrator', 'Admin'];

const avatarEmojis = ['👨', '👩', '🧑', '👨‍🎓', '👩‍🎓', '👨‍💼', '👩‍💼', '🧑‍💼', '👨‍🏫', '👩‍🏫'];

function getMessages(): Message[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveMessages(messages: Message[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

function getUser() {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

function saveUser(user: { name: string; avatar: string }) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export default function ForumPage() {
  const { user: authUser, isAdmin } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [isLoaded, setIsLoaded] = useState(true);
  const [filterMode, setFilterMode] = useState<'all' | 'mine' | 'starred' | 'pinned'>('all');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; messageId: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Convert authUser to forum user format
  const user = authUser ? { name: authUser.name, avatar: authUser.avatar } : null;

  useEffect(() => {
    loadMessages();
    

    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      loadMessages();
    }, 3000);

    // Close context menu on click outside
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);

    return () => {
      clearInterval(interval);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  function loadMessages() {
    setMessages(getMessages());
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }



  function handleSendMessage() {
    if (!newMessage.trim() || !user) return;
    
    if (replyTo) {
      // If replying, add to the parent message's replies array
      const reply: Reply = {
        id: Date.now().toString(),
        author: user.name,
        avatar: user.avatar,
        message: newMessage.trim(),
        timestamp: new Date().toLocaleString('id-ID'),
        likes: 0,
        likedBy: []
      };

      const updated = messages.map(m => {
        if (m.id === replyTo.id) {
          return { ...m, replies: [...m.replies, reply] };
        }
        return m;
      });
      saveMessages(updated);
      setMessages(updated);
    } else {
      // If not replying, create a new message
      const message: Message = {
        id: Date.now().toString(),
        author: user.name,
        avatar: user.avatar,
        message: newMessage.trim(),
        timestamp: new Date().toLocaleString('id-ID'),
        likes: 0,
        likedBy: [],
        replies: []
      };

      const updated = [message, ...messages];
      saveMessages(updated);
      setMessages(updated);
    }
    
    setNewMessage('');
    setReplyTo(null);
    setTimeout(scrollToBottom, 100);
  }

  function handleLike(messageId: string, replyId?: string) {
    if (!user) return;
    const updated = messages.map(m => {
      if (replyId && m.id === messageId) {
        // Like a reply
        return {
          ...m,
          replies: m.replies.map(r => {
            if (r.id === replyId) {
              const hasLiked = r.likedBy.includes(user.name);
              return {
                ...r,
                likes: hasLiked ? r.likes - 1 : r.likes + 1,
                likedBy: hasLiked 
                  ? r.likedBy.filter(name => name !== user.name)
                  : [...r.likedBy, user.name]
              };
            }
            return r;
          })
        };
      } else if (m.id === messageId) {
        // Like a main message
        const hasLiked = m.likedBy.includes(user.name);
        return {
          ...m,
          likes: hasLiked ? m.likes - 1 : m.likes + 1,
          likedBy: hasLiked 
            ? m.likedBy.filter(name => name !== user.name)
            : [...m.likedBy, user.name]
        };
      }
      return m;
    });
    saveMessages(updated);
    setMessages(updated);
  }

  function handleDeleteMessage(messageId: string, replyId?: string) {
    if (!confirm('Hapus pesan ini?')) return;
    if (replyId) {
      // Delete a reply
      const updated = messages.map(m => {
        if (m.id === messageId) {
          return {
            ...m,
            replies: m.replies.filter(r => r.id !== replyId)
          };
        }
        return m;
      });
      saveMessages(updated);
      setMessages(updated);
    } else {
      // Delete a main message
      const updated = messages.filter(m => m.id !== messageId);
      saveMessages(updated);
      setMessages(updated);
    }
  }



  function handlePinMessage(messageId: string) {
    if (!isAdmin()) return;
    const updated = messages.map(m => {
      if (m.id === messageId) {
        return { ...m, isPinned: !m.isPinned };
      }
      return m;
    });
    saveMessages(updated);
    setMessages(updated);
    setContextMenu(null);
  }

  function handleStarMessage(messageId: string) {
    if (!user) return;
    const updated = messages.map(m => {
      if (m.id === messageId) {
        const starredBy = m.starredBy || [];
        const hasStarred = starredBy.includes(user.name);
        return {
          ...m,
          starredBy: hasStarred
            ? starredBy.filter(name => name !== user.name)
            : [...starredBy, user.name]
        };
      }
      return m;
    });
    saveMessages(updated);
    setMessages(updated);
  }

  function handleContextMenu(e: React.MouseEvent, messageId: string) {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, messageId });
  }

  const filteredMessages = (() => {
    let result = messages;
    
    if (filterMode === 'mine') {
      result = result.filter(m => m.author === user?.name);
    } else if (filterMode === 'starred') {
      result = result.filter(m => m.starredBy?.includes(user?.name || ''));
    } else if (filterMode === 'pinned') {
      result = result.filter(m => m.isPinned);
    }
    
    // Sort: pinned messages first
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  })();

  const getReplyMessage = (replyToId?: string) => {
    if (!replyToId) return null;
    return messages.find(m => m.id === replyToId);
  };

  return (
    <>
      <style>{`
        .forum-container {
          max-width: 900px;
          margin: 0 auto;
        }
        .forum-banner {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 32px;
          color: white;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
        }
        .forum-banner::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(255,255,255,0.1), transparent);
          animation: pulse 3s infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.3; }
        }
        .forum-banner-content {
          position: relative;
          z-index: 1;
        }
        .forum-stats {
          display: flex;
          gap: 24px;
          margin-top: 16px;
        }
        .forum-stat {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        .forum-stat strong {
          font-size: 24px;
          font-weight: 800;
        }

        .filter-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          align-items: center;
        }
        .filter-btn {
          padding: 10px 20px;
          border: 2px solid var(--border);
          background: var(--card);
          color: var(--text);
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }
        .filter-btn.active {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white;
          border-color: var(--primary);
        }
        .filter-btn:hover:not(.active) {
          border-color: var(--primary);
          transform: translateY(-2px);
        }
        .user-btn {
          margin-left: auto;
          padding: 10px 20px;
          border: 2px solid var(--border);
          background: var(--card);
          color: var(--text);
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .user-btn:hover {
          background: var(--primary-light);
          border-color: var(--primary);
        }

        .messages-container {
          background: var(--card);
          border-radius: 20px;
          padding: 24px;
          min-height: 400px;
          max-height: 600px;
          overflow-y: auto;
          margin-bottom: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          color: var(--text);
        }
        .message-item {
          padding: 16px;
          border-radius: 16px;
          background: var(--bg);
          margin-bottom: 12px;
          transition: all 0.3s;
          border-left: 4px solid transparent;
        }
        .message-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border-left-color: var(--primary);
        }
        .message-item.mine {
          background: linear-gradient(135deg, var(--primary-light), #fff);
        }
        .message-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .message-author {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: grid;
          place-items: center;
          font-size: 20px;
        }
        .message-author-name {
          font-size: 14px;
          font-weight: 700;
        }
        .message-time {
          font-size: 11px;
          color: var(--muted);
        }
        .message-text {
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 12px;
        }
        .message-reply-preview {
          background: var(--bg);
          color: var(--text);
          padding: 8px 12px;
          border-radius: 8px;
          margin-bottom: 8px;
          font-size: 12px;
          border-left: 3px solid var(--primary);
        }
        .message-actions {
          display: flex;
          gap: 12px;
        }
        .message-action-btn {
          padding: 6px 12px;
          border: none;
          background: var(--bg);
          color: var(--text);
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .message-action-btn:hover {
          transform: scale(1.05);
        }
        .message-action-btn.like {
          color: var(--danger);
        }
        .message-action-btn.like.liked {
          background: var(--bg);
          opacity: 0.8;
        }
        .message-action-btn.reply {
          color: var(--primary);
        }
        .message-action-btn.delete {
          color: var(--danger);
        }

        .compose-box {
          background: var(--card);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          color: var(--text);
        }
        .reply-indicator {
          background: var(--primary-light);
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
        }
        .reply-indicator-close {
          cursor: pointer;
          font-weight: 700;
          color: var(--danger);
        }
        .compose-input {
          width: 100%;
          padding: 14px;
          border: 2px solid var(--border);
          background: var(--bg);
          color: var(--text);
          border-radius: 12px;
          font-size: 14px;
          outline: none;
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
          transition: all 0.3s;
        }
        .compose-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(123, 16, 35, 0.1);
        }
        .compose-input::placeholder {
          color: var(--muted);
        }
        .compose-actions {
          display: flex;
          gap: 12px;
          margin-top: 12px;
          justify-content: space-between;
          align-items: center;
        }
        .compose-hint {
          font-size: 12px;
          color: var(--muted);
        }
        .compose-send {
          padding: 12px 24px;
          border: none;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }
        .compose-send:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(123, 16, 35, 0.3);
        }
        .compose-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-box {
          background: var(--card);
          border-radius: 24px;
          padding: 32px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          color: var(--text);
        }
        .modal-title {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 8px;
        }
        .modal-subtitle {
          font-size: 14px;
          color: var(--muted);
          margin-bottom: 24px;
        }
        .modal-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid var(--border);
          background: var(--bg);
          color: var(--text);
          border-radius: 12px;
          font-size: 14px;
          outline: none;
          margin-bottom: 16px;
        }
        .modal-input:focus {
          border-color: var(--primary);
          color: var(--text);
        }
        .modal-input::placeholder {
          color: var(--muted);
        }
        .avatar-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          margin-bottom: 24px;
        }
        .avatar-option {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 3px solid var(--border);
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: grid;
          place-items: center;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .avatar-option:hover {
          transform: scale(1.1);
        }
        .avatar-option.selected {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(123, 16, 35, 0.2);
        }
        .modal-btn {
          width: 100%;
          padding: 14px;
          border: none;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }
        .modal-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(123, 16, 35, 0.3);
        }
        .modal-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--muted);
        }
        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .context-menu {
          position: fixed;
          background: var(--card);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          padding: 8px;
          min-width: 180px;
          z-index: 1001;
          animation: scaleIn 0.2s ease-out;
          color: var(--text);
        }
        .context-menu-item {
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .context-menu-item:hover {
          background: var(--primary-light);
          color: var(--primary);
        }
        .context-menu-item.danger:hover {
          background: #fee;
          color: var(--danger);
        }
        .pinned-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: white;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          margin-left: 8px;
        }
        .star-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: var(--card);
          border: 2px solid var(--border);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 16px;
          color: var(--text);
        }
        .star-btn:hover {
          transform: scale(1.15) rotate(15deg);
          border-color: #fbbf24;
        }
        .star-btn.starred {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          border-color: #f59e0b;
        }
      `}</style>

      <div className="forum-container">
        {/* Banner */}
        <div className={`forum-banner ${isLoaded ? 'anim-fade-up' : ''}`}>
          <div className="forum-banner-content">
            <h1 style={{fontSize: 28, fontWeight: 800, marginBottom: 8}}>💬 Forum Diskusi</h1>
            <p style={{fontSize: 14, opacity: 0.9}}>Ruang komunikasi mahasiswa dan civitas Universitas Mulia</p>
            <div className="forum-stats">
              <div className="forum-stat">
                <strong>{messages.length}</strong>
                <span>Pesan</span>
              </div>
              <div className="forum-stat">
                <strong>{new Set(messages.map(m => m.author)).size}</strong>
                <span>Pengguna</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className={`filter-bar ${isLoaded ? 'anim-fade-up delay-2' : ''}`}>
          <button 
            className={`filter-btn ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            📋 Semua Pesan
          </button>
          <button 
            className={`filter-btn ${filterMode === 'mine' ? 'active' : ''}`}
            onClick={() => setFilterMode('mine')}
          >
            ✍️ Pesan Saya
          </button>
          <button 
            className={`filter-btn ${filterMode === 'starred' ? 'active' : ''}`}
            onClick={() => setFilterMode('starred')}
          >
            ⭐ Berbintang
          </button>
          {isAdmin() && (
            <button 
              className={`filter-btn ${filterMode === 'pinned' ? 'active' : ''}`}
              onClick={() => setFilterMode('pinned')}
            >
              📌 Dipasang
            </button>
          )}
          {user && (
            <div className="user-btn" style={{cursor: 'default'}}>
              <span style={{fontSize: 20}}>{user.avatar}</span>
              <span>{user.name} {isAdmin() && '(Admin)'}</span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className={`messages-container ${isLoaded ? 'anim-scale-in delay-4' : ''}`}>
          {filteredMessages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3 style={{fontSize: 18, fontWeight: 700, marginBottom: 8}}>
                {filterMode === 'mine' ? 'Belum Ada Pesan Anda' : 'Belum Ada Diskusi'}
              </h3>
              <p style={{fontSize: 14}}>Mulai percakapan dengan mengirim pesan pertama!</p>
            </div>
          ) : (
            filteredMessages.map((msg, idx) => {
              const isMine = msg.author === user?.name;
              const isStarred = msg.starredBy?.includes(user?.name || '');
              return (
                <div 
                  key={msg.id} 
                  className={`message-item ${isMine ? 'mine' : ''}`} 
                  style={{animationDelay: `${idx * 0.05}s`, position: 'relative'}}
                  onContextMenu={(e) => handleContextMenu(e, msg.id)}
                >
                  {/* Star Button */}
                  <button 
                    className={`star-btn ${isStarred ? 'starred' : ''}`}
                    onClick={() => handleStarMessage(msg.id)}
                    title={isStarred ? 'Hapus Bintang' : 'Beri Bintang'}
                  >
                    {isStarred ? '⭐' : '☆'}
                  </button>

                  {/* Main Message */}
                  <div className="message-header">
                    <div className="message-author">
                      <div className="message-avatar">{msg.avatar}</div>
                      <div>
                        <div className="message-author-name">
                          {msg.author}
                          {msg.isPinned && (
                            <span className="pinned-badge">
                              📌 Dipasang
                            </span>
                          )}
                        </div>
                        <div className="message-time">{msg.timestamp}</div>
                      </div>
                    </div>
                  </div>
                  <div className="message-text">{msg.message}</div>
                  <div className="message-actions">
                    <button 
                      className={`message-action-btn like ${msg.likedBy.includes(user?.name || '') ? 'liked' : ''}`}
                      onClick={() => handleLike(msg.id)}
                    >
                      ❤️ {msg.likes > 0 && msg.likes}
                    </button>
                    <button className="message-action-btn reply" onClick={() => setReplyTo(msg)}>
                      💬 Balas
                    </button>
                    {isMine && (
                      <button className="message-action-btn delete" onClick={() => handleDeleteMessage(msg.id)}>
                        🗑️ Hapus
                      </button>
                    )}
                  </div>

                  {/* Replies Section */}
                  {msg.replies && msg.replies.length > 0 && (
                    <div style={{
                      marginTop: '16px',
                      paddingLeft: '20px',
                      borderLeft: '3px solid var(--primary)',
                      marginLeft: '20px'
                    }}>
                      {msg.replies.map((reply, rIdx) => {
                        const isReplyMine = reply.author === user?.name;
                        return (
                          <div key={reply.id} style={{
                            background: isReplyMine ? 'rgba(123, 16, 35, 0.05)' : 'rgba(0,0,0,0.02)',
                            padding: '12px',
                            borderRadius: '12px',
                            marginBottom: '8px'
                          }}>
                            <div className="message-header" style={{marginBottom: '8px'}}>
                              <div className="message-author">
                                <div className="message-avatar" style={{width: '28px', height: '28px', fontSize: '16px'}}>{reply.avatar}</div>
                                <div>
                                  <div className="message-author-name" style={{fontSize: '13px'}}>{reply.author}</div>
                                  <div className="message-time" style={{fontSize: '10px'}}>{reply.timestamp}</div>
                                </div>
                              </div>
                            </div>
                            <div className="message-text" style={{fontSize: '13px', marginBottom: '8px'}}>{reply.message}</div>
                            <div className="message-actions">
                              <button 
                                className={`message-action-btn like ${reply.likedBy.includes(user?.name || '') ? 'liked' : ''}`}
                                onClick={() => handleLike(msg.id, reply.id)}
                                style={{fontSize: '11px', padding: '4px 8px'}}
                              >
                                ❤️ {reply.likes > 0 && reply.likes}
                              </button>
                              {isReplyMine && (
                                <button 
                                  className="message-action-btn delete" 
                                  onClick={() => handleDeleteMessage(msg.id, reply.id)}
                                  style={{fontSize: '11px', padding: '4px 8px'}}
                                >
                                  🗑️ Hapus
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <div 
            className="context-menu"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            {isAdmin() ? (
              // Admin menu: pin & star
              <>
                <div 
                  className="context-menu-item"
                  onClick={() => handlePinMessage(contextMenu.messageId)}
                >
                  <span>📌</span>
                  <span>{messages.find(m => m.id === contextMenu.messageId)?.isPinned ? 'Lepas Pin' : 'Pin Pesan'}</span>
                </div>
                <div style={{height: 1, background: 'var(--border)', margin: '4px 0'}} />
                <div 
                  className="context-menu-item"
                  onClick={() => {
                    handleStarMessage(contextMenu.messageId);
                    setContextMenu(null);
                  }}
                >
                  <span>⭐</span>
                  <span>{messages.find(m => m.id === contextMenu.messageId)?.starredBy?.includes(user?.name || '') ? 'Hapus Bintang' : 'Beri Bintang'}</span>
                </div>
              </>
            ) : (
              // Regular user menu: star only
              <div 
                className="context-menu-item"
                onClick={() => {
                  handleStarMessage(contextMenu.messageId);
                  setContextMenu(null);
                }}
              >
                <span>⭐</span>
                <span>{messages.find(m => m.id === contextMenu.messageId)?.starredBy?.includes(user?.name || '') ? 'Hapus Bintang' : 'Beri Bintang'}</span>
              </div>
            )}
          </div>
        )}


        {/* Compose Box */}
        <div className={`compose-box ${isLoaded ? 'anim-slide-right delay-6' : ''}`}>
          {replyTo && (
            <div className="reply-indicator">
              <span>💬 Membalas <strong>{replyTo.author}</strong></span>
              <span className="reply-indicator-close" onClick={() => setReplyTo(null)}>✕</span>
            </div>
          )}
          <textarea 
            className="compose-input" 
            placeholder={replyTo ? `Balas ke ${replyTo.author}...` : "Tulis pesan Anda..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSendMessage();
              }
            }}
          />
          <div className="compose-actions">
            <div className="compose-hint">💡 Tekan Ctrl+Enter untuk kirim</div>
            <button 
              className="compose-send" 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !user}
            >
              🚀 Kirim Pesan
            </button>
          </div>
        </div>
      </div>


    </>
  );
}

