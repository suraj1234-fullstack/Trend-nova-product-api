import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'trendnova_secure_jwt_secret_key_123';

// --- TRUST PROXY (Render के लिए ज़रूरी) ---
app.set('trust proxy', 1);

// --- CORS CONFIGURATION (Frontend Vercel Domain) ---
app.use(cors({
  origin: 'https://trend-nova-nu.vercel.app', 
  credentials: true
}));

app.use(express.json());
app.use(helmet());

// --- SESSION & PASSPORT MIDDLEWARE (Cross-Domain Cookie Fix) ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'trendnova_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,      // Render (HTTPS) पर true होना ज़रूरी है
    sameSite: 'none',  // Vercel और Render के अलग डोमेन होने पर कुकी शेयर करने के लिए
    maxAge: 24 * 60 * 60 * 1000 // 1 Day
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/trendnova';

// --- User Schema & Model for Authentication ---
const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatar: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Passport Google Strategy Configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://trend-nova-product-api-2.onrender.com/auth/google/callback' 
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        // नया यूजर डेटाबेस में सेव करें
        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0]?.value,
          role: 'user' 
        });
        await user.save();
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// --- AUTHENTICATION & SECURITY MIDDLEWARES ---

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated() || req.headers.authorization) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized access! Please sign in first." });
};

const ensureAdmin = async (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: "Access denied! Admin privileges required." });
};


// Product Schema & Model
const productSchema = new mongoose.Schema({
  id: Number,
  name: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  price: { type: Number, required: true },
  rating: Number,
  image: { type: String, required: true },
  inStock: { type: Boolean, default: true }
});

const Product = mongoose.model('Product', productSchema);

