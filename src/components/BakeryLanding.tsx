import { Star, Flame, Award, HeartHandshake, ArrowRight, ArrowLeft } from "lucide-react";
import { Product } from "../types";

interface BakeryLandingProps {
  products: Product[];
  onSetView: (view: string) => void;
}

const REVIEWS = [
  {
    name: "Genevieve Dubois",
    role: "Culinary Critic, Le Guide",
    review: "The slow-fermented crust on the Sourdough Boule is a masterpiece. Crispy, lactic, absolutely authentic Paris. Chef Pierre has captured Normandy excellence.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=85&w=150"
  },
  {
    name: "Marc-Antoine Laurent",
    role: "Chocolatier Enthusiast",
    review: "Unbelievable. The Belgian chocolate pain laminates break beautifully on touch. It flaked with layers like fine leaves. Magnifique!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=85&w=150"
  },
  {
    name: "Chloe de Montaigne",
    role: "Regular customer",
    review: "Kids are completely obsessed with their Meyer Lemon Cupcakes, and the macaron gift box is my favorite present to bring to friends. Simply lovely.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=85&w=150"
  }
];

export default function BakeryLanding({ products, onSetView }: BakeryLandingProps) {
  // Take top 3 as featured products
  const featured = products.slice(0, 3);

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-amber-50/20 to-transparent dark:from-neutral-900/40 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Creative Copy writing */}
          <div className="lg:col-span-7 space-y-6 text-left animate-fade-in">
            <div className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 px-3.5 py-1 rounded-full text-[11px] font-bold text-amber-900 dark:text-amber-350 uppercase tracking-widest leading-none">
              <Flame className="h-3 w-3 text-amber-600 animate-pulse" /> Traditional Fire Oven
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl text-amber-950 dark:text-amber-50 font-bold leading-tight tracking-tight">
              Flaky, aromatic, slow-aged <br />
              <span className="text-amber-700 italic font-normal">French Masterpieces</span>
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300 text-base max-w-xl leading-relaxed">
              Formulated with organic stoneground mill T55 flour, pure Normandy butter, and standard 36-hour wild-starter slow fermentation. Baked to perfect caramelization at dawn.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => onSetView("storefront")}
                className="bg-amber-900 hover:bg-amber-950 dark:bg-amber-800 dark:hover:bg-amber-700 text-white text-xs px-6 py-4 font-bold uppercase tracking-wider rounded-xl transition shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                Explore Boulangerie Menu <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("special-offers");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-transparent border border-amber-800/30 hover:border-amber-950 dark:border-amber-300/30 text-amber-900 dark:text-amber-200 text-xs px-6 py-4 font-bold uppercase tracking-wider rounded-xl transition"
              >
                View Promo Codes
              </button>
            </div>
          </div>

          {/* Majestic Hero Image Panel */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-amber-200 dark:bg-amber-900/20 rounded-3xl transform rotate-3 scale-95 blur-sm opacity-50"></div>
            <img
              src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1200"
              alt="Artisan flour dusting and freshly baked baguettes"
              className="relative w-full aspect-[4/3] rounded-3xl object-cover shadow-2xl border-4 border-amber-50 dark:border-neutral-800 transform hover:scale-[1.01] transition duration-500"
            />
            {/* Embedded Quality Tag */}
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-neutral-800 p-4 rounded-2xl shadow-xl border border-amber-100 dark:border-neutral-700 flex items-center space-x-3 max-w-[200px]">
              <Award className="h-10 w-10 text-amber-600 shrink-0" />
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase text-amber-600">Label Rouge</p>
                <p className="text-xs font-serif font-bold text-neutral-800 dark:text-neutral-100">100% French Mill Flour Certifié</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. ARTISANAL VALUES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-[#1E1919] p-8 rounded-2xl border border-amber-100/40 dark:border-neutral-850 shadow-sm text-left hover:border-amber-300 dark:hover:border-neutral-700 transition">
            <Award className="h-8 w-8 text-amber-700 mb-4" />
            <h3 className="font-serif text-lg font-bold mb-2 text-neutral-800 dark:text-neutral-150">Aged Levain Standard</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Our sourdough uses a mature wild levain cultured since 2016, providing complex lactic sweetness and easy digestible grain structures.
            </p>
          </div>
          <div className="bg-white dark:bg-[#1E1919] p-8 rounded-2xl border border-amber-100/40 dark:border-neutral-850 shadow-sm text-left hover:border-amber-300 dark:hover:border-neutral-700 transition">
            <Flame className="h-8 w-8 text-amber-700 mb-4" />
            <h3 className="font-serif text-lg font-bold mb-2 text-neutral-800 dark:text-neutral-150">Traditional Fire Hearth</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Breads are loaded onto stone decks under high humidity, exploding the gas cell matrix to form perfect, crispy ears.
            </p>
          </div>
          <div className="bg-white dark:bg-[#1E1919] p-8 rounded-2xl border border-amber-100/40 dark:border-neutral-850 shadow-sm text-left hover:border-amber-300 dark:hover:border-neutral-700 transition">
            <HeartHandshake className="h-8 w-8 text-amber-700 mb-4" />
            <h3 className="font-serif text-lg font-bold mb-2 text-neutral-800 dark:text-neutral-150">Noble Ingredients</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              We completely bypass preservatives. Fine Normandy butter, raw sugar molasses, and unwashed Sel de Guérande crystals are our standard.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between text-left">
          <div>
            <h2 className="font-serif text-3xl font-bold text-amber-950 dark:text-amber-50">Chef's Signature Selections</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Baked daily with certified local agricultural assets</p>
          </div>
          <button
            onClick={() => onSetView("storefront")}
            className="text-amber-800 dark:text-amber-400 hover:text-amber-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1 mt-4 sm:mt-0"
          >
            Show full product range <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map((product) => (
            <div
              key={product.id}
              onClick={() => onSetView("storefront")}
              className="bg-white dark:bg-[#1C1818] rounded-2xl overflow-hidden border border-amber-100/40 dark:border-neutral-850 shadow-md group cursor-pointer hover:-translate-y-1 transition duration-300 flex flex-col h-full"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                {product.discount > 0 && (
                  <span className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] uppercase font-bold py-1 px-2.5 rounded-full shadow-sm">
                    {product.discount}% Off
                  </span>
                )}
              </div>
              <div className="p-6 text-left flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1 block">
                    {product.category}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-neutral-800 dark:text-neutral-100 group-hover:text-amber-800 transition line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2">
                    {product.description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <div>
                    {product.discount > 0 ? (
                      <div className="flex items-center space-x-1.5">
                        <span className="text-lg font-serif font-semibold text-neutral-900 dark:text-white">
                          ₹{Math.round((product.price * (100 - product.discount)) / 100)}
                        </span>
                        <span className="text-xs text-neutral-400 line-through">
                          ₹{product.price}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-serif font-semibold text-neutral-900 dark:text-white">
                        ₹{product.price}
                      </span>
                    )}
                  </div>
                  <span className="text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1.5 transition">
                    Quick Shop <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. DYNAMIC SPECIAL OFFERS COUPOUN SECTION */}
      <section id="special-offers" className="bg-amber-900 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl max-w-7xl mx-auto shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
          
          <div className="lg:col-span-6 space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              Exclusive Boulangerie <br />
              <span className="text-amber-300 italic font-normal">Promotions & Coupons</span>
            </h2>
            <p className="text-sm text-amber-100 leading-relaxed max-w-md">
              Unlock secret chef privileges and direct flat/percentage discounts by testing these active codes directly inside the Checkout window!
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Promo Card 1 */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-200">10% OFF TOTAL</span>
                <p className="font-serif text-xs font-bold text-white mt-1">Unlock on any fresh pastries</p>
              </div>
              <div className="mt-6 flex items-center justify-between bg-white/5 py-2 px-3 rounded-xl border border-white/10 select-all">
                <span className="font-mono text-sm font-bold tracking-wider text-amber-300 uppercase">WELCOME10</span>
                <span className="text-[9px] uppercase tracking-wider text-white/50">Copy Click</span>
              </div>
            </div>

            {/* Promo Card 2 */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-200">₹100 DIRECT REDUCTION</span>
                <p className="font-serif text-xs font-bold text-white mt-1">Sourdough & Country Bread discount</p>
              </div>
              <div className="mt-6 flex items-center justify-between bg-white/5 py-2 px-3 rounded-xl border border-white/10 select-all">
                <span className="font-mono text-sm font-bold tracking-wider text-amber-300 uppercase">BREADLOVE</span>
                <span className="text-[9px] uppercase tracking-wider text-white/50">Copy Click</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-amber-950 dark:text-amber-50">Laudatory Critics & Patron Reviews</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">What Parisian gastrophiles are writing about Chef Pierre's ovens</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((review, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#1C1818] p-8 rounded-3xl border border-amber-100/40 dark:border-neutral-850 shadow-sm text-left flex flex-col justify-between"
            >
              <div>
                <div className="flex space-x-1 mb-4 text-amber-500">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 italic leading-relaxed font-serif">
                  "{review.review}"
                </p>
              </div>
              <div className="flex items-center space-x-4 mt-8 pt-4 border-t border-amber-55 dark:border-neutral-850">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="h-10 w-10 rounded-full object-cover shadow-inner bg-neutral-150"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{review.name}</h4>
                  <p className="text-[10px] text-neutral-400 font-medium">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
