import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';



const client = new OAuth2Client("976544929945-qqnb1us9lqmoojtptc1rndcl8olqej6q.apps.googleusercontent.com"); // यहाँ अपनी Google Client ID डालना

// Google Login Route
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body; // जो फ्रंटएंड से मिलेगा

    // Google token को verify करो
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "976544929945-qqnb1us9lqmoojtptc1rndcl8olqej6q.apps.googleusercontent.com",
    });

    const { name, email } = ticket.getPayload();

    // चेक करो क्या ये यूजर पहले से डेटाबेस में है?
    let user = await User.findOne({ email });

    if (!user) {
      // अगर नया यूजर है, तो ऑटो-रजिस्टर कर दो (डिफ़ॉल्ट पासवर्ड जनरेट करके)
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = new User({
        name,
        email,
        password: hashedPassword,
        role: 'user' // डिफ़ॉल्ट नॉर्मल यूजर
      });
      await user.save();
    }

    // अपना खुद का JWT Token जनरेट करो (ताकि बाकी ऐप में काम करे)
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "suraj_secret_key_123",
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "Google Login successful!",
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Google authentication failed", error: error.message });
  }
};


// 1. User Schema (MongoDB के लिए)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

// अगर मॉडल पहले से रजिस्टर्ड है तो वही यूज़ करो, वरना नया बनाओ
const User = mongoose.models.User || mongoose.model('User', userSchema);

// 2. Register Function (Sign Up)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    await newUser.save();
    res.status(201).json({ message: "Registration successful! Now you can login." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 3. Login Function (Sign In)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials (Wrong password)!" });
    }

    // JWT Token Generate करना (7 दिन के लिए वैध)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "suraj_secret_key_123",
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role // यहाँ से पता चलेगा कि यह 'admin' है या 'user'
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 4. Express Routes को सेट करने के लिए एक फंक्शन जो सीधे server.js में जुड़ जाएगा
import express from 'express';
const router = express.Router();

router.post('/register', registerUser);
router.post ('/google-login',googleLogin);
router.post('/login', loginUser);

export default router;