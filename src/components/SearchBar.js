import React, { useState } from 'react';
import './SearchBar.css'

const SearchBar = ({ onSearch, onTypeChange }) => {
  const [term, setTerm] = useState('');
  const [searchType, setSearchType] = useState('youtube');

  const handleSearch = () => {
    onSearch(term);
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setSearchType(type);
    onTypeChange(type);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <select value={searchType} onChange={handleTypeChange}>
        <option value="youtube">YouTube Search</option>
        <option value="articles">Articles & Blogs</option>
        <option value="academic">Academic Papers</option>
        <option value="googleCustom">Google Search</option>
        <option value="mixsearch">Mix Search</option>
      </select>
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default SearchBar;