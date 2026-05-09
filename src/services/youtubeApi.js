import axios from 'axios';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Helper to handle API requests
const makeRequest = async (endpoint, accessToken, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await axios({
      url,
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error with YouTube API (${endpoint}):`, error);
    throw error.response?.data?.error || error;
  }
};

/**
 * Searches for a video by title.
 * @param {string} query - The search query (song name)
 * @param {string} accessToken - OAuth access token
 * @returns {Promise<string|null>} - Returns the video ID or null if not found
 */
export const searchVideo = async (query, accessToken) => {
  // If it's already a YouTube URL, extract the ID
  const urlRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = query.match(urlRegex);
  if (match && match[1]) {
    return match[1]; // Return the extracted video ID
  }

  // Otherwise, search for the video
  const data = await makeRequest('/search', accessToken, {
    method: 'GET',
    params: {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: 1,
    },
  });

  if (data.items && data.items.length > 0) {
    return data.items[0].id.videoId;
  }
  
  return null;
};

/**
 * Creates a new playlist.
 * @param {string} title - Title of the new playlist
 * @param {string} accessToken - OAuth access token
 * @returns {Promise<string>} - Returns the created playlist ID
 */
export const createPlaylist = async (title, accessToken) => {
  const data = await makeRequest('/playlists', accessToken, {
    method: 'POST',
    params: {
      part: 'snippet,status',
    },
    data: {
      snippet: {
        title: title || 'My Awesome Playlist',
        description: 'Created by YouTube Playlist Creator Web App',
      },
      status: {
        privacyStatus: 'private', // Make it private by default for safety
      },
    },
  });

  return data.id;
};

/**
 * Adds a video to a playlist.
 * @param {string} playlistId - ID of the playlist
 * @param {string} videoId - ID of the video to add
 * @param {string} accessToken - OAuth access token
 * @returns {Promise<object>} - Returns the API response
 */
export const addVideoToPlaylist = async (playlistId, videoId, accessToken) => {
  return await makeRequest('/playlistItems', accessToken, {
    method: 'POST',
    params: {
      part: 'snippet',
    },
    data: {
      snippet: {
        playlistId: playlistId,
        resourceId: {
          kind: 'youtube#video',
          videoId: videoId,
        },
      },
    },
  });
};
