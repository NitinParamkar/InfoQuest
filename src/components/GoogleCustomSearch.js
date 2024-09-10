import React, { useEffect, useRef, useState } from 'react';
import './GoogleCustomSearch.css';

const GoogleCustomSearch = ({ searchTerm, triggerSearch }) => {
  const searchRef = useRef(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchKey, setSearchKey] = useState(0); // Unique key to force re-render
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // Load Google Custom Search script
  useEffect(() => {
    const loadGoogleSearchScript = () => {
      const script = document.createElement('script');
      script.src = "https://cse.google.com/cse.js?cx=20bba4a0e3d2142c6";
      script.async = true;
      script.onload = () => {
        if (window.google && window.google.search) {
          setIsScriptLoaded(true);
          setIsLoading(false); // Set loading to false when script is loaded
        }
      };
      document.head.appendChild(script);
    };

    // Fallback: Check every 500ms if google.search is ready
    const checkGoogleSearchReady = () => {
      const interval = setInterval(() => {
        if (window.google && window.google.search) {
          setIsScriptLoaded(true);
          setIsLoading(false); // Stop loading state
          clearInterval(interval); // Stop checking once script is loaded
        }
      }, 500); // Check every 500ms
    };

    if (!window.google || !window.google.search) {
      loadGoogleSearchScript();
      checkGoogleSearchReady(); // Fallback in case onload event fails
    } else {
      setIsScriptLoaded(true);
      setIsLoading(false); // If script is already loaded, stop loading
    }
  }, []);

  // Initialize the search element after script is loaded
  useEffect(() => {
    if (isScriptLoaded) {
      window.google.search.cse.element.render({
        div: `gcse-searchresults-only0-${searchKey}`, // Unique ID for each render
        tag: 'searchresults-only',
        gname: `gcse-searchresults-only0-${searchKey}`, // Unique name for each render
      });
    }
  }, [isScriptLoaded, searchKey]); // Re-render search element on key change

  // Trigger search execution when searchTerm or triggerSearch changes
  useEffect(() => {
    if (isScriptLoaded && searchTerm && triggerSearch) {
      const element = window.google.search.cse.element.getElement(`gcse-searchresults-only0-${searchKey}`);
      if (element) {
        element.execute(searchTerm); // Execute the search term
        setIsPanelOpen(true); // Open sliding panel
      } else {
        console.error('Google Custom Search element not found');
      }
      setSearchKey((prevKey) => prevKey + 1); // Increment key to force re-render of search div
    }
  }, [isScriptLoaded, searchTerm, triggerSearch]);

  const closePanel = () => {
    setIsPanelOpen(false);
  };

  return (
    <div>
      {/* Loading message while the script is loading */}
      {isLoading && <div>Please wait while the search engine is loading...</div>}

      {/* Render search results panel */}
      {!isLoading && (
        <div className={`sliding-panel ${isPanelOpen ? 'open' : ''}`}>
          <div className="sliding-panel-content">
            <button onClick={closePanel} className="close-btn">&times;</button>
            <div id={`gcse-searchresults-only0-${searchKey}`} ref={searchRef}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleCustomSearch;