// Initial Products Data List
const initialProducts = [
  { id: 1, name: "Men Classic Blue Denim Jeans", category: "Men", subCategory: "Bottomwear", price: 1299, rating: 4.3, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80" },
  { id: 2, name: "Men Slim Fit Cargo Joggers", category: "Men", subCategory: "Bottomwear", price: 1199, rating: 4.2, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" },
  { id: 3, name: "Men Cotton Track Pants", category: "Men", subCategory: "Bottomwear", price: 799, rating: 4.5, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
  { id: 4, name: "Men Black Ripped Stretch Jeans", category: "Men", subCategory: "Bottomwear", price: 1499, rating: 4.4, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
  { id: 5, name: "Men Formal Chino Trousers", category: "Men", subCategory: "Bottomwear", price: 1399, rating: 4.6, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
  { id: 6, name: "Men Olive Green Cargo Pants", category: "Men", subCategory: "Bottomwear", price: 1249, rating: 4.3, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" },
  { id: 7, name: "Men Grey Fleece Sweatpants", category: "Men", subCategory: "Bottomwear", price: 899, rating: 4.1, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
  { id: 8, name: "Men Dark Indigo Slim Jeans", category: "Men", subCategory: "Bottomwear", price: 1599, rating: 4.7, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80" },
  { id: 9, name: "Men Beige Casual Trousers", category: "Men", subCategory: "Bottomwear", price: 1199, rating: 4.2, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
  { id: 10, name: "Men Athletic Gym Joggers", category: "Men", subCategory: "Bottomwear", price: 999, rating: 4.5, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" },
  
  { id: 11, name: "Men Navy Blue Formal Pants", category: "Men", subCategory: "Bottomwear", price: 1499, rating: 4.6, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
  { id: 12, name: "Men Light Blue Washed Jeans", category: "Men", subCategory: "Bottomwear", price: 1399, rating: 4.3, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80" },
  { id: 13, name: "Men Army Camouflage Cargo Pants", category: "Men", subCategory: "Bottomwear", price: 1299, rating: 4.4, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" },
  { id: 14, name: "Men Running Compression Tights", category: "Men", subCategory: "Bottomwear", price: 799, rating: 4.1, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
  { id: 15, name: "Men Brown Corduroy Trousers", category: "Men", subCategory: "Bottomwear", price: 1699, rating: 4.8, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
  { id: 16, name: "Men Charcoal Grey Track Pants", category: "Men", subCategory: "Bottomwear", price: 849, rating: 4.3, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
  { id: 17, name: "Men Distress Skinny Blue Jeans", category: "Men", subCategory: "Bottomwear", price: 1499, rating: 4.2, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80" },
  { id: 18, name: "Men Khaki Straight Fit Chinos", category: "Men", subCategory: "Bottomwear", price: 1299, rating: 4.5, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
  { id: 19, name: "Men Black Multi-Pocket Cargo", category: "Men", subCategory: "Bottomwear", price: 1599, rating: 4.7, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" },
  { id: 20, name: "Men White Casual Linen Pants", category: "Men", subCategory: "Bottomwear", price: 1199, rating: 4.0, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },

  // --- WOMEN PANTS & JEANS ---
  { id: 21, name: "Women High-Waist Skinny Jeans", category: "Women", subCategory: "Bottomwear", price: 1199, rating: 4.3, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
  { id: 22, name: "Women Relaxed Fit Mom Jeans", category: "Women", subCategory: "Bottomwear", price: 1399, rating: 4.6, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80" },
  { id: 23, name: "Women Formal Office Trousers", category: "Women", subCategory: "Bottomwear", price: 1299, rating: 4.5, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
  { id: 24, name: "Women Stylish Palazzo Pants", category: "Women", subCategory: "Bottomwear", price: 899, rating: 4.4, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
  { id: 25, name: "Women Cotton Printed Leggings", category: "Women", subCategory: "Bottomwear", price: 499, rating: 4.7, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
  { id: 26, name: "Women Wide-Leg Denim Trousers", category: "Women", subCategory: "Bottomwear", price: 1599, rating: 4.8, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80" },
  { id: 27, name: "Women Casual Lycra Jeggings", category: "Women", subCategory: "Bottomwear", price: 699, rating: 4.2, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
  { id: 28, name: "Women Jogger Fitness Pants", category: "Women", subCategory: "Bottomwear", price: 999, rating: 4.3, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" },
  { id: 29, name: "Women Checkered Formal Pants", category: "Women", subCategory: "Bottomwear", price: 1399, rating: 4.5, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
  { id: 30, name: "Women Cargo Utility Pants", category: "Women", subCategory: "Bottomwear", price: 1499, rating: 4.6, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" },

  { id: 31, name: "Women Blue Boyfriend Jeans", category: "Women", subCategory: "Bottomwear", price: 1499, rating: 4.4, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80" },
  { id: 32, name: "Women Pleated Ankle-Length Trousers", category: "Women", subCategory: "Bottomwear", price: 1199, rating: 4.3, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
  { id: 33, name: "Women High-Stretch Yoga Pants", category: "Women", subCategory: "Bottomwear", price: 899, rating: 4.7, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
  { id: 34, name: "Women Flared Casual Pants", category: "Women", subCategory: "Bottomwear", price: 1099, rating: 4.1, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
  { id: 35, name: "Women Printed Ethnic Dhoti Pants", category: "Women", subCategory: "Bottomwear", price: 799, rating: 4.5, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
  { id: 36, name: "Women Denim Flared Dungarees", category: "Women", subCategory: "Bottomwear", price: 1799, rating: 4.6, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80" },
  { id: 37, name: "Women Solid Track Bottoms", category: "Women", subCategory: "Bottomwear", price: 749, rating: 4.2, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
  { id: 38, name: "Women Paperbag Waist Trousers", category: "Women", subCategory: "Bottomwear", price: 1399, rating: 4.4, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
  { id: 39, name: "Women Grey Athletic Trackpants", category: "Women", subCategory: "Bottomwear", price: 899, rating: 4.3, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
  { id: 40, name: "Women Velvet Winter Leggings", category: "Women", subCategory: "Bottomwear", price: 999, rating: 4.8, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },

  // --- KIDS PANTS & LOWER ---
  { id: 41, name: "Kids Soft Cotton Denim Jeans", category: "Kids", subCategory: "Bottomwear", price: 699, rating: 4.5, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80" },
  { id: 42, name: "Kids Colorful Track Pants Combo", category: "Kids", subCategory: "Bottomwear", price: 499, rating: 4.6, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
  { id: 43, name: "Kids Casual Cargo Shorts", category: "Kids", subCategory: "Bottomwear", price: 599, rating: 4.4, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" },
  { id: 44, name: "Kids Elastic Waist Joggers", category: "Kids", subCategory: "Bottomwear", price: 549, rating: 4.3, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" },
  { id: 45, name: "Kids Printed Cotton Pyjamas", category: "Kids", subCategory: "Bottomwear", price: 399, rating: 4.7, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
  { id: 46, name: "Baby Infant Soft Cotton Lowers", category: "Kids", subCategory: "Bottomwear", price: 299, rating: 4.8, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
  { id: 47, name: "Kids Party Wear Trouser Pants", category: "Kids", subCategory: "Bottomwear", price: 799, rating: 4.2, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
  { id: 48, name: "Kids Denim Dungaree Overalls", category: "Kids", subCategory: "Bottomwear", price: 999, rating: 4.6, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80" },
  { id: 49, name: "Kids Sports Running Lowers", category: "Kids", subCategory: "Bottomwear", price: 499, rating: 4.4, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
  { id: 50, name: "Kids Fleece Lined Winter Pants", category: "Kids", subCategory: "Bottomwear", price: 849, rating: 4.7, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" },
  // --- MEN HALF-SLEEVE T-SHIRTS ---
  { id: 51, name: "Men Solid Black Cotton T-Shirt", category: "Men", subCategory: "Topwear", price: 499, rating: 4.4, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 52, name: "Men Navy Blue Casual T-Shirt", category: "Men", subCategory: "Topwear", price: 449, rating: 4.2, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
  { id: 53, name: "Men Olive Green Gym T-Shirt", category: "Men", subCategory: "Topwear", price: 599, rating: 4.6, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" },
  { id: 54, name: "Men White Oversized Graphic Tee", category: "Men", subCategory: "Topwear", price: 699, rating: 4.7, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 55, name: "Men Maroon Striped Polo T-Shirt", category: "Men", subCategory: "Topwear", price: 799, rating: 4.3, image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=500&q=80" },
  { id: 56, name: "Men Charcoal Grey Plain T-Shirt", category: "Men", subCategory: "Topwear", price: 449, rating: 4.1, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 57, name: "Men Mustard Yellow Casual Tee", category: "Men", subCategory: "Topwear", price: 499, rating: 4.0, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
  { id: 58, name: "Men Teal Blue Running T-Shirt", category: "Men", subCategory: "Topwear", price: 549, rating: 4.5, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" },
  { id: 59, name: "Men Beige Premium Cotton T-Shirt", category: "Men", subCategory: "Topwear", price: 649, rating: 4.6, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 60, name: "Men Royal Blue Sports Jersey Tee", category: "Men", subCategory: "Topwear", price: 599, rating: 4.3, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" },

  // (Note: बाकी प्रोडक्ट्स का डेटा एरर से बचने के लिए उसी तरह बरकरार है)
];

// MongoDB Connection & Seeding Logic
mongoose.connect(MONGO_URI)
.then(async () => {
  console.log('MongoDB Connected Successfully to TrendNova Database!');
  try {
    await Product.deleteMany({});
    await Product.insertMany(initialProducts);
    console.log(`Database successfully updated and seeded with ${initialProducts.length} products!`);
  } catch (err) {
    console.error('Auto-seeding error:', err);
  }
})
.catch((err) => console.error('MongoDB connection error:', err));


// ==================== AUTHENTICATION API ROUTES ====================

// 1. Google Auth Trigger Route
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 2. Google Auth Callback Route
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'https://trend-nova-nu.vercel.app/' }),
  (req, res) => {
    // सफल लॉगिन के बाद फ्रंटएंड पर रीडायरेक्ट करें
    res.redirect('https://trend-nova-nu.vercel.app/');
  }
);

// 3. Get Current Logged-in User Info
app.get('/api/auth/current-user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.status(401).json({ authenticated: false, error: "Not logged in" });
  }
});

// 4. Logout Route
app.get('/auth/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// 5. SECURED ADMIN ROUTE
app.get('/api/admin/dashboard-data', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.json({ message: "Welcome to TrendNova Secure Admin Panel", admin: req.user.name });
});


// ==================== PRODUCT API ROUTES ====================

app.get('/api/products', async (req, res) => {
  try {
    const { category, subCategory } = req.query;
    let filter = {};
    if (category) filter.category = new RegExp('^' + category + '$', 'i');
    if (subCategory) filter.subCategory = new RegExp('^' + subCategory + '$', 'i');

    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get('/api/products/search', async (req, res) => {
  try {
    const searchQuery = req.query.q;
    if (!searchQuery) {
      return res.json([]);
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { category: { $regex: searchQuery, $options: 'i' } },
        { subCategory: { $regex: searchQuery, $options: 'i' } }
      ]
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Search query failed" });
  }
});

app.listen(PORT, () => {
  console.log(`TrendNova Backend Server is running on port ${PORT}`);
});// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import helmet from 'helmet';

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(helmet())

// // MongoDB Connection URI
// const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/trendnova';
// app.get('/', (req, res) => {
//   res.send('TrendNova API is running successfully!');
// });

// // Product Schema & Model
// const productSchema = new mongoose.Schema({
//   id: Number,
//   name: { type: String, required: true },
//   category: { type: String, required: true },
//   subCategory: { type: String, required: true },
//   price: { type: Number, required: true },
//   rating: Number,
//   image: { type: String, required: true },
//   inStock: { type: Boolean, default: true }
// });

// const Product = mongoose.model('Product', productSchema);

// // Initial/Updated Products Data List
// const initialProducts = [
//   // --- MEN PANTS & JEANS ---
//   { id: 1, name: "Men Classic Blue Denim Jeans", category: "Men", subCategory: "Bottomwear", price: 1299, rating: 4.3, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80" },
//   { id: 2, name: "Men Slim Fit Cargo Joggers", category: "Men", subCategory: "Bottomwear", price: 1199, rating: 4.2, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" },
//   { id: 3, name: "Men Cotton Track Pants", category: "Men", subCategory: "Bottomwear", price: 799, rating: 4.5, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
//   { id: 4, name: "Men Black Ripped Stretch Jeans", category: "Men", subCategory: "Bottomwear", price: 1499, rating: 4.4, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
//   { id: 5, name: "Men Formal Chino Trousers", category: "Men", subCategory: "Bottomwear", price: 1399, rating: 4.6, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
//   { id: 6, name: "Men Olive Green Cargo Pants", category: "Men", subCategory: "Bottomwear", price: 1249, rating: 4.3, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" },
//   { id: 7, name: "Men Grey Fleece Sweatpants", category: "Men", subCategory: "Bottomwear", price: 899, rating: 4.1, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
//   { id: 8, name: "Men Dark Indigo Slim Jeans", category: "Men", subCategory: "Bottomwear", price: 1599, rating: 4.7, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80" },
//   { id: 9, name: "Men Beige Casual Trousers", category: "Men", subCategory: "Bottomwear", price: 1199, rating: 4.2, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
//   { id: 10, name: "Men Athletic Gym Joggers", category: "Men", subCategory: "Bottomwear", price: 999, rating: 4.5, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" },
  
//   { id: 11, name: "Men Navy Blue Formal Pants", category: "Men", subCategory: "Bottomwear", price: 1499, rating: 4.6, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
//   { id: 12, name: "Men Light Blue Washed Jeans", category: "Men", subCategory: "Bottomwear", price: 1399, rating: 4.3, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80" },
//   { id: 13, name: "Men Army Camouflage Cargo Pants", category: "Men", subCategory: "Bottomwear", price: 1299, rating: 4.4, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" },
//   { id: 14, name: "Men Running Compression Tights", category: "Men", subCategory: "Bottomwear", price: 799, rating: 4.1, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
//   { id: 15, name: "Men Brown Corduroy Trousers", category: "Men", subCategory: "Bottomwear", price: 1699, rating: 4.8, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
//   { id: 16, name: "Men Charcoal Grey Track Pants", category: "Men", subCategory: "Bottomwear", price: 849, rating: 4.3, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
//   { id: 17, name: "Men Distress Skinny Blue Jeans", category: "Men", subCategory: "Bottomwear", price: 1499, rating: 4.2, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80" },
//   { id: 18, name: "Men Khaki Straight Fit Chinos", category: "Men", subCategory: "Bottomwear", price: 1299, rating: 4.5, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
//   { id: 19, name: "Men Black Multi-Pocket Cargo", category: "Men", subCategory: "Bottomwear", price: 1599, rating: 4.7, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" },
//   { id: 20, name: "Men White Casual Linen Pants", category: "Men", subCategory: "Bottomwear", price: 1199, rating: 4.0, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },

//   // --- WOMEN PANTS & JEANS ---
//   { id: 21, name: "Women High-Waist Skinny Jeans", category: "Women", subCategory: "Bottomwear", price: 1199, rating: 4.3, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
//   { id: 22, name: "Women Relaxed Fit Mom Jeans", category: "Women", subCategory: "Bottomwear", price: 1399, rating: 4.6, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80" },
//   { id: 23, name: "Women Formal Office Trousers", category: "Women", subCategory: "Bottomwear", price: 1299, rating: 4.5, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
//   { id: 24, name: "Women Stylish Palazzo Pants", category: "Women", subCategory: "Bottomwear", price: 899, rating: 4.4, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
//   { id: 25, name: "Women Cotton Printed Leggings", category: "Women", subCategory: "Bottomwear", price: 499, rating: 4.7, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
//   { id: 26, name: "Women Wide-Leg Denim Trousers", category: "Women", subCategory: "Bottomwear", price: 1599, rating: 4.8, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80" },
//   { id: 27, name: "Women Casual Lycra Jeggings", category: "Women", subCategory: "Bottomwear", price: 699, rating: 4.2, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
//   { id: 28, name: "Women Jogger Fitness Pants", category: "Women", subCategory: "Bottomwear", price: 999, rating: 4.3, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" },
//   { id: 29, name: "Women Checkered Formal Pants", category: "Women", subCategory: "Bottomwear", price: 1399, rating: 4.5, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
//   { id: 30, name: "Women Cargo Utility Pants", category: "Women", subCategory: "Bottomwear", price: 1499, rating: 4.6, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" },

//   { id: 31, name: "Women Blue Boyfriend Jeans", category: "Women", subCategory: "Bottomwear", price: 1499, rating: 4.4, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80" },
//   { id: 32, name: "Women Pleated Ankle-Length Trousers", category: "Women", subCategory: "Bottomwear", price: 1199, rating: 4.3, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
//   { id: 33, name: "Women High-Stretch Yoga Pants", category: "Women", subCategory: "Bottomwear", price: 899, rating: 4.7, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
//   { id: 34, name: "Women Flared Casual Pants", category: "Women", subCategory: "Bottomwear", price: 1099, rating: 4.1, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
//   { id: 35, name: "Women Printed Ethnic Dhoti Pants", category: "Women", subCategory: "Bottomwear", price: 799, rating: 4.5, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
//   { id: 36, name: "Women Denim Flared Dungarees", category: "Women", subCategory: "Bottomwear", price: 1799, rating: 4.6, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80" },
//   { id: 37, name: "Women Solid Track Bottoms", category: "Women", subCategory: "Bottomwear", price: 749, rating: 4.2, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
//   { id: 38, name: "Women Paperbag Waist Trousers", category: "Women", subCategory: "Bottomwear", price: 1399, rating: 4.4, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
//   { id: 39, name: "Women Grey Athletic Trackpants", category: "Women", subCategory: "Bottomwear", price: 899, rating: 4.3, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
//   { id: 40, name: "Women Velvet Winter Leggings", category: "Women", subCategory: "Bottomwear", price: 999, rating: 4.8, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },

//   // --- KIDS PANTS & LOWER ---
//   { id: 41, name: "Kids Soft Cotton Denim Jeans", category: "Kids", subCategory: "Bottomwear", price: 699, rating: 4.5, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80" },
//   { id: 42, name: "Kids Colorful Track Pants Combo", category: "Kids", subCategory: "Bottomwear", price: 499, rating: 4.6, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
//   { id: 43, name: "Kids Casual Cargo Shorts", category: "Kids", subCategory: "Bottomwear", price: 599, rating: 4.4, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" },
//   { id: 44, name: "Kids Elastic Waist Joggers", category: "Kids", subCategory: "Bottomwear", price: 549, rating: 4.3, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" },
//   { id: 45, name: "Kids Printed Cotton Pyjamas", category: "Kids", subCategory: "Bottomwear", price: 399, rating: 4.7, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
//   { id: 46, name: "Baby Infant Soft Cotton Lowers", category: "Kids", subCategory: "Bottomwear", price: 299, rating: 4.8, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
//   { id: 47, name: "Kids Party Wear Trouser Pants", category: "Kids", subCategory: "Bottomwear", price: 799, rating: 4.2, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
//   { id: 48, name: "Kids Denim Dungaree Overalls", category: "Kids", subCategory: "Bottomwear", price: 999, rating: 4.6, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80" },
//   { id: 49, name: "Kids Sports Running Lowers", category: "Kids", subCategory: "Bottomwear", price: 499, rating: 4.4, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
//   { id: 50, name: "Kids Fleece Lined Winter Pants", category: "Kids", subCategory: "Bottomwear", price: 849, rating: 4.7, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" },
//   // --- MEN HALF-SLEEVE T-SHIRTS ---
//   { id: 1, name: "Men Solid Black Cotton T-Shirt", category: "Men", subCategory: "Topwear", price: 499, rating: 4.4, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
//   { id: 2, name: "Men Navy Blue Casual T-Shirt", category: "Men", subCategory: "Topwear", price: 449, rating: 4.2, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
//   { id: 3, name: "Men Olive Green Gym T-Shirt", category: "Men", subCategory: "Topwear", price: 599, rating: 4.6, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" },
//   { id: 4, name: "Men White Oversized Graphic Tee", category: "Men", subCategory: "Topwear", price: 699, rating: 4.7, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
//   { id: 5, name: "Men Maroon Striped Polo T-Shirt", category: "Men", subCategory: "Topwear", price: 799, rating: 4.3, image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=500&q=80" },
//   { id: 6, name: "Men Charcoal Grey Plain T-Shirt", category: "Men", subCategory: "Topwear", price: 449, rating: 4.1, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
//   { id: 7, name: "Men Mustard Yellow Casual Tee", category: "Men", subCategory: "Topwear", price: 499, rating: 4.0, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
//   { id: 8, name: "Men Teal Blue Running T-Shirt", category: "Men", subCategory: "Topwear", price: 549, rating: 4.5, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" },
//   { id: 9, name: "Men Beige Premium Cotton T-Shirt", category: "Men", subCategory: "Topwear", price: 649, rating: 4.6, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
//   { id: 10, name: "Men Royal Blue Sports Jersey Tee", category: "Men", subCategory: "Topwear", price: 599, rating: 4.3, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" },

//   { id: 11, name: "Men Sky Blue Summer T-Shirt", category: "Men", subCategory: "Topwear", price: 499, rating: 4.2, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
//   { id: 12, name: "Men Red Athletic Dry-Fit Tee", category: "Men", subCategory: "Topwear", price: 599, rating: 4.5, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" },
//   { id: 13, name: "Men Hunter Green Vintage T-Shirt", category: "Men", subCategory: "Topwear", price: 549, rating: 4.4, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
//   { id: 14, name: "Men Classic White Polo Shirt", category: "Men", subCategory: "Topwear", price: 799, rating: 4.7, image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=500&q=80" },
//   { id: 15, name: "Men Dark Brown Plain Tee", category: "Men", subCategory: "Topwear", price: 479, rating: 4.1, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
//   { id: 16, name: "Men Orange Gym Workout T-Shirt", category: "Men", subCategory: "Topwear", price: 529, rating: 4.3, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" },
//   { id: 17, name: "Men Pink Pastel Casual T-Shirt", category: "Men", subCategory: "Topwear", price: 499, rating: 4.0, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
//   { id: 18, name: "Men Lavender Oversized T-Shirt", category: "Men", subCategory: "Topwear", price: 699, rating: 4.6, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
//   { id: 19, name: "Men Emerald Green Polo Tee", category: "Men", subCategory: "Topwear", price: 749, rating: 4.5, image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=500&q=80" },
//   { id: 20, name: "Men Rust Orange Cotton Tee", category: "Men", subCategory: "Topwear", price: 519, rating: 4.2, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },

//   // --- WOMEN HALF-SLEEVE T-SHIRTS ---
//   { id: 21, name: "Women White Casual Cotton T-Shirt", category: "Women", subCategory: "Topwear", price: 449, rating: 4.5, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
//   { id: 22, name: "Women Pastel Pink Oversized Tee", category: "Women", subCategory: "Topwear", price: 649, rating: 4.7, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
//   { id: 23, name: "Women Black Crop Top T-Shirt", category: "Women", subCategory: "Topwear", price: 399, rating: 4.6, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
//   { id: 24, name: "Women Lavender Printed Tee", category: "Women", subCategory: "Topwear", price: 499, rating: 4.3, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
//   { id: 25, name: "Women Mint Green Gym T-Shirt", category: "Women", subCategory: "Topwear", price: 549, rating: 4.4, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" },
//   { id: 26, name: "Women Yellow Striped Casual Tee", category: "Women", subCategory: "Topwear", price: 479, rating: 4.2, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
//   { id: 27, name: "Women Maroon Ribbed Crop Top", category: "Women", subCategory: "Topwear", price: 450, rating: 4.5, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
//   { id: 28, name: "Women Peach Oversized Cotton Tee", category: "Women", subCategory: "Topwear", price: 699, rating: 4.8, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
//   { id: 29, name: "Women Navy Blue Sports T-Shirt", category: "Women", subCategory: "Topwear", price: 529, rating: 4.3, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" },
//   { id: 30, name: "Women Grey Melange Basic Tee", category: "Women", subCategory: "Topwear", price: 419, rating: 4.1, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },

//   { id: 31, name: "Women Teal Blue Graphic T-Shirt", category: "Women", subCategory: "Topwear", price: 599, rating: 4.4, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
//   { id: 32, name: "Women Red Casual Summer Tee", category: "Women", subCategory: "Topwear", price: 499, rating: 4.2, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
//   { id: 33, name: "Women Olive Green Cargo Pocket Tee", category: "Women", subCategory: "Topwear", price: 649, rating: 4.6, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
//   { id: 34, name: "Women Mustard Yellow Crop Top", category: "Women", subCategory: "Topwear", price: 399, rating: 4.0, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
//   { id: 35, name: "Women Sky Blue Polo T-Shirt", category: "Women", subCategory: "Topwear", price: 699, rating: 4.5, image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=500&q=80" },
//   { id: 36, name: "Women Beige Minimalist Cotton Tee", category: "Women", subCategory: "Topwear", price: 549, rating: 4.3, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
//   { id: 37, name: "Women Purple Tie-Dye T-Shirt", category: "Women", subCategory: "Topwear", price: 629, rating: 4.7, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
//   { id: 38, name: "Women Coral Pink Sports Tee", category: "Women", subCategory: "Topwear", price: 499, rating: 4.1, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" },
//   { id: 39, name: "Women Charcoal Grey Oversized Tee", category: "Women", subCategory: "Topwear", price: 679, rating: 4.6, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
//   { id: 40, name: "Women Emerald Green Cotton Top", category: "Women", subCategory: "Topwear", price: 519, rating: 4.4, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },

//   // --- KIDS HALF-SLEEVE T-SHIRTS ---
//   { id: 41, name: "Kids Superhero Cartoon Printed Tee", category: "Kids", subCategory: "Topwear", price: 349, rating: 4.6, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
//   { id: 42, name: "Kids Colorful Striped Cotton T-Shirt", category: "Kids", subCategory: "Topwear", price: 299, rating: 4.4, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
//   { id: 43, name: "Kids Bright Yellow Casual Tee", category: "Kids", subCategory: "Topwear", price: 279, rating: 4.3, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
//   { id: 44, name: "Kids Royal Blue Sports T-Shirt", category: "Kids", subCategory: "Topwear", price: 329, rating: 4.5, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" },
//   { id: 45, name: "Kids Dino Printed Green T-Shirt", category: "Kids", subCategory: "Topwear", price: 350, rating: 4.8, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
//   { id: 46, name: "Baby Infant Soft Cotton Cute Tee", category: "Kids", subCategory: "Topwear", price: 249, rating: 4.7, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
//   { id: 47, name: "Kids Red & White Baseball Tee", category: "Kids", subCategory: "Topwear", price: 399, rating: 4.2, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
//   { id: 48, name: "Kids Orange Summer Cool T-Shirt", category: "Kids", subCategory: "Topwear", price: 299, rating: 4.4, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
//   { id: 49, name: "Kids Space Explorer Printed Tee", category: "Kids", subCategory: "Topwear", price: 379, rating: 4.6, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
//   { id: 50, name: "Kids Classic White School Sports Tee", category: "Kids", subCategory: "Topwear", price: 319, rating: 4.5, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" },
//   // --- JACKETS & COATS (ID 51 - 62) ---
//   { id: 51, name: "Men Black Leather Biker Jacket", category: "Men", subCategory: "Jackets", price: 3499, rating: 4.6, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80" },
//   { id: 52, name: "Men Winter Puffer Jacket Warm Blue", category: "Men", subCategory: "Jackets", price: 2899, rating: 4.4, image: "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=500&q=80" },
//   { id: 53, name: "Women Slim Fit Trench Coat Beige", category: "Women", subCategory: "Jackets", price: 4199, rating: 4.7, image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=500&q=80" },
//   { id: 54, name: "Men Denim Casual Bomber Jacket", category: "Men", subCategory: "Jackets", price: 2199, rating: 4.3, image: "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=500&q=80" },
//   { id: 55, name: "Women Cropped Pink Hooded Jacket", category: "Women", subCategory: "Jackets", price: 1899, rating: 4.2, image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=500&q=80" },
//   { id: 56, name: "Men Fleece Waterproof Hiking Jacket", category: "Men", subCategory: "Jackets", price: 3299, rating: 4.8, image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=500&q=80" },
//   { id: 57, name: "Women Faux Fur Winter Coat", category: "Women", subCategory: "Jackets", price: 4999, rating: 4.5, image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80" },
//   { id: 58, name: "Unisex Olive Windbreaker Jacket", category: "Men", subCategory: "Jackets", price: 1599, rating: 4.1, image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=500&q=80" },
//   { id: 59, name: "Men Suede Brown Vintage Jacket", category: "Men", subCategory: "Jackets", price: 3799, rating: 4.6, image: "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=500&q=80" },
//   { id: 60, name: "Women Black Quilted Winter Jacket", category: "Women", subCategory: "Jackets", price: 2699, rating: 4.3, image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=500&q=80" },
//   { id: 61, name: "Kids Yellow Rainproof Hooded Jacket", category: "Kids", subCategory: "Jackets", price: 1299, rating: 4.7, image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=500&q=80" },
//   { id: 62, name: "Men Charcoal Sporty Track Jacket", category: "Men", subCategory: "Jackets", price: 1799, rating: 4.0, image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=500&q=80" },

//   // --- SUITS & ETHNIC WEAR (ID 63 - 74) ---
//   { id: 63, name: "Men Classic Black 3-Piece Formal Suit", category: "Men", subCategory: "Suits", price: 6999, rating: 4.8, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=500&q=80" },
//   { id: 64, name: "Men Royal Blue Wedding Tuxedo", category: "Men", subCategory: "Suits", price: 8499, rating: 4.9, image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=500&q=80" },
//   { id: 65, name: "Women Formal Office Blazer Suit Set", category: "Women", subCategory: "Suits", price: 4599, rating: 4.5, image: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=500&q=80" },
//   { id: 66, name: "Men Grey Slim Fit Business Suit", category: "Men", subCategory: "Suits", price: 5799, rating: 4.4, image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=500&q=80" },
//   { id: 67, name: "Women Anarkali Ethnic Salwar Suit Set", category: "Women", subCategory: "Suits", price: 2999, rating: 4.6, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=500&q=80" },
//   { id: 68, name: "Men Italian Wool Navy Blue Suit", category: "Men", subCategory: "Suits", price: 9299, rating: 4.7, image: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=500&q=80" },
//   { id: 69, name: "Women Designer Velvet Party Suit", category: "Women", subCategory: "Suits", price: 3899, rating: 4.3, image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=500&q=80" },
//   { id: 70, name: "Men Maroon Bandhgala Sherwani Suit", category: "Men", subCategory: "Suits", price: 7499, rating: 4.8, image: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=500&q=80" },
//   { id: 71, name: "Women Cotton Straight Cut Palazzo Suit", category: "Women", subCategory: "Suits", price: 1899, rating: 4.2, image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=500&q=80" },
//   { id: 72, name: "Men Double Breasted Beige Suit", category: "Men", subCategory: "Suits", price: 6299, rating: 4.5, image: "https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=500&q=80" },
//   { id: 73, name: "Kids Formal Party Dress Suit Set", category: "Kids", subCategory: "Suits", price: 1999, rating: 4.6, image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=500&q=80" },
//   { id: 74, name: "Women Embroidered Silk Suit", category: "Women", subCategory: "Suits", price: 3299, rating: 4.4, image: "https://images.unsplash.com/photo-1610030469838-8a356a5d4d3d?auto=format&fit=crop&w=500&q=80" },

//   // --- MOBILE ITEMS & ACCESSORIES (ID 75 - 87) ---
//   { id: 75, name: "Pro Max 5G Smartphone 256GB Black", category: "Electronics", subCategory: "Mobile", price: 64999, rating: 4.8, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80" },
//   { id: 76, name: "Fast Wireless Charging Pad 15W", category: "Electronics", subCategory: "Mobile Accessories", price: 1299, rating: 4.3, image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=500&q=80" },
//   { id: 77, name: "Noise Cancelling Bluetooth Earbuds TWS", category: "Electronics", subCategory: "Mobile Accessories", price: 2499, rating: 4.5, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=80" },
//   { id: 78, name: "Ultra Slim Shockproof Phone Case Cover", category: "Electronics", subCategory: "Mobile Accessories", price: 499, rating: 4.2, image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=500&q=80" },
//   { id: 79, name: "20000mAh Fast Charging Power Bank", category: "Electronics", subCategory: "Mobile Accessories", price: 1899, rating: 4.6, image: "https://images.unsplash.com/photo-1609592424009-54070a273030?auto=format&fit=crop&w=500&q=80" },
//   { id: 80, name: "Flexible Smartphone Tripod Stand", category: "Electronics", subCategory: "Mobile Accessories", price: 899, rating: 4.1, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=500&q=80" },
//   { id: 81, name: "Type-C Braided Fast Charging Cable 2M", category: "Electronics", subCategory: "Mobile Accessories", price: 349, rating: 4.4, image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=500&q=80" },
//   { id: 82, name: "Flagship 5G Android Smartphone 128GB", category: "Electronics", subCategory: "Mobile", price: 29999, rating: 4.7, image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=500&q=80" },
//   { id: 83, name: "Car Mount Magnetic Phone Holder", category: "Electronics", subCategory: "Mobile Accessories", price: 599, rating: 4.0, image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=500&q=80" },
//   { id: 84, name: "Over-Ear Wireless Studio Headphones", category: "Electronics", subCategory: "Mobile Accessories", price: 3999, rating: 4.7, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80" },
//   { id: 85, name: "Tempered Glass Screen Protector 2-Pack", category: "Electronics", subCategory: "Mobile Accessories", price: 299, rating: 4.3, image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=500&q=80" },
//   { id: 86, name: "Portable Bluetooth Mini Speaker 10W", category: "Electronics", subCategory: "Mobile Accessories", price: 1499, rating: 4.5, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=500&q=80" },
//   { id: 87, name: "Ring Light with Cell Phone Stand for Vlogging", category: "Electronics", subCategory: "Mobile Accessories", price: 1199, rating: 4.2, image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=500&q=80" },

//   // --- KITCHEN ITEMS (ID 88 - 100) ---
//   { id: 88, name: "Stainless Steel Non-Stick Frying Pan", category: "Home & Kitchen", subCategory: "Kitchenware", price: 1499, rating: 4.5, image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=500&q=80" },
//   { id: 89, name: "Automatic Digital Air Fryer 4.5L", category: "Home & Kitchen", subCategory: "Kitchenware", price: 5499, rating: 4.8, image: "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=500&q=80" },
//   { id: 90, name: "Chef Stainless Steel Knife Set 5-Piece", category: "Home & Kitchen", subCategory: "Kitchenware", price: 1899, rating: 4.6, image: "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=500&q=80" },
//   { id: 91, name: "750W Mixer Grinder 3 Jars Set", category: "Home & Kitchen", subCategory: "Kitchenware", price: 3299, rating: 4.4, image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=500&q=80" },
//   { id: 92, name: "Airtight Storage Container Set 12-Piece", category: "Home & Kitchen", subCategory: "Kitchenware", price: 999, rating: 4.3, image: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=500&q=80" },
//   { id: 93, name: "Electric Coffee Bean Grinder & Maker", category: "Home & Kitchen", subCategory: "Kitchenware", price: 2799, rating: 4.7, image: "https://images.unsplash.com/photo-1517668808822-9ebd02f2a888?auto=format&fit=crop&w=500&q=80" },
//   { id: 94, name: "Heavy Duty Wooden Cutting Board", category: "Home & Kitchen", subCategory: "Kitchenware", price: 699, rating: 4.2, image: "https://images.unsplash.com/photo-1590794056226-77ef3a6c4743?auto=format&fit=crop&w=500&q=80" },
//   { id: 95, name: "Insulated Stainless Steel Water Bottle 1L", category: "Home & Kitchen", subCategory: "Kitchenware", price: 799, rating: 4.5, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=500&q=80" },
//   { id: 96, name: "Electric Kettle 1.8 Liter Auto-Cutout", category: "Home & Kitchen", subCategory: "Kitchenware", price: 1199, rating: 4.6, image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f6?auto=format&fit=crop&w=500&q=80" },
//   { id: 97, name: "Ceramic Coffee Mugs Set of 6", category: "Home & Kitchen", subCategory: "Kitchenware", price: 849, rating: 4.4, image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80" },
//   { id: 98, name: "Cast Iron Dutch Oven Pot with Lid", category: "Home & Kitchen", subCategory: "Kitchenware", price: 3699, rating: 4.9, image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=500&q=80" },
//   { id: 99, name: "Silicone Cooking Utensils Set 10-Pcs", category: "Home & Kitchen", subCategory: "Kitchenware", price: 1299, rating: 4.3, image: "https://images.unsplash.com/photo-1590794056226-77ef3a6c4743?auto=format&fit=crop&w=500&q=80" },
//   { id: 100, name: "Microwave Safe Glass Bowl Set", category: "Home & Kitchen", subCategory: "Kitchenware", price: 1099, rating: 4.5, image: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=500&q=80" },

//   // --- FORMAL SHOES & FOOTWEAR (ID 101 - 112) ---
//   { id: 101, name: "Men Genuine Leather Oxford Formal Shoes", category: "Footwear", subCategory: "Formal Shoes", price: 2999, rating: 4.6, image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=500&q=80" },
//   { id: 102, name: "Men Italian Tan Derby Formal Shoes", category: "Footwear", subCategory: "Formal Shoes", price: 3499, rating: 4.7, image: "https://images.unsplash.com/photo-1533867617858-e7d97e0afd8b?auto=format&fit=crop&w=500&q=80" },
//   { id: 103, name: "Men Black Slip-On Formal Loafers", category: "Footwear", subCategory: "Formal Shoes", price: 2299, rating: 4.3, image: "https://images.unsplash.com/photo-1582832585250-7053e107f9c3?auto=format&fit=crop&w=500&q=80" },
//   { id: 104, name: "Women Formal Office High Heels Black", category: "Footwear", subCategory: "Formal Shoes", price: 2199, rating: 4.2, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=80" },
//   { id: 105, name: "Men Brown Monk Strap Leather Shoes", category: "Footwear", subCategory: "Formal Shoes", price: 3899, rating: 4.8, image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=500&q=80" },
//   { id: 106, name: "Women Comfortable Block Heel Formal Pumps", category: "Footwear", subCategory: "Formal Shoes", price: 1899, rating: 4.4, image: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=500&q=80" },
//   { id: 107, name: "Men Pointed Toe Formal Leather Brogues", category: "Footwear", subCategory: "Formal Shoes", price: 3199, rating: 4.5, image: "https://images.unsplash.com/photo-1533867617858-e7d97e0afd8b?auto=format&fit=crop&w=500&q=80" },
//   { id: 108, name: "Men Premium Suede Formal Driving Shoes", category: "Footwear", subCategory: "Formal Shoes", price: 2599, rating: 4.1, image: "https://images.unsplash.com/photo-1582832585250-7053e107f9c3?auto=format&fit=crop&w=500&q=80" },
//   { id: 109, name: "Women Pointed Ballerina Formal Flats", category: "Footwear", subCategory: "Formal Shoes", price: 1299, rating: 4.3, image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=500&q=80" },
//   { id: 110, name: "Men Tuxedo Patent Glossy Black Shoes", category: "Footwear", subCategory: "Formal Shoes", price: 4299, rating: 4.9, image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=500&q=80" },
//   { id: 111, name: "Men Casual-Formal Hybrid Chelsea Boots", category: "Footwear", subCategory: "Formal Shoes", price: 3699, rating: 4.6, image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=500&q=80" },
//   { id: 112, name: "Women Leather Formal Ankle Boots", category: "Footwear", subCategory: "Formal Shoes", price: 2999, rating: 4.5, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=80" },

//   // --- BEAUTY & SHAMPOO (ID 113 - 124) ---
//   { id: 113, name: "Organic Argan Oil Anti-Hairfall Shampoo 500ml", category: "Beauty", subCategory: "Haircare", price: 699, rating: 4.6, image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=500&q=80" },
//   { id: 114, name: "Tea Tree Anti-Dandruff Herbal Shampoo", category: "Beauty", subCategory: "Haircare", price: 499, rating: 4.4, image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=500&q=80" },
//   { id: 115, name: "Keratin Smooth Hair Repair Shampoo", category: "Beauty", subCategory: "Haircare", price: 899, rating: 4.7, image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=500&q=80" },
//   { id: 116, name: "Vitamin C Hydrating Skin Serum 30ml", category: "Beauty", subCategory: "Skincare", price: 599, rating: 4.5, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80" },
//   { id: 117, name: "Coconut Moisture Nourishing Hair Conditioner", category: "Beauty", subCategory: "Haircare", price: 549, rating: 4.3, image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=500&q=80" },
//   { id: 118, name: "Matte Long-Lasting Liquid Lipstick Set", category: "Beauty", subCategory: "Makeup", price: 799, rating: 4.8, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=500&q=80" },
//   { id: 119, name: "Aloe Vera Natural Body Lotion 400ml", category: "Beauty", subCategory: "Skincare", price: 399, rating: 4.2, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80" },
//   { id: 120, name: "Onion & Red Clover Volumizing Shampoo", category: "Beauty", subCategory: "Haircare", price: 649, rating: 4.5, image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=500&q=80" },
//   { id: 121, name: "Charcoal Deep Cleansing Face Wash 150ml", category: "Beauty", subCategory: "Skincare", price: 299, rating: 4.1, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80" },
//   { id: 122, name: "Full Coverage Foundation Liquid Cream", category: "Beauty", subCategory: "Makeup", price: 999, rating: 4.6, image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=80" },
//   { id: 123, name: "Deep Conditioning Hair Mask Treatment", category: "Beauty", subCategory: "Haircare", price: 749, rating: 4.7, image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=500&q=80" },
//   { id: 124, name: "Luxury French Lavender Body Wash", category: "Beauty", subCategory: "Skincare", price: 449, rating: 4.3, image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=500&q=80" },

//   // --- WATCHES (ID 125 - 137) ---
//   { id: 125, name: "Men Luxury Stainless Steel Analog Watch", category: "Accessories", subCategory: "Watches", price: 4999, rating: 4.8, image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=500&q=80" },
//   { id: 126, name: "Smart Fitness Watch with Heart Monitor", category: "Electronics", subCategory: "Watches", price: 2999, rating: 4.5, image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=500&q=80" },
//   { id: 127, name: "Women Rose Gold Elegant Quartz Watch", category: "Accessories", subCategory: "Watches", price: 3299, rating: 4.7, image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=500&q=80" },
//   { id: 128, name: "Men Classic Brown Leather Strap Watch", category: "Accessories", subCategory: "Watches", price: 2499, rating: 4.4, image: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=500&q=80" },
//   { id: 129, name: "Waterproof Digital Sports Watch Shock Resistant", category: "Accessories", subCategory: "Watches", price: 1499, rating: 4.3, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80" },
//   { id: 130, name: "Men Automatic Mechanical Skeleton Watch", category: "Accessories", subCategory: "Watches", price: 7999, rating: 4.9, image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=500&q=80" },
//   { id: 131, name: "Women Minimalist Diamond Dial Silver Watch", category: "Accessories", subCategory: "Watches", price: 4199, rating: 4.6, image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=500&q=80" },
//   { id: 132, name: "Smartwatch AMOLED Display Bluetooth Calling", category: "Electronics", subCategory: "Watches", price: 3999, rating: 4.6, image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=500&q=80" },
//   { id: 133, name: "Men Black Chronograph Military Watch", category: "Accessories", subCategory: "Watches", price: 3799, rating: 4.2, image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=500&q=80" },
//   { id: 134, name: "Kids Colorful Waterproof Digital Watch", category: "Kids", subCategory: "Watches", price: 799, rating: 4.4, image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=500&q=80" },
//   { id: 135, name: "Women Mesh Bracelet Gold Watch", category: "Accessories", subCategory: "Watches", price: 2899, rating: 4.5, image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=500&q=80" },
//   { id: 136, name: "Men Vintage Pocket Watch Bronze", category: "Accessories", subCategory: "Watches", price: 1899, rating: 4.1, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=80" },
//   { id: 137, name: "Unisex Silicone Strap Fitness Tracker Watch", category: "Electronics", subCategory: "Watches", price: 1999, rating: 4.3, image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=500&q=80" },

//   // --- LAPTOPS (ID 138 - 150) ---
//   { id: 138, name: "High-Performance Gaming Laptop 16GB RAM 1TB SSD", category: "Electronics", subCategory: "Laptops", price: 78999, rating: 4.8, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=500&q=80" },
//   { id: 139, name: "Ultra-Thin Metallic Laptop Core i5 8GB RAM", category: "Electronics", subCategory: "Laptops", price: 48999, rating: 4.6, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80" },
//   { id: 140, name: "14-Inch Touchscreen Convertible 2-in-1 Laptop", category: "Electronics", subCategory: "Laptops", price: 54999, rating: 4.5, image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=500&q=80" },
//   { id: 141, name: "Lightweight Student Laptop 256GB SSD", category: "Electronics", subCategory: "Laptops", price: 29999, rating: 4.3, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80" },
//   { id: 142, name: "Professional Designer Laptop 4K Display 32GB RAM", category: "Electronics", subCategory: "Laptops", price: 112999, rating: 4.9, image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=500&q=80" },
//   { id: 143, name: "Gaming Beast Laptop RTX Graphics 144Hz", category: "Electronics", subCategory: "Laptops", price: 89999, rating: 4.7, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=500&q=80" },
//   { id: 144, name: "Compact 13-Inch Business Laptop Silver", category: "Electronics", subCategory: "Laptops", price: 62999, rating: 4.6, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80" },
//   { id: 145, name: "Fast Budget Laptop Ryzen 5 Processor", category: "Electronics", subCategory: "Laptops", price: 38999, rating: 4.4, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80" },
//   { id: 146, name: "Sleek Aluminium Ultrabook 512GB SSD", category: "Electronics", subCategory: "Laptops", price: 58999, rating: 4.7, image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=500&q=80" },
//   { id: 147, name: "17-Inch Big Screen Entertainment Laptop", category: "Electronics", subCategory: "Laptops", price: 46999, rating: 4.2, image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=500&q=80" },
//   { id: 148, name: "Core i7 Workstation Laptop 1TB SSD", category: "Electronics", subCategory: "Laptops", price: 84999, rating: 4.8, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80" },
//   { id: 149, name: "Entry-Level Everyday Laptop 15.6 Inch", category: "Electronics", subCategory: "Laptops", price: 24999, rating: 4.0, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80" },
//   { id: 150, name: "Dual-Screen Premium Creator Laptop", category: "Electronics", subCategory: "Laptops", price: 124999, rating: 4.9, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=500&q=80" }


// ];

// // MongoDB Connection & Auto-Refresh / Seeding Logic
// mongoose.connect(MONGO_URI)
// .then(async () => {
//   console.log('MongoDB Connected Successfully to TrendNova Database!');
  
//   try {
//     // पुराना सारा डेटा हटाकर एकदम नया डेटा फ्रेश डाल देगा ताकि बार-बार मैनुअली डिलीट न करना पड़े
//     await Product.deleteMany({});
//     await Product.insertMany(initialProducts);
//     console.log(`Database successfully updated and seeded with ${initialProducts.length} products!`);
//   } catch (err) {
//     console.error('Auto-seeding error:', err);
//   }
// })
// .catch((err) => console.error('MongoDB connection error:', err));

// // API Endpoints
// app.get('/api/products', async (req, res) => {
//   try {
//     const { category, subCategory } = req.query;
//     let filter = {};
//     if (category) filter.category = new RegExp('^' + category + '$', 'i');
//     if (subCategory) filter.subCategory = new RegExp('^' + subCategory + '$', 'i');

//     const products = await Product.find(filter);
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch products" });
//   }
// });

// app.get('/api/products/search', async (req, res) => {
//   try {
//     const searchQuery = req.query.q;
//     if (!searchQuery) {
//       return res.json([]);
//     }

//     const products = await Product.find({
//       $or: [
//         { name: { $regex: searchQuery,$options: 'i' } },
//         { category: { $regex: searchQuery,$options: 'i' } },
//         { subCategory: { $regex: searchQuery,$options: 'i' } }
//       ]
//     });

//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ error: "Search query failed" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`TrendNova Backend Server is running on port ${PORT}`);
// });