# 📝 YouTube Playlist Creator (Hand-Drawn Edition)

A web application that automates the creation of YouTube playlists directly from your browser. Featuring a unique, pencil-sketched aesthetic!

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff.svg?logo=vite)

## ✨ Features

- **Pencil & Paper Aesthetic**: A carefully crafted, CSS-only hand-drawn UI style that feels like a sketchbook.
- **Save API Quota**: Built-in "Direct Links Mode" lets you paste YouTube URLs instead of searching, saving 66% of your daily Google API quota!
- **Bring Your Own Keys**: Designed to be hosted publicly (e.g., on Vercel or Netlify) without compromising your developer keys. Users input their own Client ID to safely use the app on their own account.
- **Live Logs**: Watch the progress in real-time as the app finds and adds your songs to the new playlist.

## 🚀 Live Demo & Hosting

You can easily host this project on Vercel, Netlify, or GitHub Pages. Because the app requires users to provide their own OAuth Client ID, you don't need to worry about other people draining your YouTube API quota!

## ⚙️ How to Use (For End Users)

Since this app interacts with your personal YouTube account to create playlists, you need to provide a Google Cloud Client ID.

**How to get your Client ID (Takes 2 minutes):**
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a **New Project**.
3. Go to **APIs & Services > Library**, search for **YouTube Data API v3**, and click **Enable**.
4. Go to **OAuth consent screen**. Choose **External**, fill in the required names/emails, and hit Save. Make sure to add your Google email under the **Test users** section!
5. Go to **Credentials > + Create Credentials > OAuth client ID**.
6. Select **Web application**. Under **Authorized JavaScript origins**, add the URL where the app is hosted (e.g., `http://localhost:5173` for local dev).
7. Copy the generated **Client ID** and paste it into the app!

## 💻 Local Development

To run this project locally on your machine:

```bash
# Clone the repository
git clone https://github.com/yourusername/yt-playlist-creator.git
cd yt-playlist-creator

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open your browser to `http://localhost:5173`.

## 🛠️ Built With

* [React](https://reactjs.org/) - UI Library
* [Vite](https://vitejs.dev/) - Build Tool
* [@react-oauth/google](https://github.com/MomenSherif/react-oauth) - Google Authentication
* [Axios](https://axios-http.com/) - HTTP Client

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
