import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());

// MongoDB Connection URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://sandhyachoudhary2005_db_user:surajpapa1234xxx@ac-win07dl-shard-00-00.yzckfou.mongodb.net:27017,ac-win07dl-shard-00-01.yzckfou.mongodb.net:27017,ac-win07dl-shard-00-02.yzckfou.mongodb.net:27017/trendnova?ssl=true&replicaSet=atlas-vgh8pd-shard-0&authSource=admin';

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
  { id: 138, name: "High-Performance Gaming Laptop 16GB RAM 1TB SSD", category: "Electronics", subCategory: "Laptops", price: 78999, rating: 4.8, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=500&q=80" },
  { id: 139, name: "Ultra-Thin Metallic Laptop Core i5 8GB RAM", category: "Electronics", subCategory: "Laptops", price: 48999, rating: 4.6, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80" },
  { id: 140, name: "14-Inch Touchscreen Convertible 2-in-1 Laptop", category: "Electronics", subCategory: "Laptops", price: 54999, rating: 4.5, image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=500&q=80" },
  { id: 141, name: "Lightweight Student Laptop 256GB SSD", category: "Electronics", subCategory: "Laptops", price: 29999, rating: 4.3, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80" },
  { id: 142, name: "Professional Designer Laptop 4K Display 32GB RAM", category: "Electronics", subCategory: "Laptops", price: 112999, rating: 4.9, image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=500&q=80" },
  { id: 143, name: "Gaming Beast Laptop RTX Graphics 144Hz", category: "Electronics", subCategory: "Laptops", price: 89999, rating: 4.7, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=500&q=80" },
  { id: 144, name: "Compact 13-Inch Business Laptop Silver", category: "Electronics", subCategory: "Laptops", price: 62999, rating: 4.6, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80" },
  { id: 145, name: "Fast Budget Laptop Ryzen 5 Processor", category: "Electronics", subCategory: "Laptops", price: 38999, rating: 4.4, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80" },
  { id: 146, name: "Sleek Aluminium Ultrabook 512GB SSD", category: "Electronics", subCategory: "Laptops", price: 58999, rating: 4.7, image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=500&q=80" },
  { id: 147, name: "17-Inch Big Screen Entertainment Laptop", category: "Electronics", subCategory: "Laptops", price: 46999, rating: 4.2, image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=500&q=80" },
  { id: 148, name: "Core i7 Workstation Laptop 1TB SSD", category: "Electronics", subCategory: "Laptops", price: 84999, rating: 4.8, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80" },
  { id: 149, name: "Entry-Level Everyday Laptop 15.6 Inch", category: "Electronics", subCategory: "Laptops", price: 24999, rating: 4.0, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80" },
  { id: 150, name: "Dual-Screen Premium Creator Laptop", category: "Electronics", subCategory: "Laptops", price: 124999, rating: 4.9, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=500&q=80" }
];

// MongoDB Connection & Auto-Refresh / Seeding Logic
mongoose.connect(MONGO_URI)
.then(async () => {
  console.log('MongoDB Connected Successfully to TrendNova Database!');
  
  try {
    // Note: Agar tu chahta hai ki har baar server restart pe data fresh ho jaye, toh deleteMany rakha hai. 
    // Par agar admin panel se add kiye hue products bachane hain, toh tu chahe toh is deleteMany ko hata bhi sakta hai.
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(initialProducts);
      console.log(`Database successfully seeded with ${initialProducts.length} products!`);
    } else {
      console.log(`Database already contains ${count} products.`);
    }
  } catch (err) {
    console.error('Auto-seeding error:', err);
  }
})
.catch((err) => console.error('MongoDB connection error:', err));

// --- API ENDPOINTS ---

// 1. Get all products (with category/subCategory filter)
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

// 2. Add New Product (POST API for Admin Panel)
app.post('/api/products', async (req, res) => {
  try {
    const { name, price, description, image, category, subCategory, rating } = req.body;
    
    const newProduct = new Product({
      id: Date.now(),
      name,
      price,
      description: description || 'No description',
      image: image || 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80',
      category: category || 'General',
      subCategory: subCategory || 'General',
      rating: rating || 4.5
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', product: savedProduct });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// 3. Delete Product (DELETE API for Admin Panel)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    let deletedProduct;

    // Check karte hain ki ID valid MongoDB ObjectId hai ya nahi
    if (mongoose.isValidObjectId(productId)) {
      deletedProduct = await Product.findByIdAndDelete(productId);
    } else {
      deletedProduct = await Product.findOneAndDelete({ id: Number(productId) || productId });
    }

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully", id: productId });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});
// 4. Search Products API
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
});