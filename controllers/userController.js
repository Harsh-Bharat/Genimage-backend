import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Usermodel from '../models/Usermodel.js'
import transactionModel from '../models/transactionModel.js'
import Razorpay from 'razorpay'

// ✅ REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing details' })
    }

    const existingUser = await Usermodel.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const userData = {
      name,
      email,
      password: hashedPassword
    }

    const newUser = new Usermodel(userData)
    await newUser.save()

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    })

   res.status(201).json({
  success: true, // ✅ ADD THIS
  message: 'User registered successfully',
  user: {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    creditLeft: newUser.creditLeft
  },
  token
})

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' })
    }

    const user = await Usermodel.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    })

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        // creditLeft: user.creditLeft
      },
      token
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}


// ✅ Get user's remaining credits
 const getUserCredit = async (req, res) => {
  try {
    const userId = req.userId; // ✅ comes from verified token

    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing' });
    }

    const user = await Usermodel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Credit fetched successfully',
      creditLeft: user.creditLeft,
    });
  } catch (error) {
    console.error('Error fetching user credit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
// ------------------------------------rajorpay ka work---------------------
 const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentRazorpay = async (req, res) => {
    try {
        const { userId, planId } = req.body;

        const userData = await Usermodel.findById(userId);
if (!userId || !planId) {
    return res.json({ success: false, message: 'Missing Details' });
}

let credits, plan, amount, date;

switch (planId) {
    case 'Basic':
        plan = 'Basic';
        credits = 100;
        amount = 10;
        break;

        case 'Business':
           plan = 'Business';
        credits = 500;
        amount = 50;
        break;
        case 'Advance':
           plan = 'Advance';
        credits = 5000;
        amount = 250;
        break;
    default:
      return res.json({success:false,message:'plan not found'})
}
date=Date.now();

const Transactiondata={date,amount,userId,plan,credits};
 const newTransactionData=await transactionModel.create(Transactiondata);

const options = {
    amount: amount * 100,
    currency: process.env.CURRENCY,
    receipt: newTransactionData._id,
}

await razorpayInstance.orders.create(options, (error, order) => {
    if (error) {
        console.log(error);
        return res.json({ success: false, message: error });
    }
    res.json({ success: true, order });
});

 


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
    
};



// ✅ Export all controller functions
export { registerUser, loginUser, getUserCredit,paymentRazorpay };
