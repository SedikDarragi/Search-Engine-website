import '../App.css';

const ResultsList = ({ results, type, loading }) => {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Searching...</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="no-results">
        <div className="search-icon">🔍</div>
        <p>Enter a search query to begin</p>
      </div>
    );
  }

  const renderWebResults = () => (
    <div className="web-results-container">
      {results.google?.length > 0 && (
        <div className="result-section">
          <h3 className="result-section-title">
            <span className="google-logo">G</span>
            <span className="google-logo red">o</span>
            <span className="google-logo yellow">o</span>
            <span className="google-logo blue">g</span>
            <span className="google-logo green">l</span>
            <span className="google-logo red">e</span> Results
          </h3>
          {results.google.map((item, index) => (
            <div key={`google-${index}`} className="result-item google-result">
              <h3 className="result-title">{item.title}</h3>
              <a href={item.link} className="result-link" target="_blank" rel="noopener noreferrer">
                {item.link}
              </a>
              {item.snippet && <p className="result-snippet">{item.snippet}</p>}
            </div>
          ))}
        </div>
      )}
      
      {results.mongo?.length > 0 && (
        <div className="result-section">
          <h3 className="result-section-title">
            <span className="mongo-logo">MongoDB</span> Results
          </h3>
          {results.mongo.map((item, index) => (
            <div key={`mongo-${index}`} className="result-item mongo-result">
              <h3 className="result-title">{item.title}</h3>
              <a href={item.url || `#${item._id}`} className="result-link" target="_blank" rel="noopener noreferrer">
                {item.url || `Local Item #${item._id}`}
              </a>
              {item.description && <p className="result-snippet">{item.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderImageResults = () => {
    const allImages = [
      ...(results.google || []).map(item => ({ 
        ...item, 
        source: 'google',
        sourceTag: (
          <span className="source-tag google-tag">
            GOOGLE
          </span>
        )
      })),
      ...(results.mongo || []).map(item => ({ 
        ...item, 
        source: 'mongo',
        sourceTag: (
          <span className="source-tag mongo-tag">
            MONGO
          </span>
        )
      }))
    ].filter(i => i.image);

    if (allImages.length === 0) {
      return (
        <div className="no-results">
          <div className="image-icon">🖼️</div>
          <p>No images found. Try a different search.</p>
        </div>
      );
    }

    return (
      <div className="image-results-grid">
        {allImages.map((item, index) => (
          <div key={`img-${index}`} className="image-card">
            <a href={item.link || item.url} target="_blank" rel="noopener noreferrer">
              <div className="image-wrapper">
                <img 
                  src={item.image?.thumbnailLink?.replace(/=s\d+-c/, '=w500-h300') || item.image} 
                  alt={item.title} 
                  loading="lazy"
                  className="result-image"
                />
              </div>
              <div className="image-details">
                <div className="image-title">{item.title}</div>
                <div className="image-source">
                  <span className="source-domain">
                    {item.link ? new URL(item.link).hostname : 'Local Database'}
                  </span>
                  {item.sourceTag}
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="results-wrapper">
      {type === 'images' ? renderImageResults() : renderWebResults()}
    </div>
  );
};

export default ResultsList;