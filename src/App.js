import React, { useState, useCallback } from 'react';
import './App.css';
import { fetchYouTubeVideos, fetchArticlesAndBlogs, fetchAcademicPapers } from './services/api';
import SearchBar from './components/SearchBar';
import ResultsList from './components/ResultsList';
import GoogleCustomSearch from './components/GoogleCustomSearch';

function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState('youtube');
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [triggerGoogleSearch, setTriggerGoogleSearch] = useState(false);
  const [nextPageToken, setNextPageToken] = useState('');
  const [offset, setOffset] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const handleSearch = useCallback(async (searchTerm) => {
    console.log('Handling search for:', searchTerm, 'Type:', searchType);
    setLoading(true);
    setError(null);
    setResults([]);
    setCurrentSearchTerm(searchTerm);
    setNextPageToken('');
    setOffset(0);
    setTotalResults(0);

    if (searchType === 'googleCustom') {
      console.log('Triggering Google Custom Search');
      setTriggerGoogleSearch(prev => !prev);
      setLoading(false);
      return;
    }

    try {
      let response;
      if (searchType === 'mixsearch') {
        console.log('Fetching mixed search results...');
        let youtubeResults = [];
        let articlesResults = [];
        let academicResults = [];

        try {
          const youtubeResponse = await fetchYouTubeVideos(searchTerm);
          youtubeResults = youtubeResponse.videos;
          console.log('YouTube results:', youtubeResults);
        } catch (error) {
          console.error('Error fetching YouTube results:', error);
        }

        try {
          const articlesResponse = await fetchArticlesAndBlogs(searchTerm);
          articlesResults = articlesResponse.articles;
          console.log('Articles results:', articlesResults);
        } catch (error) {
          console.error('Error fetching Articles results:', error);
        }

        try {
          const academicResponse = await fetchAcademicPapers(searchTerm);
          academicResults = academicResponse.articles;
          console.log('Academic results:', academicResults);
        } catch (error) {
          console.error('Error fetching Academic results:', error);
        }

        const mixedResults = [
          ...youtubeResults,
          ...articlesResults,
          ...academicResults
        ];
        
        console.log('Combined mixed results:', mixedResults);
        setResults(mixedResults);
        setTotalResults(mixedResults.length);
      } else {
        switch (searchType) {
          case 'youtube':
            response = await fetchYouTubeVideos(searchTerm);
            setResults(response.videos);
            setNextPageToken(response.nextPageToken);
            break;
          case 'articles':
            response = await fetchArticlesAndBlogs(searchTerm);
            setResults(response.articles);
            setTotalResults(response.total);
            break;
          case 'academic':
            response = await fetchAcademicPapers(searchTerm);
            setResults(response.articles);
            setTotalResults(response.total);
            break;
          default:
            break;
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
      setError(error.message || 'An unknown error occurred while fetching results. Please try again.');
    }
    setLoading(false);
  }, [searchType]);

  const handleLoadMore = async () => {
    if (loading || searchType === 'mixsearch') return;
    setLoading(true);

    try {
      let response;
      switch (searchType) {
        case 'youtube':
          response = await fetchYouTubeVideos(currentSearchTerm, nextPageToken);
          setResults(prev => [...prev, ...response.videos]);
          setNextPageToken(response.nextPageToken);
          break;
        case 'articles':
          response = await fetchArticlesAndBlogs(currentSearchTerm, offset + 10);
          setResults(prev => [...prev, ...response.articles]);
          setOffset(prev => prev + 10);
          break;
        case 'academic':
          response = await fetchAcademicPapers(currentSearchTerm, offset + 10);
          setResults(prev => [...prev, ...response.articles]);
          setOffset(prev => prev + 10);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Load more failed:', error);
      setError('Failed to load more results. Please try again.');
    }
    setLoading(false);
  };

  const showLoadMoreButton = () => {
    if (searchType === 'googleCustom' || searchType === 'mixsearch') return false;
    if (searchType === 'youtube') return !!nextPageToken;
    return results.length < totalResults;
  };

  return (
    <div className="App">
      <h1>Search App</h1>
      <SearchBar onSearch={handleSearch} onTypeChange={setSearchType} />
      {loading && <p className="loading">Loading...</p>}
      {error && (
        <div className="error">
          <p>Error: {error}</p>
          <p>Please try again or contact support if the problem persists.</p>
        </div>
      )}
      {searchType === 'googleCustom' ? (
        <GoogleCustomSearch searchTerm={currentSearchTerm} triggerSearch={triggerGoogleSearch} />
      ) : (
        <ResultsList
          results={results}
          searchType={searchType}
          searchTerm={currentSearchTerm}
        />
      )}
      {showLoadMoreButton() && (
        <button className="load-more" onClick={handleLoadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}

export default App;