import { useState } from 'react';
import { FaList, FaPlay, FaSpinner, FaCheckCircle, FaExclamationCircle, FaLink, FaSearch } from 'react-icons/fa';
import { searchVideo, createPlaylist, addVideoToPlaylist } from '../services/youtubeApi';

function PlaylistCreator({ accessToken }) {
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [songsInput, setSongsInput] = useState('');
  const [inputMode, setInputMode] = useState('links'); // 'links' or 'search'
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [finalPlaylistId, setFinalPlaylistId] = useState(null);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), message, type }]);
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!songsInput.trim()) return;

    setIsLoading(true);
    setLogs([]);
    setFinalPlaylistId(null);

    try {
      // 1. Create Playlist
      addLog('Creating playlist...', 'info');
      const title = playlistTitle.trim() || `My Playlist - ${new Date().toLocaleDateString()}`;
      const playlistId = await createPlaylist(title, accessToken);
      addLog(`Created playlist: ${title} (${playlistId})`, 'success');

      // 2. Parse Songs
      // Split by newline or comma
      const rawSongs = songsInput.split(/\r?\n|,/).map(s => s.trim()).filter(s => s.length > 0);
      addLog(`Found ${rawSongs.length} items to process.`, 'info');

      let successCount = 0;

      // 3. Process Each Song
      for (const [index, query] of rawSongs.entries()) {
        try {
          addLog(`[${index + 1}/${rawSongs.length}] Processing: ${query.substring(0, 30)}${query.length > 30 ? '...' : ''}`, 'info');
          
          let videoId = null;
          
          if (inputMode === 'links') {
            // In links mode, strictly extract from URL
            const urlRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
            const match = query.match(urlRegex);
            if (match && match[1]) {
              videoId = match[1];
            } else {
              throw new Error("Invalid YouTube URL. Please make sure it's a direct link.");
            }
          } else {
            // In search mode, use the API search
            videoId = await searchVideo(query, accessToken);
          }
          
          if (videoId) {
            addLog(`Found video ID: ${videoId}. Adding to playlist...`, 'info');
            await addVideoToPlaylist(playlistId, videoId, accessToken);
            addLog(`Successfully added!`, 'success');
            successCount++;
          } else {
            addLog(`Could not find video for: ${query}`, 'error');
          }
        } catch (itemErr) {
          addLog(`Failed: ${itemErr.message || 'Unknown error'}`, 'error');
        }
      }

      addLog(`Finished! Successfully added ${successCount} out of ${rawSongs.length} items.`, 'success');
      setFinalPlaylistId(playlistId);

    } catch (error) {
      addLog(`Fatal Error: ${error.message || 'Something went wrong.'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'left', width: '100%' }}>
      <div className="input-mode-container">
        <button
          type="button"
          onClick={() => setInputMode('links')}
          style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: '8px',
            border: 'none',
            background: inputMode === 'links' ? 'var(--primary-color)' : 'transparent',
            color: inputMode === 'links' ? 'white' : 'var(--text-muted)',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <FaLink /> Paste Direct Links
        </button>
        <button
          type="button"
          onClick={() => setInputMode('search')}
          style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: '8px',
            border: 'none',
            background: inputMode === 'search' ? 'var(--primary-color)' : 'transparent',
            color: inputMode === 'search' ? 'white' : 'var(--text-muted)',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <FaSearch /> Search Song Names
        </button>
      </div>

      {inputMode === 'links' && (
        <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#86efac', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <strong>💡 Pro Tip:</strong> Using direct YouTube links saves <strong>66% of your daily API quota</strong> because it completely bypasses the search step!
        </div>
      )}

      {inputMode === 'search' && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <strong>⚠️ Warning:</strong> Searching for song names consumes 150 quota units per song. Your daily limit is 10,000 units.
        </div>
      )}

      <form onSubmit={handleCreatePlaylist}>
        <div className="form-group">
          <label htmlFor="playlistTitle">Playlist Title (Optional)</label>
          <input
            type="text"
            id="playlistTitle"
            className="form-control"
            placeholder="E.g., Summer Vibes 2026"
            value={playlistTitle}
            onChange={(e) => setPlaylistTitle(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="songs">{inputMode === 'links' ? 'YouTube URLs (One per line)' : 'Song Names (One per line)'}</label>
          <textarea
            id="songs"
            className="form-control"
            placeholder={inputMode === 'links' ? "https://www.youtube.com/watch?v=...\nhttps://youtu.be/..." : "Bohemian Rhapsody\nHotel California"}
            value={songsInput}
            onChange={(e) => setSongsInput(e.target.value)}
            disabled={isLoading}
            required
            style={{ minHeight: '150px' }}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={isLoading || !songsInput.trim()} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
          {isLoading ? (
            <><div className="loading-spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} /> Processing...</>
          ) : (
            <><FaPlay /> Create Playlist</>
          )}
        </button>
      </form>

      {logs.length > 0 && (
        <div className="logs-container">
          <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <FaList /> Processing Logs
          </div>
          {logs.map((log) => (
            <div key={log.id} className="log-item" style={{ 
              color: log.type === 'error' ? '#fca5a5' : log.type === 'success' ? '#86efac' : '#cbd5e1',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-start'
            }}>
              <span style={{ marginTop: '2px' }}>
                {log.type === 'error' ? <FaExclamationCircle /> : log.type === 'success' ? <FaCheckCircle /> : '•'}
              </span>
              <span>{log.message}</span>
            </div>
          ))}
        </div>
      )}

      {finalPlaylistId && (
        <div className="status-message status-success" style={{ marginTop: '1.5rem', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <strong style={{ fontSize: '1.2rem', display: 'block', marginBottom: '0.5rem' }}>🎉 Playlist Ready!</strong>
            <a 
              href={`https://www.youtube.com/playlist?list=${finalPlaylistId}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ display: 'inline-block', textDecoration: 'none', marginTop: '0.5rem' }}
            >
              Open in YouTube
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlaylistCreator;
