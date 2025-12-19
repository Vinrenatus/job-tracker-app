// src/components/pages/EmailTracking.js
import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config/api';

const EmailTracking = ({ handleApiError }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentEmail, setCurrentEmail] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    contact: '',
    subject: '',
    date: '',
    type: 'Outbound',
    status: 'Sent',
    followUpDate: '',
    notes: ''
  });

  useEffect(() => {
    // In a real implementation, this would fetch from an API
    // For now, showing mock data
    const mockEmails = [
      {
        id: 1,
        company: 'TechCorp Inc.',
        contact: 'john.doe@techcorp.com',
        subject: 'Application for Frontend Developer Position',
        date: '2025-01-10',
        type: 'Outbound',
        status: 'Read',
        followUpDate: '2025-01-15',
        notes: 'Initial application sent with resume and cover letter'
      },
      {
        id: 2,
        company: 'Innovate Solutions',
        contact: 'sarah.smith@innovatesol.com',
        subject: 'Follow-up on Application Status',
        date: '2025-01-08',
        type: 'Outbound',
        status: 'Delivered',
        followUpDate: '2025-01-18',
        notes: 'Following up on previous application'
      },
      {
        id: 3,
        company: 'Global Systems',
        contact: 'hr@globalsystems.com',
        subject: 'Interview Confirmation',
        date: '2025-01-05',
        type: 'Inbound',
        status: 'Scheduled',
        followUpDate: '2025-01-12',
        notes: 'Interview scheduled for next week'
      }
    ];
    
    setEmails(mockEmails);
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
    if (currentEmail) {
      // Update existing email
      const updatedEmails = emails.map(email => 
        email.id === currentEmail.id ? { ...formData, id: currentEmail.id } : email
      );
      setEmails(updatedEmails);
    } else {
      // Add new email
      const newEmail = {
        ...formData,
        id: emails.length + 1
      };
      setEmails([...emails, newEmail]);
    }

    setShowForm(false);
    setFormData({
      company: '',
      contact: '',
      subject: '',
      date: '',
      type: 'Outbound',
      status: 'Sent',
      followUpDate: '',
      notes: ''
    });
  };

  const handleEdit = (email) => {
    setCurrentEmail(email);
    setFormData({
      company: email.company,
      contact: email.contact,
      subject: email.subject,
      date: email.date,
      type: email.type,
      status: email.status,
      followUpDate: email.followUpDate,
      notes: email.notes
    });
    setShowForm(true);
  };

  const handleDelete = (emailId) => {
    if (!window.confirm('Are you sure you want to delete this email record?')) return;
    
    setEmails(emails.filter(email => email.id !== emailId));
  };

  const handleCreateNew = () => {
    setCurrentEmail(null);
    setFormData({
      company: '',
      contact: '',
      subject: '',
      date: '',
      type: 'Outbound',
      status: 'Sent',
      followUpDate: '',
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
    <div id="email-tracking-section">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="fas fa-envelope"></i> Email & Communication Tracker</h2>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={handleCreateNew}
          >
            <i className="fas fa-plus me-1"></i> Add Communication
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            {currentEmail ? 'Edit Communication' : 'Add New Communication'}
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
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

                  <div className="mb-3">
                    <label htmlFor="subject" className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="date" className="form-label">Date Sent/Received</label>
                    <input
                      type="date"
                      className="form-control"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="type" className="form-label">Communication Type</label>
                    <select
                      className="form-select"
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                    >
                      <option value="Outbound">Outbound</option>
                      <option value="Inbound">Inbound</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="status" className="form-label">Status</label>
                    <select
                      className="form-select"
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="Sent">Sent</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Read">Read</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Failed">Failed</option>
                      <option value="Response">Response</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="followUpDate" className="form-label">Follow-up Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="followUpDate"
                      name="followUpDate"
                      value={formData.followUpDate}
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
                  {currentEmail ? 'Update' : 'Save'} Communication
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
          <i className="fas fa-comments"></i> Communication History
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Follow-up</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((email) => (
                  <tr key={email.id}>
                    <td><span className="job-company">{email.company}</span></td>
                    <td>{email.contact}</td>
                    <td>{email.subject}</td>
                    <td>{email.date}</td>
                    <td>
                      <span className={`badge ${email.type === 'Outbound' ? 'bg-info' : 'bg-success'}`}>
                        {email.type}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        email.status === 'Sent' ? 'bg-secondary' :
                        email.status === 'Delivered' ? 'bg-primary' :
                        email.status === 'Read' ? 'bg-success' :
                        email.status === 'Scheduled' ? 'bg-warning' :
                        email.status === 'Failed' ? 'bg-danger' :
                        email.status === 'Response' ? 'bg-info' : 'bg-secondary'
                      }`}>
                        {email.status}
                      </span>
                    </td>
                    <td>{email.followUpDate || 'N/A'}</td>
                    <td>{email.notes.substring(0, 50)}...</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => handleEdit(email)}
                        title="Edit"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(email.id)}
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

      {emails.length === 0 && !showForm && (
        <div className="text-center py-5">
          <h4>No communications tracked yet</h4>
          <p className="text-muted">Start tracking your job application emails and follow-ups</p>
          <button
            className="btn btn-primary"
            onClick={handleCreateNew}
          >
            <i className="fas fa-plus me-1"></i> Add First Communication
          </button>
        </div>
      )}
    </div>
  );
};

export default EmailTracking;