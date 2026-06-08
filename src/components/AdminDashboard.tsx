import React, { useState, FormEvent } from "react";
import {
  TrendingUp,
  Package,
  ShoppingBag,
  IndianRupee,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  RefreshCw,
  Percent,
  Check,
  X,
  AlertTriangle,
  ArrowRightLeft,
  Search,
  CheckCircle,
  FileUp,
  Layers,
  ChefHat
} from "lucide-react";
import { Product, Order, Coupon } from "../types";

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  onAddProduct: (prodParams: any) => Promise<void>;
  onEditProduct: (id: string, prodParams: any) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onAddCoupon: (couponParams: any) => Promise<void>;
  onToggleCoupon: (code: string) => Promise<void>;
  onUpdateOrderStatus: (id: string, status: Order["orderStatus"]) => Promise<void>;
  onBulkUpdate: (bulkParams: any) => Promise<void>;
  userToken: string | null;
}

export default function AdminDashboard({
  products,
  orders,
  coupons,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onAddCoupon,
  onToggleCoupon,
  onUpdateOrderStatus,
  onBulkUpdate,
  userToken
}: AdminDashboardProps) {
  // Navigation inside Admin Module
  const [adminTab, setAdminTab] = useState<"products" | "orders" | "coupons" | "bulk" | "copilot">("products");

  // Filter searches
  const [productSearch, setProductSearch] = useState("");

  // Product edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Product form states
  const [pName, setPName] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pCat, setPCat] = useState("Viennoiserie");
  const [pImg, setPImg] = useState("");
  const [pPrice, setPPrice] = useState(150);
  const [pDiscount, setPDiscount] = useState(0);
  const [pStock, setPStock] = useState(20);
  const [pIngredients, setPIngredients] = useState("");

  // Coupon form states
  const [cCode, setCCode] = useState("");
  const [cType, setCType] = useState<"percentage" | "fixed">("percentage");
  const [cVal, setCVal] = useState(10);
  const [cExp, setCExp] = useState("2027-12-31");

  // Bulk price manager states
  const [bPCat, setBPCat] = useState("Viennoiserie");
  const [bPMultiplier, setBPMultiplier] = useState("1.0");
  const [bPFixedDiscount, setBPFixedDiscount] = useState("0");

  // Copilot Generator states
  const [copilotConcept, setCopilotConcept] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotError, setCopilotError] = useState("");

  // CALCULATING LIVE FINANCIAL METRICS
  const totalProducts = products.length;
  const totalStockCount = products.reduce((acc, p) => acc + p.stock, 0);
  const totalOrdersCount = orders.length;
  const totalRevenueSum = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  
  const lowStockThreshold = 10;
  const lowStockProducts = products.filter(p => p.stock < lowStockThreshold);

  // Derive unique categories
  const categoriesList = ["Viennoiserie", "Artisanal Breads", "Tarts & Gateaux", "Confections"];

  // Filtered products list for rendering
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.ingredients.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Submit product create / edit
  const handleProductSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;

    const payload = {
      name: pName,
      description: pDesc,
      category: pPCatSelection(pCat),
      image: pImg,
      price: Number(pPrice),
      discount: Number(pDiscount),
      stock: Number(pStock),
      ingredients: pIngredients
    };

    try {
      if (editingId) {
        await onEditProduct(editingId, payload);
        setEditingId(null);
      } else {
        await onAddProduct(payload);
      }
      resetProductForm();
    } catch (err) {
      console.error(err);
    }
  };

  const pPCatSelection = (cat: string) => cat || "Viennoiserie";

  const triggerEditFill = (product: Product) => {
    setEditingId(product.id);
    setPName(product.name);
    setPDesc(product.description);
    setPCat(product.category);
    setPImg(product.image);
    setPPrice(product.price);
    setPDiscount(product.discount);
    setPStock(product.stock);
    setPIngredients(product.ingredients);
  };

  const resetProductForm = () => {
    setEditingId(null);
    setPName("");
    setPDesc("");
    setPCat("Viennoiserie");
    setPImg("");
    setPPrice(150);
    setPDiscount(0);
    setPStock(20);
    setPIngredients("");
  };

  // Submit Coupons
  const handleCouponSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!cCode.trim()) return;

    try {
      await onAddCoupon({
        code: cCode.toUpperCase().trim(),
        discountType: cType,
        discountValue: Number(cVal),
        expiryDate: cExp
      });
      setCCode("");
      setCVal(10);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit bulk operations
  const handleBulkSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await onBulkUpdate({
        category: bPCat,
        priceMultiplier: Number(bPMultiplier),
        discountFixed: Number(bPFixedDiscount)
      });
      alert(`Gourmet bulk adjustments updated for category: ${bPCat}`);
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger Gemini Copilot Concept mapping
  const handleCopilotGenerate = async () => {
    if (!copilotConcept.trim()) return;

    setCopilotLoading(true);
    setCopilotError("");
    try {
      const response = await fetch("/api/gemini/generate-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": userToken ? `Bearer ${userToken}` : ""
        },
        body: JSON.stringify({ conceptName: copilotConcept })
      });
      const data = await response.json();
      if (response.ok) {
        // Automatically populate product formulation form
        setPName(data.name || "");
        setPDesc(data.description || "");
        setPCat(data.category || "Viennoiserie");
        setPPrice(data.price || 200);
        setPIngredients(data.ingredients || "");
        setPImg("https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600");
        setBPCat(data.category || "Viennoiserie");
        setCopilotConcept("");
        setAdminTab("products"); // Switch back the tab to display pre-filled fields
      } else {
        setCopilotError(data.error || "Failed product blueprint generation.");
      }
    } catch {
      setCopilotError("Could not reach Gemini formulation engine.");
    } finally {
      setCopilotLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 text-left">
      
      {/* HEADER SPECS */}
      <div className="border-b border-amber-100 dark:border-neutral-850 pb-6 mb-8 mt-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-neutral-900 dark:text-neutral-55 flex items-center gap-1.5">
            <ChefHat className="h-8 w-8 text-amber-800" /> Bakeshop Administration Console
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Oversee inventory volumes, manage dynamic pricing, review pending orders tracking, and generate AI recipes.
          </p>
        </div>
        
        {/* Toggle navigation tab links */}
        <div className="flex bg-neutral-100 dark:bg-neutral-850 p-1 rounded-xl">
          <button
            onClick={() => setAdminTab("products")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold leading-none capitalize transition cursor-pointer ${
              adminTab === "products" ? "bg-white dark:bg-neutral-900 shadow-xs text-amber-800 dark:text-amber-400" : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Products CRUD
          </button>
          <button
            onClick={() => setAdminTab("orders")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold leading-none capitalize transition cursor-pointer ${
              adminTab === "orders" ? "bg-white dark:bg-neutral-900 shadow-xs text-amber-800 dark:text-amber-400" : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Orders Fulfillment
          </button>
          <button
            onClick={() => setAdminTab("coupons")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold leading-none capitalize transition cursor-pointer ${
              adminTab === "coupons" ? "bg-white dark:bg-neutral-900 shadow-xs text-amber-800 dark:text-amber-400" : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Promo coupons
          </button>
          <button
            onClick={() => setAdminTab("bulk")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold leading-none capitalize transition cursor-pointer ${
              adminTab === "bulk" ? "bg-white dark:bg-neutral-900 shadow-xs text-amber-800 dark:text-amber-400" : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Bulk adjustments
          </button>
          <button
            onClick={() => setAdminTab("copilot")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold leading-none capitalize transition cursor-pointer flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 ${
              adminTab === "copilot" ? "bg-white dark:bg-neutral-900 shadow-xs text-amber-850 dark:text-amber-450" : "text-amber-700 dark:text-amber-400 hover:text-amber-900"
            }`}
          >
            <Sparkles className="h-3 w-3" /> AI Copilot
          </button>
        </div>
      </div>

      {/* ADMIN STATS METRIC GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Stat 1 */}
        <div className="bg-white dark:bg-[#1E1919] p-5 rounded-2xl border border-amber-100/40 dark:border-neutral-850 shadow-sm flex items-center space-x-4">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-xl text-amber-800">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Total Products</p>
            <p className="font-serif text-xl font-semibold text-neutral-900 dark:text-white mt-0.5">{totalProducts}</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white dark:bg-[#1E1919] p-5 rounded-2xl border border-amber-100/40 dark:border-neutral-850 shadow-sm flex items-center space-x-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl text-blue-700">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Total Inventory</p>
            <p className="font-serif text-xl font-semibold text-neutral-900 dark:text-white mt-0.5">{totalStockCount} units</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white dark:bg-[#1E1919] p-5 rounded-2xl border border-amber-100/40 dark:border-neutral-850 shadow-sm flex items-center space-x-4">
          <div className="bg-emerald-100 dark:bg-emerald-950/30 p-3 rounded-xl text-emerald-700">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Total Order Volume</p>
            <p className="font-serif text-xl font-semibold text-neutral-900 dark:text-white mt-0.5">{totalOrdersCount}</p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white dark:bg-[#1E1919] p-5 rounded-2xl border border-amber-100/40 dark:border-neutral-850 shadow-sm flex items-center space-x-4">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-xl text-amber-800">
            <IndianRupee className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Gross Patisserie Revenue</p>
            <p className="font-serif text-xl font-semibold text-neutral-900 dark:text-white mt-0.5">₹{totalRevenueSum}</p>
          </div>
        </div>
      </div>

      {/* LOW STOCK ALERTS PANEL (If Items below 10 Stock exist) */}
      {lowStockProducts.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/25 border border-rose-500/25 rounded-2xl p-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <h3 className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wide">Danger: Low stock threshold triggered</h3>
            <p className="text-xs text-rose-700 dark:text-rose-400/90 mt-1">
              The following artisan assets have low counts remaining inside fire ovens ({lowStockThreshold} units threshold):{" "}
              {lowStockProducts.map(p => `${p.name} (${p.stock} left)`).join(", ")}. Complete bakeshop inventory rotation immediately.
            </p>
          </div>
        </div>
      )}

      {/* CORE WORKSPACE BOARD (SWITCH DEPENDENT) */}
      <div className="bg-white dark:bg-[#1C1818] rounded-3xl border border-amber-100/50 dark:border-neutral-850 shadow-xl overflow-hidden p-6 sm:p-8">
        
        {/* TAB 1: PRODUCT MANAGEMENT & FORMULARY */}
        {adminTab === "products" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left: Product Addition/Modification Form */}
            <div className="lg:col-span-5 bg-[#FAF9F5] dark:bg-[#151111] p-6 rounded-2xl border border-amber-50 dark:border-neutral-850 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-850 block border-b border-amber-100/50 dark:border-neutral-800 pb-2 flex items-center gap-1">
                {editingId ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingId ? "Update Bakery Formula" : "Inject signature item"}
              </span>

              <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
                {/* Product Name */}
                <div className="space-y-1">
                  <label className="text-neutral-500 font-bold uppercase">Product Name</label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="e.g. Classic Butter Croissant"
                    className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 p-2.5 rounded-lg outline-none text-neutral-900 dark:text-white"
                  />
                </div>

                {/* Categories */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-neutral-500 font-bold uppercase">Category</label>
                    <select
                      value={pCat}
                      onChange={(e) => setPCat(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 p-2.5 rounded-lg outline-none text-neutral-900 dark:text-white cursor-pointer"
                    >
                      {categoriesList.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Stock Quantity */}
                  <div className="space-y-1">
                    <label className="text-neutral-500 font-bold uppercase">Initial Stock</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={pStock}
                      onChange={(e) => setPStock(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 p-2.5 rounded-lg outline-none text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Price and discount row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-neutral-500 font-bold uppercase">Base Price (INR)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={pPrice}
                      onChange={(e) => setPPrice(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 p-2.5 rounded-lg outline-none text-neutral-900 dark:text-white"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-neutral-500 font-bold uppercase">Discount (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={95}
                      value={pDiscount}
                      onChange={(e) => setPDiscount(Math.min(95, Math.max(0, Number(e.target.value))))}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 p-2.5 rounded-lg outline-none text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Image URL with Preset upload simulator */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-neutral-500 font-bold uppercase">Image URL Spec</label>
                    <button
                      type="button"
                      onClick={() => setPImg("https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=600")}
                      className="text-[9px] text-amber-700 uppercase font-semibold hover:underline"
                    >
                      Fill Mock Photo
                    </button>
                  </div>
                  <input
                    type="text"
                    value={pImg}
                    onChange={(e) => setPImg(e.target.value)}
                    placeholder="Unsplash bread path URL"
                    className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 p-2.5 rounded-lg outline-none text-neutral-900 dark:text-white"
                  />
                </div>

                {/* Ingredients tag list */}
                <div className="space-y-1">
                  <label className="text-neutral-500 font-bold uppercase flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> Ingredients Blueprint</label>
                  <label className="text-[10px] text-neutral-400 font-sans block leading-tight">Separate ingredients logically for allergen filters</label>
                  <input
                    type="text"
                    value={pIngredients}
                    onChange={(e) => setPIngredients(e.target.value)}
                    placeholder="Normandy butter, organic flour T55, sea salt"
                    className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 p-2.5 rounded-lg outline-none text-neutral-900 dark:text-white"
                  />
                </div>

                {/* Description textbox */}
                <div className="space-y-1">
                  <label className="text-neutral-500 font-bold uppercase">Mouthwatering sensory description</label>
                  <textarea
                    rows={2}
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    placeholder="Golden-brown crisp shell, caramelised, layered sourdough..."
                    className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 p-2 rounded-lg outline-none text-neutral-900 dark:text-white resize-none"
                  />
                </div>

                {/* Buttons matrix */}
                <div className="grid grid-cols-2 gap-2 pt-3">
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="py-3 px-4 border border-neutral-200 dark:border-neutral-850 hover:bg-neutral-100 rounded-xl font-bold uppercase tracking-wide leading-none transition text-neutral-500"
                  >
                    Clear Form
                  </button>
                  <button
                    type="submit"
                    className="py-3 px-4 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold uppercase tracking-wide leading-none transition"
                  >
                    {editingId ? "Save Changes" : "Create Item"}
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Products List grid table */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-200">
                  Kitchen Oven Catalogs ({filteredProducts.length})
                </span>
                
                {/* Search query */}
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search master list..."
                    className="w-full bg-neutral-100 dark:bg-neutral-850 border-none outline-none text-[10px] py-2 pl-9 pr-3 rounded-xl focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Table List */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-neutral-800 dark:text-neutral-250 border-collapse">
                  <thead>
                    <tr className="border-b border-amber-50/50 dark:border-neutral-800 text-neutral-400 uppercase tracking-widest text-[9px] font-bold text-left">
                      <th className="py-3">Photo</th>
                      <th className="py-3 px-4">Item Details</th>
                      <th className="py-3 px-2">Fare Rate</th>
                      <th className="py-3 px-2">Units</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => (
                      <tr
                        key={product.id}
                        className="border-b border-amber-50/20 dark:border-neutral-850/50 hover:bg-[#FAF8F5]/30 dark:hover:bg-neutral-850/20"
                      >
                        <td className="py-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover shadow-xs bg-neutral-150"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-serif font-bold text-neutral-900 dark:text-white">{product.name}</p>
                          <span className="text-[9px] text-amber-700 uppercase font-bold tracking-wider">{product.category}</span>
                        </td>
                        <td className="py-3 px-2 font-mono">
                          {product.discount > 0 ? (
                            <>
                              <span className="font-bold text-neutral-900 dark:text-white">₹{Math.round(product.price * (100 - product.discount) / 100)}</span>
                              <span className="text-[10px] text-neutral-400 line-through block">₹{product.price}</span>
                            </>
                          ) : (
                            <span className="font-bold text-neutral-900 dark:text-white">₹{product.price}</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center space-x-1.5">
                            <span className={`font-bold ${product.stock <= 8 ? "text-rose-500" : "text-neutral-700 dark:text-neutral-300"}`}>{product.stock}</span>
                            <div className="flex flex-col text-[8.5px]">
                              <button onClick={() => onEditProduct(product.id, { stock: product.stock + 5 })} className="hover:text-amber-800 text-neutral-400 leading-none">▲</button>
                              <button onClick={() => onEditProduct(product.id, { stock: Math.max(0, product.stock - 5) })} className="hover:text-amber-800 text-neutral-400 leading-none">▼</button>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-right space-x-1">
                          <button
                            onClick={() => triggerEditFill(product)}
                            className="p-1.5 text-amber-700 hover:bg-amber-50 dark:hover:bg-neutral-850 rounded-lg transition"
                            title="Edit specs"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(product.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 rounded-lg transition"
                            title="Delete item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: REGISTERED ORDERS TRACKER */}
        {adminTab === "orders" && (
          <div className="space-y-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-200 block border-b border-amber-150 dark:border-neutral-800 pb-2 text-left">
              Fulfillment Command Center ({orders.length} transactions processed)
            </span>

            {orders.length === 0 ? (
              <div className="text-center py-16 space-y-3 col-span-3">
                <ShoppingBag className="h-10 w-10 text-neutral-350 mx-auto" />
                <p className="text-xs text-neutral-450 uppercase font-semibold">No active requests logged inside kitchen ledger</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {orders.map(order => (
                  <div
                    key={order.id}
                    className="border border-neutral-100 dark:border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xs text-left"
                  >
                    {/* Header meta */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-serif font-bold text-neutral-900 dark:text-white leading-none">Order ID: {order.id}</p>
                        <span className="text-[10px] text-neutral-400 block mt-1">{new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                      <span className={`text-[9px] uppercase font-bold py-1 px-2.5 rounded-full border tracking-wide ${
                        order.orderStatus === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-500/15" :
                        order.orderStatus === "Out for Delivery" ? "bg-purple-50 text-purple-700 border-purple-500/15" : "bg-blue-50 text-blue-700 border-blue-500/15"
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>

                    {/* Customer */}
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-neutral-800 dark:text-neutral-100 uppercase text-[9.5px]">Patron Details</p>
                      <p className="font-medium">{order.userName}</p>
                      <p className="text-neutral-400 italic break-all">{order.deliveryAddress} ({order.deliveryPhone})</p>
                    </div>

                    {/* Products details */}
                    <div className="bg-neutral-50 dark:bg-neutral-850/40 p-3 rounded-2xl text-xs space-y-1.5 border border-amber-50/10">
                      {order.products.map((item, key) => (
                        <div key={key} className="flex justify-between font-serif">
                          <span>{item.quantity}x <span className="font-sans text-neutral-600 dark:text-neutral-350">{item.name}</span></span>
                          <span className="font-mono text-neutral-400 font-bold">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-800 flex justify-between font-bold text-neutral-900 dark:text-white font-serif">
                        <span>Total Paid sum</span>
                        <span>₹{order.totalAmount}</span>
                      </div>
                    </div>

                    {/* Interactive controls */}
                    <div className="space-y-1 text-xs">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Modify Delivery step</span>
                      <div className="flex gap-1.5">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as any)}
                          className="flex-1 bg-neutral-100 dark:bg-neutral-850 border-none outline-none p-2 rounded-xl text-neutral-800 dark:text-neutral-200 cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, "Delivered")}
                          className="p-2 bg-emerald-50 dark:bg-emerald-900/35 hover:bg-emerald-150 text-emerald-700 dark:text-emerald-300 rounded-xl transition"
                          title="Fulfill instant delivered status check"
                        >
                          <CheckCircle className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COUPONS MAKER BOARD */}
        {adminTab === "coupons" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left: promo form maker */}
            <div className="lg:col-span-5 bg-[#FAF9F5] dark:bg-[#151111] p-6 rounded-2xl border border-amber-50 dark:border-neutral-850 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-850 block border-b border-amber-100/50 dark:border-neutral-800 pb-2 flex items-center gap-1">
                <Percent className="h-4 w-4" /> Forge Promotional Code
              </span>

              <form onSubmit={handleCouponSubmit} className="space-y-4 text-xs">
                {/* Coupon Code */}
                <div className="space-y-1">
                  <label className="text-neutral-500 font-bold uppercase">Code Sequence</label>
                  <input
                    type="text"
                    required
                    value={cCode}
                    onChange={(e) => setCCode(e.target.value.toUpperCase())}
                    placeholder="e.g. AUTUMN25"
                    className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 p-2.5 rounded-lg outline-none text-neutral-900 dark:text-white font-mono uppercase tracking-widest text-center"
                  />
                </div>

                {/* Discount type properties */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-neutral-500 font-bold uppercase">Reduction Type</label>
                    <select
                      value={cType}
                      onChange={(e) => setCType(e.target.value as any)}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 p-2.5 rounded-lg outline-none text-neutral-900 dark:text-white cursor-pointer"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Reduction (INR)</option>
                    </select>
                  </div>
                  
                  {/* Discount Value */}
                  <div className="space-y-1">
                    <label className="text-neutral-500 font-bold uppercase">Value</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={cVal}
                      onChange={(e) => setCVal(Number(e.target.value))}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 p-2.5 rounded-lg outline-none text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Expiration date */}
                <div className="space-y-1">
                  <label className="text-neutral-500 font-bold uppercase">Expiry Limit Date</label>
                  <input
                    type="date"
                    required
                    value={cExp}
                    onChange={(e) => setCExp(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 p-2.5 rounded-lg outline-none text-neutral-900 dark:text-white text-center font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-amber-850 hover:bg-amber-900 text-white rounded-xl font-bold uppercase tracking-wide leading-none transition"
                >
                  Authorize Promo Code
                </button>
              </form>
            </div>

            {/* Right: Active coupons status lists */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-200 block text-left">
                Authorized Promo codes ledger ({coupons.length})
              </span>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-neutral-800 dark:text-neutral-250 border-collapse">
                  <thead>
                    <tr className="border-b border-amber-50/50 dark:border-neutral-800 text-neutral-400 uppercase tracking-widest text-[9px] font-bold text-left">
                      <th className="py-3 px-2">Promo Code</th>
                      <th className="py-3 px-2">Reduction specs</th>
                      <th className="py-3 px-2">Expiry Date</th>
                      <th className="py-3 text-right">Toggle Active Lock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon, key) => (
                      <tr
                        key={key}
                        className="border-b border-amber-50/20 dark:border-neutral-850/50 hover:bg-neutral-850/10 font-sans"
                      >
                        <td className="py-3 px-2">
                          <span className="font-mono text-sm font-extrabold tracking-wider bg-amber-50 dark:bg-neutral-900 py-1 px-2.5 rounded-lg border border-amber-500/10 text-amber-800 dark:text-amber-350">
                            {coupon.code}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-bold text-neutral-900 dark:text-white">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}% Off Total`
                            : `₹${coupon.discountValue} Off Direct`}
                        </td>
                        <td className="py-3 px-2 font-mono text-neutral-400">{coupon.expiryDate}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => onToggleCoupon(coupon.code)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest leading-none border transition cursor-pointer ${
                              coupon.activeStatus
                                ? "bg-emerald-50 text-emerald-700 border-emerald-500/20 hover:bg-emerald-100"
                                : "bg-zinc-50 text-zinc-400 border-zinc-200 hover:bg-zinc-150"
                            }`}
                          >
                            {coupon.activeStatus ? "✔ Enabled" : "✘ Inactive"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: BULK ADJUSTMENTS SPACE */}
        {adminTab === "bulk" && (
          <div className="max-w-xl mx-auto bg-[#FAF9F5] dark:bg-[#151111] p-8 rounded-3xl border border-amber-50 dark:border-neutral-850 space-y-6">
            <div className="text-center space-y-1.5 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <ArrowRightLeft className="h-7 w-7 text-amber-800 mx-auto animate-pulse" />
              <h2 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">Professional Bulk Catalogue pricing adjustments</h2>
              <p className="text-[11px] text-neutral-405 leading-relaxed font-sans">
                Instantly adjust broad item values, dynamic promotional rates, or category alignments in real time.
              </p>
            </div>

            <form onSubmit={handleBulkSubmit} className="space-y-4 text-xs">
              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-neutral-500 font-bold uppercase">Select Category target</label>
                <select
                  value={bPCat}
                  onChange={(e) => setBPCat(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 p-3 rounded-lg outline-none text-neutral-900 dark:text-white cursor-pointer"
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Price multiplier */}
              <div className="space-y-1.5">
                <label className="text-neutral-500 font-bold uppercase block">Dynamic price multiplier</label>
                <label className="text-[10px] text-neutral-400 font-sans block leading-none pb-1">e.g. 1.1 increases values by 10%, 0.85 performs dynamic 15% price markdown reduction</label>
                <input
                  type="text"
                  value={bPMultiplier}
                  onChange={(e) => setBPMultiplier(e.target.value)}
                  placeholder="e.g. 1.05"
                  className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 p-3 rounded-lg outline-none text-neutral-900 dark:text-white font-mono"
                />
              </div>

              {/* Promotional Discount percentage override */}
              <div className="space-y-1.5">
                <label className="text-neutral-500 font-bold uppercase">Promotional percentage discount override (%)</label>
                <input
                  type="number"
                  min={0}
                  max={95}
                  value={bPFixedDiscount}
                  onChange={(e) => setBPFixedDiscount(e.target.value)}
                  placeholder="e.g. 15 for 15% override promo rates"
                  className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 p-3 rounded-lg outline-none text-neutral-900 dark:text-white font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 px-4 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold uppercase tracking-wide leading-none transition"
              >
                Apply wide category adjustments
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: AI COPILOT MAKER (GEMINI CREATOR) */}
        {adminTab === "copilot" && (
          <div className="max-w-2xl mx-auto bg-[#FCFAF7] dark:bg-[#151111] p-8 rounded-3xl border border-amber-50 dark:border-neutral-850 space-y-6">
            <div className="text-center space-y-1.5 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <Sparkles className="h-9 w-9 text-amber-700 mx-auto animate-bounce" />
              <h2 className="font-serif text-xl font-bold text-neutral-900 dark:text-white">Gemini AI Culinary Product Blueprint Creator</h2>
              <p className="text-[11px] text-neutral-500 leading-relaxed font-sans max-w-md mx-auto">
                Formulate elegant, seasonal bakery ideas instantly! Input a general theme, and Gemini will synthesize sensory descriptions, gourmet ingredients lists, recommended categories, and fair prices.
              </p>
            </div>

            {/* Input Concept */}
            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1 text-left">
                <label className="text-neutral-500 font-bold uppercase">Concept Idea or Flavor Profiling</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={copilotConcept}
                    onChange={(e) => setCopilotConcept(e.target.value)}
                    placeholder="e.g. Cranberry Honey Pistachio Sourdough or Orange Candied Gateaux"
                    className="flex-1 bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 p-3 rounded-xl outline-none text-neutral-900 dark:text-white font-medium"
                  />
                  <button
                    onClick={handleCopilotGenerate}
                    disabled={copilotLoading || !copilotConcept.trim()}
                    className="bg-amber-850 hover:bg-amber-900 text-white font-bold px-5 py-3 rounded-xl text-xs uppercase flex items-center gap-1.5 transition leading-none shadow-sm disabled:opacity-50"
                  >
                    {copilotLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /><span className="text-[10px]">Formulating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" /> Synthesize
                      </>
                    )}
                  </button>
                </div>
              </div>

              {copilotError && (
                <div className="bg-red-50 dark:bg-red-950/25 border border-red-500/25 text-red-650 p-4 rounded-xl text-xs text-left">
                  {copilotError}
                </div>
              )}

              {/* Tips */}
              <div className="bg-amber-50/50 dark:bg-amber-905/10 p-4 rounded-2xl border border-amber-500/10 text-left space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">🌿 Recommended Prompts</span>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-neutral-405 italic">
                  <li>"Lavender Orange Honey Blossom Scone with lemon crystals"</li>
                  <li>"A winter-glazed Chocolate Pear Tart"</li>
                  <li>"Spiced Pumpkin & Roasted Pecan Sourdough Boule"</li>
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
