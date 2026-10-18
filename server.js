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
  res.send('TrendNova API is running successfully with Massive 1200+ Products Database!');
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

// Categories & Extensive Subcategories & Names Pool
const categories = ["Men", "Women", "Kids", "Footwear", "Beauty", "Home & Kitchen"];

const subCategoriesMap = {
  "Men": ["Topwear", "Bottomwear", "Winterwear", "Ethnic", "Sportswear"],
  "Women": ["Topwear", "Bottomwear", "Ethnic", "Western Dress", "Lingerie"],
  "Kids": ["Topwear", "Bottomwear", "Ethnic", "Toys", "Winterwear"],
  "Footwear": ["Casual Shoes", "Sports Shoes", "Formal Shoes", "Sandals", "Flip Flops"],
  "Beauty": ["Skincare", "Makeup", "Haircare", "Fragrance", "Bath & Body"],
  "Home & Kitchen": ["Decor", "Kitchenware", "Bedding", "Lighting", "Storage & Organization"]
};

// Variety of Adjectives & Base Names for Massive Unique Combinations
const nameAdjectives = [
  "Premium", "Classic", "Modern", "Stylish", "Luxury", "Designer", "Casual", "Comfortable", 
  "Trendy", "Elegant", "Vibrant", "Soft", "Durable", "Handcrafted", "Exquisite", "Royal", 
  "Urban", "Vintage", "Minimalist", "Heavy-Duty", "Glossy", "Matte", "Organic", "Pure"
];

const imagePool = {
  "Topwear": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80",
  "Bottomwear": "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80",
  "Winterwear": "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=500&q=80",
  "Ethnic": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=500&q=80",
  "Sportswear": "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80",
  "Western Dress": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=500&q=80",
  "Lingerie": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=500&q=80",
  "Toys": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80",
  "Casual Shoes": "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=500&q=80",
  "Sports Shoes": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80",
  "Formal Shoes": "https://images.unsplash.com/photo-1533867617858-e7d97e0afd8b?auto=format&fit=crop&w=500&q=80",
  "Sandals": "https://images.unsplash.com/photo-1603808033192-082d6939d3e1?auto=format&fit=crop&w=500&q=80",
  "Flip Flops": "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=500&q=80",
  "Skincare": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80",
  "Makeup": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=80",
  "Haircare": "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=500&q=80",
  "Fragrance": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=500&q=80",
  "Bath & Body": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=500&q=80",
  "Decor": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=500&q=80",
  "Kitchenware": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=500&q=80",
  "Bedding": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=500&q=80",
  "Lighting": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=500&q=80",
  "Storage & Organization": "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=500&q=80"
};

let allProducts = [];
let generatedId = 1;

// Generating massive dataset (1200+ Products: ~200 items per category)
categories.forEach(cat => {
  const subCats = subCategoriesMap[cat];
  subCats.forEach(subCat => {
    // 45 items per subcategory * 5 subcategories * 6 categories = ~1350 products!
    for (let i = 1; i <= 45; i++) {
      const adj = nameAdjectives[(generatedId + i) % nameAdjectives.length];
      const productName = `${cat} ${adj} ${subCat} Model-${generatedId}`;
      const priceVal = Math.floor(Math.random() * 3500) + 199;
      const ratingVal = +(Math.random() * (5.0 - 4.0) + 4.0).toFixed(1);
      
      allProducts.push({
        id: generatedId,
        name: productName,
        category: cat,
        subCategory: subCat,
        price: priceVal,
        rating: ratingVal,
        image: imagePool[subCat] || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80",
        inStock: true
      });
      generatedId++;
    }
  });
});

