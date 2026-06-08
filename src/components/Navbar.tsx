import { ShoppingCart, Heart, User, ShieldCheck, Sun, Moon, LogOut, Sparkles } from "lucide-react";
import { User as UserType } from "../types";

interface NavbarProps {
  user: UserType | null;
  role: "admin" | "user";
  onRoleToggle: () => void;
  onSetView: (view: string) => void;
  activeView: string;
  cartCount: number;
  wishlistCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onTriggerCart: () => void;
  onTriggerWishlist: () => void;
  onLogout: () => void;
}

export default function Navbar({
  user,
  role,
  onRoleToggle,
  onSetView,
  activeView,
  cartCount,
  wishlistCount,
  isDarkMode,
  onToggleDarkMode,
  onTriggerCart,
  onTriggerWishlist,
  onLogout
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#1A1515]/90 backdrop-blur-md border-b border-amber-100 dark:border-neutral-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Signature */}
          <div className="flex items-center space-x-12 cursor-pointer" onClick={() => onSetView("home")}>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-amber-900 dark:text-amber-100">
                L'Artisan <span className="text-amber-600 font-normal italic">Boulanger</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-amber-500 font-bold font-sans">
                Parisian Finery &bull; Est. 2016
              </span>
            </div>

            {/* Main Navigation Links */}
            <nav className="hidden lg:flex space-x-8 text-sm font-medium">
              <button
                onClick={() => onSetView("home")}
                className={`transition-colors py-2 ${
                  activeView === "home" ? "text-amber-800 dark:text-amber-400 font-semibold" : "text-neutral-500 dark:text-neutral-400 hover:text-amber-800"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => onSetView("storefront")}
                className={`transition-colors py-2 ${
                  activeView === "storefront" ? "text-amber-800 dark:text-amber-400 font-semibold" : "text-neutral-500 dark:text-neutral-400 hover:text-amber-800"
                }`}
              >
                Signature Boulangerie
              </button>
              {user && (
                <button
                  onClick={() => onSetView("dashboard")}
                  className={`transition-colors py-2 ${
                    activeView === "dashboard" ? "text-amber-800 dark:text-amber-400 font-semibold" : "text-neutral-500 dark:text-neutral-400 hover:text-amber-800"
                  }`}
                >
                  My Profile & Orders
                </button>
              )}
            </nav>
          </div>

          {/* Action Center Controls */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            
            {/* Quick Role-Switcher Bar and Highlight Indicator */}
            <div className="flex items-center bg-amber-50 dark:bg-amber-950/20 px-3 py-1.5 rounded-full border border-amber-100 dark:border-amber-950/50">
              <ShieldCheck className="h-4 w-4 mr-1.5 text-amber-700 dark:text-amber-400" />
              <button
                onClick={onRoleToggle}
                className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider hover:underline"
                title="Toggle sandbox accounts for reviewer demo"
              >
                {role === "admin" ? "Simulate: Admin Mode" : "Simulate: Customer"}
              </button>
              {role === "admin" && (
                <span className="ml-1.5 flex h-2 w-2 rounded-full bg-emerald-500"></span>
              )}
            </div>

            {/* Admin Management Workspace shortcut */}
            {role === "admin" && (
              <button
                onClick={() => onSetView("admin")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide flex items-center gap-1 leading-none shadow-sm transition ${
                  activeView === "admin"
                    ? "bg-amber-850 hover:bg-amber-900 text-white"
                    : "bg-amber-100/55 dark:bg-neutral-850 hover:bg-amber-100 text-amber-900 dark:text-amber-200"
                }`}
              >
                <Sparkles className="h-3 w-3 animate-pulse" /> Workspace
              </button>
            )}

            {/* Dark mode toggler */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-150 dark:hover:bg-neutral-800 rounded-full transition"
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Wishlist */}
            {role === "user" && (
              <button
                onClick={onTriggerWishlist}
                className="relative p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                    {wishlistCount}
                  </span>
                )}
              </button>
            )}

            {/* Cart Floating Button */}
            {role === "user" && (
              <button
                onClick={onTriggerCart}
                className="relative p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-amber-700 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-semibold animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* User details OR login button */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div onClick={() => onSetView(role === "admin" ? "admin" : "dashboard")} className="hidden sm:flex flex-col text-right cursor-pointer">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-100 leading-none">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition"
                  title="Logout Session"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onSetView("login")}
                className="bg-amber-900 border border-amber-800/20 hover:bg-amber-950 text-white text-xs px-4 py-2 font-semibold uppercase tracking-wider rounded-lg transition"
              >
                Sign In
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}
