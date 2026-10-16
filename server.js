import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. MongoDB Local Connection (Compass connection ke hisab se)
const MONGO_URI =  'mongodb://localhost:27017/trendnova';
app.get('/', (req, res) => {
  res.send('TrendNova API is running successfully!');
});

mongoose.connect(MONGO_URI)
.then(async () => {
  console.log('MongoDB Connected Successfully to TrendNova Database!');
  
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(initialProducts);
      console.log(`Database auto-created and seeded with ${initialProducts.length} products successfully!`);
    } else {
      console.log(`Database already has ${count} products.`);
    }
  } catch (err) {
    console.error('Auto-seeding error:', err);
  }
})
.catch((err) => console.error('MongoDB connection error:', err));

// 2. Product Schema & Model
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

// 3. Products Data List
const initialProducts = [
  // --- MEN ---
  { id: 1, name: "Men Cotton Casual Slim Fit Shirt", category: "Men", subCategory: "Topwear", price: 799, rating: 4.2, image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=500&q=80" },
  { id: 2, name: "Men Solid O-Neck Black T-Shirt", category: "Men", subCategory: "Topwear", price: 499, rating: 4.5, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { id: 3, name: "Men Classic Blue Denim Jeans", category: "Men", subCategory: "Bottomwear", price: 1299, rating: 4.3, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80" },
  { id: 4, name: "Men Formal Leather Belt", category: "Men", subCategory: "Belts", price: 599, rating: 4.0, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80" },
  { id: 5, name: "Men Chronograph Stainless Steel Watch", category: "Men", subCategory: "Watches", price: 2999, rating: 4.7, image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=500&q=80" },
  { id: 6, name: "Men Running Sports Shoes", category: "Men", subCategory: "Footwear", price: 1599, rating: 4.4, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80" },
  { id: 7, name: "Men Graphic Printed Oversized Tee", category: "Men", subCategory: "Topwear", price: 699, rating: 4.6, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80" },
  { id: 8, name: "Men Cargo Jogger Pants", category: "Men", subCategory: "Bottomwear", price: 999, rating: 4.2, image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=500&q=80" },
  { id: 9, name: "Men Minimalist Brown Leather Watch", category: "Men", subCategory: "Watches", price: 1899, rating: 4.3, image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=500&q=80" },
  { id: 10, name: "Men Formal Oxford Shoes", category: "Men", subCategory: "Footwear", price: 2199, rating: 4.5, image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=500&q=80" },

  // --- WOMEN ---
  { id: 11, name: "Women Floral Printed Kurta Set", category: "Women", subCategory: "Ethnic Wear", price: 1499, rating: 4.6, image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=500&q=80" },
  { id: 12, name: "Women Elegant Party Wear Gown", category: "Women", subCategory: "Western Wear", price: 2499, rating: 4.4, image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=500&q=80" },
  { id: 13, name: "Women Chic Stylish Handbag", category: "Women", subCategory: "Handbags", price: 1199, rating: 4.5, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80" },
  { id: 14, name: "Women Gold-Plated Kundan Earrings", category: "Women", subCategory: "Jewellery", price: 799, rating: 4.8, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=500&q=80" },
  { id: 15, name: "Women Casual Slip-On Sneakers", category: "Women", subCategory: "Footwear", price: 899, rating: 4.1, image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=500&q=80" },
  { id: 16, name: "Women High-Waist Skinny Jeans", category: "Women", subCategory: "Western Wear", price: 1199, rating: 4.3, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
  { id: 17, name: "Women Designer Potli Bag", category: "Women", subCategory: "Handbags", price: 599, rating: 4.2, image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=500&q=80" },
  { id: 18, name: "Women Block Heels Sandals", category: "Women", subCategory: "Footwear", price: 1399, rating: 4.4, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=80" },
  { id: 19, name: "Women Georgette Saree with Blouse", category: "Women", subCategory: "Ethnic Wear", price: 1999, rating: 4.7, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=500&q=80" },
  { id: 20, name: "Women Sterling Silver Bracelet", category: "Women", subCategory: "Jewellery", price: 999, rating: 4.6, image: "https://images.unsplash.com/photo-1611591483212-68b442d20396?auto=format&fit=crop&w=500&q=80" },

  // --- KIDS ---
  { id: 21, name: "Kids Cotton Superhero T-Shirt", category: "Kids", subCategory: "Boys Clothing", price: 399, rating: 4.5, image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=500&q=80" },
  { id: 22, name: "Kids Cute Frock with Bow", category: "Kids", subCategory: "Girls Clothing", price: 699, rating: 4.7, image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=500&q=80" },
  { id: 23, name: "Baby Soft Cotton Romper Set", category: "Kids", subCategory: "Infant Wear", price: 499, rating: 4.8, image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=500&q=80" },
  { id: 24, name: "Kids Waterproof School Backpack", category: "Kids", subCategory: "School Bags", price: 899, rating: 4.3, image: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=500&q=80" },
  { id: 25, name: "Kids Light-Up Running Shoes", category: "Kids", subCategory: "Footwear", price: 999, rating: 4.6, image: "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?auto=format&fit=crop&w=500&q=80" },
  { id: 26, name: "Educational Wooden Puzzle Toy", category: "Kids", subCategory: "Toys", price: 599, rating: 4.4, image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80" },
  { id: 27, name: "Kids Denim Shorts & Tee Combo", category: "Kids", subCategory: "Boys Clothing", price: 799, rating: 4.2, image: "https://images.unsplash.com/photo-1503944583220-74d8964b7c25?auto=format&fit=crop&w=500&q=80" },
  { id: 28, name: "Kids Party Wear Princess Dress", category: "Kids", subCategory: "Girls Clothing", price: 1199, rating: 4.7, image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=500&q=80" },
  { id: 29, name: "Remote Control Racing Car Toy", category: "Kids", subCategory: "Toys", price: 1299, rating: 4.5, image: "https://images.unsplash.com/photo-1594787318060-d843815c13fb?auto=format&fit=crop&w=500&q=80" },
  { id: 30, name: "Kids Casual Velcro Sneakers", category: "Kids", subCategory: "Footwear", price: 799, rating: 4.3, image: "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=500&q=80" },

  // --- BEAUTY ---
  { id: 31, name: "Matte Liquid Lipstick Set", category: "Beauty", subCategory: "Makeup", price: 699, rating: 4.6, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=500&q=80" },
  { id: 32, name: "Vitamin C Face Serum for Glow", category: "Beauty", subCategory: "Skincare", price: 599, rating: 4.7, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80" },
  { id: 33, name: "Argan Oil Hair Fall Control Shampoo", category: "Beauty", subCategory: "Haircare", price: 499, rating: 4.3, image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=500&q=80" },
  { id: 34, name: "Luxury Long-Lasting Perfume for Men & Women", category: "Beauty", subCategory: "Fragrances", price: 1299, rating: 4.8, image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=500&q=80" },
  { id: 35, name: "Professional Hair Straightener", category: "Beauty", subCategory: "Appliances", price: 1499, rating: 4.4, image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=500&q=80" },
  { id: 36, name: "Hydrating Body Lotion with Shea Butter", category: "Beauty", subCategory: "Bath & Body", price: 399, rating: 4.5, image: "https://images.unsplash.com/photo-1608248597359-994b655f5f4b?auto=format&fit=crop&w=500&q=80" },
  { id: 37, name: "HD Foundation & Makeup Concealer", category: "Beauty", subCategory: "Makeup", price: 899, rating: 4.2, image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=500&q=80" },
  { id: 38, name: "Aloe Vera Gel for Face and Hair", category: "Beauty", subCategory: "Skincare", price: 299, rating: 4.8, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80" },
  { id: 39, name: "Keratin Smooth Hair Mask", category: "Beauty", subCategory: "Haircare", price: 649, rating: 4.6, image: "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=500&q=80" },
  { id: 40, name: "Electric Hair Trimmer for Grooming", category: "Beauty", subCategory: "Appliances", price: 999, rating: 4.3, image: "https://images.unsplash.com/photo-1621607548518-efe2b75211d0?auto=format&fit=crop&w=500&q=80" },

  // --- HOME & KITCHEN ---
  { id: 41, name: "Cotton Queen Size Bedsheet with Pillow Covers", category: "Home & Kitchen", subCategory: "Bed Linen", price: 999, rating: 4.6, image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=500&q=80" },
  { id: 42, name: "Non-Stick Aluminum Cookware Fry Pan Set", category: "Home & Kitchen", subCategory: "Kitchenware", price: 1499, rating: 4.5, image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=500&q=80" },
  { id: 43, name: "Modern LED Desk Lamp with Touch Control", category: "Home & Kitchen", subCategory: "Lighting", price: 799, rating: 4.7, image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=500&q=80" },
  { id: 44, name: "Decorative Wall Clock for Living Room", category: "Home & Kitchen", subCategory: "Decor", price: 899, rating: 4.4, image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=500&q=80" },
  { id: 45, name: "Multi-Purpose Plastic Storage Organizer Box", category: "Home & Kitchen", subCategory: "Storage & Organizers", price: 499, rating: 4.2, image: "https://images.unsplash.com/photo-1595515106967-174823158f27?auto=format&fit=crop&w=500&q=80" },
  { id: 46, name: "Stainless Steel Insulated Water Bottle", category: "Home & Kitchen", subCategory: "Kitchenware", price: 599, rating: 4.8, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=500&q=80" },
  { id: 47, name: "Microfiber Floor Cleaning Mop", category: "Home & Kitchen", subCategory: "Cleaning", price: 699, rating: 4.3, image: "https://images.unsplash.com/photo-1585837135231-d2a70c9cd5bc?auto=format&fit=crop&w=500&q=80" },
  { id: 48, name: "Plush Velvet Cushion Covers Set of 5", category: "Home & Kitchen", subCategory: "Bed Linen", price: 799, rating: 4.5, image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=500&q=80" },
  { id: 49, name: "Aromatherapy Essential Oil Diffuser", category: "Home & Kitchen", subCategory: "Decor", price: 1199, rating: 4.6, image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=500&q=80" },
  { id: 50, name: "Stainless Steel Kitchen Spice Container Box", category: "Home & Kitchen", subCategory: "Kitchenware", price: 899, rating: 4.7, image: "https://images.unsplash.com/photo-1590794056226-79ef3a8137e9?auto=format&fit=crop&w=500&q=80" }
];

// 4. API Endpoints
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