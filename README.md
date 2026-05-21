# Portfolio

```
portfolio-root/
├── frontend/
│   └── index.html        ← open this in browser / deploy to Netlify
├── backend/
│   ├── src/
│   │   └── index.js      ← Express server
│   ├── .env.example      ← copy to .env and fill credentials
│   ├── .gitignore
│   ├── package.json
│   └── README.md
├── .gitignore
└── README.md
```

## Run locally
```bash
# 1. Start backend
cd backend
npm install
cp .env.example .env    # fill in Gmail + App Password
npm run dev

# 2. Open frontend
# Open frontend/index.html in browser (or use VS Code Live Server)
```

## Deploy
- **frontend/** → Netlify, GitHub Pages, or Vercel (free static hosting)
- **backend/**  → Render.com or Railway (free Node.js hosting)

After deploying backend, update this line in `frontend/index.html`:
```js
const BACKEND_URL = 'https://your-app.onrender.com/api/contact';
```