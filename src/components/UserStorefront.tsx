import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, ArrowUpDown, Flame, BadgeAlert, Plus, Minus, Layers, Info, Calendar, Sparkles, X } from "lucide-react";
import { Product } from "../types";

interface UserStorefrontProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onAddToWishlist: (product: Product) => void;
  wishlistIds: string[];
}

export default function UserStorefront({
  products,
  onAddToCart,
  onBuyNow,
  onAddToWishlist,
  wishlistIds
}: UserStorefrontProps) {
  // Storefront states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest"); // "newest", "price-low", "price-high"

  // Selected Detail Modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailQuantity, setDetailQuantity] = useState(1);

  // Derive unique categories from products
  const categories = useMemo(() => {
    const list = ["All"];
    products.forEach(p => {
      if (!list.includes(p.category)) {
        list.push(p.category);
      }
    });
    return list;
  }, [products]);

  // Filter & Sort Logic
  const processedProducts = useMemo(() => {
    let list = [...products];

    // 1. Text Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        p => p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.ingredients.toLowerCase().includes(q)
      );
    }

    // 2. Category selection Filter
    if (selectedCategory !== "All") {
      list = list.filter(p => p.category === selectedCategory);
    }

    // 3. Sort strategy
    if (sortBy === "price-low") {
      list.sort((a, b) => {
        const finalA = a.price * (100 - a.discount) / 100;
        const finalB = b.price * (100 - b.discount) / 100;
        return finalA - finalB;
      });
    } else if (sortBy === "price-high") {
      list.sort((a, b) => {
        const finalA = a.price * (100 - a.discount) / 100;
        const finalB = b.price * (100 - b.discount) / 100;
        return finalB - finalA;
      });
    } else {
      // Newest
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [products, searchQuery, selectedCategory, sortBy]);

  // Modal helpers
  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    setDetailQuantity(1);
  };

  const incrementQty = (limit: number) => {
    setDetailQuantity(prev => Math.min(limit, prev + 1));
  };

  const decrementQty = () => {
    setDetailQuantity(prev => Math.max(1, prev - 1));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 text-left">
      
      {/* HEADER SPECS */}
      <div className="border-b border-amber-100 dark:border-neutral-850 pb-6 mb-8 mt-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-neutral-900 dark:text-neutral-55">
          Signature Craft Boulangerie
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Explore our daily fire-deck offerings, hand-baked by our master patissiers. Filter for allergens or category.
        </p>
      </div>

      {/* FILTER & INTERACTIVE SORT BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center mb-10">
        
        {/* Search Input */}
        <div className="lg:col-span-5 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search sourdough, baguettes, lavender cupcakes, organic chocolate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#1E1919] border border-amber-100 dark:border-neutral-800 text-xs py-3.5 pl-11 pr-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-white"
          />
        </div>

        {/* Category Carousel Trigger */}
        <div className="lg:col-span-4 flex gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-amber-800 text-white shadow-md shadow-amber-800/20"
                  : "bg-white dark:bg-[#1E1919] text-neutral-600 dark:text-neutral-400 border border-amber-100/40 dark:border-neutral-800 hover:bg-amber-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="lg:col-span-3 flex items-center bg-white dark:bg-[#1E1919] border border-amber-100 dark:border-neutral-800 rounded-xl px-3.5 py-1">
          <ArrowUpDown className="h-4 w-4 text-neutral-400 mr-2 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs text-neutral-700 dark:text-neutral-300 py-2 cursor-pointer font-medium"
          >
            <option value="newest" className="dark:bg-neutral-900">Sort by: Freshly Baked</option>
            <option value="price-low" className="dark:bg-neutral-900">Price: Low to High</option>
            <option value="price-high" className="dark:bg-neutral-900">Price: High to Low</option>
          </select>
        </div>

      </div>

      {/* PRODUCTS GRID MATRIX */}
      {processedProducts.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-[#1C1818] rounded-3xl border border-dashed border-amber-200/50 dark:border-neutral-800">
          <BadgeAlert className="h-10 w-10 text-neutral-400 mx-auto mb-3 animate-pulse" />
          <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">No Breads match your criteria</h3>
          <p className="text-xs text-neutral-400 mt-1">Try resetting your category filters or search phrasing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
          {processedProducts.map(product => {
            const hasDiscount = product.discount > 0;
            const finalPrice = Math.round(product.price * (100 - product.discount) / 100);
            const isLowStock = product.stock > 0 && product.stock <= 8;
            const isOut = product.stock === 0;

            return (
              <div
                key={product.id}
                className="bg-white dark:bg-[#1C1818] rounded-2xl overflow-hidden border border-amber-100/40 dark:border-neutral-850 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition duration-300 flex flex-col justify-between group"
              >
                {/* Product Media Area */}
                <div onClick={() => handleOpenModal(product)} className="relative aspect-square overflow-hidden bg-neutral-100 cursor-pointer">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                  />
                  {/* Absolute Badge elements */}
                  {hasDiscount && (
                    <span className="absolute top-3 left-3 bg-rose-500 text-white text-[9px] uppercase font-bold px-2 py-1 rounded-full shadow-sm">
                      {product.discount}% OFF
                    </span>
                  )}
                  {isOut && (
                    <span className="absolute inset-0 bg-neutral-900/60 flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                      Sold out for the day
                    </span>
                  )}
                </div>

                {/* Info and Actions */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div onClick={() => handleOpenModal(product)} className="cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 block">
                        {product.category}
                      </span>
                      {isLowStock && (
                        <span className="text-[9px] font-bold text-rose-500 uppercase flex items-center gap-1 leading-none">
                          <Flame className="h-3 w-3 animate-bounce" /> Low Stock
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-base font-bold text-neutral-800 dark:text-neutral-100 group-hover:text-amber-800 transition line-clamp-1 mt-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-neutral-400 dark:text-neutral-400 line-clamp-2 mt-1.5 leading-relaxed font-sans">
                      {product.description}
                    </p>
                  </div>

                  {/* Actions & pricing */}
                  <div className="pt-5 border-t border-amber-100/50 dark:border-neutral-850 mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-[9px] text-neutral-400 uppercase font-semibold leading-none mb-1">Gourmet Fare Price</p>
                      {hasDiscount ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-base font-serif font-semibold text-neutral-900 dark:text-white">
                            ₹{finalPrice}
                          </span>
                          <span className="text-xs text-neutral-450 line-through">
                            ₹{product.price}
                          </span>
                        </div>
                      ) : (
                        <span className="text-base font-serif font-semibold text-neutral-900 dark:text-white">
                          ₹{product.price}
                        </span>
                      )}
                    </div>

                    <div className="flex space-x-1.5">
                      <button
                        onClick={() => onAddToWishlist(product)}
                        className={`p-2.5 rounded-lg border transition ${
                          wishlistIds.includes(product.id)
                            ? "border-rose-500/20 bg-rose-50 dark:bg-rose-950/20 text-rose-500"
                            : "border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:bg-neutral-50"
                        }`}
                        title="Add to Wishlist"
                      >
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </button>
                      <button
                        disabled={isOut}
                        onClick={() => handleOpenModal(product)}
                        className="bg-amber-900 hover:bg-amber-950 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 text-white text-xs font-semibold uppercase px-3 py-2.5 rounded-lg transition"
                      >
                        Quick Add
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* DYNAMIC FRONTEND PRODUCT DETAIL POPUP MODAL */}
      {selectedProduct && (
        <div id="product-detail-modal" className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-[#1E1919] max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl border border-amber-100 dark:border-neutral-800 grid grid-cols-1 md:grid-cols-2 animate-fade-in text-left">
            
            {/* Left Column Image */}
            <div className="relative h-64 md:h-full bg-neutral-100">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 left-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 md:hidden"
              >
                <Minus className="h-4 w-4 rotate-45" />Close
              </button>
            </div>

            {/* Right Column Specification details */}
            <div className="p-6 md:p-8 flex flex-col justify-between h-full space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
                    {selectedProduct.category}
                  </span>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="hidden md:block text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  {selectedProduct.name}
                </h2>
                
                {/* Sourdough detail specs */}
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mt-3">
                  {selectedProduct.description}
                </p>

                {/* Gourmet Ingredient Tags panel */}
                <div className="mt-5 space-y-2 bg-neutral-50 dark:bg-[#151111] p-4 rounded-2xl border border-amber-50 dark:border-neutral-850">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block flex items-center gap-1">
                    <Layers className="h-3 w-3" /> Noble Formula Ingredients
                  </span>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
                    {selectedProduct.ingredients}
                  </p>
                </div>

                <div className="mt-5 flex items-center space-x-15 text-xs text-neutral-400">
                  <span className="flex items-center gap-1"><Info className="h-4 w-4 text-amber-600" /> Preservative Free</span>
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4 text-amber-600" /> Daily Fresh Base</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-amber-100/50 dark:border-neutral-850">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">Fare Totals</p>
                    <div className="flex items-baseline space-x-2">
                      <span className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">
                        ₹{Math.round(selectedProduct.price * (100 - selectedProduct.discount) / 100) * detailQuantity}
                      </span>
                      {selectedProduct.discount > 0 && (
                        <span className="text-xs text-neutral-400 line-through">
                          ₹{selectedProduct.price * detailQuantity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity manager */}
                  <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-xl px-2.5 py-1 text-sm bg-white dark:bg-neutral-800 shadow-sm">
                    <button
                      onClick={decrementQty}
                      className="p-1 hover:text-amber-800 transition text-neutral-500"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-neutral-900 dark:text-white text-xs">
                      {detailQuantity}
                    </span>
                    <button
                      onClick={() => incrementQty(selectedProduct.stock)}
                      className="p-1 hover:text-amber-800 transition text-neutral-500"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Store Cart Trigger CTAs */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      onAddToCart(selectedProduct, detailQuantity);
                      setSelectedProduct(null);
                    }}
                    className="border border-amber-800 hover:bg-amber-50 dark:border-amber-300 dark:hover:bg-neutral-850 text-amber-800 dark:text-amber-300 text-xs px-4 py-3.5 font-bold uppercase tracking-wider rounded-xl transition"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      onBuyNow(selectedProduct, detailQuantity);
                      setSelectedProduct(null);
                    }}
                    className="bg-amber-900 hover:bg-amber-950 dark:bg-amber-800 dark:hover:bg-amber-700 text-white text-xs px-4 py-3.5 font-bold uppercase tracking-wider rounded-xl transition shadow-lg"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
