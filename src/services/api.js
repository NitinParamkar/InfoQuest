// src/services/api.js
import axios from 'axios';

const MEDIASTACK_API_KEY = process.env.REACT_APP_MEDIASTACK_API_KEY;
const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;

// Fetch YouTube videos
export const fetchYouTubeVideos = async (searchTerm, pageToken = '') => {
  try {
    const searchResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/search',
      {
        params: {
          q: searchTerm,
          part: 'snippet',
          maxResults: 10,
          pageToken,
          type: 'video',
          key: YOUTUBE_API_KEY,
        },
      }
    );

    const videoIds = searchResponse.data.items.map(item => item.id.videoId).join(',');

    const videoDetailsResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          id: videoIds,
          part: 'statistics',
          key: YOUTUBE_API_KEY,
        },
      }
    );

    const videosWithStats = searchResponse.data.items.map((item, index) => {
      const stats = videoDetailsResponse.data.items[index].statistics;
      const views = parseInt(stats.viewCount, 10) || 0;
      const likes = parseInt(stats.likeCount, 10) || 0;

      return {
        type: 'youtube',
        title: item.snippet.title,
        link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnail: item.snippet.thumbnails.high.url,
        views,
        likes,
      };
    });

    return {
      videos: videosWithStats,
      nextPageToken: searchResponse.data.nextPageToken,
    };

  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    throw error;
  }
};

// Fetch articles and blogs from Mediastack API
export const fetchArticlesAndBlogs = async (searchTerm, offset = 0) => {
  try {
    // Make API call to Mediastack
    const response = await axios.get('http://api.mediastack.com/v1/news', {
      params: {
        access_key: MEDIASTACK_API_KEY, 
        keywords: searchTerm,
        languages: 'en',
        offset, 
        limit: 10, 
      },
    });

    
    console.log(response.data);

    
    if (response.data && response.data.data) {
      const articles = response.data.data.map(article => ({
        type: 'article',
        title: article.title,
        description: article.description,
        link: article.url,
        source: article.source,
        image: article.image || null, 
        published_at: article.published_at,
      }));

      return {
        articles,
        total: response.data.pagination.total, 
      };
    } else {
     
      console.warn('No articles found for the search term:', searchTerm);
      return {
        articles: [],
        total: 0,
      };
    }
  } catch (error) {
    
    console.error('Error fetching articles and blogs:', error.message);
    throw error; 
  }
};

// Fetch academic papers (Placeholder)
export const fetchAcademicPapers = async (searchTerm, start = 0, maxResults = 10) => {
  try {
    const response = await axios.get('http://export.arxiv.org/api/query', {
      params: {
        search_query: `ti:${searchTerm} OR abs:${searchTerm}`, 
        start,
        max_results: maxResults,
        sortBy: 'relevance', 
        sortOrder: 'descending'
      }
    });

    // Parse the XML response
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data, "text/xml");

    const entries = xmlDoc.getElementsByTagName('entry');
    const articles = Array.from(entries).map(entry => ({
      type: 'academic',
      title: entry.getElementsByTagName('title')[0].textContent,
      authors: Array.from(entry.getElementsByTagName('author')).map(author => author.getElementsByTagName('name')[0].textContent),
      summary: entry.getElementsByTagName('summary')[0].textContent,
      link: entry.getElementsByTagName('id')[0].textContent,
      published: entry.getElementsByTagName('published')[0].textContent,
    }));

    const totalResults = xmlDoc.getElementsByTagName('opensearch:totalResults')[0].textContent;

    return {
      articles,
      total: parseInt(totalResults, 10)
    };
  } catch (error) {
    console.error('Error fetching academic papers:', error);
    throw error;
  }
};


//fetching results from google search without API key
export const fetchGoogleResults = async (searchTerm, start = 1) => {
  try {
    console.log('Fetching Google results for:', searchTerm);
    const response = await axios.get('https://cse.google.com/cse?', {
      params: {
        cx: GOOGLE_SEARCH_ENGINE_ID, 
        q: searchTerm,
        start: start,
        num: 10, 
        sort: 'relevance', 
        safe: 'active', 
      },
    });

    console.log('Google API response:', response.data);
    console.log('Number of items returned:', response.data.items ? response.data.items.length : 0);

    if (!response.data.items || response.data.items.length === 0) {
      console.warn('No items in Google API response');
      return { results: [], total: 0 };
    }

    const results = response.data.items.map(item => ({
      type: 'google',
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      image: item.pagemap?.cse_image?.[0]?.src || null,
    }));

    console.log('Processed Google results:', results);

    return {
      results,
      total: parseInt(response.data.searchInformation.totalResults, 10),
    };
  } catch (error) {
    console.error('Error fetching Google search results:', error);
    throw error;
  }
};