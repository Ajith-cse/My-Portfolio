# Portfolio Contact Backend

Node.js + Express backend for your portfolio contact form.
Sends you an email when someone submits the form,
and auto-replies to the sender.

---

## Folder Structure

```
portfolio-backend/
├── src/
│   └── index.js          ← main server
├── .env.example          ← copy to .env and fill in
├── .gitignore
├── package.json
├── README.md
└── portfolio.html        ← updated portfolio (put in your public folder)
```

---

## Local Setup (5 minutes)

### Step 1 — Install dependencies
```bash
cd portfolio-backend
npm install
```

### Step 2 — Get a Gmail App Password
1. Go to **myaccount.google.com**
2. **Security** → make sure **2-Step Verification** is ON
3. Search **"App passwords"** in the search bar
4. Create one → select **Mail** → copy the 16-character code

### Step 3 — Create your .env file
```bash
cp .env.example .env
```
Open `.env` and fill in:
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop   ← your 16-char app password
EMAIL_TO=your-gmail@gmail.com
FRONTEND_URL=http://localhost:5500
```

### Step 4 — Run the server
```bash
npm run dev       # with auto-restart (nodemon)
# or
npm start         # production
```

Server starts at **http://localhost:3001**

### Step 5 — Test it
```bash
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Hello from curl!"}'
```
You should receive an email within seconds.

---

## Deploy to Render (Free)

Render.com gives you a free Node.js server — perfect for a portfolio.

### Step 1 — Push backend to GitHub
```bash
git init
git add .
git commit -m "Portfolio contact backend"
git remote add origin https://github.com/YOUR_USERNAME/portfolio-backend.git
git push -u origin main
```
⚠️ Make sure `.env` is in `.gitignore` (it already is).

### Step 2 — Create a Render Web Service
1. Go to **render.com** → New → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance type:** Free

### Step 3 — Add Environment Variables on Render
In your Render dashboard → Environment → Add:
```
EMAIL_USER     your-gmail@gmail.com
EMAIL_PASS     your-app-password
EMAIL_TO       your-gmail@gmail.com
FRONTEND_URL   https://your-portfolio-url.com
PORT           3001
```

### Step 4 — Update portfolio.html
Once deployed, change this line in `portfolio.html`:
```js
// FROM:
const BACKEND_URL = 'http://localhost:3001/api/contact';

// TO:
const BACKEND_URL = 'https://your-app-name.onrender.com/api/contact';
```

---

## Other Free Deployment Options

| Platform  | Free Tier | Notes |
|-----------|-----------|-------|
| Render    | ✅ Yes    | Sleeps after 15min inactivity (free tier) |
| Railway   | ✅ $5/mo credit | Faster, no sleep |
| Fly.io    | ✅ Yes    | More control |
| Vercel    | ✅ Yes    | Needs minor refactor to serverless functions |

---

## API Reference

### POST /api/contact
**Body (JSON):**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "message": "I'd love to discuss an opportunity..."
}
```

**Success (200):**
```json
{ "success": true, "message": "Message sent successfully! I'll get back to you soon." }
```

**Validation Error (400):**
```json
{ "success": false, "message": "A valid email address is required." }
```

**Rate Limited (429):**
```json
{ "success": false, "message": "Too many messages sent. Please try again in 15 minutes." }
```

**Server Error (500):**
```json
{ "success": false, "message": "Something went wrong. Please email me directly." }
```

---

## Security Features Built In
- ✅ Rate limiting (5 requests / 15 min per IP)
- ✅ Input validation (name, email format, message length)
- ✅ HTML escaping to prevent email injection
- ✅ CORS locked to your frontend URL only
- ✅ Credentials in .env (never hardcoded)
- ✅ .env excluded from git