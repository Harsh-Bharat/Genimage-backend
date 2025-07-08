import express from 'express';
import { registerUser, loginUser, getUserCredit, paymentRazorpay } from '../controllers/userController.js';
import useAuth from '../middlewares/useAuth.js';
import { genimage } from '../controllers/genimage.js';


const router = express.Router();

// 👤 Auth Routes
router.post('/register', registerUser);           // /api/user/register
router.post('/login', loginUser);                 // /api/user/login
router.post('/getcredit', useAuth, getUserCredit); // /api/user/getcredit
router.post('/razorpay', useAuth, paymentRazorpay); // /api/user/getcredit

// 🎨 Image Generation
router.post('/generate-image', useAuth, genimage); // /api/user/generate-image

export default router;
