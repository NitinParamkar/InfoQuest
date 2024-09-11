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
    const lines = text.split('\n');
    if (lines.length > maxLines) {
      return lines.slice(0, maxLines).join('\n') + '...';
    }
    return text;
  };

  // Helper function to calculate the score for YouTube results
  const calculateScore = (views, likes) => {
    return 0.5 * views + 0.5 * likes;
  };

  // Sort results by the calculated score for YouTube results
  const sortedResults = results.slice().sort((a, b) => {
    if (a.type === 'youtube' && b.type === 'youtube') {
      const scoreA = calculateScore(a.views, a.likes);
      const scoreB = calculateScore(b.views, b.likes);
      return scoreB - scoreA; // Sort in descending order of score
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
      case 'academic':
        const content = result.type === 'article' ? result.description : result.summary;
        const truncatedContent = truncateText(content, 15);
        return (
          <div key={index} className="result-item article" onClick={() => handleCardClick(result)}>
            {result.image && <img src={result.image} alt={result.title} className="thumbnail" />}
            <h3 className="title">{result.title}</h3>
            {result.authors && result.authors.length > 0 && (
              <p className="authors"><strong>Authors: </strong>{result.authors.join(', ')}</p>
            )}
            <p className="content">{truncatedContent}</p>
            {result.type === 'article' && (
              <>
                <p className="source"><strong>Source:</strong> {result.source}</p>
                <p className="published"><strong>Published:</strong> {new Date(result.published_at).toLocaleString()}</p>
              </>
            )}
            {result.type === 'academic' && (
              <p className="published"><strong>Published:</strong> {new Date(result.published).toLocaleString()}</p>
            )}
          </div>
        );
      case 'google':
        return (
          <div key={index} className="result-item google" onClick={() => handleCardClick(result)}>
            {result.image && <img src={result.image} alt={result.title} className="thumbnail" />}
            <h3 className="title">{result.title}</h3>
            <p className="snippet">{result.snippet}</p>
            <a href={result.link} target="_blank" rel="noopener noreferrer">Visit website</a>
          </div>
        );
      default:
        return null;
    }
  };

  if (searchType === 'googleCustom') {
    return <GoogleCustomSearch searchTerm={searchTerm} />;
  }

  return (
    <div className="results-list">
      {sortedResults.length === 0 ? (
        <p >
        No results found
       </p>      
      ) : (
        sortedResults.map((result, index) => renderResultItem(result, index))
      )}
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

const getVideoId = (url) => {
  const urlParams = new URLSearchParams(new URL(url).search);
  return urlParams.get('v');
};

export default ResultsList;
