import React, { useState, useEffect, useRef } from 'react';
import '../App.css';

const SearchBar = ({ 
  onSearch, 
  searchType, 
  setSearchType, 
  isGuest,
  loading,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  onInputChange,
  currentQuery
}) => {
  const [query, setQuery] = useState(currentQuery);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    setQuery(currentQuery);
  }, [currentQuery]);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query, 1);
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onInputChange(value);
    setShowSuggestions(true);
  };

  const selectSuggestion = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion, 1);
  };

  const handleTabClick = (type) => {
    if (isGuest) {
      // For guests, change type and search immediately
      const changeAllowed = setSearchType(type);
      if (changeAllowed && query.trim()) {
        onSearch(query, 1, type);
      }
    } else if (type === searchType) {
      // For logged-in users, refresh if clicking active tab
      if (query.trim()) {
        onSearch(query, 1);
      }
    } else {
      // For logged-in users trying to switch types
      setSearchType(type);
    }
  };

  return (
    <div className="search-wrapper" ref={suggestionsRef}>
      <h1>IMSET Search</h1>
      <div className="search-box">
        <input
          type="text"
          id="searchInput"
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search..."
          disabled={loading}
          autoComplete="off"
        />
        <button 
          id="searchBtn" 
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        
        {showSuggestions && suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li 
                key={index}
                onClick={() => selectSuggestion(suggestion)}
                className="suggestion-item"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="category-tabs">
        <button 
          className={`tab ${searchType === 'web' ? 'active' : ''}`}
          onClick={() => handleTabClick('web')}
          disabled={loading}
        >
          Web
        </button>
        <button
          className={`tab ${searchType === 'images' ? 'active' : ''}`}
          onClick={() => handleTabClick('images')}
          disabled={loading}
        >
          Images
        </button>
      </div>
    </div>
  );
};

export default SearchBar;