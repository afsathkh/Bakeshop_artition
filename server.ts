import express from "express";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");
const JWT_SECRET = process.env.JWT_SECRET || "artisan_bakery_secret_2026";

// App middle-wares
app.use(express.json());

// --- DATABASE DESIGN & MOCK STORAGE SYSTEM ---
interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "user";
  phone?: string;
  address?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  price: number;
  discount: number; // percentage
  stock: number;
  ingredients: string;
  createdAt: string;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  userId: string;
  userName: string;
  deliveryAddress: string;
  deliveryPhone: string;
  products: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  orderStatus: "Pending" | "Preparing" | "Out for Delivery" | "Delivered";
  paymentStatus: "Paid" | "Pending";
  createdAt: string;
}

interface Coupon {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  expiryDate: string;
  activeStatus: boolean;
}

interface DBState {
  users: User[];
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
}

const DEFAULT_SEEDS: DBState = {
  users: [
    {
      id: "admin-1",
      name: "Chef Pierre",
      email: "admin@bakery.com",
      passwordHash: bcrypt.hashSync("password123", 10),
      role: "admin",
      phone: "+33 1 42 68 53 00",
      address: "12 Rue Royale, 75008 Paris, France"
    },
    {
      id: "user-1",
      name: "Alice Marie",
      email: "user@bakery.com",
      passwordHash: bcrypt.hashSync("password123", 10),
      role: "user",
      phone: "+33 6 12 34 56 78",
      address: "45 Avenue de la République, 75011 Paris, France"
    }
  ],
  products: [
    {
      id: "prod-1",
      name: "Classic Normandy Butter Croissant",
      description: "Traditional golden-brown crescent laminate pastry made with high-content Normandy butter, giving a crisp outer shell and airy feather-light crumb.",
      category: "Viennoiserie",
      image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600",
      price: 180,
      discount: 10,
      stock: 24,
      ingredients: "Normandy Butter (82% fat), Wild levain starter, organic stoneground wheat flour T55, unrefined cane sugar, dry yeast, sea salt",
      createdAt: new Date().toISOString()
    },
    {
      id: "prod-2",
      name: "Premium Belgian Chocolate Pain",
      description: "Buttery pastry laminate wrapped cleanly around two rich sticks of 70% dark Belgian cocoa couverture, baked fresh at dawn.",
      category: "Viennoiserie",
      image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&q=80&w=600",
      price: 220,
      discount: 0,
      stock: 18,
      ingredients: "Organic French flour (T55), Belcolade 70% dark chocolate batons, high-fat butter, mineral water, active culture yeast",
      createdAt: new Date().toISOString()
    },
    {
      id: "prod-3",
      name: "36-Hour Country Sourdough Boule",
      description: "Naturally leavened rustica bread with a deeply caramelized thick crust, custard-like open crumb, and the classic lactic yogurt tang.",
      category: "Artisanal Breads",
      image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=600",
      price: 380,
      discount: 15,
      stock: 8,
      ingredients: "Stoneground dark rye flour, stoneground wholewheat flour, pristine well-water, 12-year mature wild culture starter, Sel Gris de Guérande",
      createdAt: new Date().toISOString()
    },
    {
      id: "prod-4",
      name: "Parisian Heritage Baguette",
      description: "The pride of France. Exuberantly crackling crust with a highly alveolated, pale-creamy aromatic inner crumb.",
      category: "Artisanal Breads",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600",
      price: 120,
      discount: 0,
      stock: 35,
      ingredients: "High-protein unbleached wheat flour, mountain spring water, active compressed yeast, iodized salt",
      createdAt: new Date().toISOString()
    },
    {
      id: "prod-5",
      name: "Tahitian Vanilla Strawberry Tart",
      description: "Fresh glazed hand-selected field strawberries layered atop a silky Tahitian vanilla bean pastry cream bed inside a crispy sweet sable crust.",
      category: "Tarts & Gateaux",
      image: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&q=80&w=600",
      price: 490,
      discount: 20,
      stock: 5,
      ingredients: "Organic strawberries, Tahitian vanilla paste, cream, almond flour, egg yolks, sweet pastry paste",
      createdAt: new Date().toISOString()
    },
    {
      id: "prod-6",
      name: "Lavender Meyer Lemon Cupcake",
      description: "Spongy delicate vanilla cupcake core injected with sharp, fresh Meyer lemon curd, frosted with a light whipped violet buttercream petal.",
      category: "Tarts & Gateaux",
      image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=600",
      price: 160,
      discount: 0,
      stock: 12,
      ingredients: "Vanilla cake flour, lavender essence infusion, Meyer lemon zest, butter cream, violet flowers, sugar",
      createdAt: new Date().toISOString()
    },
    {
      id: "prod-7",
      name: "Luxury French Macaron Box (12pcs)",
      description: "Exquisite assortment of fragile almond shells filled with intense dark chocolate ganache, Sicilian pistachio paste, and natural raspberry puree.",
      category: "Confections",
      image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&q=80&w=600",
      price: 680,
      discount: 5,
      stock: 6,
      ingredients: "Gluten-free almond flour, organic eggs, powdered sugar, raspberry coulis, Sicilian pistachio butter, dark cocoa paste",
      createdAt: new Date().toISOString()
    }
  ],
  orders: [
    {
      id: "ord-1001",
      userId: "user-1",
      userName: "Alice Marie",
      deliveryAddress: "45 Avenue de la République, 75011 Paris, France",
      deliveryPhone: "+33 6 12 34 56 78",
      products: [
        { productId: "prod-1", name: "Classic Normandy Butter Croissant", price: 180, quantity: 2 },
        { productId: "prod-3", name: "36-Hour Country Sourdough Boule", price: 380, quantity: 1 }
      ],
      totalAmount: 644,
      discountAmount: 114,
      orderStatus: "Delivered",
      paymentStatus: "Paid",
      createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
    },
    {
      id: "ord-1002",
      userId: "user-1",
      userName: "Alice Marie",
      deliveryAddress: "45 Avenue de la République, 75011 Paris, France",
      deliveryPhone: "+33 6 12 34 56 78",
      products: [
        { productId: "prod-5", name: "Tahitian Vanilla Strawberry Tart", price: 490, quantity: 1 }
      ],
      totalAmount: 392,
      discountAmount: 98,
      orderStatus: "Preparing",
      paymentStatus: "Paid",
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    }
  ],
  coupons: [
    { code: "WELCOME10", discountType: "percentage", discountValue: 10, expiryDate: "2027-12-31", activeStatus: true },
    { code: "BREADLOVE", discountType: "fixed", discountValue: 100, expiryDate: "2027-12-31", activeStatus: true },
    { code: "FESTIVE20", discountType: "percentage", discountValue: 20, expiryDate: "2027-12-31", activeStatus: true }
  ]
};

