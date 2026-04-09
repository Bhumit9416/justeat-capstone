import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { searchRestaurants } from "../../api/restaurants";
import { getPreferences } from "../../api/preferences";
import { toast } from "react-toastify";

// ── Icons ──────────────────────────────────────────────
function SearchIcon()  { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function MapPinIcon()  { return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function StarIcon()    { return <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>; }
function ClockIcon()   { return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function OrderIcon()   { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>; }
function HeartIcon()       { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>; }
function HeartFilledIcon() { return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>; }
function LogoutIcon()  { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function ChevronRightIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>; }
function XIcon()       { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }

const CUISINES = ["All","North Indian","South Indian","Chinese","Italian","Pizza","Biryani","Burger","Sushi","Mexican","Thai","Continental"];
const SORT_OPTIONS = [
  { id: "default",  label: "Relevance"  },
  { id: "rating",   label: "Rating"     },
  { id: "name",     label: "Name A–Z"   },
];

const CUISINE_EMOJIS = {
  "All": "🍽️", "North Indian": "🍛", "South Indian": "🥘", "Chinese": "🍜",
  "Italian": "🍝", "Pizza": "🍕", "Biryani": "🍚", "Burger": "🍔",
  "Sushi": "🍣", "Mexican": "🌮", "Thai": "🍱", "Continental": "🥐",
};

// Food images for scrolling hero strip (Unsplash free-to-use)
const FOOD_IMAGES = [
  { url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop", label: "Pizza" },
  { url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop", label: "Burger" },
  { url: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=300&h=200&fit=crop", label: "Sushi" },
  { url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&h=200&fit=crop", label: "Biryani" },
  { url: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=300&h=200&fit=crop", label: "Burger" },
  { url: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300&h=200&fit=crop", label: "Pizza" },
  { url: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=300&h=200&fit=crop", label: "Noodles" },
  { url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop", label: "Pancakes" },
  { url: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=300&h=200&fit=crop", label: "Tacos" },
  { url: "https://images.unsplash.com/photo-1547592180-85f173990554?w=300&h=200&fit=crop", label: "Soup" },
  { url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&h=200&fit=crop", label: "Salad" },
  { url: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=300&h=200&fit=crop", label: "Pasta" },
];

const DELIVERY_TIMES = ["20–30 min","30–40 min","40–50 min"];
const TAG_POOL = ["Pure Veg","Family Friendly","Trending","New","Top Rated","Fast Delivery"];

function RestaurantCard({ restaurant, index, onClick, isFavorite, onToggleFavorite }) {
  const deliveryTime = DELIVERY_TIMES[restaurant.id % 3];
  const tags = [TAG_POOL[(restaurant.id + index) % TAG_POOL.length]];
  const offerPct = [10,15,20,25][restaurant.id % 4];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer group border border-gray-100 hover:shadow-xl hover:shadow-gray-200/60 transition-shadow duration-300">

      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden">
        {restaurant.imageUrl ? (
          <img src={restaurant.imageUrl} alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-20 select-none">🍽</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Offer badge */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-rose-600 to-orange-500 px-3 py-1.5">
          <p className="text-white text-xs font-bold">{offerPct}% OFF up to ₹{offerPct * 5}</p>
        </div>

        {/* Heart / favourite button */}
        <motion.button
          whileTap={{ scale: 0.75 }}
          onClick={e => { e.stopPropagation(); onToggleFavorite?.(restaurant.id); }}
          className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all z-10 ${
            isFavorite ? "bg-rose-500 text-white" : "bg-white/90 text-gray-400 hover:text-rose-500"
          }`}>
          {isFavorite ? <HeartFilledIcon /> : <HeartIcon />}
        </motion.button>

        {/* Delivery time */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur rounded-lg px-2 py-1 flex items-center gap-1">
          <ClockIcon />
          <span className="text-gray-700 text-[11px] font-semibold">{deliveryTime}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-gray-900 font-bold text-[15px] leading-tight line-clamp-1">{restaurant.name}</h3>
          {restaurant.rating && (
            <div className="flex items-center gap-1 bg-green-600 text-white rounded-lg px-1.5 py-0.5 shrink-0">
              <StarIcon />
              <span className="text-xs font-bold">{restaurant.rating}</span>
            </div>
          )}
        </div>

        <p className="text-gray-500 text-[13px] mb-2">{restaurant.cuisine}</p>

        <div className="flex items-center gap-1 text-gray-400 text-[12px] mb-3">
          <MapPinIcon />
          <span className="line-clamp-1">{restaurant.location}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
          {tags.map(t => (
            <span key={t} className="text-[10px] px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-full font-semibold">{t}</span>
          ))}
          <span className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 rounded-full font-semibold">{restaurant.cuisine}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function CustomerHomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);
  const [search, setSearch]           = useState("");
  const [location, setLocation]       = useState("");
  const [cuisine, setCuisine]         = useState("All");
  const [sort, setSort]               = useState("default");
  const [vegFilter, setVegFilter]     = useState("all"); // "all" | "veg" | "nonveg"
  const favKey = `je_favorites_${user?.username}`;
  const [favorites, setFavorites]     = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(`je_favorites_${user?.username}`) || "[]")); }
    catch { return new Set(); }
  });
  const [retryTick, setRetryTick] = useState(0);

  // Reload favourites whenever the logged-in user changes (login / account switch)
  useEffect(() => {
    if (!user?.username) { setFavorites(new Set()); return; }
    try {
      setFavorites(new Set(JSON.parse(localStorage.getItem(`je_favorites_${user.username}`) || "[]")));
    } catch { setFavorites(new Set()); }
  }, [user?.username]);

  const toastRef = useRef(null);
  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      const adding = !next.has(id);
      if (adding) next.add(id); else next.delete(id);
      localStorage.setItem(`je_favorites_${user?.username}`, JSON.stringify([...next]));
      // dismiss previous toast so only ONE shows at a time
      if (toastRef.current) toast.dismiss(toastRef.current);
      toastRef.current = adding
        ? toast.success("Added to favourites ❤️", { autoClose: 1800 })
        : toast.info("Removed from favourites",   { autoClose: 1800 });
      return next;
    });
  };
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);
  const favSectionRef = useRef(null);
  const searchTimer = useRef(null);

  // Single effect handles initial load + debounced search
  useEffect(() => {
    // Show loading immediately so skeletons appear right away
    setLoading(true);
    setError(false);

    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await searchRestaurants(
          search,
          cuisine === "All" ? "" : cuisine,
          location
        );
        if (res.success) {
          setRestaurants(res.data || []);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to load restaurants:", err?.response?.data || err.message);
        setError(true);
      } finally {
        setLoading(false);
      }
    }, search || cuisine !== "All" || location ? 400 : 0);

    return () => clearTimeout(searchTimer.current);
  }, [search, cuisine, location, retryTick]);

  // close profile menu on outside click
  useEffect(() => {
    const handler = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load preferences once on mount (silent)
  useEffect(() => {
    getPreferences().then(res => {
      if (res?.success && res.data) setPreferences(res.data);
    }).catch(() => {});
  }, []);

  const sorted = [...restaurants]
    .filter(r => {
      if (vegFilter === "veg")    return r.cuisine?.toLowerCase().includes("veg") || r.name?.toLowerCase().includes("veg");
      if (vegFilter === "nonveg") return !r.cuisine?.toLowerCase().includes("veg");
      return true;
    })
    .sort((a, b) => {
    if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sort === "name")   return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="w-full min-h-screen bg-[#f5f5f5] flex flex-col">

      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="w-full max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex items-center gap-4 h-16">

            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-xs">JE</span>
              </div>
              <span className="text-gray-900 font-black text-xl tracking-tight hidden sm:block">JustEat</span>
            </div>

            {/* Location pill */}
            <div className="hidden md:flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1.5 cursor-pointer hover:border-gray-300 transition shrink-0">
              <MapPinIcon />
              <input value={location} onChange={e => setLocation(e.target.value)}
                placeholder="Enter location"
                className="w-32 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent" />
              {location && <button onClick={() => setLocation("")} className="text-gray-400 hover:text-gray-600"><XIcon /></button>}
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search for restaurants, cuisines..."
                className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white border border-transparent focus:border-rose-200 transition" />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><XIcon /></button>
              )}
            </div>

            {/* Nav actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => navigate("/customer/orders")}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition text-sm font-medium">
                <OrderIcon /> My Orders
              </button>
              <button onClick={() => {
                if (favSectionRef.current) {
                  favSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition text-sm font-medium">
                <HeartIcon />
                Favourites {favorites.size > 0 && <span className="bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{favorites.size}</span>}
              </button>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button onClick={() => setShowProfileMenu(p => !p)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold text-xs">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.username}</span>
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                      </div>
                      {[
                        { label: "My Orders",    action: () => navigate("/customer/orders") },
                        { label: "Preferences",  action: () => navigate("/customer/preferences") },
                      ].map(item => (
                        <button key={item.label} onClick={() => { item.action(); setShowProfileMenu(false); }}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                          {item.label} <ChevronRightIcon />
                        </button>
                      ))}
                      <div className="border-t border-gray-100">
                        <button onClick={logout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition font-medium">
                          <LogoutIcon /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <div className="relative bg-gradient-to-r from-rose-700 via-rose-600 to-orange-500 overflow-hidden" style={{ minHeight: 220 }}>

        {/* Scrolling food images strip */}
        <div className="absolute inset-0 flex flex-col gap-3 justify-center overflow-hidden opacity-30 pointer-events-none select-none">
          {/* Row 1 — scrolls left */}
          <div className="flex gap-3" style={{ animation: "marquee-left 30s linear infinite", width: "max-content" }}>
            {[...FOOD_IMAGES, ...FOOD_IMAGES].map((img, i) => (
              <img key={i} src={img.url} alt={img.label}
                className="h-24 w-36 object-cover rounded-xl shrink-0"
                loading="lazy" />
            ))}
          </div>
          {/* Row 2 — scrolls left slower (offset) */}
          <div className="flex gap-3" style={{ animation: "marquee-left 45s linear infinite", width: "max-content", marginLeft: "-120px" }}>
            {[...FOOD_IMAGES.slice(4), ...FOOD_IMAGES, ...FOOD_IMAGES.slice(0, 4)].map((img, i) => (
              <img key={i} src={img.url} alt={img.label}
                className="h-24 w-36 object-cover rounded-xl shrink-0"
                loading="lazy" />
            ))}
          </div>
        </div>

        {/* Dark overlay so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-rose-700/80 via-rose-600/70 to-orange-500/60" />

        {/* Hero text */}
        <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <motion.p initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
              className="text-rose-200 text-sm font-semibold uppercase tracking-widest mb-2">
              {new Date().getHours() < 12 ? "🌅 Good Morning" : new Date().getHours() < 17 ? "☀️ Good Afternoon" : "🌙 Good Evening"}, {user?.username}
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-white font-black text-3xl sm:text-4xl lg:text-5xl mb-2 leading-tight">
              What would you like<br className="hidden sm:block" /> to eat today?
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              className="text-rose-100 text-sm mt-2 flex items-center gap-2">
              {loading
                ? <><span className="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Finding restaurants near you…</>
                : <><span>📍</span> {restaurants.length} restaurant{restaurants.length !== 1 ? "s" : ""} available near you</>
              }
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* ── Recommendations ── */}
      {(() => {
        const prefs = preferences?.preferredCuisines;
        const isVeg = preferences?.dietaryRestrictions?.includes("Vegetarian");
        const recommended = !loading && restaurants.length > 0 && !search && cuisine === "All" && !location
          ? restaurants.filter((r) =>
              (prefs?.length > 0 && prefs.some((c) => r.cuisine?.toLowerCase().includes(c.toLowerCase()))) ||
              (isVeg && r.cuisine?.toLowerCase().includes("veg"))
            )
          : [];
        if (recommended.length === 0) return null;
        return (
          <div className="bg-white border-b border-gray-100">
            <div className="w-full max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 py-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-gray-900 font-bold text-lg flex items-center gap-2">
                    <span className="text-xl">✨</span> Recommended for You
                  </h3>
                  <p className="text-gray-400 text-sm mt-0.5">Based on your food preferences</p>
                </div>
                <button onClick={() => navigate("/customer/preferences")}
                  className="text-rose-500 text-xs font-semibold hover:underline hidden sm:block">
                  Edit preferences
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {recommended.slice(0, 8).map((r, i) => (
                  <div key={r.id} className="shrink-0 w-60 sm:w-64">
                    <RestaurantCard restaurant={r} index={i}
                      isFavorite={favorites.has(r.id)}
                      onToggleFavorite={toggleFavorite}
                      onClick={() => navigate(`/customer/restaurant/${r.id}`)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Favourites Section ── */}
      {favorites.size > 0 && !search && cuisine === "All" && !location && (() => {
        const favRestaurants = restaurants.filter(r => favorites.has(r.id));
        if (favRestaurants.length === 0) return null;
        return (
          <div ref={favSectionRef} className="bg-white border-b border-gray-100 scroll-mt-16">
            <div className="w-full max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 py-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-gray-900 font-bold text-lg flex items-center gap-2">
                    <span className="text-xl">❤️</span> Your Favourites
                  </h3>
                  <p className="text-gray-400 text-sm mt-0.5">{favRestaurants.length} saved restaurant{favRestaurants.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {favRestaurants.map((r, i) => (
                  <div key={r.id} className="shrink-0 w-60 sm:w-64">
                    <RestaurantCard restaurant={r} index={i}
                      isFavorite={true}
                      onToggleFavorite={toggleFavorite}
                      onClick={() => navigate(`/customer/restaurant/${r.id}`)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Cuisine Filter Strip ── */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30 shadow-sm">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-14">
          <div className="flex items-center gap-3 py-4 overflow-x-auto scrollbar-hide">
            {CUISINES.map((c, i) => {
              const active = cuisine === c;
              const GRAD = [
                "from-rose-500 to-orange-400",
                "from-orange-500 to-amber-400",
                "from-amber-500 to-yellow-400",
                "from-emerald-500 to-teal-400",
                "from-teal-500 to-cyan-400",
                "from-sky-500 to-blue-400",
                "from-violet-500 to-purple-400",
                "from-pink-500 to-rose-400",
                "from-red-500 to-rose-400",
                "from-lime-500 to-green-400",
                "from-cyan-500 to-sky-400",
                "from-fuchsia-500 to-pink-400",
              ][i % 12];
              return (
                <motion.button
                  key={c}
                  onClick={() => {
                    setCuisine(c);
                    if (c === "All") window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  whileHover={{ y: -3, scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`relative flex flex-col items-center gap-2 shrink-0 rounded-2xl px-5 py-3.5 min-w-[84px] border-2 transition-all duration-200 cursor-pointer select-none
                    ${active
                      ? "border-transparent text-white shadow-lg"
                      : "bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:shadow-md hover:text-gray-800"
                    }`}
                  style={active ? {} : {}}>
                  {/* gradient bg for active */}
                  {active && (
                    <span className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${GRAD} opacity-100`} />
                  )}
                  <span className={`relative text-3xl leading-none transition-transform duration-200 ${active ? "drop-shadow-sm" : ""}`}>
                    {CUISINE_EMOJIS[c]}
                  </span>
                  <span className={`relative text-[11px] font-bold whitespace-nowrap leading-tight text-center tracking-wide ${active ? "text-white" : "text-gray-500"}`}>
                    {c}
                  </span>
                  {/* Active underline — inside the button, no overflow bleed */}
                  <span className={`relative h-1 rounded-full transition-all duration-300 ${active ? "w-6 bg-white/70" : "w-0 bg-transparent"}`} />
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 py-8">

        {/* Results header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-gray-900 font-bold text-lg">
              {search || cuisine !== "All" || location ? "Search Results" : "All Restaurants"}
            </h3>
            <p className="text-gray-400 text-sm mt-0.5">
              {loading ? "Loading..." : `${sorted.length} restaurant${sorted.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          {/* Sort + Veg filter */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Veg toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {[
                { id: "all",    label: "All",         icon: null },
                { id: "veg",    label: "Veg",         icon: "🟢" },
                { id: "nonveg", label: "Non-Veg",     icon: "🔴" },
              ].map(opt => (
                <button key={opt.id} onClick={() => setVegFilter(opt.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    vegFilter === opt.id
                      ? opt.id === "veg" ? "bg-green-500 text-white shadow" : opt.id === "nonveg" ? "bg-red-500 text-white shadow" : "bg-white text-gray-700 shadow"
                      : "text-gray-500 hover:text-gray-700"
                  }`}>
                  {opt.icon && <span>{opt.icon}</span>}{opt.label}
                </button>
              ))}
            </div>
            <span className="text-gray-400 text-xs font-medium hidden sm:block">Sort by</span>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-rose-400 transition cursor-pointer">
              {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Cards */}
        {error ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4 border-2 border-red-100">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p className="text-gray-700 font-semibold text-lg mb-1">Could not load restaurants</p>
            <p className="text-sm text-gray-400 mb-4">Please check if the server is running or try again</p>
            <button onClick={() => setRetryTick(t => t + 1)}
              className="bg-rose-500 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-rose-600 transition">
              Retry
            </button>
          </motion.div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-44 bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <SearchIcon />
            </div>
            <p className="text-gray-600 font-semibold text-lg mb-1">No restaurants found</p>
            <p className="text-sm text-gray-400 mb-4">Try adjusting your search or filters</p>
            <button onClick={() => { setSearch(""); setCuisine("All"); setLocation(""); }}
              className="bg-rose-500 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-rose-600 transition">
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sorted.map((r, i) => (
              <RestaurantCard key={r.id} restaurant={r} index={i}
                isFavorite={favorites.has(r.id)}
                onToggleFavorite={toggleFavorite}
                onClick={() => navigate(`/customer/restaurant/${r.id}`)} />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="w-full max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-[10px]">JE</span>
              </div>
              <span className="text-gray-800 font-bold text-sm">JustEat</span>
            </div>
            <div className="flex items-center gap-5 text-xs text-gray-400">
              <button onClick={() => navigate("/customer/orders")} className="hover:text-rose-500 transition">My Orders</button>
              <button onClick={() => navigate("/customer/preferences")} className="hover:text-rose-500 transition">Preferences</button>
            </div>
            <p className="text-gray-300 text-xs">&copy; {new Date().getFullYear()} JustEat</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
