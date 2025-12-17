# Deployment Guide

## GitHub Pages Deployment

### 1. Build Production Bundle

```bash
npm run build
```

This creates a `/dist` folder with optimized assets.

### 2. Vite Configuration

The `vite.config.js` is already configured for GitHub Pages:

```javascript
export default defineConfig({
    base: './',  // Relative paths for GitHub Pages
    build: {
        outDir: 'dist',
        emptyOutDir: true
    }
});
```

### 3. Deploy to GitHub Pages

**Option A: Manual Upload**
1. Run `npm run build`
2. Upload contents of `/dist` folder to repo's `gh-pages` branch

**Option B: GitHub Actions (Recommended)**
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 4. Enable GitHub Pages

1. Go to repo Settings → Pages
2. Source: Deploy from branch
3. Branch: `gh-pages` / `root`

## Dev vs Production

| Feature | Dev | Production |
|---------|-----|------------|
| Dev tools | ✅ Visible | ❌ Hidden |
| Console logs | ✅ Active | ❌ Stripped |
| Source maps | ✅ Full | ❌ None |
| Build size | Large | Optimized |

**Vite handles this automatically based on `npm run dev` vs `npm run build`.**

## Testing Production Build Locally

```bash
npm run build
npm run preview
```

Opens production build at `http://localhost:4173`

## Repository

**GitHub:** https://github.com/tonicsouls/LMS_01218_A

## Last Updated
2025-12-17T16:17:00
