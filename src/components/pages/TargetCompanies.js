// src/components/pages/TargetCompanies.js
import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config/api';

const TargetCompanies = ({ handleApiError }) => {
  const [targetCompanies, setTargetCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch target companies data from the API
    const token = localStorage.getItem('access_token');
    fetch(`${API_BASE_URL}/api/target-companies`, {
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
        const companies = data.companies?.map(company => ({
          id: company.id || Math.random(),
          name: company.name,
          role: company.role,
          website: company.website,
          size: company.size,
          industry: company.industry,
          remote: company.remote_policy,
          status: company.application_status,
          priority: company.priority
        })) || [];
        setTargetCompanies(companies);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching target companies:', error);
        if (handleApiError) {
          handleApiError(error, 'Failed to load target companies');
        }
        setLoading(false);
      });
  }, [handleApiError]);

  // Function to search for top companies using Google AI
  const searchTopCompanies = async () => {
    if (!searchTerm.trim()) {
      handleApiError('Please enter a search term', 'Search term required');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/search-companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: searchTerm })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add the search results to our target companies
      const newCompanies = data.results?.slice(0, 20).map(company => ({
        id: company.id || Math.random(),
        name: company.name,
        role: company.role || '',
        website: company.website || '',
        size: company.size || '',
        industry: company.industry || '',
        remote: company.remote_policy || '',
        status: 'To Apply',
        priority: 'Medium'
      })) || [];

      // Update state to include new companies
      setTargetCompanies(prev => [...prev, ...newCompanies]);

    } catch (error) {
      console.error('Error searching for companies:', error);
      if (handleApiError) {
        handleApiError(error, 'Failed to search for companies');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to handle deletion of a target company
  const handleDelete = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this target company?')) return;

    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/target-companies/${companyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setTargetCompanies(targetCompanies.filter(company => company.id !== companyId));
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting target company:', error);
      if (handleApiError) {
        handleApiError(error, 'Failed to delete target company');
      }
    }
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
    <div id="target-companies-section">
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2><i className="fas fa-target me-2"></i> Target Companies</h2>
        </div>

        <div className="d-flex mb-3">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Search for top companies in your field (e.g. 'software engineering', 'marketing', 'design')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchTopCompanies()}
          />
          <button
            className="btn btn-success"
            onClick={searchTopCompanies}
          >
            <i className="fas fa-search me-1"></i> Find Companies
          </button>
        </div>
      </div>

      <div className="card dashboard-card">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <span><i className="fas fa-building me-2"></i>Target Companies Tracker</span>
          <span className="badge bg-light text-dark">{targetCompanies.length} companies</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Company Name</th>
                  <th>Role Title</th>
                  <th>Website</th>
                  <th>Company Size</th>
                  <th>Industry</th>
                  <th>Remote Policy</th>
                  <th>Application Status</th>
                  <th>Priority</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {targetCompanies.map((company) => (
                  <tr key={company.id}>
                    <td><span className="job-company">{company.name}</span></td>
                    <td>{company.role}</td>
                    <td>
                      {company.website ? (
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                          <i className="fas fa-link me-1"></i>Visit
                        </a>
                      ) : 'N/A'}
                    </td>
                    <td>{company.size}</td>
                    <td>{company.industry}</td>
                    <td>{company.remote}</td>
                    <td>{company.status}</td>
                    <td>{company.priority}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(company.id)}
                        title="Delete company"
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

      {targetCompanies.length === 0 && (
        <div className="text-center py-5">
          <h4 className="text-primary">No target companies yet</h4>
          <p className="text-muted mb-4">Start building your target companies list using our AI-powered search or add your own</p>
          <div className="d-flex justify-content-center gap-3">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => {
                setSearchTerm('software engineering');
                setTimeout(searchTopCompanies, 100);
              }}
            >
              <i className="fas fa-robot me-2"></i> AI Suggest Companies
            </button>
            <button
              className="btn btn-outline-primary btn-lg"
              onClick={() => {
                // In the future we could add a form to add companies manually
                handleApiError('', 'Manual add form will be implemented in a future update');
              }}
            >
              <i className="fas fa-plus me-2"></i> Add Manually
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TargetCompanies;
