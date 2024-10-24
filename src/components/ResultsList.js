import React, { useState } from 'react';
import './ResultsList.css';
import GoogleCustomSearch from './GoogleCustomSearch';

const ResultsList = ({ results, searchType, searchTerm }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const handleCardClick = (result) => {
    if (result.type === 'youtube') {
      setSelectedVideo(result);
    } else if (result.link) {
      window.open(result.link, '_blank');
    }
  };

  const closeModal = () => {
    setSelectedVideo(null);
  };

  const truncateText = (text, maxLines) => {
    if (!text) return '';
    const lines = text.split('\n');
    if (lines.length > maxLines) {
      return lines.slice(0, maxLines).join('\n') + '...';
    }
    return text;
  };

  const calculateScore = (views, likes) => {
    return 0.5 * views + 0.5 * likes;
  };

  const sortedResults = results.slice().sort((a, b) => {
    if (a.type === 'youtube' && b.type === 'youtube') {
      const scoreA = calculateScore(a.views, a.likes);
      const scoreB = calculateScore(b.views, b.likes);
      return scoreB - scoreA; 
    }
    return 0; 
  });

  const renderResultItem = (result, index) => {
    switch (result.type) {
      case 'youtube':
        return (
          <div key={index} className="result-item youtube" onClick={() => handleCardClick(result)}>
            {result.thumbnail && <img src={result.thumbnail} alt={result.title} className="thumbnail" />}
            <h3 className="title">{result.title}</h3>
            <p className="views">Views: {result.views}</p>
            <p className="likes">Likes: {result.likes}</p>
          </div>
        );
      case 'article':
        return (
          <div key={index} className="result-item article" onClick={() => handleCardClick(result)}>
            {result.image && <img src={result.image} alt={result.title} className="thumbnail" />}
            <h3 className="title">{result.title}</h3>
            <p className="content">{truncateText(result.description, 3)}</p>
            <p className="source"><strong>Source:</strong> {result.source}</p>
            <p className="published"><strong>Published:</strong> {new Date(result.published_at).toLocaleString()}</p>
          </div>
        );
      case 'academic':
        return (
          <div key={index} className="result-item academic" onClick={() => handleCardClick(result)}>
            <h3 className="title">{result.title}</h3>
            {result.authors && result.authors.length > 0 && (
              <p className="authors"><strong>Authors: </strong>{result.authors.join(', ')}</p>
            )}
            <p className="content">{truncateText(result.summary, 3)}</p>
            <p className="published"><strong>Published:</strong> {new Date(result.published).toLocaleString()}</p>
          </div>
        );
      default:
        return null;
    }
  };

 
  const getVideoId = (url) => {
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('v');
  };

  if (searchType === 'googleCustom') {
    return <GoogleCustomSearch searchTerm={searchTerm} />;
  }

  return (
    <div className="results-list">
      {
        sortedResults.map((result, index) => renderResultItem(result, index))
      }
      {selectedVideo && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${getVideoId(selectedVideo.link)}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsList;