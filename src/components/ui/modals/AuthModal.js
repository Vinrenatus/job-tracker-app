// src/components/ui/modals/AuthModal.js
import React, { useState } from 'react';

const AuthModal = ({ show, onClose, isLoginMode, setIsLoginMode, login, signup }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  if (!show) return null;

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    let result;

    try {
      if (isLoginMode) {
        result = await login(username, password);
      } else {
        result = await signup(username, email, password);
      }

      if (result.success) {
        onClose();
        showNotification('success', isLoginMode ? 'Login successful!' : 'Account created successfully!');
      } else {
        showNotification('error', result.message);
      }
    } catch (error) {
      showNotification('error', error.message || 'An unexpected error occurred');
    }
  };

  const toggleAuthMode = () => {
    setIsLoginMode(!isLoginMode);
    // Reset form fields when switching modes
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">{isLoginMode ? 'Login' : 'Sign Up'}</h4>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleAuthSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              
              {!isLoginMode && (
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="btn btn-primary w-100">
                {isLoginMode ? 'Login' : 'Sign Up'}
              </button>
            </form>
            
            <div className="text-center mt-3">
              <p className="mb-0">
                {isLoginMode ? "Don't have an account? " : "Already have an account? "} 
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  toggleAuthMode();
                }}>
                  {isLoginMode ? 'Sign Up' : 'Login'}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {notification.show && (
        <div
          className={`alert fixed-top end-0 mt-3 me-3 ${notification.type === 'success' ? 'alert-success' : 'alert-danger'}`}
          role="alert"
          style={{ width: '300px', zIndex: '1050' }}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default AuthModal;
