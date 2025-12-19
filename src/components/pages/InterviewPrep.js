// src/components/pages/InterviewPrep.js
import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config/api';

const InterviewPrep = ({ handleApiError }) => {
  const [interviewPrep, setInterviewPrep] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  useEffect(() => {
    // Fetch interview prep data from the API
    const token = localStorage.getItem('access_token');
    if (token) {
      fetch(`${API_BASE_URL}/api/interviews`, {
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
          const prep = data.interviews?.map((item, idx) => ({
            id: item.id || idx,
            company: item.company || item.Company,
            role: item.role || item.Role,
            date: item.date || item['Interview Date'],
            type: item.type || item['Interview Type'],
            interviewer: item.interviewer || item.Interviewer,
            questions: item.questions || item['Questions to Ask'],
            notes: item.notes || item['Research Notes']
          })) || [];
          setInterviewPrep(prep);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching interview prep:', error);
          if (handleApiError) {
            handleApiError(error, 'Failed to load interview prep data');
          }
          setLoading(false);
        });
    }
  }, [handleApiError]);

  const openGoogleSearch = (interview = null) => {
    setSelectedInterview(interview);
    setIsChatOpen(true); // Reusing this state for the Google search container
  };

  const closeGoogleSearch = () => {
    setIsChatOpen(false);
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
    <div id="interview-prep-section">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="fas fa-calendar-check me-2"></i> Interview Preparation</h2>
        <button
          className="btn btn-success"
          onClick={() => openGoogleSearch(null)}
        >
          <i className="fas fa-search me-1"></i> Research with Google
        </button>
      </div>

      <div className="card dashboard-card">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <span><i className="fas fa-user-tie me-2"></i> Upcoming Interviews</span>
          <span className="badge bg-light text-dark">{interviewPrep.length} scheduled</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Interview Date</th>
                  <th>Interview Type</th>
                  <th>Interviewer</th>
                  <th>Questions to Ask</th>
                  <th>Research Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {interviewPrep.map((prep) => (
                  <tr key={prep.id}>
                    <td><span className="job-company">{prep.company}</span></td>
                    <td>{prep.role}</td>
                    <td>{prep.date}</td>
                    <td>{prep.type}</td>
                    <td>{prep.interviewer}</td>
                    <td>{prep.questions}</td>
                    <td>{prep.notes}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-info me-2"
                        onClick={() => openGoogleSearch(prep)}
                        title="Research Company"
                      >
                        <i className="fas fa-search"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
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

      {interviewPrep.length === 0 && (
        <div className="text-center py-5">
          <h4 className="text-primary">No upcoming interviews yet</h4>
          <p className="text-muted mb-4">Schedule an interview or use our AI assistant to practice for your next one</p>
          <div className="d-flex justify-content-center gap-3">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => openGoogleSearch(null)}
            >
              <i className="fas fa-search me-2"></i> Research Companies
            </button>
            <button
              className="btn btn-outline-primary btn-lg"
              onClick={() => handleApiError('', 'Interview scheduling feature coming soon')}
            >
              <i className="fas fa-calendar-plus me-2"></i> Schedule Interview
            </button>
          </div>
        </div>
      )}

      {/* Embedded Google Search Container */}
      {isChatOpen && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeGoogleSearch}>
          <div className="modal-dialog modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ height: '80vh' }}>
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-search me-2 text-info"></i>
                  {selectedInterview ? `Google Research: ${selectedInterview.company} Interview` : 'Google Research for Interviews'}
                </h5>
                <button type="button" className="btn-close" onClick={closeGoogleSearch}></button>
              </div>
              <div className="modal-body" style={{ height: 'calc(80vh - 56px)' }}>
                <div className="d-flex flex-column h-100">
                  <div className="p-3 border-bottom">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search for interview questions, company research, industry trends..."
                        id="google-search-input"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const searchQuery = e.target.value;
                            if (searchQuery.trim()) {
                              window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
                            }
                          }
                        }}
                      />
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => {
                          const searchInput = document.getElementById('google-search-input');
                          if (searchInput && searchInput.value.trim()) {
                            window.open(`https://www.google.com/search?q=${encodeURIComponent(searchInput.value)}`, '_blank');
                          }
                        }}
                      >
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </div>
                  <div className="flex-grow-1 p-3 bg-light overflow-auto">
                    <div className="container-fluid">
                      <h5 className="mb-3">Research Resources</h5>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="card h-100">
                            <div className="card-body">
                              <h6 className="card-title">Interview Questions</h6>
                              <p className="card-text small">Research common interview questions for your target role</p>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => window.open('https://www.google.com/search?q=common+interview+questions+for+' + (selectedInterview ? encodeURIComponent(selectedInterview.roleTitle || selectedInterview.role) : 'job'), '_blank')}
                              >
                                Search Questions
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="card h-100">
                            <div className="card-body">
                              <h6 className="card-title">Company Research</h6>
                              <p className="card-text small">Research company culture, news, and recent developments</p>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => window.open('https://www.google.com/search?q=' + (selectedInterview ? encodeURIComponent(selectedInterview.company + ' company news') : 'company news'), '_blank')}
                              >
                                Research Company
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="card h-100">
                            <div className="card-body">
                              <h6 className="card-title">Industry Trends</h6>
                              <p className="card-text small">Stay updated on industry developments and trends</p>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => window.open('https://www.google.com/search?q=latest+industry+trends+for+' + (selectedInterview ? encodeURIComponent(selectedInterview.roleTitle || selectedInterview.role) : 'your field'), '_blank')}
                              >
                                Industry Trends
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="card h-100">
                            <div className="card-body">
                              <h6 className="card-title">Salary Research</h6>
                              <p className="card-text small">Research salary ranges for your target position</p>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => window.open('https://www.google.com/search?q=salary+range+' + (selectedInterview ? encodeURIComponent((selectedInterview.roleTitle || selectedInterview.role) + ' ' + selectedInterview.company) : 'position'), '_blank')}
                              >
                                Salary Research
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <small className="text-muted">
                  Google Search Container - Research companies, interview questions, and industry trends
                </small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPrep;
