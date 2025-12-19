// src/components/pages/Networking.js
import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config/api';

const Networking = ({ handleApiError }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentConnection, setCurrentConnection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    linkedin: '',
    dateMet: '',
    howMet: '',
    nextAction: '',
    nextActionDate: '',
    notes: ''
  });

  useEffect(() => {
    // In a real implementation, this would fetch from an API
    // For now, showing mock data
    const mockConnections = [
      {
        id: 1,
        name: 'John Smith',
        title: 'Senior Engineer',
        company: 'TechCorp Inc.',
        email: 'john.smith@techcorp.com',
        phone: '+1 (555) 123-4567',
        linkedin: 'linkedin.com/in/johnsmith',
        dateMet: '2025-01-10',
        howMet: 'Conference',
        nextAction: 'Follow up on job opportunity',
        nextActionDate: '2025-01-17',
        notes: 'Works in the engineering department, interested in frontend positions'
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        title: 'HR Manager',
        company: 'Global Solutions',
        email: 'sarah.j@globalsolutions.com',
        phone: '+1 (555) 987-6543',
        linkedin: 'linkedin.com/in/sarahjohnson',
        dateMet: '2025-01-05',
        howMet: 'LinkedIn',
        nextAction: 'Send resume',
        nextActionDate: '2025-01-12',
        notes: 'Hiring manager for frontend developer position'
      },
      {
        id: 3,
        name: 'Michael Chen',
        title: 'CTO',
        company: 'Innovate Startups',
        email: 'michael@innovate.com',
        phone: '+1 (555) 456-7890',
        linkedin: 'linkedin.com/in/michaelchen',
        dateMet: '2024-12-20',
        howMet: 'Networking event',
        nextAction: 'Schedule coffee chat',
        nextActionDate: '2025-01-20',
        notes: 'Looking for senior developers for new product team'
      }
    ];
    
    setConnections(mockConnections);
    setLoading(false);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // In a real implementation, this would send to an API
    if (currentConnection) {
      // Update existing connection
      const updatedConnections = connections.map(connection => 
        connection.id === currentConnection.id ? { ...formData, id: currentConnection.id } : connection
      );
      setConnections(updatedConnections);
    } else {
      // Add new connection
      const newConnection = {
        ...formData,
        id: connections.length + 1
      };
      setConnections([...connections, newConnection]);
    }

    setShowForm(false);
    setFormData({
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      linkedin: '',
      dateMet: '',
      howMet: '',
      nextAction: '',
      nextActionDate: '',
      notes: ''
    });
  };

  const handleEdit = (connection) => {
    setCurrentConnection(connection);
    setFormData({
      name: connection.name,
      title: connection.title,
      company: connection.company,
      email: connection.email,
      phone: connection.phone,
      linkedin: connection.linkedin,
      dateMet: connection.dateMet,
      howMet: connection.howMet,
      nextAction: connection.nextAction,
      nextActionDate: connection.nextActionDate,
      notes: connection.notes
    });
    setShowForm(true);
  };

  const handleDelete = (connectionId) => {
    if (!window.confirm('Are you sure you want to delete this connection?')) return;
    
    setConnections(connections.filter(connection => connection.id !== connectionId));
  };

  const handleCreateNew = () => {
    setCurrentConnection(null);
    setFormData({
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      linkedin: '',
      dateMet: '',
      howMet: '',
      nextAction: '',
      nextActionDate: '',
      notes: ''
    });
    setShowForm(true);
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
    <div id="networking-section">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="fas fa-network-wired"></i> Networking & Connections</h2>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={handleCreateNew}
          >
            <i className="fas fa-plus me-1"></i> Add Connection
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            {currentConnection ? 'Edit Connection' : 'Add New Connection'}
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="company" className="form-label">Company</label>
                    <input
                      type="text"
                      className="form-control"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="linkedin" className="form-label">LinkedIn Profile</label>
                    <input
                      type="url"
                      className="form-control"
                      id="linkedin"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="dateMet" className="form-label">Date Met</label>
                    <input
                      type="date"
                      className="form-control"
                      id="dateMet"
                      name="dateMet"
                      value={formData.dateMet}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="howMet" className="form-label">How Did You Meet?</label>
                    <select
                      className="form-select"
                      id="howMet"
                      name="howMet"
                      value={formData.howMet}
                      onChange={handleChange}
                    >
                      <option value="">Select option</option>
                      <option value="Conference">Conference</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Networking event">Networking event</option>
                      <option value="Referral">Referral</option>
                      <option value="Work">From work</option>
                      <option value="Social event">Social event</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="nextAction" className="form-label">Next Action</label>
                    <input
                      type="text"
                      className="form-control"
                      id="nextAction"
                      name="nextAction"
                      value={formData.nextAction}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="nextActionDate" className="form-label">Next Action Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="nextActionDate"
                      name="nextActionDate"
                      value={formData.nextActionDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="notes" className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      id="notes"
                      name="notes"
                      rows="2"
                      value={formData.notes}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  {currentConnection ? 'Update' : 'Save'} Connection
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

      <div className="card dashboard-card">
        <div className="card-header bg-primary text-white">
          <i className="fas fa-users"></i> Professional Network
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>How Met</th>
                  <th>Next Action</th>
                  <th>Next Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {connections.map((connection) => (
                  <tr key={connection.id}>
                    <td>
                      <div className="fw-bold">{connection.name}</div>
                      <div className="text-muted small">{connection.title}</div>
                    </td>
                    <td>{connection.company}</td>
                    <td>
                      <div>{connection.email}</div>
                      <div className="text-muted small">{connection.phone}</div>
                    </td>
                    <td>
                      <span className="badge bg-secondary">{connection.howMet}</span>
                    </td>
                    <td>{connection.nextAction}</td>
                    <td>
                      {connection.nextActionDate ? (
                        <span className={new Date(connection.nextActionDate) < new Date() ? 'text-danger' : 'text-primary'}>
                          {connection.nextActionDate}
                        </span>
                      ) : (
                        'No date set'
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => handleEdit(connection)}
                        title="Edit"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(connection.id)}
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

      {connections.length === 0 && !showForm && (
        <div className="text-center py-5">
          <h4>No connections in your network yet</h4>
          <p className="text-muted">Start building your professional network</p>
          <button
            className="btn btn-primary"
            onClick={handleCreateNew}
          >
            <i className="fas fa-plus me-1"></i> Add First Connection
          </button>
        </div>
      )}
    </div>
  );
};

export default Networking;