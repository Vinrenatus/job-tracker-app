const StatCard = ({ title, value, icon, className = "" }) => {
  return (
    <div className={"card dashboard-card stat-card bg-light " + className}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">
        <i className={"fas " + icon}></i> {title}
      </div>
    </div>
  );
};

export default StatCard;