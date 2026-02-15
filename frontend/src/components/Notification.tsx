/** Toast notification: auto-dismiss and close button. */
import React, { useEffect } from 'react';

type NotificationProps = {
  message: string;
  type?: 'success' | 'info' | 'error';
  onClose: () => void;
  duration?: number;
};

const Notification: React.FC<NotificationProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div
      className={`notification notification--${type}`}
      role="alert"
    >
      <span className="notification__message">{message}</span>
      <button
        type="button"
        className="notification__close"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
};

export default Notification;
