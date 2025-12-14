# HyLove Demo Site v2.2

HyLove 腦波分析系統 - 提供多種腦波資料分析功能的網頁應用程式。

**Demo Site**: https://hylove-demo.good-nas.cc
**Credentials**: admin / lovehy2025

## Features

### Core Features
- **Multi-User Support**: Create and manage multiple user profiles
- **File Management**: Upload and organize brainwave data files (CSV format)
- **File Groups**: Group related files for easier analysis workflow
- **Analysis History**: Track all analysis results with filtering and search

### Analysis Plugins
- **元神音** (Yuanshenyin): Brainwave music encoding and playback
- **雙人腦波音樂** (Dual Music): Dual-person brainwave music generation
- **亨運來** (Hengyunlai): H.R. evaluation system
- **貞天賦** (Zhentianfu): Potential assessment system
- **利養炁** (Liyangqi): Mindfulness practice analysis
- **珍寶炁** (Zhenbaoqi): Crystal testing system
- **情香意** (Qingxiangyi): Fragrance testing system
- **易** (Yi): Emotion management and ORE testing

### Report Features
- Detailed analysis reports with charts and visualizations
- **Print/PDF Export**: Print reports or save as PDF files
- Auto-save to history for future reference

## Tech Stack

- React 19 with TypeScript
- React Router v7
- DaisyUI / TailwindCSS (custom earth-tone theme)
- Highcharts for data visualization
- OpenSheetMusicDisplay for music scores
- Playwright for E2E testing

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
```

## Deployment

### Docker Build (Multi-platform)

```bash
# Create a builder (for Apple Silicon)
docker buildx create --use --name mybuilder

# Login to Docker Hub
docker login

# Build and push image
docker buildx build --platform linux/amd64,linux/arm64 \
  -t p988744/hylove-demo:2.2 \
  -t p988744/hylove-demo:latest . --push
```

### Run with Docker Compose

```bash
# Prepare nginx basic auth file (optional)
htpasswd -c ./nginx/.htpasswd admin
export HTPASSWD_PATH=$(pwd)/nginx/.htpasswd

# Run with docker-compose
docker compose -f docker-compose-prod.yml up -d
```

### GitHub Pages Deployment

```bash
npm run deploy
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_ANALYSIS_API_BASE` | Backend API base URL | `http://localhost:3000` |

### Cloudflare Tunnel Setup

Navigate to: `Network` > `Tunnels` > `Settings` > `Public Hostname`

## Project Structure

```
src/
├── analysis/           # Plugin system
│   ├── registry.ts     # Plugin registry
│   └── plugins/        # Individual analysis plugins
├── components/         # Reusable UI components
├── config/             # Analysis methods and renderers
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── pages/              # Page components
└── services/           # API services
e2e/
├── fixtures/           # Test data and utilities
├── helpers/            # Shared test helpers
└── *.spec.ts           # Test specifications
```

## License

Private - All rights reserved.
