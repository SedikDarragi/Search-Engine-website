import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import ResultsList from './components/ResultsList';
import UserIcon from './components/UserIcon';
import Settings from './components/Settings';
import HistoryManagement from './components/HistoryManagement';
import './App.css';

function App() {
  const [user, setUser] = useState('guest');
  const [appSettings, setAppSettings] = useState({
    darkMode: false,
    resultsPerPage: 10,
    safeSearch: true,
    saveHistory: true,
    defaultSearchType: 'web'
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSearchType, setActiveSearchType] = useState(appSettings.defaultSearchType);

  // Load settings on app start
  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = JSON.parse(localStorage.getItem('searchSettings')) || {};
      setAppSettings(prev => ({
        ...prev,
        ...savedSettings
      }));
      setActiveSearchType(savedSettings.defaultSearchType || 'web');
      applyDarkMode(savedSettings.darkMode || false);
    };
    loadSettings();
  }, []);

  // Apply dark mode
  const applyDarkMode = (enabled) => {
    document.documentElement.classList.toggle('dark-mode', enabled);
  };

  // Handle search
  const handleSearch = async (query, page = 1, type = null) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setCurrentQuery(query);
    setCurrentPage(page);
    setShowSuggestions(false);
    
    try {
      const searchType = type || 
                       (user === 'guest' ? activeSearchType : appSettings.defaultSearchType);
      
      const response = await fetch(
        `http://localhost:3000/api/search?q=${encodeURIComponent(query)}&type=${searchType}&page=${page}`,
        {
          headers: {
            'x-user': user !== 'guest' ? user.username : undefined
          }
        }
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setResults(data.items);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle settings changes
  const handleSettingsChange = (newSettings) => {
    setAppSettings(newSettings);
    setActiveSearchType(newSettings.defaultSearchType);
    applyDarkMode(newSettings.darkMode);
    localStorage.setItem('searchSettings', JSON.stringify(newSettings));
    
    // If we have a current query, re-search with new settings
    if (currentQuery) {
      handleSearch(currentQuery, 1);
    }
  };

  // Handle search type change attempts
  const handleSearchTypeChange = (type) => {
    if (user === 'guest') {
      setActiveSearchType(type);
      if (currentQuery) {
        handleSearch(currentQuery, 1, type);
      }
      return true;
    } else if (type !== appSettings.defaultSearchType) {
      alert(`Please change the search type in settings to access ${type} search`);
      return false;
    }
    return true;
  };

  return (
    <Router>
      <div className={`app-container ${appSettings.darkMode ? 'dark' : ''}`}>
        <nav className="app-navbar">
          <div className="navbar-content">
            <UserIcon 
              user={user} 
              onLogin={setUser} 
              onLogout={() => setUser('guest')} 
            />
          </div>
        </nav>

        <Routes>
          <Route path="/" element={
            <>
              <div className={`search-container ${results ? 'has-results' : ''}`}>
                <SearchBar 
                  onSearch={handleSearch}
                  searchType={user === 'guest' ? activeSearchType : appSettings.defaultSearchType}
                  setSearchType={handleSearchTypeChange}
                  isGuest={user === 'guest'}
                  loading={loading}
                  suggestions={suggestions}
                  showSuggestions={showSuggestions}
                  setShowSuggestions={setShowSuggestions}
                  currentQuery={currentQuery}
                  onInputChange={(query) => {
                    setCurrentQuery(query);
                  }}
                />
              </div>
              
              {results && (
                <div className="results-area">
                  {error && <div className="error">{error}</div>}
                  <ResultsList 
                    results={results} 
                    type={user === 'guest' ? activeSearchType : appSettings.defaultSearchType} 
                    loading={loading}
                  />
                </div>
              )}
            </>
          }/>
          
          <Route path="/settings" element={
            <Settings 
              user={user}
              settings={appSettings}
              onSettingsChange={handleSettingsChange}
            />
          }/>

          <Route path="/history" element={
            <HistoryManagement user={user} />
          }/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;