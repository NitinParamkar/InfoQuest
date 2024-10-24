import React, { useEffect, useRef, useState } from 'react';
import './GoogleCustomSearch.css';

const GoogleCustomSearch = ({ searchTerm, triggerSearch }) => {
  const searchRef = useRef(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchKey, setSearchKey] = useState(0); 
  const [isLoading, setIsLoading] = useState(true); 
  const prevSearchTermRef = useRef('');
  const prevTriggerSearchRef = useRef(false);

 
  useEffect(() => {
    const loadGoogleSearchScript = () => {
      const script = document.createElement('script');
      script.src = "https://cse.google.com/cse.js?cx=20bba4a0e3d2142c6";
      script.async = true;
      script.onload = () => {
        if (window.google && window.google.search) {
          setIsScriptLoaded(true);
          setIsLoading(false); 
        }
      };
      document.head.appendChild(script);
    };

   
    const checkGoogleSearchReady = () => {
      const interval = setInterval(() => {
        if (window.google && window.google.search) {
          setIsScriptLoaded(true);
          setIsLoading(false); 
          clearInterval(interval); 
        }
      }, 500);
    };

    if (!window.google || !window.google.search) {
      loadGoogleSearchScript();
      checkGoogleSearchReady(); 
    } else {
      setIsScriptLoaded(true);
      setIsLoading(false); 
    }
  }, []);


  useEffect(() => {
    if (isScriptLoaded) {
      window.google.search.cse.element.render({
        div: `gcse-searchresults-only0-${searchKey}`,
        tag: 'searchresults-only',
        gname: `gcse-searchresults-only0-${searchKey}`, 
      });
    }
  }, [isScriptLoaded, searchKey]);


  useEffect(() => {
    const executeSearch = () => {
      if (isScriptLoaded && searchTerm && triggerSearch) {
        const element = window.google.search.cse.element.getElement(`gcse-searchresults-only0-${searchKey}`);
        if (element) {
          element.execute(searchTerm); 
          setIsPanelOpen(true); 
          setSearchKey((prevKey) => prevKey + 1);
        } else {
          console.error('Google Custom Search element not found');
        }
      }
    };

    if (searchTerm !== prevSearchTermRef.current || triggerSearch !== prevTriggerSearchRef.current) {
      executeSearch();
      prevSearchTermRef.current = searchTerm;
      prevTriggerSearchRef.current = triggerSearch;
    }
  }, [isScriptLoaded, searchTerm, triggerSearch, searchKey]);

  const closePanel = () => {
    setIsPanelOpen(false);
  };

  return (
    <div>
      {isLoading && <div>Please wait while the search engine is loading...</div>}

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