# student-tool-kit

A comprehensive AI-powered student utility toolkit with tools for writing, studying, productivity, and more.

## 🚀 Live Demo

**Visit:** https://muzamillp20-ai.github.io/student-tool-kit/

## ⚠️ IMPORTANT: GitHub Pages Configuration

If your site shows a blank page, you need to configure GitHub Pages correctly:

### Quick Fix (2 minutes):

1. Go to: https://github.com/muzamillp20-ai/student-tool-kit/settings/pages
2. In **Build and deployment** section
3. Change **Source** to: **"GitHub Actions"** (NOT "Deploy from a branch")
4. Save
5. Push your changes to main branch
6. Wait for deployment to complete
7. Hard refresh the browser (Ctrl+Shift+R)

**See [BLANK_PAGE_FIX.md](./BLANK_PAGE_FIX.md) for detailed troubleshooting.**

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Deployment

This project uses GitHub Actions for automatic deployment to GitHub Pages.

### How it works:
1. Push to the `main` branch
2. GitHub Actions builds the project with Vite
3. The `dist` folder is deployed to GitHub Pages
4. Site available at: `https://muzamillp20-ai.github.io/student-tool-kit/`

### Manual deployment:
1. Go to **Actions** tab
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow**

## 🔧 Configuration

### Vite Configuration
- Base path: `/student-tool-kit/` (configured in `vite.config.js`)
- Router: HashRouter (works with GitHub Pages)

### AI Configuration
- Default model: Google Gemini 2.5 Flash
- API key: Configure in Settings page or `.env` file
- Demo mode: Works without API key

## 📁 Project Structure

```
student-tool-kit/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers
│   ├── pages/          # Page components
│   ├── services/       # AI service layer
│   └── data/          # Tool definitions
├── .github/
│   └── workflows/     # GitHub Actions workflows
└── dist/              # Production build output
```

## 🎯 Features

- 🤖 AI-powered tools (Gemini API)
- 📝 Writing tools (summarizer, rewriter, email generator)
- 🎓 Student tools (study planner, quiz generator, flashcards)
- 💼 Productivity tools (task planner, daily planner, goals)
- 💻 Developer tools (code explainer, JSON formatter)
- 🧠 AI assistants (brainstorming, research, decision making)
- 🔐 User authentication with email verification
- 🌓 Dark/Light mode
- 📱 Fully responsive design
- 💾 Local storage for user data

## 📄 Documentation

- [BLANK_PAGE_FIX.md](./BLANK_PAGE_FIX.md) - Fix for blank page issue
- [GITHUB_PAGES_FIX.md](./GITHUB_PAGES_FIX.md) - Detailed deployment guide
- [DEPLOYMENT_FIX_SUMMARY.md](./DEPLOYMENT_FIX_SUMMARY.md) - Technical summary

## 🐛 Troubleshooting

### Blank page on GitHub Pages?
→ See [BLANK_PAGE_FIX.md](./BLANK_PAGE_FIX.md)

### Build fails?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Local preview shows blank page?
```bash
# Make sure you're using the correct base path
npm run preview
# Visit: http://localhost:4173/student-tool-kit/
```

## 📝 License

MIT

## 👤 Author

Created for students who need powerful AI tools in one place.
