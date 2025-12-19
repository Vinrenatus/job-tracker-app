const Notification = ({ show, type, message }) => {
  if (!show) return null;

  // Determine Bootstrap class based on notification type
  const alertClass = type === 'error' ? 'alert-danger' : 'alert-success';

  return (
    <div
      id="notification"
      className={`position-fixed top-0 end-0 m-3 p-3 rounded shadow ${alertClass}`}
      style={{ zIndex: 1050, minWidth: '300px' }}
    >
      <div className="d-flex align-items-center">
        <i className={`fas me-2 ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Notification;
