// src/components/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config/api';

const Dashboard = ({ isAuthenticated, handleApiError }) => {
  const [dashboardData, setDashboardData] = useState({
    total_applications: 0,
    applications_this_week: 0,
    interviews_scheduled: 0,
    offers_received: 0,
    average_hourly_rate: 0,
    applications_today: 0,
    success_rate: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch dashboard data from the API
      const token = localStorage.getItem('access_token');
      fetch(`${API_BASE_URL}/api/tracker/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setDashboardData(data);
      })
      .catch(error => {
        console.error('Error fetching dashboard data:', error);
        if (handleApiError) {
          handleApiError(error, 'Failed to load dashboard data');
        }
      });

      // Fetch recent applications
      fetch(`${API_BASE_URL}/api/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const apps = data.applications?.slice(0, 10).map(app => ({
          id: app.id,
          company: app.company,
          roleTitle: app.role_title,
          appliedDate: app.applied_date,
          status: app.status,
          source: app.application_source,
          hourlyRate: app.hourly_rate
        })) || [];
        setRecentApplications(apps);
      })
      .catch(error => {
        console.error('Error fetching recent applications:', error);
        if (handleApiError) {
          handleApiError(error, 'Failed to load recent applications');
        }
      });
    }
  }, [isAuthenticated, handleApiError]);

  // Format status text for display
  const getStatusClass = (status) => {
    if (!status) return '';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('applied')) return 'status-applied';
    if (lowerStatus.includes('screening')) return 'status-screening';
    if (lowerStatus.includes('interview')) return 'status-interview';
    if (lowerStatus.includes('offer')) return 'status-offer';
    if (lowerStatus.includes('rejected')) return 'status-rejected';
    return '';
  };

  return (
    <div id="dashboard-section">
      <h2 className="mb-4"><i className="fas fa-tachometer-alt"></i> Dashboard Overview</h2>

      {/* Stats Cards Row */}
      <div className="row mb-4">
        <div className="col-md-2 col-sm-6">
          <div className="card dashboard-card stat-card bg-light">
            <div className="stat-value">{dashboardData.total_applications || 0}</div>
            <div className="stat-label">Total Applications</div>
          </div>
        </div>
        <div className="col-md-2 col-sm-6">
          <div className="card dashboard-card stat-card bg-light">
            <div className="stat-value">{dashboardData.applications_this_week || 0}</div>
            <div className="stat-label">This Week</div>
          </div>
        </div>
        <div className="col-md-2 col-sm-6">
          <div className="card dashboard-card stat-card bg-light">
            <div className="stat-value">{dashboardData.interviews_scheduled || 0}</div>
            <div className="stat-label">Interviews</div>
          </div>
        </div>
        <div className="col-md-2 col-sm-6">
          <div className="card dashboard-card stat-card bg-light">
            <div className="stat-value">{dashboardData.offers_received || 0}</div>
            <div className="stat-label">Offers</div>
          </div>
        </div>
        <div className="col-md-2 col-sm-6">
          <div className="card dashboard-card stat-card bg-light">
            <div className="stat-value">${dashboardData.average_hourly_rate?.toFixed(2) || '0.00'}</div>
            <div className="stat-label">Avg. Hourly Rate</div>
          </div>
        </div>
        <div className="col-md-2 col-sm-6">
          <div className="card dashboard-card stat-card bg-light">
            <div className="stat-value">{dashboardData.applications_today || 0}</div>
            <div className="stat-label">Today's Apps</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row">
        <div className="col-12">
          <div className="card dashboard-card">
            <div className="card-header bg-primary text-white">
              <i className="fas fa-table"></i> Recent Applications
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Company</th>
                      <th>Role</th>
                      <th>Applied Date</th>
                      <th>Status</th>
                      <th>Source</th>
                      <th>Hourly Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.map((app) => (
                      <tr key={app.id}>
                        <td><span className="job-company">{app.company}</span></td>
                        <td><span className="job-title">{app.roleTitle}</span></td>
                        <td>{app.appliedDate}</td>
                        <td><span className={getStatusClass(app.status)}><strong>{app.status}</strong></span></td>
                        <td>{app.source}</td>
                        <td>${app.hourlyRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
