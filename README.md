# 🎵 Audio Player - Offline Music Library

A modern, offline-capable music player built with **SvelteKit 5** as a **SPA/PWA**. Store and play your music library entirely in your browser with support for offline playback.

## ✨ Features

- **📱 Progressive Web App (PWA)** - Install on any device and use offline
- **🗄️ Smart Storage** - Uses OPFS (Origin Private File System) with IndexedDB fallback
- **🎨 Minimalist UI** - Clean, responsive design with smooth animations
- **📁 Flexible Import** - Load single files, multiple files, or entire folders
- **🎵 Metadata Support** - Extracts and displays title, artist, album, duration, and album art
- **🎛️ Full Playback Controls** - Play/pause, next/prev, seek, volume control
- **♿ Accessibility** - Respects `prefers-reduced-motion` and includes ARIA labels
- **📦 Offline-First** - All your music is stored locally

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, pnpm, or yarn

### Installation

```sh
# Clone the repository
git clone https://github.com/Erickgiber/audio-player.git
cd audio-player

# Install dependencies
npm install
```

### Development

Start the development server:

```sh
npm run dev

# Or open in browser automatically
npm run dev -- --open
```

The app will be available at `http://localhost:5173`

### Building for Production

Create an optimized production build:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

## 🌐 Deploying to Vercel

This project is configured for easy deployment to Vercel:

1. **Push to GitHub** (already done if you're in the repo)

2. **Import to Vercel**:
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect SvelteKit configuration

3. **Deploy**:
   - Click "Deploy"
   - Your app will be live in seconds!

### Manual Deployment

Alternatively, deploy from the command line:

```sh
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

## 📖 Usage

### Adding Music

1. **Single File**: Click "Add Files" and select one or more audio files
2. **Multiple Files**: Select multiple files using Ctrl/Cmd+Click
3. **Folder**: Click "Add Folder" to import an entire directory
4. **Drag & Drop**: Drag audio files or folders directly onto the upload area

### Supported Formats

- MP3
- WAV
- OGG
- M4A
- FLAC
- AAC
- Any format supported by your browser

### Playback Controls

- **Play/Pause**: Click the center play button
- **Next/Previous**: Use the skip buttons
- **Seek**: Click or drag the progress bar
- **Volume**: Click the volume icon and adjust the slider

### Managing Your Library

- **Play a Track**: Click any track in the library
- **Delete a Track**: Click the delete (trash) icon on a track
- **Storage Info**: The app uses persistent storage when available

## 🏗️ Architecture

### Tech Stack

- **Framework**: SvelteKit 5 (Svelte 5 runes API)
- **Build**: Vite
- **Adapter**: @sveltejs/adapter-static (SPA mode)
- **PWA**: @vite-pwa/sveltekit
- **Storage**: OPFS + IndexedDB (idb-keyval)
- **Metadata**: music-metadata
- **TypeScript**: Full type safety

### Project Structure

```
audio-player/
├── src/
│   ├── lib/
│   │   ├── components/      # Svelte components
│   │   │   ├── Player.svelte      # Audio player UI
│   │   │   ├── Library.svelte     # Track list
│   │   │   └── FileUploader.svelte # File import
│   │   ├── storage.ts       # Storage abstraction (OPFS/IDB)
│   │   ├── metadata.ts      # Audio metadata extraction
│   │   ├── stores.ts        # Svelte stores (library, player)
│   │   └── types.ts         # TypeScript types
│   ├── routes/
│   │   ├── +layout.svelte   # App layout
│   │   ├── +layout.ts       # SPA config (ssr=false)
│   │   └── +page.svelte     # Main page
│   └── app.css              # Global styles
├── static/                  # Static assets (icons, manifest)
├── svelte.config.js         # SvelteKit config
├── vite.config.ts           # Vite + PWA config
└── package.json
```

### Storage Strategy

The app uses a tiered storage approach:

1. **OPFS (Preferred)**: Origin Private File System for optimal performance
2. **IndexedDB (Fallback)**: Used when OPFS is not available
3. **Persistent Storage**: Automatically requests `navigator.storage.persist()`

Audio files and cover art are stored separately from metadata for optimal memory usage.

### PWA Configuration

- **Service Worker**: Auto-generated with Workbox
- **Manifest**: Configured for standalone app experience
- **Caching**: Only caches app assets (not user audio files)
- **Offline**: Full offline functionality after first visit

## 🛠️ Development

### Type Checking

```sh
npm run check
```

### Watch Mode

```sh
npm run check:watch
```

### Building

```sh
npm run build
```

## 🔒 Security

- All audio files are stored in browser's origin-private storage
- No data is sent to external servers
- IndexedDB is scoped to the current origin
- Metadata extraction happens client-side

## 📱 Browser Support

- Chrome/Edge 86+
- Firefox 90+
- Safari 14+
- Opera 72+

**Note**: OPFS requires Chrome/Edge 102+ or Safari 15.2+. Other browsers will use IndexedDB.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Built with [SvelteKit](https://kit.svelte.dev/)
- PWA support by [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- Metadata parsing by [music-metadata](https://github.com/Borewit/music-metadata)
- Storage utilities by [idb-keyval](https://github.com/jakearchibald/idb-keyval)

---

Made with ♪ using SvelteKit 5
