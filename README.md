WitchCard.Shop - Full Package (Frontend + Backend)
==================================================

This archive contains two folders:

1) frontend/  -- static site (HTML, CSS, JS) ready for GitHub Pages
2) backend/   -- Node.js Express backend ready for Render (or any Node host)

Steps to deploy:

FRONTEND (GitHub Pages)
-----------------------
- Create a repo 'witchcard-frontend' and push the frontend/ files to the main branch.
- In the frontend/index.html replace the placeholder %%API_BASE%% with your backend URL (e.g. https://witchcard-backend.onrender.com)
  and replace %%RAZORPAY_KEY_ID%% with your Razorpay Key ID (this is public).
- In GitHub repo -> Settings -> Pages -> set source to main branch / root (or gh-pages branch if you prefer).
- Configure your custom domain (witchcard.shop) via DNS: add a CNAME to yourusername.github.io or follow GitHub Pages docs.

BACKEND (Render)
----------------
- Create a repo 'witchcard-backend' and push backend/ files.
- On Render: New -> Web Service -> Connect repo -> Deploy.
- Add environment variables on Render's dashboard (PROKERALA_API_KEY, PROKERALA_API_SECRET, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, AFFILIATE_API)
- Deploy, then copy service URL and set it in frontend as API_BASE.

NOTES
-----
- Never put secrets in frontend code.
- Test free Horoscope flow first (no payment).
- For payments, use Razorpay test keys first.
- After everything works, you can enable your custom domain on GitHub Pages and point API_BASE to your backend.
