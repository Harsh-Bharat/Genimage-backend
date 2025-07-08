import express from 'express'
import cors from 'cors'
import connectDB from './config/mongodb.js' // ✅ path from config
import dotenv from 'dotenv'
import route from './routers/userRoutes.js'
import Razorpay from 'razorpay'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Middlewaress
app.use(cors({
  origin: "https://genimage-project.vercel.app",
  credentials: true
}));

app.use(express.json())
app.use('/user/api',route);

// Connect to MongoDB
connectDB();

// Test route
app.get('/', (req, res) => {
  res.send('✅ Server and MongoDB connected')
})
app.post('/orders', async (req, res) => {
  const razorpay = new Razorpay({
    key_id: "rzp_test_GcZZFDP9jHtC4",
    key_secret: "63dtQv2u70lw7ENziYey0ew"
  });

  const options = {
    amount: req.body.amount,
    currency: req.body.currency,
    receipt: "receipt#1",
    payment_capture: 1
  };

  try {
    const response = await razorpay.orders.create(options);

    res.json({
      order_id: response.id,
      currency: response.currency,
      amount: response.amount
    });
  } catch (error) {
    // Handle error here if needed
    res.status(500).send("internal server ki dikkt ")
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`)
})
