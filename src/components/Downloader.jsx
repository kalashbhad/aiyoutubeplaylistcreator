import React, { useState } from 'react';
import { FaDownload, FaSpinner, FaMusic, FaVideo, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';

const Downloader = () => {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('mp4'); // mp4 or mp3
  const [quality, setQuality] = useState('1080'); // 144, 360, 720, 1080, 4k
  const [status, setStatus] = useState('idle'); // idle, fetching, downloading, error, success
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleDownload = async () => {
    if (!url) {
      setMessage('Please enter a YouTube URL.');
      setStatus('error');
      return;
    }

    setStatus('fetching');
    setMessage('Fetching info...');

    try {
      const response = await axios.get(`http://localhost:3001/api/info?url=${encodeURIComponent(url)}`);
      const info = response.data;

      const entries = info.entries || [info];
      const total = entries.length;
      
      setProgress({ current: 0, total });
      setStatus('downloading');

      if (total > 1) {
        setMessage(`Playlist detected! Triggering ${total} downloads... Please click "Allow" if your browser asks for multiple downloads permission.`);
      } else {
        setMessage(`Downloading ${info.title || 'video'}... This might take a moment to process high quality video.`);
      }

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const entryUrl = entry.url || url; // flatPlaylist returns 'url' for entries
        const title = entry.title || `video-${i+1}`;
        
        const downloadUrl = `http://localhost:3001/api/download?url=${encodeURIComponent(entryUrl)}&format=${format}&quality=${quality}&title=${encodeURIComponent(title)}`;
        
        triggerDownload(downloadUrl);
        
        setProgress(prev => ({ ...prev, current: i + 1 }));
        
        if (i < entries.length - 1) {
          await new Promise(r => setTimeout(r, 2000)); // 2 second delay between downloads to prevent strict browser blocks
        }
      }

      setStatus('success');
      setMessage(total > 1 ? `Successfully triggered ${total} downloads!` : 'Download complete!');
      setTimeout(() => setStatus('idle'), 8000);

    } catch (error) {
      console.error('Download error:', error);
      setStatus('error');
      setMessage('Failed to process the URL. Make sure it is a valid YouTube link.');
    }
  };

  const triggerDownload = (url) => {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="drawn-panel" style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Permanent Marker', cursive", fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Media Downloader
        </h2>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: '1.5rem', color: 'var(--text-muted)' }}>
          Grab any YouTube video or playlist with one click.
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="yt-url" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Video or Playlist URL</label>
        <input
          id="yt-url"
          type="text"
          className="form-control"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (status === 'error') setStatus('idle');
          }}
          disabled={status === 'fetching' || status === 'downloading'}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Format</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className={`btn ${format === 'mp4' ? 'btn-primary' : ''}`}
              style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem', background: format === 'mp4' ? 'var(--text-ink)' : 'transparent', color: format === 'mp4' ? 'var(--bg-paper)' : 'inherit' }}
              onClick={() => setFormat('mp4')}
              disabled={status === 'fetching' || status === 'downloading'}
            >
              <FaVideo /> MP4
            </button>
            <button 
              className={`btn ${format === 'mp3' ? 'btn-primary' : ''}`}
              style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem', background: format === 'mp3' ? 'var(--text-ink)' : 'transparent', color: format === 'mp3' ? 'var(--bg-paper)' : 'inherit' }}
              onClick={() => setFormat('mp3')}
              disabled={status === 'fetching' || status === 'downloading'}
            >
              <FaMusic /> MP3
            </button>
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: format === 'mp3' ? 'var(--text-muted)' : 'inherit' }}>
            Video Quality
          </label>
          <select 
            className="form-control" 
            value={quality} 
            onChange={(e) => setQuality(e.target.value)}
            disabled={format === 'mp3' || status === 'fetching' || status === 'downloading'}
            style={{ opacity: format === 'mp3' ? 0.5 : 1 }}
          >
            <option value="144">144p (Smallest)</option>
            <option value="240">240p</option>
            <option value="360">360p</option>
            <option value="480">480p</option>
            <option value="720">720p (HD)</option>
            <option value="1080">1080p (Full HD)</option>
            <option value="4k">4K (Ultra HD)</option>
          </select>
        </div>
      </div>

      <button 
        className="btn btn-primary" 
        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem', padding: '1.25rem', marginTop: '1rem' }}
        onClick={handleDownload}
        disabled={status === 'fetching' || status === 'downloading' || !url.trim()}
      >
        {status === 'fetching' ? (
          <><FaSpinner className="spin" /> Fetching details...</>
        ) : status === 'downloading' ? (
          <><FaSpinner className="spin" /> Processing ({progress.current}/{progress.total})</>
        ) : (
          <><FaDownload /> Download Now</>
        )}
      </button>

      {status !== 'idle' && status !== 'fetching' && status !== 'downloading' && (
        <div className={`status-message ${status === 'success' ? 'status-success' : 'status-error'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
          {status === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
          {message}
        </div>
      )}
      
      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Downloader;
