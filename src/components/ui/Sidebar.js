import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, isAuthenticated, logout }) => {
  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { id: 'applications', label: 'Applications', icon: 'fas fa-list' },
    { id: 'targetCompanies', label: 'Target Companies', icon: 'fas fa-target' },
    { id: 'emailTracking', label: 'Email Tracking', icon: 'fas fa-envelope' },
    { id: 'networking', label: 'Networking', icon: 'fas fa-network-wired' },
    { id: 'interviewPrep', label: 'Interview Prep', icon: 'fas fa-calendar-check' },
    { id: 'analysis', label: 'Analysis', icon: 'fas fa-chart-line' }
  ];

  return (
    <div className="sidebar d-flex flex-column" style={{ width: '250px', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div className="p-3 border-bottom">
        <h4 className="mb-0">
          <i className="fas fa-briefcase me-2"></i>Job Tracker
        </h4>
      </div>
      
      <nav className="mt-3">
        <ul className="nav flex-column">
          {navItems.map(item => (
            <li key={item.id} className="nav-item">
              <a
                href="#"
                className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(item.id);
                }}
              >
                <i className={`${item.icon} me-2`}></i>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="mt-auto p-3 border-top">
        <button 
          className="btn btn-outline-secondary w-100" 
          onClick={logout}
        >
          <i className="fas fa-sign-out-alt me-2"></i>Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;