// MongoDB Connection & Auto-Seeding Logic
mongoose.connect(MONGO_URI)
.then(async () => {
  console.log('MongoDB Connected Successfully to TrendNova Database!');
  
  try {
    await Product.deleteMany({});
    await Product.insertMany(allProducts);
    console.log(`Boom! Database successfully loaded with massive ${allProducts.length} unique products!`);
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
});{/*import express from 'express';
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
  { id: 50, name: "Kids Fleece Lined Winter Pants", category: "Kids", subCategory: "Bottomwear", price: 849, rating: 4.7, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" },
  // --- MEN HALF-SLEEVE T-SHIRTS ---
  { id: 1, name: "Men Solid Black Cotton T-Shirt", category: "Men", subCategory: "Topwear", price: 499, rating: 4.4, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 2, name: "Men Navy Blue Casual T-Shirt", category: "Men", subCategory: "Topwear", price: 449, rating: 4.2, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
  { id: 3, name: "Men Olive Green Gym T-Shirt", category: "Men", subCategory: "Topwear", price: 599, rating: 4.6, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" },
  { id: 4, name: "Men White Oversized Graphic Tee", category: "Men", subCategory: "Topwear", price: 699, rating: 4.7, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 5, name: "Men Maroon Striped Polo T-Shirt", category: "Men", subCategory: "Topwear", price: 799, rating: 4.3, image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=500&q=80" },
  { id: 6, name: "Men Charcoal Grey Plain T-Shirt", category: "Men", subCategory: "Topwear", price: 449, rating: 4.1, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 7, name: "Men Mustard Yellow Casual Tee", category: "Men", subCategory: "Topwear", price: 499, rating: 4.0, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
  { id: 8, name: "Men Teal Blue Running T-Shirt", category: "Men", subCategory: "Topwear", price: 549, rating: 4.5, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" },
  { id: 9, name: "Men Beige Premium Cotton T-Shirt", category: "Men", subCategory: "Topwear", price: 649, rating: 4.6, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 10, name: "Men Royal Blue Sports Jersey Tee", category: "Men", subCategory: "Topwear", price: 599, rating: 4.3, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" },

  { id: 11, name: "Men Sky Blue Summer T-Shirt", category: "Men", subCategory: "Topwear", price: 499, rating: 4.2, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
  { id: 12, name: "Men Red Athletic Dry-Fit Tee", category: "Men", subCategory: "Topwear", price: 599, rating: 4.5, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" },
  { id: 13, name: "Men Hunter Green Vintage T-Shirt", category: "Men", subCategory: "Topwear", price: 549, rating: 4.4, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 14, name: "Men Classic White Polo Shirt", category: "Men", subCategory: "Topwear", price: 799, rating: 4.7, image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=500&q=80" },
  { id: 15, name: "Men Dark Brown Plain Tee", category: "Men", subCategory: "Topwear", price: 479, rating: 4.1, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 16, name: "Men Orange Gym Workout T-Shirt", category: "Men", subCategory: "Topwear", price: 529, rating: 4.3, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" },
  { id: 17, name: "Men Pink Pastel Casual T-Shirt", category: "Men", subCategory: "Topwear", price: 499, rating: 4.0, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
  { id: 18, name: "Men Lavender Oversized T-Shirt", category: "Men", subCategory: "Topwear", price: 699, rating: 4.6, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 19, name: "Men Emerald Green Polo Tee", category: "Men", subCategory: "Topwear", price: 749, rating: 4.5, image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=500&q=80" },
  { id: 20, name: "Men Rust Orange Cotton Tee", category: "Men", subCategory: "Topwear", price: 519, rating: 4.2, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },

  // --- WOMEN HALF-SLEEVE T-SHIRTS ---
  { id: 21, name: "Women White Casual Cotton T-Shirt", category: "Women", subCategory: "Topwear", price: 449, rating: 4.5, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 22, name: "Women Pastel Pink Oversized Tee", category: "Women", subCategory: "Topwear", price: 649, rating: 4.7, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
  { id: 23, name: "Women Black Crop Top T-Shirt", category: "Women", subCategory: "Topwear", price: 399, rating: 4.6, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 24, name: "Women Lavender Printed Tee", category: "Women", subCategory: "Topwear", price: 499, rating: 4.3, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
  { id: 25, name: "Women Mint Green Gym T-Shirt", category: "Women", subCategory: "Topwear", price: 549, rating: 4.4, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" },
  { id: 26, name: "Women Yellow Striped Casual Tee", category: "Women", subCategory: "Topwear", price: 479, rating: 4.2, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 27, name: "Women Maroon Ribbed Crop Top", category: "Women", subCategory: "Topwear", price: 450, rating: 4.5, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
  { id: 28, name: "Women Peach Oversized Cotton Tee", category: "Women", subCategory: "Topwear", price: 699, rating: 4.8, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 29, name: "Women Navy Blue Sports T-Shirt", category: "Women", subCategory: "Topwear", price: 529, rating: 4.3, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" },
  { id: 30, name: "Women Grey Melange Basic Tee", category: "Women", subCategory: "Topwear", price: 419, rating: 4.1, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },

  { id: 31, name: "Women Teal Blue Graphic T-Shirt", category: "Women", subCategory: "Topwear", price: 599, rating: 4.4, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 32, name: "Women Red Casual Summer Tee", category: "Women", subCategory: "Topwear", price: 499, rating: 4.2, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
  { id: 33, name: "Women Olive Green Cargo Pocket Tee", category: "Women", subCategory: "Topwear", price: 649, rating: 4.6, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 34, name: "Women Mustard Yellow Crop Top", category: "Women", subCategory: "Topwear", price: 399, rating: 4.0, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
  { id: 35, name: "Women Sky Blue Polo T-Shirt", category: "Women", subCategory: "Topwear", price: 699, rating: 4.5, image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=500&q=80" },
  { id: 36, name: "Women Beige Minimalist Cotton Tee", category: "Women", subCategory: "Topwear", price: 549, rating: 4.3, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 37, name: "Women Purple Tie-Dye T-Shirt", category: "Women", subCategory: "Topwear", price: 629, rating: 4.7, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
  { id: 38, name: "Women Coral Pink Sports Tee", category: "Women", subCategory: "Topwear", price: 499, rating: 4.1, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" },
  { id: 39, name: "Women Charcoal Grey Oversized Tee", category: "Women", subCategory: "Topwear", price: 679, rating: 4.6, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 40, name: "Women Emerald Green Cotton Top", category: "Women", subCategory: "Topwear", price: 519, rating: 4.4, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },

  // --- KIDS HALF-SLEEVE T-SHIRTS ---
  { id: 41, name: "Kids Superhero Cartoon Printed Tee", category: "Kids", subCategory: "Topwear", price: 349, rating: 4.6, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 42, name: "Kids Colorful Striped Cotton T-Shirt", category: "Kids", subCategory: "Topwear", price: 299, rating: 4.4, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
  { id: 43, name: "Kids Bright Yellow Casual Tee", category: "Kids", subCategory: "Topwear", price: 279, rating: 4.3, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 44, name: "Kids Royal Blue Sports T-Shirt", category: "Kids", subCategory: "Topwear", price: 329, rating: 4.5, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" },
  { id: 45, name: "Kids Dino Printed Green T-Shirt", category: "Kids", subCategory: "Topwear", price: 350, rating: 4.8, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 46, name: "Baby Infant Soft Cotton Cute Tee", category: "Kids", subCategory: "Topwear", price: 249, rating: 4.7, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
  { id: 47, name: "Kids Red & White Baseball Tee", category: "Kids", subCategory: "Topwear", price: 399, rating: 4.2, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 48, name: "Kids Orange Summer Cool T-Shirt", category: "Kids", subCategory: "Topwear", price: 299, rating: 4.4, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
  { id: 49, name: "Kids Space Explorer Printed Tee", category: "Kids", subCategory: "Topwear", price: 379, rating: 4.6, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 50, name: "Kids Classic White School Sports Tee", category: "Kids", subCategory: "Topwear", price: 319, rating: 4.5, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80" }

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
});*/}