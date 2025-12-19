import React, { useState } from 'react';

const ResumeUpload = ({ handleApiError }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchResults, setSearchResults] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file type is supported
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const imageTypes = ['image/jpeg', 'image/jpg', 'image/png'];

      if (!validTypes.includes(file.type) && !imageTypes.includes(file.type)) {
        if (handleApiError) {
          handleApiError('Invalid file type', 'Please upload a Word document (.doc, .docx), PDF, or image file (.png, .jpg, .jpeg)');
        }
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        if (handleApiError) {
          handleApiError('File too large', 'Please upload a file smaller than 10MB');
        }
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      if (handleApiError) {
        handleApiError('No file selected', 'Please select a resume file to upload');
      }
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('resume', selectedFile);

    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('http://localhost:5000/api/upload-resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUploadProgress(100);
      
      // Display search results
      setSearchResults(data.jobMatches || []);
      
    } catch (error) {
      console.error('Error uploading resume:', error);
      if (handleApiError) {
        handleApiError(error, 'Failed to upload resume');
      }
    } finally {
      setUploading(false);
    }
  };

  const addJobToTargets = async (job) => {
    const token = localStorage.getItem('access_token');
    
    try {
      const response = await fetch('http://localhost:5000/api/target-companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: job.company,
          role_title: job.position,
          website: job.website || '',
          company_size: job.company_size || '',
          industry: job.industry || '',
          remote_policy: job.remote_policy || '',
          application_status: 'To Apply',
          priority: 'Medium'
        })
      });

      if (response.ok) {
        if (handleApiError) {
          handleApiError('Success', `${job.company} added to target companies!`);
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error adding job to targets:', error);
      if (handleApiError) {
        handleApiError(error, 'Failed to add company to targets');
      }
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header bg-info text-white">
        <i className="fas fa-file-upload me-2"></i> Resume Upload & Job Matching
      </div>
      <div className="card-body">
        <div className="mb-3">
          <label htmlFor="resumeUpload" className="form-label">Upload Resume for Job Matching</label>
          <input
            type="file"
            className="form-control"
            id="resumeUpload"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={handleFileChange}
          />
          <div className="form-text">
            Supported formats: PDF, DOC, DOCX, PNG, JPG, JPEG (Max 10MB)
          </div>
        </div>

        {selectedFile && (
          <div className="mb-3">
            <p>Selected file: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
            <button 
              className="btn btn-info"
              onClick={handleUpload}
              disabled={uploading}
            >
              <i className="fas fa-cloud-upload-alt me-1"></i>
              {uploading ? 'Uploading...' : 'Upload & Match Jobs'}
            </button>
          </div>
        )}

        {uploading && (
          <div className="progress mb-3">
            <div 
              className="progress-bar" 
              role="progressbar" 
              style={{ width: `${uploadProgress}%` }}
              aria-valuenow={uploadProgress}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {uploadProgress}%
            </div>
          </div>
        )}

        {searchResults.length > 0 && (
          <div>
            <h5 className="mt-4">Matching Jobs Found:</h5>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Company</th>
                    <th>Position</th>
                    <th>Industry</th>
                    <th>Salary Range</th>
                    <th>Remote Policy</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((job, index) => (
                    <tr key={index}>
                      <td>{job.company}</td>
                      <td>{job.position}</td>
                      <td>{job.industry}</td>
                      <td>{job.salaryRange || 'N/A'}</td>
                      <td>{job.remotePolicy || 'N/A'}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-success me-2"
                          onClick={() => addJobToTargets(job)}
                          title="Add to Target Companies"
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                        <a 
                          href={job.applyLink || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                          title="Apply Now"
                        >
                          <i className="fas fa-paper-plane"></i>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;