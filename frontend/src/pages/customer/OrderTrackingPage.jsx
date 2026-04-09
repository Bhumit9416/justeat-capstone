import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getOrderById } from "../../api/orders";
import { rateRestaurant } from "../../api/restaurants";
import { toast } from "react-toastify";

// ── Icons ────────────────────────────────────────────────────────────────────
function ArrowLeftIcon()  { return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>; }
function CheckIcon()      { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>; }
function ClockIcon()      { return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function MapPinIcon()     { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function PhoneIcon()      { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.82a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>; }
function StarIcon()       { return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>; }
function ReceiptIcon()    { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>; }
function BikeIcon()       { return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M15 6h2l3 5.5M2 17.5h11.5L10 6h5"/></svg>; }
function ListIcon()       { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>; }
function HomeIcon()       { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_STEPS = [
  {
    key: "PENDING",
    label: "Order Placed",
    sub: "We've received your order",
    icon: "🧾",
    color: "rose",
  },
  {
    key: "PREPARING",
    label: "Preparing",
    sub: "Chef is cooking your meal",
    icon: "👨‍🍳",
    color: "orange",
  },
  {
    key: "READY",
    label: "Out for Delivery",
    sub: "Rider is on the way",
    icon: "🛵",
    color: "blue",
  },
  {
    key: "COMPLETED",
    label: "Delivered",
    sub: "Enjoy your meal!",
    icon: "🎉",
    color: "emerald",
  },
];

const STATUS_INDEX = { PENDING: 0, PREPARING: 1, READY: 2, COMPLETED: 3 };

const STEP_COLOR = {
  rose:    { ring: "ring-rose-500",    bg: "bg-rose-500",    text: "text-rose-500",    light: "bg-rose-50",    border: "border-rose-200"    },
  orange:  { ring: "ring-orange-500",  bg: "bg-orange-500",  text: "text-orange-500",  light: "bg-orange-50",  border: "border-orange-200"  },
  blue:    { ring: "ring-blue-500",    bg: "bg-blue-500",    text: "text-blue-500",    light: "bg-blue-50",    border: "border-blue-200"    },
  emerald: { ring: "ring-emerald-500", bg: "bg-emerald-500", text: "text-emerald-500", light: "bg-emerald-50", border: "border-emerald-200" },
};

// Fake rider pool
const RIDERS = [
  { name: "Rahul Sharma",   phone: "+91 98765 43210", rating: 4.9, trips: 1240 },
  { name: "Arjun Mehta",    phone: "+91 87654 32109", rating: 4.8, trips: 890  },
  { name: "Suresh Kumar",   phone: "+91 76543 21098", rating: 4.7, trips: 2100 },
  { name: "Vikram Patel",   phone: "+91 65432 10987", rating: 4.9, trips: 567  },
];

// Total delivery window from order placement (35 min)
const TOTAL_DELIVERY_MINS = 35;

// Compute remaining seconds based on actual order creation time
function calcRemainingSeconds(createdAt) {
  if (!createdAt) return TOTAL_DELIVERY_MINS * 60;
  const placed = new Date(createdAt).getTime();
  const deadline = placed + TOTAL_DELIVERY_MINS * 60 * 1000;
  return Math.max(0, Math.floor((deadline - Date.now()) / 1000));
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const { state }   = useLocation();

  const [order, setOrder]           = useState(state?.order || null);
  const [loading, setLoading]       = useState(!state?.order);
  const [secsLeft, setSecsLeft]     = useState(
    state?.order ? calcRemainingSeconds(state.order.createdAt) : null
  );
  const [ratingVal, setRatingVal]   = useState(0);
  const [ratingDone, setRatingDone] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [showTip, setShowTip]       = useState(false);
  const [tip, setTip]               = useState(0);

  const timerRef   = useRef(null);
  const pollRef    = useRef(null);

  // ── Initial load if not passed via state ─────────────────────────────────
  useEffect(() => {
    if (!state?.order) {
      getOrderById(orderId)
        .then(res => {
          if (res.success) {
            setOrder(res.data);
            setSecsLeft(calcRemainingSeconds(res.data.createdAt));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  // ── Live polling every 8 s — updates order status from backend ───────────
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await getOrderById(orderId);
        if (res.success) setOrder(res.data);
      } catch {}
    }, 8000);
    return () => clearInterval(pollRef.current);
  }, [orderId]);

  // ── Countdown — recalculates every second from actual createdAt ───────────
  useEffect(() => {
    clearInterval(timerRef.current);
    if (!order || order.status === "COMPLETED") {
      setSecsLeft(0);
      return;
    }
    setSecsLeft(calcRemainingSeconds(order.createdAt));
    timerRef.current = setInterval(() => {
      setSecsLeft(calcRemainingSeconds(order.createdAt));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [order?.id, order?.status, order?.createdAt]);

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
          className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center gap-4">
        <span className="text-5xl">😕</span>
        <p className="text-gray-500 font-semibold">Order not found</p>
        <button onClick={() => navigate("/customer/home")}
          className="bg-rose-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm">Go Home</button>
      </div>
    );
  }

  const stepIdx     = STATUS_INDEX[order.status] ?? 0;
  const currentStep = STATUS_STEPS[stepIdx];
  const isDone      = order.status === "COMPLETED";
  const rider       = RIDERS[order.id % RIDERS.length];
  const minutesLeft = secsLeft !== null ? Math.ceil(secsLeft / 60) : TOTAL_DELIVERY_MINS;

  // Bill
  const itemsTotal  = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = isDone ? 0 : 30;
  const taxAmt      = itemsTotal * 0.05;
  const finalTotal  = itemsTotal + deliveryFee + taxAmt + tip;

  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          <button onClick={() => navigate("/customer/home")}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition">
            <ArrowLeftIcon />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-gray-900 font-bold text-base leading-tight">Order Tracking</h1>
            <p className="text-gray-400 text-xs">Order #{order.id} &bull; {order.restaurantName}</p>
          </div>
          <button onClick={() => navigate("/customer/orders")}
            className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-600 hover:text-rose-500 hover:border-rose-200 text-xs font-semibold px-3 py-2 rounded-xl transition">
            <ListIcon /> All Orders
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* ── Hero ETA Card ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl overflow-hidden shadow-lg ${isDone ? "bg-gradient-to-br from-emerald-500 to-teal-500" : "bg-gradient-to-br from-rose-500 via-rose-500 to-orange-400"}`}>
          <div className="px-6 pt-7 pb-6">
            {/* Animated emoji */}
            <div className="flex justify-center mb-4">
              {isDone ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}
                  className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-5xl">🎉</span>
                </motion.div>
              ) : (
                <motion.div
                  animate={{ x: [-6, 6, -6] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                  className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-5xl">🛵</span>
                </motion.div>
              )}
            </div>

            {isDone ? (
              <div className="text-center">
                <p className="text-white font-black text-2xl mb-1">Delivered!</p>
                <p className="text-white/80 text-sm">Hope you enjoyed your meal 😊</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-2">Estimated Delivery</p>
                <motion.p key={secsLeft} className="text-white font-black text-6xl leading-none mb-2 tabular-nums"
                  initial={{ scale: 1.05 }} animate={{ scale: 1 }}>
                  {minutesLeft}
                </motion.p>
                <p className="text-white/80 text-base font-semibold">minutes</p>
                {secsLeft !== null && secsLeft < 3600 && (
                  <p className="text-white/60 text-xs mt-2 font-mono">
                    {formatTime(secsLeft)} remaining
                  </p>
                )}
              </div>
            )}

            {/* Status badge */}
            <div className="mt-5 flex justify-center">
              <span className="bg-white/20 backdrop-blur text-white text-xs font-bold px-4 py-1.5 rounded-full border border-white/30">
                {currentStep.icon} {currentStep.label}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          {!isDone && (
            <div className="h-1.5 bg-white/20">
              <motion.div className="h-full bg-white/80 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${((stepIdx + 1) / STATUS_STEPS.length) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }} />
            </div>
          )}
        </motion.div>

        {/* ── Status Stepper ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-gray-800 font-bold text-sm mb-5 flex items-center gap-2">
            <ClockIcon /> Order Progress
          </h2>
          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />
            <motion.div className="absolute left-5 top-5 w-0.5 bg-gradient-to-b from-rose-500 to-emerald-500 origin-top"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: Math.min(stepIdx / (STATUS_STEPS.length - 1), 1) }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }} />

            <div className="space-y-5">
              {STATUS_STEPS.map((step, i) => {
                const done    = i <= stepIdx;
                const active  = i === stepIdx;
                const col     = STEP_COLOR[step.color];
                return (
                  <motion.div key={step.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex items-center gap-4 relative">
                    {/* Circle */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-500 border-2 ${
                      done
                        ? `${col.bg} border-transparent shadow-md`
                        : "bg-white border-gray-200"
                    } ${active ? `ring-4 ${col.ring}/20` : ""}`}>
                      {done ? (
                        i < stepIdx
                          ? <CheckIcon />
                          : <span className="text-lg">{step.icon}</span>
                      ) : (
                        <span className="text-gray-300 text-base">{i + 1}</span>
                      )}
                      {done && i < stepIdx && <span className="text-white"><CheckIcon /></span>}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm ${done ? "text-gray-900" : "text-gray-300"}`}>{step.label}</p>
                      <p className={`text-xs mt-0.5 ${active ? col.text : done ? "text-gray-400" : "text-gray-200"}`}>{step.sub}</p>
                    </div>

                    {/* Active pulse */}
                    {active && !isDone && (
                      <span className="relative flex h-2.5 w-2.5 mr-1">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${col.bg} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${col.bg}`}></span>
                      </span>
                    )}
                    {i === stepIdx && isDone && (
                      <span className="text-emerald-500 text-xs font-bold">✓ Done</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── Rider Card ── */}
        {(order.status === "READY" || order.status === "COMPLETED") && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-gray-800 font-bold text-sm mb-4 flex items-center gap-2">
              <BikeIcon /> Your Delivery Partner
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center text-3xl shrink-0">
                🧑‍💼
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-bold text-base">{rider.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <StarIcon />
                  <span className="text-gray-700 text-sm font-semibold">{rider.rating}</span>
                  <span className="text-gray-400 text-xs">&bull; {rider.trips.toLocaleString()} trips</span>
                </div>
              </div>
              <a href={`tel:${rider.phone}`}
                className="w-11 h-11 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl flex items-center justify-center text-rose-500 transition shrink-0">
                <PhoneIcon />
              </a>
            </div>
            {/* Mock map strip */}
            <div className="mt-4 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-100 flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: "repeating-linear-gradient(0deg,#10b98120 0,#10b98120 1px,transparent 1px,transparent 28px),repeating-linear-gradient(90deg,#10b98120 0,#10b98120 1px,transparent 1px,transparent 28px)" }} />
              <div className="relative flex items-center gap-3">
                <span className="text-2xl">📍</span>
                <div className="h-0.5 w-16 bg-gradient-to-r from-rose-400 to-emerald-400 rounded-full" />
                <motion.span className="text-2xl" animate={{ x: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 1.2 }}>🛵</motion.span>
                <div className="h-0.5 w-8 bg-gray-300 rounded-full" />
                <span className="text-2xl">🏠</span>
              </div>
              <span className="absolute bottom-2 right-3 text-[10px] text-teal-600 font-semibold">Live tracking</span>
            </div>
          </motion.div>
        )}

        {/* ── Delivery Address ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-gray-800 font-bold text-sm mb-3 flex items-center gap-2">
            <MapPinIcon /> Delivering To
          </h2>
          <div className="flex gap-3 items-start">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-lg">🏠</span>
            </div>
            <div>
              <p className="text-gray-900 font-semibold text-sm">Home</p>
              <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">123, Sector 18, Near Metro Station<br />Gurugram, Haryana – 122001</p>
            </div>
          </div>
        </motion.div>

        {/* ── Order Summary ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-gray-800 font-bold text-sm mb-4 flex items-center gap-2">
            <ReceiptIcon /> Order Summary
          </h2>

          {/* Restaurant */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center text-xl">
              🍽️
            </div>
            <div>
              <p className="text-gray-900 font-bold text-sm">{order.restaurantName}</p>
              <p className="text-gray-400 text-xs">Order ID: #{order.id}</p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3 mb-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                  <span className="text-rose-600 font-bold text-[10px]">{item.quantity}×</span>
                </div>
                <p className="flex-1 text-gray-700 text-sm font-medium">{item.menuItemName}</p>
                <p className="text-gray-900 font-bold text-sm">₹{(item.price * item.quantity).toFixed(0)}</p>
              </div>
            ))}
          </div>

          {/* Bill breakdown */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 border border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Item Total</span>
              <span className="text-gray-800 font-semibold">₹{itemsTotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery Fee</span>
              <span className={deliveryFee === 0 ? "text-emerald-600 font-semibold" : "text-gray-800 font-semibold"}>
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">GST (5%)</span>
              <span className="text-gray-800 font-semibold">₹{taxAmt.toFixed(0)}</span>
            </div>
            {tip > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tip for rider 🙏</span>
                <span className="text-emerald-600 font-semibold">₹{tip}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2.5 flex justify-between">
              <span className="text-gray-900 font-bold text-base">Total Paid</span>
              <span className="text-rose-600 font-black text-base">₹{finalTotal.toFixed(0)}</span>
            </div>
          </div>

          {/* Tip for rider */}
          {!isDone && (
            <div className="mt-4">
              {!showTip ? (
                <button onClick={() => setShowTip(true)}
                  className="w-full text-xs font-semibold text-emerald-600 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5">
                  💚 Add a tip for your delivery partner
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-gray-500 text-xs font-semibold shrink-0">Tip:</p>
                  {[10, 20, 30, 50].map(t => (
                    <button key={t} onClick={() => setTip(tip === t ? 0 : t)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                        tip === t ? "bg-emerald-500 text-white border-emerald-500" : "bg-white border-gray-200 text-gray-600 hover:border-emerald-300"
                      }`}>
                      ₹{t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* ── Rate Experience (after delivered) ── */}
        {isDone && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-gray-800 font-bold text-sm mb-1">Rate your experience</h2>
            <p className="text-gray-400 text-xs mb-4">How was your meal from {order.restaurantName}?</p>
            {!ratingDone ? (
              <>
                {/* Stars */}
                <div className="flex justify-center gap-3 mb-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <motion.button key={s} whileHover={{ scale: 1.25 }} whileTap={{ scale: 0.85 }}
                      onClick={() => setRatingVal(s)}
                      className={`text-3xl transition-all duration-150 ${s <= ratingVal ? "opacity-100 drop-shadow-sm" : "opacity-20 grayscale"}`}>
                      ⭐
                    </motion.button>
                  ))}
                </div>
                {/* Label */}
                {ratingVal > 0 && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center text-sm font-semibold text-gray-600 mb-4">
                    {["", "😞 Poor", "😐 Fair", "🙂 Good", "😊 Great", "🤩 Excellent!"][ratingVal]}
                  </motion.p>
                )}
                <AnimatePresence>
                  {ratingVal > 0 && (
                    <motion.button initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      disabled={ratingSubmitting}
                      onClick={async () => {
                        setRatingSubmitting(true);
                        try {
                          await rateRestaurant(order.restaurantId, ratingVal);
                          setRatingDone(true);
                          toast.success("⭐ Rating submitted! Thanks for your feedback.");
                        } catch {
                          toast.error("Couldn't submit rating. Try again.");
                        } finally {
                          setRatingSubmitting(false);
                        }
                      }}
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-bold text-sm transition disabled:opacity-60 flex items-center justify-center gap-2">
                      {ratingSubmitting
                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</>
                        : "Submit Rating"
                      }
                    </motion.button>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                className="flex flex-col items-center gap-2 py-2">
                <span className="text-4xl">🙏</span>
                <p className="text-gray-700 font-bold text-sm">Thanks for rating!</p>
                <div className="flex gap-1 mt-1">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={`text-xl ${s <= ratingVal ? "opacity-100" : "opacity-20 grayscale"}`}>⭐</span>
                  ))}
                </div>
                <p className="text-gray-400 text-xs mt-1">Your rating helps other customers decide 🍽️</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Offers / Promo strip ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl shrink-0">🏷️</span>
          <div className="flex-1 min-w-0">
            <p className="text-amber-800 font-bold text-sm">Save on your next order!</p>
            <p className="text-amber-600 text-xs">Use code <span className="font-black">WELCOME50</span> for ₹50 off</p>
          </div>
          <button
            onClick={() => { navigator.clipboard?.writeText("WELCOME50"); }}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition shrink-0">
            Copy
          </button>
        </motion.div>

        {/* ── Bottom CTAs ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="grid grid-cols-2 gap-3 pb-8">
          <button onClick={() => navigate("/customer/home")}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-rose-200 hover:text-rose-500 text-gray-600 font-semibold text-sm py-3.5 rounded-2xl transition shadow-sm">
            <HomeIcon /> Home
          </button>
          <button onClick={() => navigate("/customer/orders")}
            className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm py-3.5 rounded-2xl transition shadow-lg shadow-rose-500/25">
            <ListIcon /> All Orders
          </button>
        </motion.div>
      </div>
    </div>
  );
}
