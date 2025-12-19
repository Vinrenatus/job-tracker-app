const Modal = ({ show, onClose, isLoginMode, onToggleMode, onSubmit }) => {
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ username, email, password });
    // Reset form after submission
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="modal" style={{ display: 'block' }} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close-modal" onClick={onClose}>&times;</span>
        <h2 id="modalTitle">{isLoginMode ? 'Login' : 'Sign Up'}</h2>
        <form id="authForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="text" 
              id="username" 
              className="form-control" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          {!isLoginMode && (
            <div className="form-group">
              <input 
                type="email" 
                id="email" 
                className="form-control" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          )}
          <div className="form-group">
            <input 
              type="password" 
              id="password" 
              className="form-control" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn-primary" id="authSubmitBtn">
            {isLoginMode ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <div className="auth-toggle">
          <span id="toggleText">{isLoginMode ? "Don't have an account? " : "Already have an account? "}</span>
          <a id="toggleLink" onClick={onToggleMode}>{isLoginMode ? 'Sign up' : 'Login'}</a>
        </div>
      </div>
    </div>
  );
};

export default Modal;
