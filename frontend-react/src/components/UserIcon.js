import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import SignupModal from './SignupModal';
import { ReactComponent as SettingsIcon } from '../icons/settings.svg';
import { ReactComponent as LogoutIcon } from '../icons/logout.svg';

const UserIcon = ({ user, onLogin, onLogout }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-icon-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="user-icon-container">
      <div 
        className="user-icon" 
        onClick={() => {
          if (user === 'guest') {
            setShowAuthModal(true);
          } else {
            setShowDropdown(!showDropdown);
          }
        }}
      >
        {user === 'guest' ? (
          <svg className="guest-icon" viewBox="0 0 24 24" fill="#757575">
            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" />
            <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" />
          </svg>
        ) : (
          <div className="user-avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {showDropdown && user !== 'guest' && (
        <div className="user-dropdown">
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            <span className="username">@{user.username}</span>
          </div>
          <div className="dropdown-divider"></div>
          
          <button 
            className="dropdown-btn"
            onClick={() => {
              navigate('/settings');
              setShowDropdown(false);
            }}
          >
            <SettingsIcon className="icon" />
            <span>Settings</span>
          </button>
          
          <button 
            className="dropdown-btn logout"
            onClick={() => {
              onLogout();
              setShowDropdown(false);
            }}
          >
            <LogoutIcon className="icon" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={(userData) => {
            onLogin(userData);
            setShowAuthModal(false);
          }}
          onSwitchToSignup={() => {
            setShowAuthModal(false);
            setShowSignupModal(true);
          }}
        />
      )}

      {showSignupModal && (
        <SignupModal
          onClose={() => setShowSignupModal(false)}
          onSignup={(userData) => {
            onLogin(userData);
            setShowSignupModal(false);
          }}
        />
      )}
    </div>
  );
};

export default UserIcon;