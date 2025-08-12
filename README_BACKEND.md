WitchCard.Shop Backend (for Render / Railway / VPS)
-----------------------------------------------
1. Create a repo 'witchcard-backend' and push these files.
2. On Render: New -> Web Service -> Connect repo -> Deploy.
3. Set Environment Variables in Render (or .env locally):
   - PROKERALA_API_KEY
   - PROKERALA_API_SECRET
   - RAZORPAY_KEY_ID
   - RAZORPAY_KEY_SECRET
   - AFFILIATE_API (optional)
4. After deploy, note the service URL and use it as API_BASE in frontend.
