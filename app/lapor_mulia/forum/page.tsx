'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../lib/auth-context';
import { getForumMessages, saveForumMessages, getReports, syncReportsToForum } from '../lib/storage';
import type { ForumMessage, ForumReply } from '../lib/types';
import { categories } from '../lib/constants';

const STORAGE_KEY = 'muliaForumMessages';

function getMessages(): ForumMessage[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveMessages(messages: ForumMessage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

function getCategoryIcon(category?: string): string {
  const cat = categories.find(c => c.name === category);
  return cat?.icon || '📋';
}

function getCategoryColor(category?: string): string {
  const cat = categories.find(c => c.name === category);
  return cat?.color || '#667eea';
}

function getStatusColor(status?: string): string {
  switch (status) {
    case 'Diproses': return '#FF9800';
    case 'Selesai': return '#4CAF50';
    case 'Ditolak': return '#E53935';
    default: return '#1E88E5';
  }
}

function getPriorityColor(priority?: string): string {
  switch (priority) {
    case 'Darurat': return '#9C27B0';
    case 'Tinggi': return '#F44336';
    case 'Sedang': return '#FF9800';
    default: return '#4CAF50';
  }
}

export default function ForumPage() {
  const { user: authUser, isAdmin } = useAuth();
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState<ForumMessage | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'reports' | 'mine' | 'starred' | 'pinned'>('all');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; messageId: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoaded = true;

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
    // Backward compatibility: sync existing reports to forum
    const reports = getReports();
    syncReportsToForum(reports);
    setMessages(getMessages());
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleSendMessage() {
    if (!newMessage.trim() || !user) return;
    
    if (replyTo) {
      const reply: ForumReply = {
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
      const message: ForumMessage = {
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
    const msg = messages.find(m => m.id === messageId);
    
    // Jika ini post laporan, hanya admin yang bisa hapus
    if (msg?.isReport && !isAdmin()) {
      return;
    }

    if (!confirm('Hapus pesan ini?')) return;
    
    if (replyId) {
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
    
    if (filterMode === 'reports') {
      result = result.filter(m => m.isReport);
    } else if (filterMode === 'mine') {
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

  const reportCount = messages.filter(m => m.isReport).length;
  const messageCount = messages.filter(m => !m.isReport).length;

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
          flex-wrap: wrap;
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

        /* Report Card Styles */
        .report-forum-card {
          padding: 20px;
          border-radius: 16px;
          background: var(--card);
          margin-bottom: 16px;
          transition: all 0.3s;
          border: 2px solid var(--border);
          border-left: 5px solid var(--primary);
          position: relative;
        }
        .report-forum-card:hover {
          transform: translateX(4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        .report-forum-card.pinned {
          border-color: #fbbf24;
          border-left-color: #f59e0b;
        }
        .report-badge-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .report-category-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }
        .report-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
        }
        .report-priority-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
        }
        .report-title {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 8px;
          color: var(--text);
        }
        .report-description {
          font-size: 13px;
          line-height: 1.6;
          color: var(--muted);
          margin-bottom: 12px;
        }
        .report-location {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 12px;
        }
        .report-meta-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .report-ticket {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 8px;
          background: var(--primary-light);
          color: var(--primary);
        }
        .report-author {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .report-author-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: grid;
          place-items: center;
          font-size: 16px;
        }
        .report-author-name {
          font-size: 13px;
          font-weight: 700;
        }
        .report-author-time {
          font-size: 11px;
          color: var(--muted);
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
          color: var(--text);
          caret-color: var(--primary);
          background: var(--bg);
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

        /* Dark mode overrides */
        [data-theme="dark"] .forum-container { color: var(--text); }
        [data-theme="dark"] .forum-banner { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); }
        [data-theme="dark"] .filter-btn { background: var(--card); color: var(--text); border-color: var(--border); }
        [data-theme="dark"] .user-btn { background: var(--card); color: var(--text); border-color: var(--border); }
        [data-theme="dark"] .message-card { background: var(--card); border-color: var(--border); }
        [data-theme="dark"] .reply-card { background: var(--bg); border-color: var(--border); }
        [data-theme="dark"] .reply-input { background: var(--card); color: var(--text); border-color: var(--border); }
        [data-theme="dark"] .message-input { background: var(--card); color: var(--text); border-color: var(--border); }
        [data-theme="dark"] .reply-input::placeholder, [data-theme="dark"] .message-input::placeholder { color: var(--muted); }
        [data-theme="dark"] .modal-content { background: var(--card); }
        [data-theme="dark"] .context-menu { background: var(--card); border-color: var(--border); }
        [data-theme="dark"] .report-forum-card { background: var(--card); border-color: var(--border); }
      `}</style>

      <div className="forum-container">
        {/* Banner */}
        <div className={`forum-banner ${isLoaded ? 'anim-fade-up' : ''}`}>
          <div className="forum-banner-content">
            <h1 style={{fontSize: 28, fontWeight: 800, marginBottom: 8}}>💬 Forum Diskusi</h1>
            <p style={{fontSize: 14, opacity: 0.9}}>Ruang komunikasi mahasiswa dan civitas Universitas Mulia</p>
            <div className="forum-stats">
              <div className="forum-stat">
                <strong>{reportCount}</strong>
                <span>Laporan</span>
              </div>
              <div className="forum-stat">
                <strong>{messageCount}</strong>
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
            📋 Semua
          </button>
          <button 
            className={`filter-btn ${filterMode === 'reports' ? 'active' : ''}`}
            onClick={() => setFilterMode('reports')}
          >
            📢 Laporan ({reportCount})
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
                {filterMode === 'mine' ? 'Belum Ada Pesan Anda' : filterMode === 'reports' ? 'Belum Ada Laporan' : 'Belum Ada Diskusi'}
              </h3>
              <p style={{fontSize: 14}}>
                {filterMode === 'reports' 
                  ? 'Laporan yang dibuat akan otomatis muncul di sini'
                  : 'Mulai percakapan dengan mengirim pesan pertama!'}
              </p>
            </div>
          ) : (
            filteredMessages.map((msg, idx) => {
              const isMine = msg.author === user?.name;
              const isStarred = msg.starredBy?.includes(user?.name || '');

              // Render Report Card
              if (msg.isReport) {
                return (
                  <div 
                    key={msg.id} 
                    className={`report-forum-card ${msg.isPinned ? 'pinned' : ''} ${isMine ? 'mine' : ''}`}
                    style={{animationDelay: `${idx * 0.05}s`}}
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

                    {/* Report Badge Row */}
                    <div className="report-badge-row">
                      <span 
                        className="report-category-badge"
                        style={{
                          background: getCategoryColor(msg.reportCategory) + '20',
                          color: getCategoryColor(msg.reportCategory)
                        }}
                      >
                        {getCategoryIcon(msg.reportCategory)} {msg.reportCategory}
                      </span>
                      <span 
                        className="report-status-badge"
                        style={{
                          background: getStatusColor(msg.reportStatus) + '20',
                          color: getStatusColor(msg.reportStatus)
                        }}
                      >
                        {msg.reportStatus}
                      </span>
                      {msg.reportPriority && (
                        <span 
                          className="report-priority-badge"
                          style={{
                            background: getPriorityColor(msg.reportPriority) + '20',
                            color: getPriorityColor(msg.reportPriority)
                          }}
                        >
                          {msg.reportPriority}
                        </span>
                      )}
                      {msg.isPinned && (
                        <span className="pinned-badge">📌 Dipasang</span>
                      )}
                    </div>

                    {/* Report Title */}
                    <div className="report-title">{msg.message.split('\n')[0]}</div>

                    {/* Report Description */}
                    {msg.message.split('\n').slice(1).join('\n') && (
                      <div className="report-description">
                        {msg.message.split('\n').slice(1).join('\n')}
                      </div>
                    )}

                    {/* Report Location */}
                    {msg.reportLocation && (
                      <div className="report-location">
                        📍 {msg.reportLocation}
                      </div>
                    )}

                    {/* Report Meta */}
                    <div className="report-meta-row">
                      <span className="report-ticket">{msg.reportId}</span>
                    </div>

                    {/* Author */}
                    <div className="report-author">
                      <div className="report-author-avatar">{msg.avatar}</div>
                      <div>
                        <div className="report-author-name">{msg.author}</div>
                        <div className="report-author-time">{msg.timestamp}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="message-actions">
                      <button 
                        className={`message-action-btn like ${msg.likedBy.includes(user?.name || '') ? 'liked' : ''}`}
                        onClick={() => handleLike(msg.id)}
                      >
                        ❤️ {msg.likes > 0 && msg.likes}
                      </button>
                      <button className="message-action-btn reply" onClick={() => setReplyTo(msg)}>
                        💬 Balas ({msg.replies.length})
                      </button>
                      {isAdmin() && (
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
                        {msg.replies.map((reply) => {
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
                                {(isReplyMine || isAdmin()) && (
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
              }

              // Render Regular Message
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
                      💬 Balas ({msg.replies.length})
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
                      {msg.replies.map((reply) => {
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
              <span>💬 Membalas <strong>{replyTo.author}</strong>{replyTo.isReport ? ' (Laporan)' : ''}</span>
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

