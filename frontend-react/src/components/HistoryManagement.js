import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as BackIcon } from '../icons/back.svg';
import { ReactComponent as TrashIcon } from '../icons/trash.svg';
import { ReactComponent as ClockIcon } from '../icons/clock.svg';
import '../css/HistoryManagement.css';

const HistoryManagement = ({ user }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (!user || user === 'guest') {
          navigate('/');
          return;
        }

        setLoading(true);
        setError(null);
        
        console.log('Fetching history for user:', user.username); // Debug log
        
        const response = await fetch('http://localhost:3000/api/history', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-user': user.username
          },
          credentials: 'include'
        });

        console.log('Response status:', response.status); // Debug log

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText); // Debug log
          throw new Error(errorText || 'Failed to fetch history');
        }

        const data = await response.json();
        console.log('History data received:', data); // Debug log
        setHistory(data.history || []);
      } catch (err) {
        console.error('Fetch history error:', err);
        setError(err.message || 'Failed to load search history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, navigate]);

  const deleteItem = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/history/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user': user.username
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete item');
      }

      setHistory(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete history item');
    }
  };

  const clearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all your search history? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/history', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user': user.username
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clear history');
      }

      setHistory([]);
    } catch (err) {
      console.error('Clear history error:', err);
      setError(err.message || 'Failed to clear history');
    }
  };

  const filteredHistory = history.filter(item =>
    item.query.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your search history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3 className="error-title">Error Loading History</h3>
        <p className="error-message">
          {error.startsWith('<!DOCTYPE html>') 
            ? 'Failed to connect to server. Please check your connection.' 
            : error}
        </p>
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="history-management">
      <button className="back-button" onClick={() => navigate(-1)}>
        <BackIcon />
        <span>Back</span>
      </button>

      <div className="history-header">
        <h1>
          <ClockIcon className="history-icon" />
          Search History
        </h1>
        <p className="history-subtitle">View and manage your past searches</p>
      </div>

      <div className="history-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search your history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="history-search"
          />
        </div>
        <button
          className="clear-all-button"
          onClick={clearAll}
          disabled={history.length === 0}
        >
          <TrashIcon />
          Clear All History
        </button>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="empty-state">
          {searchTerm ? (
            <>
              <p>No matching searches found</p>
              <button
                className="clear-search-button"
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <p>Your search history is empty</p>
              <p className="subtext">Searches you perform will appear here</p>
            </>
          )}
        </div>
      ) : (
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Search Query</th>
                <th>Type</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item) => (
                <tr key={item._id}>
                  <td className="query-cell">{item.query}</td>
                  <td className="type-cell">
                    <span className={`type-badge ${item.type}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="date-cell">{formatDate(item.timestamp)}</td>
                  <td className="actions-cell">
                    <button
                      className="delete-button"
                      onClick={() => deleteItem(item._id)}
                      title="Delete this search"
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoryManagement;