import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getRestaurantById } from "../../api/restaurants";
import { getMenu } from "../../api/menu";
import { placeOrder } from "../../api/orders";
import { toast } from "react-toastify";

// ── Icons ──────────────────────────────────────────────
function ArrowLeftIcon()  { return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>; }
function PlusIcon()       { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function MinusIcon()      { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function StarIcon()       { return <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>; }
function MapPinIcon()     { return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function ClockIcon()      { return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function BagIcon()        { return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>; }
function TrashIcon()      { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>; }
function SearchIcon()     { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function XIcon()          { return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function TagIcon()        { return <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>; }
function InfoIcon()       { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>; }
function BikeIcon()       { return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M15 6h2l3 5.5M2 17.5h11.5L10 6h5"/></svg>; }

const DELIVERY_TIMES = ["20–30 min", "30–40 min", "40–50 min"];
const FOOD_EMOJIS    = ["🍕","🍔","🌮","🍜","🍱","🥘","🍛","🥗","🍣","🍝","🥙","🫔"];

export default function RestaurantPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [cart, setCart]             = useState({});
  const [search, setSearch]         = useState("");
  const [cartOpen, setCartOpen]     = useState(false);
  const [placing, setPlacing]       = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [vegFilter, setVegFilter]   = useState("all"); // "all" | "veg" | "nonveg"
  const [showInfo, setShowInfo]     = useState(false);
  const [promoCode, setPromoCode]   = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const menuRef = useRef(null);

  // Load restaurant + menu
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [rRes, mRes] = await Promise.all([getRestaurantById(id), getMenu(id)]);
        if (rRes.success) setRestaurant(rRes.data);
        if (mRes.success) setMenu(mRes.data);
      } catch { toast.error("Failed to load restaurant"); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  // Sticky header scroll spy
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 240);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Cart helpers
  const addToCart = (item) =>
    setCart(p => ({ ...p, [item.id]: { ...item, qty: (p[item.id]?.qty || 0) + 1 } }));

  const removeFromCart = (item) =>
    setCart(p => {
      const next = { ...p };
      if ((next[item.id]?.qty || 0) > 1) next[item.id] = { ...next[item.id], qty: next[item.id].qty - 1 };
      else delete next[item.id];
      return next;
    });

  const clearCart = () => { setCart({}); setPromoApplied(false); setPromoCode(""); };

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === "WELCOME50") {
      setPromoApplied(true);
      toast.success("🎉 Promo applied! ₹50 off your order.");
    } else {
      toast.error("Invalid promo code. Try WELCOME50");
    }
  };

  const cartItems  = Object.values(cart);
  const cartCount  = cartItems.reduce((s, i) => s + i.qty, 0);
  const cartTotal  = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const discount   = promoApplied ? 50 : 0;
  const tax        = Math.max(0, cartTotal - discount) * 0.05;
  const grandTotal = Math.max(0, cartTotal - discount) + tax;

  const handleOrder = async () => {
    if (!cartItems.length) return;
    setPlacing(true);
    try {
      const res = await placeOrder({
        restaurantId: parseInt(id),
        items: cartItems.map(i => ({ menuItemId: i.id, quantity: i.qty })),
      });
      if (res.success) {
        toast.success("🎉 Order placed! Get ready for a delicious meal.");
        clearCart();
        setCartOpen(false);
        navigate(`/customer/order/${res.data.id}`, { state: { order: res.data } });
      } else toast.error(res.message || "Failed to place order");
    } catch { toast.error("Error placing order"); }
    finally { setPlacing(false); }
  };

  const categories = [
    "All",
    ...(menu.some(m => m.isMostlyOrdered) ? ["🔥 Popular"] : []),
    ...(menu.some(m => m.isSpecial)       ? ["⭐ Specials"] : []),
    ...(menu.some(m => m.isDealOfDay)     ? ["🏷️ Deals"]   : []),
  ];

  const filtered = menu
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()) ||
                 (m.description || "").toLowerCase().includes(search.toLowerCase()))
    .filter(m => {
      if (activeCategory === "🔥 Popular") return m.isMostlyOrdered;
      if (activeCategory === "⭐ Specials") return m.isSpecial;
      if (activeCategory === "🏷️ Deals")   return m.isDealOfDay;
      return true;
    })
    .filter(m => {
      if (vegFilter === "veg")    return m.isVeg !== false;  // null/undefined → treat as veg
      if (vegFilter === "nonveg") return m.isVeg === false;
      return true;
    });

  const bestsellers  = menu.filter(m => m.isMostlyOrdered).slice(0, 4);
  const deliveryTime = restaurant ? DELIVERY_TIMES[restaurant.id % 3] : "30–40 min";
  const heroEmoji    = restaurant ? FOOD_EMOJIS[restaurant.id % FOOD_EMOJIS.length] : "🍽";

  // Loading
  if (loading) return (
    <div className="w-screen h-screen bg-[#f8f8f8] flex flex-col items-center justify-center gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full" />
      <p className="text-gray-400 text-sm font-medium animate-pulse">Loading menu…</p>
    </div>
  );

  // Reusable cart body
  const CartBody = () => (
    cartItems.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <span className="text-5xl mb-3">🛒</span>
        <p className="text-gray-700 font-bold text-sm">Your cart is empty</p>
        <p className="text-gray-400 text-xs mt-1">Browse the menu and add items</p>
      </div>
    ) : (
      <>
        <div className="max-h-56 overflow-y-auto divide-y divide-gray-50">
          {cartItems.map(item => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 font-semibold text-sm truncate">{item.name}</p>
                <p className="text-gray-400 text-xs">₹{item.price} × {item.qty}</p>
              </div>
              <div className="flex items-center border border-rose-200 rounded-lg overflow-hidden shrink-0">
                <button onClick={() => removeFromCart(item)} className="px-1.5 py-1 text-rose-500 hover:bg-rose-50 transition"><MinusIcon /></button>
                <span className="text-rose-600 font-bold text-xs px-1.5 min-w-[20px] text-center">{item.qty}</span>
                <button onClick={() => addToCart(item)} className="px-1.5 py-1 text-rose-500 hover:bg-rose-50 transition"><PlusIcon /></button>
              </div>
              <p className="text-gray-800 font-bold text-sm shrink-0 w-12 text-right">₹{(item.price * item.qty).toFixed(0)}</p>
            </div>
          ))}
        </div>

        {/* Promo */}
        <div className="border-t border-gray-100 px-4 py-3">
          <div className="flex gap-2">
            <input value={promoCode} onChange={e => setPromoCode(e.target.value)}
              placeholder="Promo code (WELCOME50)"
              disabled={promoApplied}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 outline-none focus:border-rose-300 disabled:opacity-50 transition" />
            <button onClick={applyPromo} disabled={promoApplied}
              className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-rose-100 disabled:opacity-50 transition whitespace-nowrap">
              {promoApplied ? "✓ Applied" : "Apply"}
            </button>
          </div>
        </div>

        {/* Bill breakdown */}
        <div className="border-t border-gray-100 px-4 py-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-500"><span>Item total</span><span>₹{cartTotal.toFixed(2)}</span></div>
          {promoApplied && (
            <div className="flex justify-between text-green-600 font-semibold"><span>Promo (WELCOME50)</span><span>−₹50.00</span></div>
          )}
          <div className="flex justify-between text-gray-500"><span>Delivery fee</span><span className="text-green-600 font-semibold">FREE</span></div>
          <div className="flex justify-between text-gray-500"><span>GST (5%)</span><span>₹{tax.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
            <span>To Pay</span><span>₹{grandTotal.toFixed(0)}</span>
          </div>
        </div>

        <div className="px-4 pb-4 space-y-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleOrder} disabled={placing}
            className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-60 transition shadow-lg shadow-rose-500/20">
            {placing ? "Placing Order…" : `Place Order · ₹${grandTotal.toFixed(0)}`}
          </motion.button>
          <button onClick={clearCart}
            className="w-full text-xs text-gray-400 hover:text-rose-400 transition flex items-center justify-center gap-1.5 py-1">
            <TrashIcon /> Clear cart
          </button>
        </div>
      </>
    )
  );

  // Menu item card
  const MenuItem = ({ item, index }) => {
    const qty   = cart[item.id]?.qty || 0;
    const isVeg = item.isVeg !== false; // default veg if backend field missing
    const emo   = FOOD_EMOJIS[(item.id + index) % FOOD_EMOJIS.length];
    return (
      <motion.div layout
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04, duration: 0.25 }}
        className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-4 hover:border-rose-100 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-200 group">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center shrink-0 ${isVeg ? "border-green-600" : "border-red-500"}`}>
              <div className={`w-2 h-2 rounded-full ${isVeg ? "bg-green-600" : "bg-red-500"}`} />
            </div>
            {item.isMostlyOrdered && <span className="text-[9px] bg-green-50 text-green-700 border border-green-100 px-1.5 py-0.5 rounded-full font-bold uppercase">🔥 Bestseller</span>}
            {item.isSpecial       && <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full font-bold uppercase">⭐ Special</span>}
            {item.isDealOfDay     && <span className="text-[9px] bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.5 rounded-full font-bold uppercase">🏷️ Deal</span>}
          </div>
          <h3 className="text-gray-900 font-bold text-[15px] mb-0.5 leading-tight">{item.name}</h3>
          <p className="text-rose-600 font-bold text-sm mb-1">₹{item.price}</p>
          {item.description && <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{item.description}</p>}
          {item.orderCount > 0 && (
            <p className="text-gray-400 text-[11px] mt-1.5 flex items-center gap-1">🔥 {item.orderCount} orders</p>
          )}
        </div>

        <div className="relative shrink-0 mb-3">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            {item.imageUrl
              ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover"
                  onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }} />
              : null}
            <span className={`text-4xl opacity-50 select-none ${item.imageUrl ? "hidden" : ""}`}>{emo}</span>
          </div>
          {qty === 0 ? (
            <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={() => addToCart(item)}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border-2 border-rose-500 text-rose-600 font-bold text-sm px-5 py-0.5 rounded-lg shadow-md hover:bg-rose-500 hover:text-white transition-colors whitespace-nowrap">
              ADD
            </motion.button>
          ) : (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center bg-rose-500 rounded-lg shadow-md overflow-hidden">
              <button onClick={() => removeFromCart(item)} className="text-white px-2 py-1 hover:bg-rose-600 transition"><MinusIcon /></button>
              <span className="text-white font-bold text-sm px-2 min-w-[24px] text-center">{qty}</span>
              <button onClick={() => addToCart(item)} className="text-white px-2 py-1 hover:bg-rose-600 transition"><PlusIcon /></button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // ════════════════════════════════════════════════════
  return (
    <div className="w-screen min-h-screen bg-[#f5f5f5] overflow-x-hidden">

      {/* ── Permanent sticky header ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="w-full max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 h-16 flex items-center gap-4">
          <button onClick={() => navigate("/customer/home")}
            className="flex items-center gap-2 text-gray-600 hover:text-rose-500 font-semibold text-sm transition shrink-0">
            <ArrowLeftIcon /> Back
          </button>
          <div className="w-px h-4 bg-gray-200 shrink-0" />
          <div className="flex-1 min-w-0">
            <h1 className="text-gray-900 font-bold text-base truncate">{restaurant?.name}</h1>
            <p className="text-gray-500 text-xs truncate">{restaurant?.cuisine} · {restaurant?.location}</p>
          </div>
          {cartCount > 0 && (
            <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileTap={{ scale: 0.95 }}
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-rose-500/25 shrink-0">
              <BagIcon /> {cartCount} · ₹{grandTotal.toFixed(0)}
            </motion.button>
          )}
        </div>
      </header>

      {/* ── Hero banner ── */}
      <div className="relative w-full h-72 sm:h-80 lg:h-96 overflow-hidden">
        {restaurant?.imageUrl
          ? <img src={restaurant.imageUrl} alt={restaurant.name} className="absolute inset-0 w-full h-full object-cover scale-110" />
          : (
            <div className="absolute inset-0 bg-gradient-to-br from-rose-900 via-rose-700 to-orange-600">
              <div className="absolute inset-0 flex items-center justify-center text-[160px] opacity-10 select-none">{heroEmoji}</div>
            </div>
          )
        }
        {/* STRONG dark overlay so name is always white-on-dark (never white-on-white) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />

        {/* Restaurant info at bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 lg:px-16 pb-6 max-w-screen-2xl mx-auto">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <span className="inline-block bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest mb-2">
                {restaurant?.cuisine}
              </span>
              {/* ✅ White text on enforced dark overlay — always visible */}
              <h2 className="text-white font-black text-3xl sm:text-4xl leading-tight drop-shadow-lg mb-2 truncate">
                {restaurant?.name}
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                {restaurant?.rating > 0 && (
                  <div className="flex items-center gap-1 bg-green-500 text-white px-2.5 py-1 rounded-lg font-bold text-xs shadow-sm">
                    <StarIcon /> {restaurant.rating}
                    <span className="font-normal opacity-80 ml-0.5">(200+ reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-white/85 text-xs font-medium">
                  <ClockIcon /> {deliveryTime}
                </div>
                <div className="flex items-center gap-1 text-white/85 text-xs font-medium">
                  <MapPinIcon /> {restaurant?.location}
                </div>
                <div className="flex items-center gap-1 text-white/85 text-xs font-medium">
                  <BikeIcon /> Free delivery
                </div>
              </div>
            </div>
            <button onClick={() => setShowInfo(p => !p)}
              className="shrink-0 flex items-center gap-1 text-white/60 hover:text-white text-xs font-medium transition mb-1">
              <InfoIcon /> {showInfo ? "Less" : "Info"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Collapsible info panel ── */}
      <AnimatePresence>
        {showInfo && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden bg-rose-50 border-b border-rose-100 w-full">
            <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { label: "Cuisine",  value: restaurant?.cuisine   || "—" },
                { label: "Location", value: restaurant?.location  || "—" },
                { label: "Rating",   value: restaurant?.rating ? `${restaurant.rating} / 5 ⭐` : "New" },
                { label: "Delivery", value: `${deliveryTime} 🛵` },
              ].map(it => (
                <div key={it.label}>
                  <p className="text-rose-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">{it.label}</p>
                  <p className="text-gray-800 font-bold text-sm">{it.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Offers strip ── */}
      <div className="w-full bg-white border-b border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 py-3 flex items-center gap-6 overflow-x-auto scrollbar-hide">
          {["20% off on orders above ₹399", "Free delivery on first order", "₹50 off · use code WELCOME50", "Flat ₹100 off above ₹799"].map((offer, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <span className="text-rose-500"><TagIcon /></span>
              <span className="text-gray-600 text-xs font-medium whitespace-nowrap">{offer}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Category tabs + search bar ── */}
      <div className="sticky top-16 z-30 w-full bg-white border-b border-gray-100">
        <div className="w-full max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                activeCategory === cat
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {cat}
            </button>
          ))}

          {/* ── Veg / Non-Veg toggle ── */}
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-xl p-1 shrink-0">
            {[
              { id: "all",    label: "All",     icon: null },
              { id: "veg",    label: "Veg",     icon: "🟢" },
              { id: "nonveg", label: "Non-Veg", icon: "🔴" },
            ].map(opt => (
              <button key={opt.id} onClick={() => setVegFilter(opt.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  vegFilter === opt.id
                    ? opt.id === "veg"
                      ? "bg-green-500 text-white shadow"
                      : opt.id === "nonveg"
                        ? "bg-red-500 text-white shadow"
                        : "bg-white text-gray-700 shadow"
                    : "text-gray-500 hover:text-gray-700"
                }`}>
                {opt.icon && <span>{opt.icon}</span>}
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search pushed to right */}
          <div className="ml-auto shrink-0 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><SearchIcon /></span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search menu…"
              className="w-40 sm:w-52 bg-gray-100 rounded-full pl-9 pr-4 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white border border-transparent focus:border-rose-200 transition" />
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="w-full max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 py-8 flex gap-8 items-start">

        {/* Menu column */}
        <div className="flex-1 min-w-0 space-y-8">

          {/* Bestsellers row */}
          {activeCategory === "All" && bestsellers.length > 0 && !search && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🔥</span>
                <h3 className="text-gray-900 font-bold text-base">Most Popular</h3>
                <span className="text-gray-400 text-xs">({bestsellers.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bestsellers.map((item, i) => {
                  const qty = cart[item.id]?.qty || 0;
                  return (
                    <motion.div key={item.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      className="bg-white rounded-2xl border border-gray-100 p-3.5 flex items-center gap-3 hover:shadow-md hover:border-rose-100 transition-all relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-500 to-orange-400 rounded-l-2xl" />
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 ml-2 bg-gradient-to-br from-orange-50 to-rose-50 flex items-center justify-center">
                        {item.imageUrl
                          ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display="none"; e.currentTarget.nextSibling.style.display="flex"; }} />
                          : null}
                        <span className={`text-2xl ${item.imageUrl ? "hidden" : "flex"} items-center justify-center w-full h-full`}>
                          {FOOD_EMOJIS[(item.id + i) % FOOD_EMOJIS.length]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-bold text-sm truncate">{item.name}</p>
                        <p className="text-rose-600 font-bold text-sm">₹{item.price}</p>
                        <span className="text-[9px] bg-green-50 text-green-700 border border-green-100 px-1.5 py-0.5 rounded-full font-bold">BESTSELLER</span>
                      </div>
                      {qty === 0 ? (
                        <button onClick={() => addToCart(item)}
                          className="shrink-0 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition shadow-md">
                          <PlusIcon />
                        </button>
                      ) : (
                        <div className="shrink-0 flex items-center gap-0.5 bg-rose-500 rounded-full px-1 shadow-md">
                          <button onClick={() => removeFromCart(item)} className="w-6 h-6 text-white flex items-center justify-center hover:bg-rose-600 rounded-full transition"><MinusIcon /></button>
                          <span className="text-white font-bold text-xs min-w-[18px] text-center">{qty}</span>
                          <button onClick={() => addToCart(item)} className="w-6 h-6 text-white flex items-center justify-center hover:bg-rose-600 rounded-full transition"><PlusIcon /></button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Full menu */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-900 font-bold text-base">
                {activeCategory === "All" ? "Full Menu" : activeCategory}
              </h3>
              <span className="text-gray-400 text-xs font-medium">
                {filtered.length} item{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-20 bg-white rounded-2xl border border-gray-100">
                <span className="text-5xl mb-3 opacity-40">🍽</span>
                <p className="font-semibold text-gray-500 text-sm">No items found</p>
                <p className="text-xs text-gray-400 mt-1">Try a different search or category</p>
                {search && (
                  <button onClick={() => setSearch("")} className="mt-4 text-rose-500 text-xs font-semibold hover:underline">
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3" ref={menuRef}>
                <AnimatePresence>
                  {filtered.map((item, i) => <MenuItem key={item.id} item={item} index={i} />)}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>

        {/* Desktop cart sidebar */}
        <div className="hidden lg:block w-80 xl:w-96 shrink-0">
          <div className="sticky top-[132px] bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-3.5 flex items-center gap-2">
              <BagIcon />
              <h3 className="font-bold text-white">Your Order</h3>
              {cartCount > 0 && <span className="ml-auto text-white/80 text-xs">{cartCount} item{cartCount !== 1 ? "s" : ""}</span>}
            </div>
            <CartBody />
          </div>
        </div>
      </div>

      {/* ── Mobile Cart Drawer ── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setCartOpen(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 lg:hidden max-h-[88vh] flex flex-col">
              <div className="bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-4 rounded-t-3xl flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-white font-bold">
                  <BagIcon />
                  <span>Your Order</span>
                  {cartCount > 0 && <span className="text-white/80 font-normal text-sm">· {cartCount} item{cartCount !== 1 ? "s" : ""}</span>}
                </div>
                <button onClick={() => setCartOpen(false)} className="text-white/70 hover:text-white transition"><XIcon /></button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <CartBody />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile floating cart button ── */}
      <AnimatePresence>
        {cartCount > 0 && !cartOpen && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ type: "spring", damping: 25 }}
            className="fixed bottom-5 left-4 right-4 z-40 lg:hidden">
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setCartOpen(true)}
              className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white py-4 rounded-2xl font-bold flex items-center justify-between px-5 shadow-2xl shadow-rose-500/30">
              <div className="flex items-center gap-3">
                <span className="bg-white/20 rounded-lg px-2 py-0.5 text-sm font-black">{cartCount}</span>
                <span className="text-sm">item{cartCount !== 1 ? "s" : ""} in cart</span>
              </div>
              <span className="font-bold">₹{grandTotal.toFixed(0)} →</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

