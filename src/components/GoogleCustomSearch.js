import React, { useEffect, useRef, useState } from 'react';
import './GoogleCustomSearch.css';

const GoogleCustomSearch = ({ searchTerm, triggerSearch }) => {
  const searchRef = useRef(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchKey, setSearchKey] = useState(0); // Unique key to force re-render

  useEffect(() => {
    const loadGoogleSearchScript = () => {
      const script = document.createElement('script');
      script.src = "https://cse.google.com/cse.js?cx=20bba4a0e3d2142c6";
      script.async = true;
      script.onload = () => {
        setIsScriptLoaded(true);
      };
      document.head.appendChild(script);
    };

    if (!window.google || !window.google.search) {
      loadGoogleSearchScript();
    } else {
      setIsScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isScriptLoaded) {
      window.google.search.cse.element.render({
        div: `gcse-searchresults-only0-${searchKey}`, // unique ID for each render
        tag: 'searchresults-only',
        gname: `gcse-searchresults-only0-${searchKey}`, // unique name for each render
      });
    }
  }, [isScriptLoaded, searchKey]); // rerender search element on key change

  useEffect(() => {
    if (isScriptLoaded && searchTerm && triggerSearch) {
      if (window.google && window.google.search) {
        const element = window.google.search.cse.element.getElement(`gcse-searchresults-only0-${searchKey}`);
        if (element) {
          element.execute(searchTerm);
          setIsPanelOpen(true);
        } else {
          console.error('Google Custom Search element not found');
        }
      }
      setSearchKey((prevKey) => prevKey + 1); // Increment key to re-render search div
    }
  }, [isScriptLoaded, searchTerm, triggerSearch]);

  const closePanel = () => {
    setIsPanelOpen(false);
  };

  return (
    <div>
      <div className={`sliding-panel ${isPanelOpen ? 'open' : ''}`}>
        <div className="sliding-panel-content">
          <button onClick={closePanel} className="close-btn">&times;</button>
          <div id={`gcse-searchresults-only0-${searchKey}`} ref={searchRef}></div>
        </div>
      </div>
    </div>
  );
};

export default GoogleCustomSearch;
