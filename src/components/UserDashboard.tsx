import React, { useState, FormEvent } from "react";
import { User, Phone, MapPin, Package, Clock, CheckCircle2, Truck, Timer, Sparkles } from "lucide-react";
import { Order, User as UserType } from "../types";

interface UserDashboardProps {
  user: UserType | null;
  orders: Order[];
  onUpdateProfile: (updatedParams: { name: string; phone: string; address: string }) => Promise<void>;
}

export default function UserDashboard({ user, orders, onUpdateProfile }: UserDashboardProps) {
  // Profile update form state
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setSuccess("");
    setError("");

    try {
      await onUpdateProfile({ name, phone, address });
      setSuccess("Your Parisian profile coordinates updated successfully!");
    } catch {
      setError("Failed to register profile modifications with server.");
    } finally {
      setSaving(false);
    }
  };

  // Status mapping to icons/colors
  const getStatusVisuals = (status: Order["orderStatus"]) => {
    switch (status) {
      case "Pending":
        return {
          color: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-500/20",
          desc: "Kitchen is queuing your bakes",
          icon: <Timer className="h-4 w-4" />
        };
      case "Preparing":
        return {
          color: "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border-amber-500/20",
          desc: "Bakers are scoring and fires are high",
          icon: <Clock className="h-4 w-4 animate-spin-slow" />
        };
      case "Out for Delivery":
        return {
          color: "bg-purple-50 dark:bg-purple-950/20 text-purple-600 border-purple-500/20",
          desc: "Courier carrying warm loaves to you",
          icon: <Truck className="h-4 w-4" />
        };
      case "Delivered":
        return {
          color: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-500/20",
          desc: "Delivered to your luxury doorstep",
          icon: <CheckCircle2 className="h-4 w-4" />
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 text-left">
      
      {/* HEADER SECTION */}
      <div className="border-b border-amber-100 dark:border-neutral-850 pb-6 mb-8 mt-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-neutral-900 dark:text-neutral-55">
          Gourmet Patron Lounge
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Review recent Parisian bakeries transactions, monitor live warm loaf step tracking, or modify your coordinates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: EDIT PROFILE SYSTEM */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1E1919] p-6 rounded-3xl border border-amber-100/40 dark:border-neutral-850 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <User className="h-5 w-5 text-amber-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-200">
              Patron Profile Details
            </span>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-500 uppercase flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-amber-700/60" /> Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-[#FCFBF9] dark:bg-neutral-850 border border-amber-100/40 dark:border-neutral-800 text-xs p-3 rounded-lg outline-none focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-white"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-500 uppercase flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-amber-700/60" /> Phone number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +33 6 12 34"
                className="w-full bg-[#FCFBF9] dark:bg-neutral-850 border border-amber-100/40 dark:border-neutral-800 text-xs p-3 rounded-lg outline-none focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-white"
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-500 uppercase flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-amber-700/60" /> Delivery Address
              </label>
              <textarea
                rows={4}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Saved courier delivery address"
                className="w-full bg-[#FCFBF9] dark:bg-neutral-850 border border-amber-100/40 dark:border-neutral-800 text-xs p-3 rounded-lg outline-none focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-white resize-none"
              />
            </div>

            {success && (
              <span className="text-[11px] text-emerald-600 block text-center font-bold tracking-wide">✔ {success}</span>
            )}
            {error && (
              <span className="text-[11px] text-red-500 block text-center font-medium">✘ {error}</span>
            )}

            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="w-full bg-amber-800 hover:bg-amber-900 text-white text-[11px] font-bold tracking-wider py-3 px-4 uppercase rounded-xl transition"
            >
              {saving ? "Registering..." : "Update Coordinates"}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: ACTIVE & HISTORIC TRANSACTIONS */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1E1919] p-6 sm:p-8 rounded-3xl border border-amber-100/40 dark:border-neutral-850 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <Package className="h-5 w-5 text-amber-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-200">
              Kitchen Orders Tracker ({orders.length})
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Package className="h-10 w-10 text-neutral-300 mx-auto" />
              <p className="text-xs text-neutral-400 font-bold uppercase">No transactions found in history</p>
              <p className="text-xs text-neutral-400">Order cookies, tarts, and levains inside our main e-store!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const stepDetails = getStatusVisuals(order.orderStatus);

                return (
                  <div
                    key={order.id}
                    className="border border-neutral-100 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs hover:border-amber-100"
                  >
                    {/* Upper Metadata panel */}
                    <div className="bg-neutral-50 dark:bg-[#1C1818]/80 p-4 border-b border-neutral-150 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <p className="font-mono text-xs font-bold text-neutral-900 dark:text-white">Order: {order.id}</p>
                        <p className="text-[10px] text-neutral-400 font-medium">Placed on: {new Date(order.createdAt).toLocaleString()}</p>
                      </div>

                      {/* Status indicator */}
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${stepDetails.color}`}>
                        {stepDetails.icon}
                        {order.orderStatus}
                      </div>
                    </div>

                    {/* Order items body */}
                    <div className="p-4 sm:p-6 space-y-4">
                      <div className="space-y-2">
                        {order.products.map((item, id) => (
                          <div key={id} className="flex justify-between items-center text-xs text-neutral-800 dark:text-neutral-200">
                            <span className="font-serif">
                              {item.quantity}x <span className="font-sans text-neutral-700 dark:text-neutral-300">{item.name}</span>
                            </span>
                            <span className="font-mono text-neutral-500">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Timeline diagram summary */}
                      <div className="bg-[#FAF8F5] dark:bg-[#151111] p-4 rounded-xl border border-amber-50 dark:border-neutral-850 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="text-left space-y-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700">Dispatch Details</span>
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-300 font-sans break-words max-w-sm">
                            Deliver to: {order.deliveryAddress} ({order.deliveryPhone})
                          </p>
                        </div>
                        
                        <div className="md:text-right flex flex-col justify-end space-y-0.5">
                          {order.discountAmount > 0 && (
                            <span className="text-[10px] text-emerald-600 font-semibold leading-none">Coupon Privilege reduction: -₹{order.discountAmount}</span>
                          )}
                          <span className="font-serif text-sm font-bold text-neutral-900 dark:text-white">Paid Totals: ₹{order.totalAmount}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