function readDb(): DBState {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_SEEDS, null, 2));
      return DEFAULT_SEEDS;
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read database state, returning defaults", err);
    return DEFAULT_SEEDS;
  }
}

function writeDb(state: DBState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error("Failed to write database state", err);
  }
}

// Ensure database file is initialized at boot
readDb();

// --- LAZY GEMINI API CLIENT ---
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("WARNING: Server running with placeholder or empty GEMINI_API_KEY. AI features will be unavailable.");
      return null;
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiInstance;
}

// --- JWT AUTH MIDDLEWARE ---
function authenticateJWT(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token missing or invalid" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Access forbidden: signature expired or invalid" });
  }
}

// --- EXPRESS ROOT API ENDPOINTS ---

// 1. Auth Endpoint: Log in
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid email or matching password" });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "48h" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address
    }
  });
});

// Auth Endpoint: Google verified login/registration
app.post("/api/auth/google", (req, res) => {
  const { name, email } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: "Email and name are required from Google user" });
  }

  const databaseState = readDb();
  let user = databaseState.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // Automatically register the Google authenticated user
    user = {
      id: "google-" + Date.now(),
      name,
      email,
      passwordHash: bcrypt.hashSync("google-user-pw-hash-" + Math.random(), 10),
      role: email.toLowerCase().includes("admin") ? "admin" : "user",
      phone: "",
      address: ""
    };
    databaseState.users.push(user);
    writeDb(databaseState);
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "48h" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address
    }
  });
});

