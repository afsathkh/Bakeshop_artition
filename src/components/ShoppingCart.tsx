import React, { useState, FormEvent } from "react";
import { X, Check, ShoppingBag, CreditCard, Ticket, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { CartItem, Coupon } from "../types";

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateCartQty: (productId: string, quantity: number) => void;
  onRemoveCartItem: (productId: string) => void;
  onCheckoutComplete: (orderParams: any) => Promise<void>;
  userProfile: any;
}

export default function ShoppingCart({
  isOpen,
  onClose,
  cartItems,
  onUpdateCartQty,
  onRemoveCartItem,
  onCheckoutComplete,
  userProfile
}: ShoppingCartProps) {
  // Navigation inside Cart Panel: "cart" | "checkout"
  const [step, setStep] = useState<"cart" | "checkout">("cart");

  // Coupon application states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Address form fields
  const [fullName, setFullName] = useState(userProfile?.name || "");
  const [phone, setPhone] = useState(userProfile?.phone || "");
  const [address, setAddress] = useState(userProfile?.address || "");
  
  // Checkout process trigger
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  if (!isOpen) return null;

  // Calculators
  const subtotal = cartItems.reduce((acc, c) => acc + (c.priceAfterDiscount * c.quantity), 0);

  let discountValue = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discountValue = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    } else {
      discountValue = Math.min(subtotal, appliedCoupon.discountValue);
    }
  }

  const finalBill = Math.max(0, subtotal - discountValue);

  // Validate coupon codes with backend
  const handleApplyCoupon = async (e: FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon(data);
        setCouponCode("");
      } else {
        setCouponError(data.error || "Failed raw coupon check.");
      }
    } catch {
      setCouponError("Unable to register response with sever.");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Submit checkout
  const handlePlaceOrder = async () => {
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setCheckoutError("Delivery parameters (Full Name, Phone, and Address) are mandatory.");
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError("");

    const orderProducts = cartItems.map(c => ({
      productId: c.id,
      name: c.name,
      price: c.priceAfterDiscount,
      quantity: c.quantity,
      image: c.image
    }));

    try {
      await onCheckoutComplete({
        products: orderProducts,
        deliveryAddress: address,
        deliveryPhone: phone,
        discountAmount: discountValue,
        totalAmount: finalBill
      });
      // Reset checkout step states
      setStep("cart");
      removeCoupon();
    } catch (err: any) {
      setCheckoutError(err.message || "Something triggered an internal billing error.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/65 backdrop-blur-xs flex justify-end">
      
      {/* Absolute Close Backdrop click trigger */}
      <div className="absolute inset-0 cursor-default" onClick={onClose}></div>

      {/* Slide drawer */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#1E1919] h-full shadow-2xl flex flex-col justify-between border-l border-amber-100 dark:border-neutral-850 animate-fade-in text-left">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-amber-100 dark:border-neutral-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step === "checkout" ? (
              <button onClick={() => setStep("cart")} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-850 rounded-full transition">
                <ArrowLeft className="h-4.5 w-4.5" />
              </button>
            ) : (
              <ShoppingBag className="h-5 w-5 text-amber-800 dark:text-amber-400" />
            )}
            <h2 className="font-serif text-lg font-bold text-neutral-800 dark:text-neutral-50">
              {step === "checkout" ? "Delivery & Finalize" : "Gourmet Shopping Basket"}
            </h2>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-850 dark:hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body content (Switch depending on active step) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-24 space-y-3">
              <ShoppingBag className="h-12 w-12 text-neutral-300 mx-auto animate-bounce" />
              <p className="text-xs font-bold text-neutral-500 dark:text-neutral-450">Your basket is completely empty.</p>
              <button
                onClick={onClose}
                className="text-amber-800 dark:text-amber-400 font-bold hover:underline text-xs tracking-wider uppercase"
              >
                Go browse the signature menu
              </button>
            </div>
          ) : step === "cart" ? (
            
            /* STEP 1: SHOPPING BASKET SUMMARY LIST */
            <div className="space-y-4">
              {cartItems.map(item => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-neutral-50 dark:bg-[#151111] border border-amber-50/50 dark:border-neutral-850 rounded-xl"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 rounded-lg object-cover bg-neutral-100"
                  />
                  <div className="flex-1 flex flex-col justify-between text-xs">
                    <div>
                      <h4 className="font-serif font-bold text-neutral-800 dark:text-neutral-100 leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-neutral-400 mt-0.5 font-sans">Unit: ₹{item.priceAfterDiscount}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity manager */}
                      <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-850 px-1.5 py-0.5">
                        <button
                          onClick={() => onUpdateCartQty(item.id, item.quantity - 1)}
                          className="hover:text-amber-850 text-neutral-400 p-0.5"
                        >
                          <MinusIcon className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-neutral-850 dark:text-white text-[11px]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateCartQty(item.id, item.quantity + 1)}
                          className="hover:text-amber-850 text-neutral-400 p-0.5"
                        >
                          <PlusIcon className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveCartItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          ) : (

            /* STEP 2: CHECKOUT INFO WINDOW */
            <div className="space-y-5 text-neutral-800 dark:text-neutral-250">
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700">Delivery Information</span>
                
                {/* Full name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-500 block uppercase">Recipient Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Recipient's Name"
                    className="w-full bg-[#FCFBF9] dark:bg-neutral-850 border border-amber-100/40 dark:border-neutral-800 text-xs p-3 rounded-lg outline-none focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-white"
                  />
                </div>

                {/* Delivery Phone */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-500 block uppercase">Contact Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +33 6 12 34 56"
                    className="w-full bg-[#FCFBF9] dark:bg-neutral-850 border border-amber-100/40 dark:border-neutral-800 text-xs p-3 rounded-lg outline-none focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-white"
                  />
                </div>

                {/* Delivery Address */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-500 block uppercase">Premium Delivery Address</label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 15 Rue Royale, Paris"
                    className="w-full bg-[#FCFBF9] dark:bg-neutral-850 border border-amber-100/40 dark:border-neutral-800 text-xs p-3 rounded-lg outline-none focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-white resize-none"
                  />
                </div>
              </div>

              {checkoutError && (
                <div className="bg-red-50 dark:bg-red-950/25 border border-red-500/20 text-red-600 px-4 py-3 rounded-xl text-xs">
                  {checkoutError}
                </div>
              )}
            </div>

          )}
        </div>

        {/* Coupon Checker & Checkout Totals Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-neutral-50 dark:bg-[#161111] border-t border-amber-100 dark:border-neutral-850 space-y-4">
            
            {/* Coupon Code Section */}
            {step === "checkout" && (
              <div className="pb-3 border-b border-amber-100/30 dark:border-neutral-850 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 block text-left">PROMO privilèges</span>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 rounded-xl border border-emerald-500/20 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-bold font-mono">
                      <Ticket className="h-4.5 w-4.5 text-emerald-600" />
                      {appliedCoupon.code} (
                      {appliedCoupon.discountType === "percentage"
                        ? `${appliedCoupon.discountValue}%`
                        : `₹${appliedCoupon.discountValue}`} Off)
                    </div>
                    <button onClick={removeCoupon} className="text-red-500 hover:text-red-800 font-bold hover:underline py-0.5 px-1.5 text-[10px]">
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. FESTIVE20, BREADLOVE"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-xs rounded-xl py-2.5 px-3 uppercase text-neutral-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponCode.trim()}
                      className="bg-amber-850 hover:bg-amber-900 text-white text-[11px] font-bold py-2.5 px-4 rounded-xl uppercase leading-none"
                    >
                      {couponLoading ? "Checking..." : "Apply"}
                    </button>
                  </form>
                )}
                {couponError && (
                  <span className="text-[10px] text-red-500 font-medium block text-left">{couponError}</span>
                )}
              </div>
            )}

            {/* Price breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Total Items</span>
                <span>{cartItems.reduce((acc, c) => acc + c.quantity, 0)} items</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Basket Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Privilege Coupon Discount</span>
                  <span>-₹{discountValue}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-900 dark:text-white font-bold text-sm pt-2 border-t border-dashed border-amber-205 dark:border-neutral-800">
                <span>Final amount due</span>
                <span>₹{finalBill}</span>
              </div>
            </div>

            {/* CTAs */}
            {step === "cart" ? (
              <button
                onClick={() => setStep("checkout")}
                className="w-full bg-amber-900 hover:bg-amber-950 text-white text-xs font-bold py-4 uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
              >
                <CreditCard className="h-4 w-4" /> Proceed to Checkout
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={checkoutLoading}
                className="w-full bg-amber-900 hover:bg-amber-950 text-white text-xs font-bold py-4 uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Cooking Order...
                  </>
                ) : (
                  <>Place Order & Pay (₹{finalBill})</>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full text-center text-[10px] font-bold text-neutral-400 hover:text-amber-800 dark:hover:text-amber-400 uppercase tracking-widest leading-none mt-1"
            >
              Continue shopping
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// Icon helper components
function PlusIcon(props: any) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

function MinusIcon(props: any) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
