# Deployment Guide

This guide covers various deployment options for the Elevation of Privilege card game.

---

## 🐳 Docker Deployment

### Quick Start

```bash
# Build the image locally
docker build -t eop-game .

# Run the container
docker run -d -p 8080:80 --name eop eop-game

# Access at http://localhost:8080
```

### Using GitHub Container Registry

The repository includes automated Docker builds (`docker-build.yml`) that publish to GitHub Container Registry (ghcr.io).

**Pull and run:**
```bash
# Pull the latest image
docker pull ghcr.io/<username>/eop:latest

# Run it
docker run -d -p 8080:80 ghcr.io/<username>/eop:latest
```

**Available tags:**
- `latest` - Latest build from main branch
- `main` - Latest main branch
- `v1.0.0` - Specific version (from git tags)
- `sha-abc1234` - Specific commit

### Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  eop:
    # Use pre-built image from GitHub Container Registry:
    image: ghcr.io/<username>/eop:latest
    # OR build locally:
    # build: .
    ports:
      - "8080:80"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:80/"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

Run with:
```bash
docker-compose up -d
```

---

## 📦 GitHub Pages

### Automated Deployment (Recommended)

This repository includes a GitHub Actions workflow (`jekyll-gh-pages.yml`) that automatically deploys to GitHub Pages.

**Setup:**
1. Go to your repository Settings → Pages
2. Set Source to "GitHub Actions"
3. The workflow will automatically deploy the `src/` directory on push to `main`

**Access:** `https://<username>.github.io/<repo-name>/`

### Manual Deployment

If you prefer manual deployment:

```bash
# Create gh-pages branch
git checkout -b gh-pages

# Copy src to root
cp -r src/* .

# Commit and push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

Then set Source to "Deploy from a branch" → `gh-pages` → `/ (root)` in Settings → Pages.

---

## 🌐 Netlify

### Option 1: Web UI

1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository
4. Configure:
   - **Build command:** (leave empty)
   - **Publish directory:** `src`
5. Click "Deploy site"

### Option 2: CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=src
```

### Option 3: netlify.toml

Create `netlify.toml` in project root:

```toml
[build]
  publish = "src"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
```

---

## ▲ Vercel

### Option 1: Web UI

1. Go to [Vercel](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `src`
   - **Build Command:** (leave empty)
   - **Output Directory:** (leave empty)
5. Click "Deploy"

### Option 2: CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod src
```

### Option 3: vercel.json

Create `vercel.json` in project root:

```json
{
  "version": 2,
  "public": true,
  "buildCommand": "",
  "outputDirectory": "src",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## 🌍 Traditional Web Hosting

### Apache

Upload the `src/` directory to your web server.

Create `.htaccess`:

```apache
# Security headers
Header set X-Frame-Options "SAMEORIGIN"
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### Nginx

Upload the `src/` directory to your web server (e.g., `/var/www/eop/`).

Configure nginx:

```nginx
server {
    listen 80;
    server_name eop.yourdomain.com;
    root /var/www/eop;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript image/jpeg image/png;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 🔒 HTTPS/SSL

### Free SSL with Let's Encrypt (for VPS/dedicated hosting)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d eop.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Cloudflare (easiest option)

1. Sign up for [Cloudflare](https://cloudflare.com)
2. Add your domain
3. Update nameservers at your registrar
4. Enable "Always Use HTTPS" in SSL/TLS settings
5. Done! Free SSL + CDN

---

## 📊 Monitoring & Analytics

### Add Google Analytics (optional)

Add to all HTML files before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🔧 Troubleshooting

### Issue: Cards not loading
**Solution:** Check browser console for 404 errors. Ensure `img/` directory is present.

### Issue: Links don't work
**Solution:** Verify file paths are relative. Avoid absolute paths like `/index.html`.

### Issue: localStorage not persisting
**Solution:** Ensure HTTPS is enabled. Some browsers block localStorage on HTTP.

### Issue: CORS errors (if hosting on subdomain)
**Solution:** Add CORS headers to your server configuration.

---

## 🚀 Performance Tips

1. **Enable Gzip/Brotli compression** on your server
2. **Use a CDN** (Cloudflare, AWS CloudFront)
3. **Add cache headers** for static assets
4. **Optimize images** (already JPG format, good compression)
5. **Use HTTP/2** for faster loading

---

## 📝 Custom Domain Setup

### GitHub Pages

1. Add a `CNAME` file to `src/` with your domain:
   ```
   eop.yourdomain.com
   ```
2. Update DNS:
   - Type: `CNAME`
   - Name: `eop`
   - Value: `<username>.github.io`

### Netlify/Vercel

1. Go to site settings → Domain management
2. Add custom domain
3. Update DNS as instructed
4. SSL is automatic!

---

Need help? Open an issue on GitHub!