// 2. Auth Endpoint: Register
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, phone, address, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  const db = readDb();
  const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: "User with this email already exists" });
  }

  const newUser: User = {
    id: "user-" + Date.now(),
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role: role === "admin" || email.toLowerCase().includes("admin") ? "admin" : "user",
    phone: phone || "",
    address: address || ""
  };

  db.users.push(newUser);
  writeDb(db);

  const token = jwt.sign(
    { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: "48h" }
  );

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      address: newUser.address
    }
  });
});

// 3. Auth Endpoint: Fetch Profile
app.get("/api/auth/me", authenticateJWT, (req: any, res) => {
  const db = readDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address
  });
});

// 4. Update Profile
app.put("/api/auth/profile", authenticateJWT, (req: any, res) => {
  const { name, phone, address } = req.body;
  const db = readDb();
  const userIdx = db.users.findIndex(u => u.id === req.user.id);
  if (userIdx === -1) {
    return res.status(404).json({ error: "User profile not found" });
  }

  if (name) db.users[userIdx].name = name;
  if (phone !== undefined) db.users[userIdx].phone = phone;
  if (address !== undefined) db.users[userIdx].address = address;

  writeDb(db);
  res.json({
    id: db.users[userIdx].id,
    name: db.users[userIdx].name,
    email: db.users[userIdx].email,
    role: db.users[userIdx].role,
    phone: db.users[userIdx].phone,
    address: db.users[userIdx].address
  });
});

// 5. Products Api: Get list of products
app.get("/api/products", (req, res) => {
  const db = readDb();
  res.json(db.products);
});

// 6. Products Api: Create Product (Admin Only)
app.post("/api/products", authenticateJWT, (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Requires administrator capabilities" });
  }

  const { name, description, category, image, price, discount, stock, ingredients } = req.body;
  if (!name || !category || price === undefined || stock === undefined) {
    return res.status(400).json({ error: "Missing required fields (name, category, price, stock)" });
  }

  const db = readDb();
  const newProduct: Product = {
    id: "prod-" + Date.now(),
    name,
    description: description || "Freshly baked artisan product delicious for any occasion.",
    category,
    image: image || "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600",
    price: Number(price),
    discount: Number(discount || 0),
    stock: Number(stock),
    ingredients: ingredients || "Wheat flour, butter, water, sugar, yeast, salt.",
    createdAt: new Date().toISOString()
  };

  db.products.push(newProduct);
  writeDb(db);
  res.status(201).json(newProduct);
});

// 7. Products Api: Edit Product (Admin Only)
app.put("/api/products/:id", authenticateJWT, (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Requires administrator capabilities" });
  }

  const { name, description, category, image, price, discount, stock, ingredients } = req.body;
  const db = readDb();
  const index = db.products.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const updated = {
    ...db.products[index],
    name: name !== undefined ? name : db.products[index].name,
    description: description !== undefined ? description : db.products[index].description,
    category: category !== undefined ? category : db.products[index].category,
    image: image !== undefined ? image : db.products[index].image,
    price: price !== undefined ? Number(price) : db.products[index].price,
    discount: discount !== undefined ? Number(discount) : db.products[index].discount,
    stock: stock !== undefined ? Number(stock) : db.products[index].stock,
    ingredients: ingredients !== undefined ? ingredients : db.products[index].ingredients
  };

  db.products[index] = updated;
  writeDb(db);
  res.json(updated);
});

// 8. Products Api: Delete Product (Admin Only)
app.delete("/api/products/:id", authenticateJWT, (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Requires administrator capabilities" });
  }

  const db = readDb();
  const index = db.products.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  db.products.splice(index, 1);
  writeDb(db);
  res.json({ message: "Product deleted successfully" });
});

// 9. Bulk Update Prices (Admin Only)
app.post("/api/products/bulk-update", authenticateJWT, (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Requires administrator capabilities" });
  }

  const { category, priceMultiplier, discountFixed } = req.body;
  if (!category) {
    return res.status(400).json({ error: "Category is required for bulk actions" });
  }

  const db = readDb();
  let updatedCount = 0;

  db.products = db.products.map(p => {
    if (p.category === category) {
      updatedCount++;
      let newPrice = p.price;
      let newDiscount = p.discount;

      if (priceMultiplier) {
        newPrice = Math.round(p.price * Number(priceMultiplier));
      }
      if (discountFixed !== undefined) {
        newDiscount = Math.min(100, Math.max(0, Number(discountFixed)));
      }

      return { ...p, price: newPrice, discount: newDiscount };
    }
    return p;
  });

  writeDb(db);
  res.json({ message: `Successfully updated ${updatedCount} products in category: ${category}` });
});

