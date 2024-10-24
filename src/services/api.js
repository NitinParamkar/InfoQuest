
import axios from 'axios';

const MEDIASTACK_API_KEY = process.env.REACT_APP_MEDIASTACK_API_KEY;
const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;


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


export const fetchArticlesAndBlogs = async (searchTerm, offset = 0) => {
  try {
  
    const response = await axios.get('https://api.mediastack.com/v1/news', {
      params: {
        access_key: MEDIASTACK_API_KEY, 
        keywords: searchTerm,
        languages: 'en',
        offset, 
        limit: 12, 
        sort: 'published_desc',
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

      const sortedArticles = sortArticlesByRelevance(articles, searchTerm);

      return {
        articles: sortedArticles,
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
    console.error('Error fetching articles and blogs:', error);
    console.error('Error details:', error.response ? error.response.data : 'No response data');
    throw error;
  }
};

function sortArticlesByRelevance(articles, searchTerm) {
  const searchTerms = searchTerm.toLowerCase().split(' ');
  
  return articles.sort((a, b) => {
    const scoreA = calculateRelevanceScore(a, searchTerms);
    const scoreB = calculateRelevanceScore(b, searchTerms);
    return scoreB - scoreA;
  });
}


function calculateRelevanceScore(article, searchTerms) {
  let score = 0;
  const title = article.title.toLowerCase();
  const description = article.description.toLowerCase();

  searchTerms.forEach(term => {
    if (title.includes(term)) score += 2;
    if (description.includes(term)) score += 1;
  });

  return score;
}


export const fetchAcademicPapers = async (searchTerm, start = 0, maxResults = 10) => {
  try {
    const response = await axios.get('https://export.arxiv.org/api/query', {
      params: {
        search_query: `ti:${searchTerm} OR abs:${searchTerm}`, 
        start,
        max_results: maxResults,
        sortBy: 'relevance', 
        sortOrder: 'descending'
      }
    });


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
    console.error('Error details:', error.response ? error.response.data : 'No response data');
    throw error;
  }
};


