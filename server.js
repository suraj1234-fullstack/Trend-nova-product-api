import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/trendnova';
app.get('/', (req, res) => {
  res.send('TrendNova API is running successfully!');
});

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

// Initial/Updated Products Data List
const initialProducts = [
  // --- MEN PANTS & JEANS ---
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
  { id: 50, name: "Kids Fleece Lined Winter Pants", category: "Kids", subCategory: "Bottomwear", price: 849, rating: 4.7, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" }
];

// MongoDB Connection & Auto-Refresh / Seeding Logic
mongoose.connect(MONGO_URI)
.then(async () => {
  console.log('MongoDB Connected Successfully to TrendNova Database!');
  
  try {
    // पुराना सारा डेटा हटाकर एकदम नया डेटा फ्रेश डाल देगा ताकि बार-बार मैनुअली डिलीट न करना पड़े
    await Product.deleteMany({});
    await Product.insertMany(initialProducts);
    console.log(`Database successfully updated and seeded with ${initialProducts.length} products!`);
  } catch (err) {
    console.error('Auto-seeding error:', err);
  }
})
.catch((err) => console.error('MongoDB connection error:', err));

// API Endpoints
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
        { name: { $regex: searchQuery,$options: 'i' } },
        { category: { $regex: searchQuery,$options: 'i' } },
        { subCategory: { $regex: searchQuery,$options: 'i' } }
      ]
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Search query failed" });
  }
});

app.listen(PORT, () => {
  console.log(`TrendNova Backend Server is running on port ${PORT}`);
});