// 10. Orders Api: Get List
app.get("/api/orders", authenticateJWT, (req: any, res) => {
  const db = readDb();
  if (req.user.role === "admin") {
    res.json(db.orders);
  } else {
    // Regular users can only see their own orders
    const history = db.orders.filter(o => o.userId === req.user.id);
    res.json(history);
  }
});

// 11. Orders Api: Place Order
app.post("/api/orders", authenticateJWT, (req: any, res) => {
  const { products, deliveryAddress, deliveryPhone, discountAmount, totalAmount } = req.body;
  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: "Cart is empty or invalid" });
  }

  const db = readDb();

  // Validate the stock level for each product
  for (const item of products) {
    const originalProd = db.products.find(p => p.id === item.productId);
    if (!originalProd) {
      return res.status(400).json({ error: `Product ${item.name} not found in our catalogs` });
    }
    if (originalProd.stock < item.quantity) {
      return res.status(400).json({ error: `Insufficient stock for ${item.name}. Only ${originalProd.stock} available.` });
    }
  }

  // Deduct stocks safely
  db.products = db.products.map(p => {
    const item = products.find(prod => prod.productId === p.id);
    if (item) {
      return { ...p, stock: Math.max(0, p.stock - item.quantity) };
    }
    return p;
  });

  const newOrder: Order = {
    id: "ord-" + (db.orders.length + 1000 + Date.now().toString().slice(-4)),
    userId: req.user.id,
    userName: req.user.name,
    deliveryAddress: deliveryAddress || "Collection at Main Counter",
    deliveryPhone: deliveryPhone || "N/A",
    products,
    totalAmount: Number(totalAmount),
    discountAmount: Number(discountAmount || 0),
    orderStatus: "Pending",
    paymentStatus: "Paid",
    createdAt: new Date().toISOString()
  };

  db.orders.unshift(newOrder); // Add newer to the beginning
  writeDb(db);

  res.status(201).json(newOrder);
});

// 12. Orders Api: Update order tracking status (Admin Only)
app.put("/api/orders/:id/status", authenticateJWT, (req: any, res) => {
  const { orderStatus } = req.body;
  if (!orderStatus) {
    return res.status(400).json({ error: "Status must be declared" });
  }

  const db = readDb();
  const index = db.orders.findIndex(o => o.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Order details not found" });
  }

  // Make sure it is an admin or the appropriate status
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Only admins can change order steps" });
  }

  db.orders[index].orderStatus = orderStatus;
  writeDb(db);
  res.json(db.orders[index]);
});

// 13. Coupons: Get Active
app.get("/api/coupons", (req, res) => {
  const db = readDb();
  res.json(db.coupons);
});

// 14. Coupons: Add new Promotional Code (Admin Only)
app.post("/api/coupons", authenticateJWT, (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Requires administrator capabilities" });
  }

  const { code, discountType, discountValue, expiryDate } = req.body;
  if (!code || !discountType || discountValue === undefined) {
    return res.status(400).json({ error: "Missing coupon parameters (code, type, value)" });
  }

  const db = readDb();
  const normalizedCode = code.toUpperCase().trim();
  const exists = db.coupons.find(c => c.code === normalizedCode);
  if (exists) {
    return res.status(400).json({ error: "Coupon with this code sequence already exists" });
  }

  const newCoupon: Coupon = {
    code: normalizedCode,
    discountType,
    discountValue: Number(discountValue),
    expiryDate: expiryDate || "2027-12-31",
    activeStatus: true
  };

  db.coupons.push(newCoupon);
  writeDb(db);
  res.status(201).json(newCoupon);
});

// 15. Coupons: Toggle State (Admin Only)
app.put("/api/coupons/:code", authenticateJWT, (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Requires administrator capabilities" });
  }

  const db = readDb();
  const coupon = db.coupons.find(c => c.code === req.params.code.toUpperCase());
  if (!coupon) {
    return res.status(404).json({ error: "Coupon not parsed" });
  }

  coupon.activeStatus = !coupon.activeStatus;
  writeDb(db);
  res.json(coupon);
});

