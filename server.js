import express from "express";
import axios from "axios";
import Razorpay from "razorpay";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: 'order_' + Date.now()
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/astro', async (req, res) => {
  const { service, data } = req.body;
  try {
    const tokenResponse = await axios.post('https://api.prokerala.com/token', new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.PROKERALA_API_KEY,
      client_secret: process.env.PROKERALA_API_SECRET
    }));
    const token = tokenResponse.data.access_token;
    let endpoint = '';
    if(service === 'horoscope') endpoint = 'https://api.prokerala.com/v2/astrology/horoscope';
    if(service === 'kundli') endpoint = 'https://api.prokerala.com/v2/astrology/natal-chart';
    if(service === 'past-life') endpoint = 'https://api.prokerala.com/v2/astrology/past-life';
    if(service === 'compatibility') endpoint = 'https://api.prokerala.com/v2/astrology/compatibility';

    const apiResponse = await axios.get(endpoint, { params: data, headers: { Authorization: `Bearer ${token}` } });
    const affiliateData = { affiliateLink: process.env.AFFILIATE_API || '' };
    res.json({ ...apiResponse.data, affiliate: affiliateData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
