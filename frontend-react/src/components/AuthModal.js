import { useState } from 'react';
import '../App.css';

const AuthModal = ({ onClose, onLogin, onSwitchToSignup }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please fill all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (data.success) {
        onLogin(data.user);
        onClose();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="close-modal" onClick={onClose}>×</button>
        <h3>Login</h3>
        
        {error && <div className="auth-error">{error}</div>}
        
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <button onClick={handleLogin}>Login</button>
        <div className="auth-switch">
          Don't have an account? <span onClick={onSwitchToSignup}>Sign up</span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;