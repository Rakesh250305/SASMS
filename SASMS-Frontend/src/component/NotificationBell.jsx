import { useState, useRef, useEffect } from "react";
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from "react-router-dom";

const typeIcon = {
  booking_created: "📋",
  booking_assigned: "👷",
  booking_in_progress: "⚙️",
  booking_completed: "✅",
  booking_cancelled: "❌",
};

const typeColor = {
  booking_created: "#3b82f6",
  booking_assigned: "#8b5cf6",
  booking_in_progress: "#f59e0b",
  booking_completed: "#10b981",
  booking_cancelled: "#ef4444",
};

export default function NotificationBell() {
  const { notifications, unreadCount, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const role = localStorage.getItem('role');

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && unreadCount > 0) markRead([]);
  };

  const handleClick = (n) => {
    setOpen(false);
    if (!n.booking) return;
    const bookingId = n.booking._id || n.booking;
    if (role === "user") navigate(`/user/booking/${bookingId}`);
    else if (role === "admin") navigate(`/admin/booking/${bookingId}`);
    else if (role === "provider") navigate(`/provider/booking/${bookingId}`);
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button onClick={handleOpen} style={styles.bell}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div style={styles.dropdown}>
          <div style={styles.dropHeader}>
            <span style={styles.dropTitle}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={() => markRead([])} style={styles.markAllBtn}>Mark all read</button>
            )}
          </div>
          <div style={styles.list}>
            {notifications.length === 0 ? (
              <div style={styles.empty}>No notifications yet</div>
            ) : (
              notifications.slice(0, 15).map((n) => (
                <div key={n._id} onClick={() => handleClick(n)} style={{
                  ...styles.item,
                  background: n.isRead ? "transparent" : "rgba(99,102,241,0.06)",
                }}>
                  <div style={{ ...styles.iconDot, background: typeColor[n.type] + "20", color: typeColor[n.type] }}>
                    {typeIcon[n.type] || "🔔"}
                  </div>
                  <div style={styles.itemContent}>
                    <div style={styles.itemTitle}>{n.title}</div>
                    <div style={styles.itemMsg}>{n.message}</div>
                    <div style={styles.itemTime}>{timeAgo(n.createdAt)}</div>
                  </div>
                  {!n.isRead && <span style={styles.dot} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  bell: {
    position: "relative", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px", padding: "8px 10px", cursor: "pointer", color: "inherit",
    display: "flex", alignItems: "center", transition: "background 0.2s",
  },
  badge: {
    position: "absolute", top: "-6px", right: "-6px", background: "#ef4444",
    color: "#fff", fontSize: "10px", fontWeight: 700, borderRadius: "10px",
    padding: "2px 5px", minWidth: "18px", textAlign: "center", lineHeight: 1,
  },
  dropdown: {
    position: "absolute", right: 0, top: "calc(100% + 8px)", width: "340px",
    background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 999, overflow: "hidden",
  },
  dropHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  dropTitle: { fontWeight: 700, fontSize: "14px", color: "#fff" },
  markAllBtn: {
    background: "none", border: "none", color: "#6366f1", fontSize: "12px",
    cursor: "pointer", fontWeight: 600,
  },
  list: { maxHeight: "380px", overflowY: "auto" },
  empty: { padding: "32px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "14px" },
  item: {
    display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 16px",
    cursor: "pointer", transition: "background 0.15s", borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  iconDot: {
    width: "36px", height: "36px", borderRadius: "10px", display: "flex",
    alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0,
  },
  itemContent: { flex: 1, minWidth: 0 },
  itemTitle: { fontWeight: 600, fontSize: "13px", color: "#fff", marginBottom: "2px" },
  itemMsg: { fontSize: "12px", color: "rgba(255,255,255,0.55)", lineHeight: 1.4 },
  itemTime: { fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "4px" },
  dot: {
    width: "8px", height: "8px", borderRadius: "50%", background: "#6366f1",
    flexShrink: 0, marginTop: "6px",
  },
};