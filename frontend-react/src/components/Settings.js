import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ToggleSwitch from './ToggleSwitch';
import { ReactComponent as AppearanceIcon } from '../icons/appearance.svg';
import { ReactComponent as SearchIcon } from '../icons/search.svg';
import { ReactComponent as PrivacyIcon } from '../icons/privacy.svg';
import { ReactComponent as BackIcon } from '../icons/back.svg';
import './Settings.css';


const Settings = ({ user, settings, onSettingsChange }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const navigate = useNavigate();

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const updateSetting = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    navigate(-1);
  };

  const handleReset = () => {
    setLocalSettings(settings);
  };

  return (
    <div className="settings-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        <BackIcon />
      </button>

      <div className="settings-header">
        <h1>Settings</h1>
        <p className="settings-subtitle">Customize your search experience</p>
      </div>

      <div className="settings-group">
        <h2><AppearanceIcon /> Appearance</h2>
        <div className="setting-item">
          <div className="setting-label">
            <span>Dark Mode</span>
            <span>Switch between light and dark theme</span>
          </div>
          <div className="setting-control">
            <ToggleSwitch
              checked={localSettings.darkMode}
              onChange={(checked) => updateSetting('darkMode', checked)}
            />
          </div>
        </div>
      </div>

      <div className="settings-group">
        <h2><SearchIcon /> Search Preferences</h2>
        <div className="setting-item">
          <div className="setting-label">
            <span>Default Search Type</span>
            <span>Choose your preferred search mode</span>
          </div>
          <div className="setting-control">
            <select
              className="setting-select"
              value={localSettings.defaultSearchType}
              onChange={(e) => updateSetting('defaultSearchType', e.target.value)}
            >
              <option value="web">Web</option>
              <option value="images">Images</option>
            </select>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <span>Results Per Page</span>
            <span>Number of results displayed per search</span>
          </div>
          <div className="setting-control">
            <select
              className="setting-select"
              value={localSettings.resultsPerPage}
              onChange={(e) => updateSetting('resultsPerPage', parseInt(e.target.value))}
            >
              <option value={10}>10 results</option>
              <option value={25}>25 results</option>
              <option value={50}>50 results</option>
            </select>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <span>SafeSearch</span>
            <span>Filter explicit content from results</span>
          </div>
          <div className="setting-control">
            <ToggleSwitch
              checked={localSettings.safeSearch}
              onChange={(checked) => updateSetting('safeSearch', checked)}
            />
          </div>
        </div>
      </div>

      <div className="settings-group">
        <h2><PrivacyIcon /> Privacy</h2>
        <div className="setting-item">
          <div className="setting-label">
            <span>Search History</span>
            <span>Save your recent search queries</span>
          </div>
          <div className="setting-control">
            <ToggleSwitch
              checked={localSettings.saveHistory}
              onChange={(checked) => updateSetting('saveHistory', checked)}
            />
          </div>
        </div>

        {user !== 'guest' && (
          <>
            <div className="setting-item">
              <div className="setting-label">
                <span>Manage Search History</span>
                <span>View and manage your saved search history</span>
              </div>
              <div className="setting-control">
                <button 
                  className="btn btn-secondary"
                  onClick={() => navigate('/history')}
                >
                  Manage History
                </button>
              </div>
            </div>

            {localSettings.saveHistory && (
              <div className="setting-item">
                <div className="setting-label">
                  <span>Clear History</span>
                  <span>Permanently delete all your search history</span>
                </div>
                <div className="setting-control">
                  <button 
                    className="danger-button"
                    onClick={() => navigate('/history')}
                  >
                    Clear Now
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="settings-actions">
        <button 
          className="btn btn-secondary"
          onClick={handleReset}
        >
          Reset Changes
        </button>
        <button 
          className="btn btn-primary"
          onClick={handleSave}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;