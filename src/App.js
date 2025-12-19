// Main App Component
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/layouts/Header';
import Sidebar from './components/ui/Sidebar';
import Dashboard from './components/pages/Dashboard';
import Applications from './components/pages/Applications';
import TargetCompanies from './components/pages/TargetCompanies';
import InterviewPrep from './components/pages/InterviewPrep';
import JobAnalysis from './components/pages/JobAnalysis';
import EmailTracking from './components/pages/EmailTracking';
import Networking from './components/pages/Networking';
import AuthModal from './components/ui/modals/AuthModal';
import Notification from './components/ui/Notification';


// App.js - Main application component using modular structure
const AppContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const { isAuthenticated, loading, login, signup, logout } = useAuth();

  // Check if user is new or returning to show landing page
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (!hasVisited) {
      setShowAuthModal(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);

  // Notification handling functions
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  // Error handling function to be used across the app
  const handleApiError = (error, customMessage = 'An error occurred while processing your request') => {
    console.error(customMessage, error);
    showNotification('error', customMessage);
  };

  // Handle authentication form submission - This function isn't used anymore
  // as AuthModal now receives login/signup functions as props

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      {/* Sidebar Navigation */}
      {isAuthenticated && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAuthenticated={isAuthenticated}
          logout={logout}
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-grow-1 ${isAuthenticated ? 'mt-4' : ''}`}>
        {!isAuthenticated && (
          <div className="text-center py-5">
            <h2>Welcome to Job Search Tracker</h2>
            <p className="lead">Please login or sign up to access your job applications</p>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setShowAuthModal(true)}
            >
              <i className="fas fa-sign-in-alt"></i> Login or Sign Up
            </button>
          </div>
        )}

        {isAuthenticated && (
          <>
            {activeTab === 'dashboard' && <Dashboard isAuthenticated={isAuthenticated} handleApiError={handleApiError} />}
            {activeTab === 'applications' && <Applications isAuthenticated={isAuthenticated} handleApiError={handleApiError} />}
            {activeTab === 'targetCompanies' && <TargetCompanies handleApiError={handleApiError} />}
            {activeTab === 'interviewPrep' && <InterviewPrep handleApiError={handleApiError} />}
            {activeTab === 'analysis' && <JobAnalysis isAuthenticated={isAuthenticated} handleApiError={handleApiError} />}
            {activeTab === 'emailTracking' && <EmailTracking handleApiError={handleApiError} />}
            {activeTab === 'networking' && <Networking handleApiError={handleApiError} />}
          </>
        )}
      </div>

      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        isLoginMode={isLoginMode}
        setIsLoginMode={setIsLoginMode}
        login={login}
        signup={signup}
      />

      <Notification show={notification.show} type={notification.type} message={notification.message} />
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;