import { useEffect, useRef, useState } from "react";

function NotificationsBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const previousCount = useRef(0);

  const playSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.play().catch(() => {});
  };

const fetchNotifications = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  try {
    const response = await fetch(
      `http://localhost:8080/api/notifications/user/${user.id}`
    );
    const data = await response.json();

    // 🔥 غير notifications لي ما تقراوش
    const unread = data.filter((n) => !n.readStatus);

    if (previousCount.current !== 0 && unread.length > previousCount.current) {
      playSound();
    }

    previousCount.current = unread.length;
    setNotifications(data);
  } catch (error) {
    console.error(error);
  }
};

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="notification-wrapper">
      <button
  onClick={async () => {
    setOpen(!open);

    // 🔥 mark all as read
    const unread = notifications.filter(n => !n.readStatus);

    for (let notif of unread) {
      await fetch(`http://localhost:8080/api/notifications/${notif.id}/read`, {
        method: "PUT"
      });
    }

    // update UI
    setNotifications(prev =>
      prev.map(n => ({ ...n, readStatus: true }))
    );
  }}
>
        🔔
        {notifications.filter(n => !n.readStatus).length > 0 && (
  <span className="notification-count">
    {notifications.filter(n => !n.readStatus).length}
  </span>
)}
      </button>

      {open && (
        <div className="notification-dropdown">
          <h3>Notifications</h3>

          {notifications.length === 0 ? (
            <p>Aucune notification</p>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="notification-item">
                <strong>{notif.title}</strong>
                <p>{notif.message}</p>
                <small>{notif.type}</small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationsBell;