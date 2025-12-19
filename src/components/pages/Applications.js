// src/components/pages/Applications.js
import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config/api';

const Applications = ({ isAuthenticated, handleApiError }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentApp, setCurrentApp] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
  const [formData, setFormData] = useState({
    company: '',
    roleTitle: '',
    location: '',
    hourlyRate: '',
    appliedDate: '',
    status: 'Applied',
    source: '',
    contact: '',
    priority: 'Medium'
  });

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('access_token');
      fetch(`${API_BASE_URL}/api/applications`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const apps = data.applications?.map(app => ({
          id: app.id,
          company: app.company,
          roleTitle: app.role_title,
          location: app.location,
          hourlyRate: app.hourly_rate,
          appliedDate: app.applied_date,
          status: app.status,
          source: app.application_source,
          contact: app.contact_email,
          priority: app.priority_level
        })) || [];
        setApplications(apps);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching applications:', error);
        if (handleApiError) {
          handleApiError(error, 'Failed to load applications');
        }
        setLoading(false);
      });
    }
  }, [isAuthenticated, handleApiError, showForm]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const url = currentApp ? `${API_BASE_URL}/api/applications/${currentApp.id}` : `${API_BASE_URL}/api/applications`;
    const method = currentApp ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          company: formData.company,
          role_title: formData.roleTitle,
          location: formData.location,
          hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
          applied_date: formData.appliedDate,
          status: formData.status,
          application_source: formData.source,
          contact_email: formData.contact,
          priority_level: formData.priority
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setShowForm(false);
      setCurrentApp(null);
      setFormData({
        company: '',
        roleTitle: '',
        location: '',
        hourlyRate: '',
        appliedDate: '',
        status: 'Applied',
        source: '',
        contact: '',
        priority: 'Medium'
      });

      // Refresh the applications list
      const token = localStorage.getItem('access_token');
      const refreshedResponse = await fetch(`${API_BASE_URL}/api/applications`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (refreshedResponse.ok) {
        const refreshedData = await refreshedResponse.json();
        const apps = refreshedData.applications?.map(app => ({
          id: app.id,
          company: app.company,
          roleTitle: app.role_title,
          location: app.location,
          hourlyRate: app.hourly_rate,
          appliedDate: app.applied_date,
          status: app.status,
          source: app.application_source,
          contact: app.contact_email,
          priority: app.priority_level
        })) || [];
        setApplications(apps);
      }
    } catch (error) {
      console.error(`Error ${currentApp ? 'updating' : 'creating'} application:`, error);
      if (handleApiError) {
        handleApiError(error, `Failed to ${currentApp ? 'update' : 'create'} application`);
      }
    }
  };

  const handleEdit = (app) => {
    setCurrentApp(app);
    setFormData({
      company: app.company,
      roleTitle: app.roleTitle,
      location: app.location,
      hourlyRate: app.hourlyRate || '',
      appliedDate: app.appliedDate || '',
      status: app.status,
      source: app.source || '',
      contact: app.contact || '',
      priority: app.priority || 'Medium'
    });
    setShowForm(true);
  };

  const handleDelete = async (appId) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;

    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/applications/${appId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove from local state
      setApplications(applications.filter(app => app.id !== appId));
    } catch (error) {
      console.error('Error deleting application:', error);
      if (handleApiError) {
        handleApiError(error, 'Failed to delete application');
      }
    }
  };

  const handleCreateNew = () => {
    setCurrentApp(null);
    setFormData({
      company: '',
      roleTitle: '',
      location: '',
      hourlyRate: '',
      appliedDate: '',
      status: 'Applied',
      source: '',
      contact: '',
      priority: 'Medium'
    });
    setShowForm(true);
  };

  // Format status text for display
  const getStatusClass = (status) => {
    if (!status) return 'status-other';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('applied')) return 'status-applied';
    if (lowerStatus.includes('screening')) return 'status-screening';
    if (lowerStatus.includes('interview')) return 'status-interview';
    if (lowerStatus.includes('offer')) return 'status-offer';
    if (lowerStatus.includes('rejected')) return 'status-rejected';
    return 'status-other';
  };

  // Get CSS class for priority badge
  const getPriorityClass = (priority) => {
    if (!priority) return 'bg-secondary';
    const lowerPriority = priority.toLowerCase();
    if (lowerPriority.includes('high')) return 'bg-danger';
    if (lowerPriority.includes('medium')) return 'bg-warning';
    if (lowerPriority.includes('low')) return 'bg-success';
    return 'bg-secondary';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div id="applications-section">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="fas fa-list"></i> Job Applications</h2>
        <div className="d-flex gap-2">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('table')}
            >
              <i className="fas fa-table"></i> Table View
            </button>
            <button
              type="button"
              className={`btn ${viewMode === 'kanban' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('kanban')}
            >
              <i className="fas fa-columns"></i> Pipeline View
            </button>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleCreateNew}
          >
            <i className="fas fa-plus me-1"></i> Add Application
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            {currentApp ? 'Edit Application' : 'Add New Application'}
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="company" className="form-label">Company *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="roleTitle" className="form-label">Role Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="roleTitle"
                      name="roleTitle"
                      value={formData.roleTitle}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="location" className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="source" className="form-label">Application Source</label>
                    <input
                      type="text"
                      className="form-control"
                      id="source"
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="hourlyRate" className="form-label">Hourly Rate ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="hourlyRate"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      step="0.01"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="appliedDate" className="form-label">Applied Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="appliedDate"
                      name="appliedDate"
                      value={formData.appliedDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="contact" className="form-label">Contact Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="contact"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="status" className="form-label">Status</label>
                      <select
                        className="form-select"
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Processing">Processing</option>
                        <option value="Interview">Interview</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Offer">Offer</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="priority" className="form-label">Priority</label>
                      <select
                        className="form-select"
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  {currentApp ? 'Update' : 'Save'} Application
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewMode === 'table' ? (
        <div className="card dashboard-card">
          <div className="card-header bg-primary text-white">
            <i className="fas fa-briefcase"></i> Application Tracker
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Company</th>
                    <th>Role Title</th>
                    <th>Location</th>
                    <th>Hourly Rate</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Contact</th>
                    <th>Priority</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td><span className="job-company">{app.company}</span></td>
                      <td>{app.roleTitle}</td>
                      <td>{app.location}</td>
                      <td>${typeof app.hourlyRate === 'number' ? app.hourlyRate.toFixed(2) : 'N/A'}</td>
                      <td>{app.appliedDate}</td>
                      <td><span className={getStatusClass(app.status)}><strong>{app.status}</strong></span></td>
                      <td>{app.source}</td>
                      <td>{app.contact}</td>
                      <td>{app.priority}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => handleEdit(app)}
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(app.id)}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="application-pipeline">
          <div className="d-flex flex-nowrap overflow-x-auto mb-3" style={{ gap: '1rem' }}>
            {['Applied', 'Processing', 'Interview', 'Offer', 'Rejected'].map((status) => {
              const statusApps = applications.filter(app =>
                app.status.toLowerCase().includes(status.toLowerCase())
              );

              return (
                <div key={status} className="pipeline-column" style={{ minWidth: '300px' }}>
                  <div className="pipeline-header p-3 bg-primary text-white rounded-top">
                    <h5 className="mb-0">
                      <span className={`status-${status.toLowerCase()}`}>
                        {status}
                        <span className="badge bg-light text-dark ms-2">{statusApps.length}</span>
                      </span>
                    </h5>
                  </div>
                  <div className="pipeline-content p-2" style={{ minHeight: '500px', backgroundColor: '#f8f9fa', borderRadius: '0 0 5px 5px' }}>
                    {statusApps.map((app) => (
                      <div key={app.id} className="pipeline-card card mb-2">
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-start">
                            <h6 className="card-title mb-1">
                              <span className="job-company">{app.company}</span>
                            </h6>
                            <span className={`badge ${getPriorityClass(app.priority)}`}>
                              {app.priority}
                            </span>
                          </div>
                          <p className="card-text small mb-1">{app.roleTitle}</p>
                          <p className="card-text small text-muted mb-2">
                            <i className="fas fa-calendar me-1"></i>
                            {app.appliedDate || 'No date'}
                          </p>
                          <div className="d-flex justify-content-between">
                            <span className="small">
                              ${typeof app.hourlyRate === 'number' ? app.hourlyRate.toFixed(2) : 'N/A'}
                            </span>
                            <div>
                              <button
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => handleEdit(app)}
                                title="Edit"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(app.id)}
                                title="Delete"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {statusApps.length === 0 && (
                      <div className="text-center text-muted p-4">
                        <p className="mb-0">No applications</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {applications.length === 0 && !showForm && (
        <div className="text-center py-5">
          <h4>No applications found</h4>
          <p className="text-muted">Get started by adding your first job application</p>
          <button
            className="btn btn-primary"
            onClick={handleCreateNew}
          >
            <i className="fas fa-plus me-1"></i> Add Your First Application
          </button>
        </div>
      )}
    </div>
  );
};

export default Applications;
