require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;
// ── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS — only allow your portfolio frontend
app.use(cors({
  origin: ['http://localhost:5500',
    'http://127.0.0.1:5500',
    process.env.FRONTEND_URL,],
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type'],
}));

// Rate limiter — max 5 contact form submissions per 15 min per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many messages sent. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Nodemailer Transporter ────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,   // Gmail App Password
  },
});

// Verify transporter config on startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email transporter error:', error.message);
    console.error('   → Check your EMAIL_USER and EMAIL_PASS in .env');
  } else {
    console.log('✅ Email transporter ready');
  }
});

// ── Input Validation ─────────────────────────────────────────
function validateContactInput({ name, email, message }) {
  const errors = [];
  if (!name || name.trim().length < 2)
    errors.push('Name must be at least 2 characters.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push('A valid email address is required.');
  if (!message || message.trim().length < 10)
    errors.push('Message must be at least 10 characters.');
  if (message && message.trim().length > 2000)
    errors.push('Message must be under 2000 characters.');
  return errors;
}

// ── Email Templates ──────────────────────────────────────────
function buildOwnerEmail({ name, email, message }) {
  return {
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `📬 New message from ${name} — Portfolio Contact`,
    text: `You received a new message via your portfolio contact form.\n\nName: ${name}\nEmail: ${email}\nMessage:\n${message}\n\n---\nSent from your portfolio website.`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0c0c0f;color:#f1f5f9;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#3b82f6,#a855f7);padding:28px 32px;">
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#fff;">📬 New Portfolio Message</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Someone reached out via your contact form</p>
        </div>
        <div style="padding:28px 32px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;color:#94a3b8;font-size:14px;width:80px;">Name</td>
              <td style="padding:10px 0;color:#f1f5f9;font-weight:500;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#94a3b8;font-size:14px;">Email</td>
              <td style="padding:10px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#60a5fa;text-decoration:none;">${escapeHtml(email)}</a></td>
            </tr>
          </table>
          <div style="margin-top:20px;padding:20px;background:#111116;border-radius:10px;border-left:3px solid #3b82f6;">
            <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;">Message</p>
            <p style="margin:0;color:#e2e8f0;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</p>
          </div>
          <div style="margin-top:24px;">
            <a href="mailto:${escapeHtml(email)}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#3b82f6,#a855f7);color:#fff;text-decoration:none;border-radius:100px;font-weight:500;font-size:14px;">Reply to ${escapeHtml(name)}</a>
          </div>
        </div>
        <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.07);color:#475569;font-size:12px;">
          Sent from your portfolio website · ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
        </div>
      </div>
    `,
  };
}

function buildAutoReplyEmail({ name, email }) {
  return {
    from: `"[YOUR NAME]" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Thanks for reaching out, ${name}! 👋`,
    text: `Hi ${name},\n\nThanks for your message! I've received it and will get back to you within 24–48 hours.\n\nBest,\n[YOUR NAME]\n[ADD YOUR LINKEDIN URL]`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0c0c0f;color:#f1f5f9;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#3b82f6,#a855f7);padding:28px 32px;">
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#fff;">Thanks for reaching out! 👋</h1>
        </div>
        <div style="padding:28px 32px;">
          <p style="color:#e2e8f0;line-height:1.7;">Hi <strong>${escapeHtml(name)}</strong>,</p>
          <p style="color:#94a3b8;line-height:1.7;">I've received your message and I'll get back to you within <strong style="color:#60a5fa;">24–48 hours</strong>.</p>
          <p style="color:#94a3b8;line-height:1.7;">In the meantime, feel free to check out my work on GitHub or connect on LinkedIn.</p>
          <div style="margin-top:24px;display:flex;gap:12px;">
            <a href="[ADD GITHUB LINK HERE]" style="display:inline-block;padding:12px 20px;background:#111116;border:1px solid rgba(255,255,255,0.1);color:#f1f5f9;text-decoration:none;border-radius:10px;font-size:14px;">GitHub</a>
            <a href="[ADD LINKEDIN LINK HERE]" style="display:inline-block;padding:12px 20px;background:#111116;border:1px solid rgba(255,255,255,0.1);color:#f1f5f9;text-decoration:none;border-radius:10px;font-size:14px;">LinkedIn</a>
          </div>
        </div>
        <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.07);color:#475569;font-size:12px;">
          [YOUR NAME] · [YOUR CITY] · <a href="mailto:[ADD EMAIL HERE]" style="color:#475569;">[ADD EMAIL HERE]</a>
        </div>
      </div>
    `,
  };
}

// Sanitize HTML special chars to prevent injection in emails
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Routes ────────────────────────────────────────────────────

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Portfolio contact API is running.' });
});

// Contact form submission
app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, message } = req.body;

  // Validate
  const errors = validateContactInput({ name, email, message });
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0] });
  }

  try {
    // Send both emails concurrently
    await Promise.all([
      transporter.sendMail(buildOwnerEmail({ name: name.trim(), email: email.trim(), message: message.trim() })),
      transporter.sendMail(buildAutoReplyEmail({ name: name.trim(), email: email.trim() })),
    ]);

    console.log(`📨 Message received from ${name} <${email}>`);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully! I\'ll get back to you soon.',
    });
  } catch (err) {
    console.error('❌ Failed to send email:', err.message);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please email me directly.',
    });
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Portfolio backend running on http://localhost:${PORT}`);
  console.log(`   POST /api/contact  →  contact form endpoint`);
  console.log(`   GET  /             →  health check\n`);

  // Keep Render free tier awake — ping every 10 minutes
  const BACKEND_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  setInterval(() => {
    fetch(`${BACKEND_URL}/`)
      .then(() => console.log('✅ Keep-alive ping sent'))
      .catch(() => console.log('⚠️ Keep-alive ping failed'));
  }, 10 * 60 * 1000);
});