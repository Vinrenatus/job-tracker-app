// src/components/layouts/Header.js - Updated with full functionality
import React from 'react';

const Header = ({ activeTab, setActiveTab, isAuthenticated, loading, logout, setShowAuthModal }) => {
  if (loading) {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">Loading...</div>
      </nav>
    );
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <i className="fas fa-briefcase"></i> Job Search Tracker
        </a>
        <div className="navbar-nav ms-auto">
          {isAuthenticated ? (
            <>
              <button
                className={'nav-link ' + (activeTab === 'dashboard' ? 'active' : '')}
                onClick={() => setActiveTab('dashboard')}
              >
                <i className="fas fa-home"></i> Dashboard
              </button>
              <button
                className={'nav-link ' + (activeTab === 'applications' ? 'active' : '')}
                onClick={() => setActiveTab('applications')}
              >
                <i className="fas fa-list"></i> Applications
              </button>
              <button
                className={'nav-link ' + (activeTab === 'targetCompanies' ? 'active' : '')}
                onClick={() => setActiveTab('targetCompanies')}
              >
                <i className="fas fa-target"></i> Target Companies
              </button>
              <button
                className={'nav-link ' + (activeTab === 'interviewPrep' ? 'active' : '')}
                onClick={() => setActiveTab('interviewPrep')}
              >
                <i className="fas fa-calendar-check"></i> Interview Prep
              </button>
              <button
                className={'nav-link ' + (activeTab === 'analysis' ? 'active' : '')}
                onClick={() => setActiveTab('analysis')}
              >
                <i className="fas fa-chart-line"></i> Analysis
              </button>
              <button
                className="nav-link"
                onClick={logout}
              >
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </>
          ) : (
            <button
              className="nav-link"
              onClick={() => setShowAuthModal(true)}
            >
              <i className="fas fa-sign-in-alt"></i> Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;