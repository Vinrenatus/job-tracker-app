// src/components/pages/JobAnalysis.js
import React, { useState, useEffect } from 'react';

const JobAnalysis = ({ isAuthenticated }) => {
  const [analysisData, setAnalysisData] = useState({
    applicationsPerDay: [],
    successRate: 0,
    topCompanies: [],
    recommendedJobs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      // In a real application, we would fetch from the backend
      // For now, simulate API response with mock data
      setTimeout(() => {
        setAnalysisData({
          applicationsPerDay: [
            { date: '2024-12-10', count: 5 },
            { date: '2024-12-11', count: 8 },
            { date: '2024-12-12', count: 12 },
            { date: '2024-12-13', count: 6 },
            { date: '2024-12-14', count: 10 },
            { date: '2024-12-15', count: 15 },
            { date: '2024-12-16', count: 9 }
          ],
          successRate: 15.7,
          topCompanies: [
            { name: 'TechCorp', applications: 24, interviews: 8, offers: 2 },
            { name: 'StartupX', applications: 18, interviews: 5, offers: 1 },
            { name: 'EnterpriseSys', applications: 15, interviews: 3, offers: 0 },
            { name: 'DataFlow', applications: 12, interviews: 4, offers: 1 }
          ],
          recommendedJobs: [
            { title: 'Senior Backend Engineer', company: 'TechCorp', match: 92 },
            { title: 'Full Stack Developer', company: 'StartupX', match: 88 },
            { title: 'DevOps Specialist', company: 'EnterpriseSys', match: 85 },
            { title: 'Data Architect', company: 'DataFlow', match: 82 }
          ]
        });
        setLoading(false);
      }, 1000);
    }
  }, [isAuthenticated]);

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
    <div id="job-analysis-page" className="p-4">
      <h2 className="mb-4"><i className="fas fa-chart-line me-2"></i>Job Search Analysis</h2>

      <div className="row">
        <div className="col-md-6">
          <div className="card dashboard-card mb-4">
            <div className="card-header bg-primary text-white">
              <i className="fas fa-chart-bar me-2"></i>Applications Per Day
            </div>
            <div className="card-body">
              <div className="chart-placeholder text-center p-5">
                <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
                <p className="mb-0">Applications Trend Chart</p>
              </div>
            </div>
          </div>

          <div className="card dashboard-card mb-4">
            <div className="card-header bg-primary text-white">
              <i className="fas fa-medal me-2"></i>Success Rate
            </div>
            <div className="card-body text-center">
              <h3 className="display-4 text-success">{analysisData.successRate}%</h3>
              <p className="text-muted">Overall Success Rate</p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card dashboard-card mb-4">
            <div className="card-header bg-primary text-white">
              <i className="fas fa-building me-2"></i>Top Companies Applied To
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Company</th>
                      <th>Apps</th>
                      <th>Interviews</th>
                      <th>Offers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisData.topCompanies.map((company, index) => (
                      <tr key={index}>
                        <td><span className="job-company">{company.name}</span></td>
                        <td>{company.applications}</td>
                        <td>{company.interviews}</td>
                        <td className={company.offers > 0 ? "text-success fw-bold" : "text-muted"}>{company.offers}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card dashboard-card mb-4">
            <div className="card-header bg-primary text-white">
              <i className="fas fa-lightbulb me-2"></i>Recommended Jobs
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Position</th>
                      <th>Company</th>
                      <th>Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisData.recommendedJobs.map((job, index) => (
                      <tr key={index}>
                        <td>{job.title}</td>
                        <td><span className="job-company">{job.company}</span></td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="flex-grow-1 me-2">
                              <div className="progress" style={{ height: '8px' }}>
                                <div
                                  className="progress-bar"
                                  role="progressbar"
                                  style={{ width: `${job.match}%` }}
                                  aria-valuenow={job.match}
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                ></div>
                              </div>
                            </div>
                            <span className="fw-bold">{job.match}%</span>
                          </div>
                        </td>
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

export default JobAnalysis;