// 16. Coupons: Validate coupon usage
app.post("/api/coupons/validate", (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  const db = readDb();
  const coupon = db.coupons.find(c => c.code === code.toUpperCase().trim());
  if (!coupon) {
    return res.status(404).json({ error: "Invalid Coupon Code" });
  }

  if (!coupon.activeStatus) {
    return res.status(400).json({ error: "This coupon is currently inactive" });
  }

  // Simple date checker
  const now = new Date();
  const exp = new Date(coupon.expiryDate);
  if (exp < now) {
    return res.status(400).json({ error: "This promo code has expired" });
  }

  res.json(coupon);
});

// --- AI EXPERTISE SERVER ENDPOINTS (GEMINI @GOOGLE/GENAI SDK) ---

// AI Assistant Endpoint: Storefront Intelligent Chat
app.post("/api/gemini/chat", async (req, res) => {
  const { prompt, history, cartItems } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const aiClient = getGeminiClient();
  if (!aiClient) {
    return res.json({
      text: "Bonjour! I am your AI Baking Assistant. Note: The application is currently running in trial mode with mock AI responses since the `GEMINI_API_KEY` environment variable has not been configured in the AI Studio platform yet. You can activate full Gemini reasoning inside Settings > Secrets!\n\nAs your custom backup guide: I suggest pairing our crackling French Sourdough Boule with salted Normandy butter, or enjoying sweet Macarons with robust espresso!"
    });
  }

  const db = readDb();
  const availableItemsSummary = db.products
    .map(p => `- ${p.name} (${p.category}): FRF ${p.price} with ${p.discount}% discount. Ingredients: [${p.ingredients}]. Stock Left: ${p.stock}`)
    .join("\n");

  const cartSummary = cartItems && cartItems.length > 0
    ? cartItems.map((c: any) => `${c.quantity}x ${c.name}`).join(", ")
    : "Empty";

  const systemPrompt = `You are "Chef Jean-Luc", an expert Parisian culinary master and welcoming AI consultant for our French Patisserie and Bakery. 
Use a touch of French flair ("Bonjour!", "Magnifique!", "Ah, l'amour!") but write primarily in clear English.
Be warm, professional, exceptionally knowledgeable about baking procedures, pastries, flour fermentation, wine pairings, allergens, yeast processes, and sensory descriptions.

Here are the active items available in our kitchen right now:
${availableItemsSummary}

Current items in coordinates of customer's basket:
${cartSummary}

Rules:
1. Promote our freshly-baked kitchen assets enthusiastically. Mention current stock limits (low stock alerts) or discounts.
2. If requested for recipe/pairing/diet suggestions, reference our ingredients. Suggest smart cross-selling (add on tarts, coffee pairing).
3. Do not invent products that are not in the kitchen catalog. Keep answers concise, mouthwatering, and helpful.`;

  try {
    // Format historical conversation matching Gemini's modern chat API format
    // In @google/genai, we use chats.create or generateContent. Let's do generateContent for simplicity of layout,
    // feeding the system instruction inside the config object.
    const contents: any[] = [];
    if (history && history.length > 0) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        });
      });
    }
    contents.push({ role: "user", parts: [{ text: prompt }] });

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Assistant Chat request failed:", error);
    res.status(500).json({ error: "Gemini AI processing error: " + error.message });
  }
});

