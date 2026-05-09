import { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { FaYoutube, FaKey, FaChevronDown, FaChevronUp, FaDownload, FaList } from 'react-icons/fa';
import PlaylistCreator from './components/PlaylistCreator';
import YouTubeAuth from './components/YouTubeAuth';
import Downloader from './components/Downloader';

function App() {
  const [activeTab, setActiveTab] = useState('creator'); // 'creator' or 'downloader'
  const [clientId, setClientId] = useState('');
  const [isClientIdSet, setIsClientIdSet] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const handleSetClientId = (e) => {
    e.preventDefault();
    if (clientId.trim()) {
      setIsClientIdSet(true);
    }
  };

  const handleResetClientId = () => {
    setIsClientIdSet(false);
    setAccessToken(null);
  };

  return (
    <div className="app-container">
      <header className="header" style={{ marginBottom: '1rem' }}>
        <h1><FaYoutube /> YT Master Tools</h1>
        <p>Automate your YouTube music experience & download videos</p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn ${activeTab === 'creator' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('creator')}
          style={{ background: activeTab === 'creator' ? 'var(--text-ink)' : 'transparent', color: activeTab === 'creator' ? 'var(--bg-paper)' : 'var(--text-ink)' }}
        >
          <FaList /> AI Playlist Creator
        </button>
        <button 
          className={`btn ${activeTab === 'downloader' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('downloader')}
          style={{ background: activeTab === 'downloader' ? 'var(--text-ink)' : 'transparent', color: activeTab === 'downloader' ? 'var(--bg-paper)' : 'var(--text-ink)' }}
        >
          <FaDownload /> YouTube Downloader
        </button>
      </div>

      {activeTab === 'downloader' ? (
        <Downloader />
      ) : (
        <>
          {!isClientIdSet ? (
            <div className="drawn-panel">
              <form onSubmit={handleSetClientId}>
                <div className="form-group">
                  <label htmlFor="clientId">Google OAuth Client ID</label>
                  <input
                    type="text"
                    id="clientId"
                    className="form-control"
                    placeholder="Paste your Client ID here..."
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={!clientId.trim()}>
                  <FaKey /> Set Client ID
                </button>
              </form>

              <div className="setup-guide" style={{ marginTop: '3rem' }}>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => setShowSetupGuide(!showSetupGuide)}
                  style={{ width: '100%', justifyContent: 'space-between' }}
                >
                  <span>How do I get a Client ID?</span>
                  {showSetupGuide ? <FaChevronUp /> : <FaChevronDown />}
                </button>

                {showSetupGuide && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <p style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>
                      Because this app interacts with your personal YouTube account, you need to provide your own <strong>Google Cloud Client ID</strong>. This ensures your quota and privacy are protected.
                    </p>
                    <ol>
                      <li>Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--text-ink)', fontWeight: 'bold' }}>Google Cloud Console</a> and create a new project.</li>
                      <li>In the left menu, go to <strong>APIs & Services &gt; Library</strong>. Search for <strong>YouTube Data API v3</strong> and enable it.</li>
                      <li>Go to <strong>APIs & Services &gt; OAuth consent screen</strong>. Choose <strong>External</strong>. Fill in an App name and your email. Click Save.</li>
                      <li>In the Consent Screen setup, under <strong>Test users</strong>, make sure to add the Google email address you plan to log in with!</li>
                      <li>Go to <strong>APIs & Services &gt; Credentials</strong>. Click <strong>+ Create Credentials &gt; OAuth client ID</strong>.</li>
                      <li>Select <strong>Web application</strong>. Under <strong>Authorized JavaScript origins</strong>, add this exact URL: <code>https://aiyoutubeplaylistcreator.vercel.app</code></li>
                      <li>Click Create. Copy the <strong>Client ID</strong> (the long string ending in <code>.apps.googleusercontent.com</code>) and paste it in the box above!</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <GoogleOAuthProvider clientId={clientId}>
              <div className="drawn-panel auth-container">
                {!accessToken ? (
                  <>
                    <h2 style={{ fontFamily: "'Permanent Marker', cursive", fontSize: '2.5rem', marginBottom: '1rem' }}>Connect Your Account</h2>
                    <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>We need your permission to create playlists on your behalf.</p>
                    <YouTubeAuth setAccessToken={setAccessToken} />
                    <button 
                      onClick={handleResetClientId} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginTop: '2rem', textDecoration: 'underline', fontFamily: "'Caveat', cursive", fontSize: '1.4rem' }}
                    >
                      Change Client ID
                    </button>
                  </>
                ) : (
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                      <div className="status-message status-success" style={{ margin: 0, padding: '0.5rem 1rem' }}>
                        ✓ Authenticated
                      </div>
                      <button 
                        onClick={() => setAccessToken(null)}
                        className="btn"
                        style={{ padding: '0.5rem 1rem', fontSize: '1.2rem' }}
                      >
                        Disconnect
                      </button>
                    </div>
                    <PlaylistCreator accessToken={accessToken} />
                  </div>
                )}
              </div>
            </GoogleOAuthProvider>
          )}
        </>
      )}
    </div>
  );
}

export default App;
