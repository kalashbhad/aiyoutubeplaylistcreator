import express from 'express';
import cors from 'cors';
import youtubeDl from 'youtube-dl-exec';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid'; // we need uuid for temp files

const app = express();
app.use(cors());

// Ensure downloads directory exists
const downloadsDir = path.join(process.cwd(), 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

app.get('/api/info', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL required' });
    
    console.log(`Fetching info for: ${url}`);
    
    // Use flatPlaylist to fetch playlist info super fast
    const info = await youtubeDl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      callHome: false,
      noCheckCertificate: true,
      flatPlaylist: true, // extremely important for playlists!
      playlistEnd: 100
    });
    
    res.json(info);
  } catch (error) {
    console.error('Error fetching info:', error);
    res.status(500).json({ error: 'Failed to fetch info' });
  }
});

app.get('/api/download', async (req, res) => {
  const { url, format, quality, title } = req.query;
  if (!url) return res.status(400).send('URL required');
  
  console.log(`Downloading: ${url} - Format: ${format} - Quality: ${quality}`);
  
  const isAudio = format === 'mp3';
  const isAudioOnly = format === 'audio'; // alias
  const extension = isAudio ? 'mp3' : 'mp4';
  const safeTitle = (title || 'download').replace(/[^\w\s-]/gi, '').trim();
  const tempFileName = `${uuidv4()}.${extension}`;
  const tempFilePath = path.join(downloadsDir, tempFileName);

  // Determine format string
  let formatString = 'best';
  if (isAudio) {
    formatString = 'bestaudio';
  } else if (quality) {
    // example: "1080", "720", "4k" (2160)
    let height = quality === '4k' ? 2160 : parseInt(quality);
    if (height) {
      // yt-dlp syntax for "best video up to height + best audio, fallback to best up to height"
      formatString = `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${height}][ext=mp4]/best`;
    }
  }

  try {
    const options = {
      format: formatString,
      output: tempFilePath,
      noWarnings: true,
      callHome: false,
      noCheckCertificate: true,
    };

    if (isAudio) {
      options.extractAudio = true;
      options.audioFormat = 'mp3';
    } else {
      options.mergeOutputFormat = 'mp4';
    }

    // Execute download to disk
    await youtubeDl(url, options);

    // Send the file to the user
    res.download(tempFilePath, `${safeTitle}.${extension}`, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Delete the temp file after sending
      fs.unlink(tempFilePath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
      });
    });

  } catch (error) {
    console.error('yt-dlp error:', error);
    if (!res.headersSent) {
      res.status(500).send('Download failed');
    }
    // Attempt cleanup if it failed midway
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Downloader server running on port ${PORT}`);
});