// AI Copilot Endpoint: Generate dynamic product details
app.post("/api/gemini/generate-product", async (req, res) => {
  const { conceptName } = req.body;
  if (!conceptName) {
    return res.status(400).json({ error: "Concept name is required" });
  }

  const aiClient = getGeminiClient();
  if (!aiClient) {
    // Elegant fallback simulation
    return res.json({
      name: conceptName,
      description: `Luxury artisan creation inspired by our master baker. Layers of hand-refined textures cooked to perfect crumb criteria with organic butter essence.`,
      price: 240,
      category: "Viennoiserie",
      ingredients: "Normandy flour, butter culture, artisanal water crystals, baker yeast, raw cane sugar, organic fine salt",
      message: "This is a pre-designed premium template. Connect your Gemini API Key in the Secrets tab for automatic smart recipe formulas!"
    });
  }

  const systemInstruction = `You are a dynamic French Michelin-star recipe designer. 
Generate a beautifully curated artisan bakery listing in JSON format. 
You must respond ONLY with a clean JSON object containing the specified keys. No markdown backticks, no comments. No extra padding.`;

  const userPrompt = `Develop a professional, detailed, premium bakery product based on this concept: "${conceptName}".
Format your entire response strictly as a JSON object with this exact shape:
{
  "name": "Refined professional product name",
  "description": "Exquisite, sensory descriptions focusing on standard baking terms (laminate structure, caramelization, crumb layers, mouthfeel)",
  "category": "Pick one of (Viennoiserie, Artisanal Breads, Tarts & Gateaux, Confections)",
  "price": Recommended retail price in numbers between 100 and 700 (INR/French cents equivalent),
  "ingredients": "A separated list of gourmet, authentic baking ingredients with sources (e.g. Maldon flaky salt, farm dairy butter, Valrhona dark chocolates)"
}`;

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            price: { type: Type.INTEGER },
            ingredients: { type: Type.STRING }
          },
          required: ["name", "description", "category", "price", "ingredients"]
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    res.json(parsed);
  } catch (err: any) {
    console.error("Gemini failed product concept mapping:", err);
    res.status(500).json({ error: "Failed to map concepts: " + err.message });
  }
});

// AI Analytics Endpoint: Admin Performance Coach
app.post("/api/gemini/analytics-coach", async (req, res) => {
  const aiClient = getGeminiClient();
  const db = readDb();

  // Aggregate stats
  const totalProducts = db.products.length;
  const totalStock = db.products.reduce((acc, p) => acc + p.stock, 0);
  const totalOrders = db.orders.length;
  const totalRevenue = db.orders.reduce((acc, o) => acc + o.totalAmount, 0);

  const lowStockThreshold = 10;
  const lowStockItems = db.products.filter(p => p.stock < lowStockThreshold)
    .map(p => `${p.name} (Only ${p.stock} left)`).join(", ");

  const productPerformance = db.products.map(p => {
    // Count how many ordered
    let quantitySold = 0;
    db.orders.forEach(o => {
      o.products.forEach(item => {
        if (item.productId === p.id) {
          quantitySold += item.quantity;
        }
      });
    });
    return { name: p.name, stock: p.stock, sold: quantitySold };
  });

  if (!aiClient) {
    return res.json({
      coachingParagraph: "Bienvenue, Bakery Director! The AI Analytics Coach allows you to explore custom reports. Here is your quick automated status report:\n\n1. **Stock Concerns**: Re-bake items marked under 10 stock to capture peak weekend margins.\n2. **Best Sellers**: Viennoiseries are moving rapidly. Boost laminated butter production.\n3. **Promotional Target**: Set a 15% discount coupon for excess standard loaves to reduce flour wastage. \n\n*Configure your GEMINI_API_KEY inside the Secrets menu to receive automated deep forecasting reports!*"
    });
  }

  const statusDashboard = {
    totalRevenue,
    totalOrders,
    totalProducts,
    totalStock,
    lowStockItems,
    performance: productPerformance
  };

  const systemInstruction = `You are a high-level Business Intelligence Coach and French Retail Patisserie Specialist. 
Analyze the real-time bakery metrics provided. Give structured, highly strategic, yet motivating professional recommendations. Limit your analysis to 3 actionable, highly impactful checkpoints centered on stock rotation, dynamic coupon discount pricing, and production targets. Keep it delightfully French and executive.`;

  const userPrompt = `Here is our bakery database snapshot:
${JSON.stringify(statusDashboard, null, 2)}

Provide your executive intelligence assessment and next-step actions. Limit response to 3 short paragraphs. No code blocks.`;

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    res.json({ coachingParagraph: response.text });
  } catch (err: any) {
    console.error("Gemini failed business analytics review:", err);
    res.status(500).json({ error: "Failed to parse coaching directions: " + err.message });
  }
});

// --- VITE DEV OR PROD MIDDLEWARE SETUP ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA Fallback logic for client routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Artisan server running successfully on http://localhost:${PORT}]`);
  });
}

startServer();
