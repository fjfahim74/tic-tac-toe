# 🌐 Web Version - Deployment Guide

## Quick Start Local Server

### Option 1: Python HTTP Server (Simplest)
```bash
# Navigate to web folder
cd web

# Python 3
python -m http.server 8000

# Open browser to: http://localhost:8000
```

### Option 2: Node.js HTTP Server
```bash
# Install http-server globally
npm install -g http-server

# Run server
cd web
http-server -p 8000

# Open browser to: http://localhost:8000
```

### Option 3: PHP Built-in Server
```bash
cd web
php -S localhost:8000

# Open browser to: http://localhost:8000
```

### Option 4: VS Code Live Server Extension
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

---

## 🚀 Deploy to Real Server

### Free Hosting Options

#### 1. GitHub Pages (Recommended)
```bash
# Create repository
git init
git add .
git commit -m "Add web version"

# Push to GitHub
git remote add origin <your-repo-url>
git push -u origin main

# Enable GitHub Pages in repository settings
# Your site will be at: https://yourusername.github.io/tic-tac-toe
```

#### 2. Netlify (Drag & Drop)
1. Go to https://www.netlify.com/
2. Sign up (free)
3. Drag the `web` folder to Netlify
4. Get instant URL: `https://your-site.netlify.app`

#### 3. Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd web
vercel

# Follow prompts, get instant URL
```

#### 4. Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Deploy
firebase deploy

# Get URL: https://your-project.firebaseapp.com
```

---

## 📁 Web Version Structure

```
web/
├── index.html    # Main HTML structure
├── style.css     # Complete styling & animations
└── script.js     # Game logic with Minimax AI
```

---

## ✨ Features (Same as Desktop)

✅ **AI with 3 Difficulty Levels**
- Easy: Random moves
- Medium: 70% optimal
- Hard: Unbeatable Minimax

✅ **Beautiful UI**
- Gradient backgrounds
- Smooth animations
- Responsive design
- Mobile-friendly

✅ **Statistics Tracking**
- LocalStorage persistence
- Win/Loss/Draw percentages
- Total games counter

✅ **Game Modes**
- Single player vs AI
- Two player local
- Multiple difficulty levels

---

## 🎮 Browser Requirements

- **Modern Browser**: Chrome, Firefox, Safari, Edge (last 2 versions)
- **JavaScript**: Must be enabled
- **LocalStorage**: For statistics persistence

---

## 🔧 Customization

### Change Colors
Edit `style.css`:
```css
/* Main gradient */
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Modify AI Difficulty
Edit `script.js`:
```javascript
// Medium AI chance (currently 70%)
move = Math.random() < 0.7 ? getBestMove() : getRandomMove();
```

---

## 📊 Testing

1. **Local Testing**: Run local server
2. **Cross-Browser**: Test on Chrome, Firefox, Safari
3. **Mobile**: Test on phone/tablet
4. **AI**: Verify all difficulty levels work
5. **Statistics**: Check persistence after refresh

---

## 🌐 Share Your Game

After deployment, share your URL:
- `https://yourusername.github.io/tic-tac-toe`
- `https://your-site.netlify.app`
- `https://your-project.vercel.app`

---

## 💡 Presentation Tips

1. **Open in Browser**: Show the live URL
2. **Demo Easy Mode**: Show you can win
3. **Demo Hard Mode**: Show it's unbeatable
4. **Show Statistics**: Play a few games
5. **Mobile View**: Resize browser or show on phone
6. **Inspect Code**: Show the clean JavaScript/CSS

---

## 🎓 University Benefits

✅ **Accessible**: No installation needed
✅ **Shareable**: Just send a link
✅ **Professional**: Modern web technologies
✅ **Portfolio**: Add to your portfolio site
✅ **Demonstrable**: Works on any device

---

Made for easy deployment and sharing! 🚀
