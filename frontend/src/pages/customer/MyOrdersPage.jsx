import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getMyOrders } from "../../api/orders";
import { searchRestaurants } from "../../api/restaurants";
import { toast } from "react-toastify";

function ArrowLeftIcon()   { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>; }
function RefreshIcon()     { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>; }
function ChevronDownIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>; }
function ChevronUpIcon()   { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>; }
function BoxIcon()         { return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>; }
function ClockIcon()       { return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function SparkleIcon()     { return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>; }

const STATUS_META = {
  PENDING:   {
    label: "Order Placed", shortLabel: "Placed",
    step: 1,
    pill: "bg-amber-50 text-amber-600 border-amber-200",
    bar: "from-amber-400 to-amber-500",
    ring: "ring-amber-400/20",
    dot: "bg-amber-500",
    icon: "🕐",
    tip: "Your order has been received by the restaurant.",
  },
  PREPARING: {
    label: "Preparing", shortLabel: "Preparing",
    step: 2,
    pill: "bg-blue-50 text-blue-600 border-blue-200",
    bar: "from-blue-400 to-blue-500",
    ring: "ring-blue-400/20",
    dot: "bg-blue-500",
    icon: "👨‍🍳",
    tip: "The kitchen is cooking your order right now!",
  },
  READY:     {
    label: "Ready to Pick", shortLabel: "Ready",
    step: 3,
    pill: "bg-violet-50 text-violet-600 border-violet-200",
    bar: "from-violet-400 to-violet-500",
    ring: "ring-violet-400/20",
    dot: "bg-violet-500",
    icon: "✅",
    tip: "Your order is ready and on its way!",
  },
  COMPLETED: {
    label: "Delivered", shortLabel: "Delivered",
    step: 4,
    pill: "bg-emerald-50 text-emerald-600 border-emerald-200",
    bar: "from-emerald-400 to-emerald-500",
    ring: "ring-emerald-400/20",
    dot: "bg-emerald-500",
    icon: "🎉",
    tip: "Enjoy your meal! Come back soon.",
  },
};

const STEPS = [
  { key: "PENDING",   label: "Placed",    icon: "🛒" },
  { key: "PREPARING", label: "Preparing", icon: "🍳" },
  { key: "READY",     label: "Ready",     icon: "📦" },
  { key: "COMPLETED", label: "Delivered", icon: "🎉" },
];

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    + " · " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// ── Order Card component ──────────────────────────────────────────
function OrderCard({ order, restMap, isOpen, onToggle, navigate }) {
  const meta    = STATUS_META[order.status] || STATUS_META.PENDING;
  const step    = meta.step;
  const rest    = restMap[order.restaurantId];
  const isActive = order.status !== "COMPLETED";

  return (
    <motion.div layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 ${
        isOpen
          ? "border-rose-200 shadow-lg shadow-rose-500/10"
          : "border-gray-100 hover:border-rose-100 hover:shadow-md hover:shadow-gray-200/60"
      }`}>

      {/* Status colour bar */}
      <div className={`h-1 bg-gradient-to-r ${meta.bar} ${isActive ? "animate-pulse" : ""}`} />

      <button className="w-full text-left" onClick={onToggle}>
        <div className="px-5 pt-4 pb-3">
          {/* Top row: photo + info + badge */}
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-gray-100">
              {rest?.imageUrl
                ? <img src={rest.imageUrl} alt={rest.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-rose-50 flex items-center justify-center">
                    <span className="text-2xl">{meta.icon}</span>
                  </div>
              }
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <p className="text-gray-900 font-bold text-sm truncate">
                    {order.restaurantName || rest?.name || "Restaurant"}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                    <ClockIcon /> {fmtDate(order.createdAt)}
                  </p>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 flex items-center gap-1 ${meta.pill}`}>
                  {isActive && <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} animate-pulse`} />}
                  {meta.shortLabel}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-gray-400 text-xs">{order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}</span>
                <span className="text-gray-200">·</span>
                <span className="text-gray-900 font-bold text-sm">₹{order.totalPrice?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Animated stepper */}
          <div className="mt-4 flex items-center">
            {STEPS.map((s, idx) => {
              const done    = idx + 1 <= step;
              const current = idx + 1 === step;
              const isLast  = idx === STEPS.length - 1;
              return (
                <div key={s.key} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <motion.div
                      animate={current && isActive ? { scale: [1, 1.18, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        done
                          ? `bg-gradient-to-br ${meta.bar} border-transparent shadow-md`
                          : "bg-white border-gray-200"
                      } ${current ? `ring-4 ${meta.ring}` : ""}`}>
                      {done
                        ? <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                        : <span className="text-[10px] text-gray-300">{idx + 1}</span>
                      }
                    </motion.div>
                    <span className={`text-[9px] font-semibold whitespace-nowrap ${done ? "text-rose-500" : "text-gray-300"}`}>
                      {s.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div className="flex-1 h-0.5 mx-1.5 mb-4 rounded-full overflow-hidden bg-gray-100">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${meta.bar}`}
                        initial={{ width: "0%" }}
                        animate={{ width: idx + 1 < step ? "100%" : "0%" }}
                        transition={{ duration: 0.55, delay: idx * 0.1, ease: "easeOut" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {isActive && (
            <p className="mt-2 text-[11px] text-gray-400 italic">{meta.tip}</p>
          )}
        </div>

        {/* Expand chevron */}
        <div className={`flex items-center justify-center py-1.5 border-t transition-colors ${
          isOpen ? "border-rose-100 text-rose-400 bg-rose-50/40" : "border-gray-100 text-gray-300"
        }`}>
          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </div>
      </button>

      {/* Expanded: items list */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}>
            <div className="px-5 py-4 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Order Items</p>
              <div className="space-y-2.5">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-400 text-[10px] font-bold flex items-center justify-center shrink-0">{item.quantity}</span>
                      <span className="text-gray-700 text-sm truncate">{item.menuItemName || `Item #${item.menuItemId}`}</span>
                    </div>
                    <span className="text-gray-900 font-semibold text-sm shrink-0">₹{item.price?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-gray-400 text-sm">Total paid</span>
                <span className="text-gray-900 font-black text-base">₹{order.totalPrice?.toFixed(2)}</span>
              </div>
              {order.status === "COMPLETED" && (
                <motion.button
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/customer/home")}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-md shadow-rose-500/20">
                  <SparkleIcon /> Order Again
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────
export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders]         = useState([]);
  const [restMap, setRestMap]       = useState({});
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]         = useState("ALL");
  const [expanded, setExpanded]     = useState(null);
  const pollRef = useRef(null);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [ordRes, restRes] = await Promise.all([
        getMyOrders(),
        searchRestaurants(),
      ]);
      if (ordRes.success) setOrders(ordRes.data || []);
      else if (!silent) toast.error("Failed to load orders");
      if (restRes.success) {
        const map = {};
        (restRes.data || []).forEach(r => { map[r.id] = r; });
        setRestMap(map);
      }
    } catch { if (!silent) toast.error("Error loading orders"); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 s while active orders exist
    pollRef.current = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(pollRef.current);
  }, []);

  const activeCount    = orders.filter(o => o.status !== "COMPLETED").length;
  const completedCount = orders.filter(o => o.status === "COMPLETED").length;

  const FILTERS = [
    { id: "ALL",       label: "All",        count: orders.length },
    { id: "PENDING",   label: "Placed",     count: orders.filter(o => o.status === "PENDING").length },
    { id: "PREPARING", label: "Preparing",  count: orders.filter(o => o.status === "PREPARING").length },
    { id: "READY",     label: "Ready",      count: orders.filter(o => o.status === "READY").length },
    { id: "COMPLETED", label: "Delivered",  count: orders.filter(o => o.status === "COMPLETED").length },
  ];

  const visible = filter === "ALL" ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="w-full min-h-screen bg-[#f7f7f8] flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <button onClick={() => navigate("/customer/home")}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition text-sm font-medium">
            <ArrowLeftIcon /> Back
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 font-bold text-base leading-tight">My Orders</p>
            {activeCount > 0 && (
              <p className="text-xs text-rose-500 font-medium">{activeCount} active order{activeCount !== 1 ? "s" : ""} in progress</p>
            )}
          </div>
          <button onClick={() => fetchData(true)} disabled={refreshing}
            className={`p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition ${refreshing ? "animate-spin text-rose-400" : ""}`}
            title="Refresh">
            <RefreshIcon />
          </button>
        </div>
      </header>

      <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Stats strip ── */}
        <AnimatePresence>
          {!loading && orders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Total Orders", value: orders.length,   cls: "text-gray-900",    bg: "bg-white" },
                { label: "Active",       value: activeCount,     cls: "text-rose-500",    bg: "bg-rose-50" },
                { label: "Delivered",    value: completedCount,  cls: "text-emerald-600", bg: "bg-emerald-50" },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-2xl px-3 py-3 border border-gray-100 text-center`}>
                  <p className={`text-2xl font-black ${s.cls} leading-none`}>{s.value}</p>
                  <p className="text-gray-400 text-[11px] font-medium mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Filter tabs ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide mb-5 -mx-1 px-1 pb-0.5">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                filter === f.id
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/25"
                  : "bg-white text-gray-500 border border-gray-100 hover:border-rose-200 hover:text-rose-500"
              }`}>
              {f.label}
              {f.count > 0 && (
                <span className={`ml-1.5 text-[10px] font-bold ${filter === f.id ? "text-rose-100" : "text-gray-400"}`}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                <div className="h-1 rounded-full bg-gray-100 mb-4" />
                <div className="flex gap-3 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
                <div className="flex gap-2">
                  {[...Array(4)].map((_, j) => <div key={j} className="flex-1 h-1.5 rounded-full bg-gray-100" />)}
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-5 border-2 border-rose-100">
              <span className="text-4xl">🍽️</span>
            </div>
            <p className="text-gray-800 font-bold text-lg mb-1.5">
              {filter === "ALL" ? "No orders yet" : `No ${FILTERS.find(f => f.id === filter)?.label} orders`}
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {filter === "ALL" ? "Your order history will appear here" : "Try selecting a different filter"}
            </p>
            <button
              onClick={() => filter === "ALL" ? navigate("/customer/home") : setFilter("ALL")}
              className="bg-rose-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-600 transition shadow-md shadow-rose-500/20">
              {filter === "ALL" ? "Explore Restaurants" : "View All Orders"}
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {visible.map((order, i) => (
                <motion.div key={order.id} transition={{ delay: i * 0.05 }}>
                  <OrderCard
                    order={order}
                    restMap={restMap}
                    isOpen={expanded === order.id}
                    onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
                    navigate={navigate}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-rose-500 rounded-md flex items-center justify-center shrink-0">
              <span className="text-white font-black text-[9px]">JE</span>
            </div>
            <span className="text-gray-800 font-bold text-sm">JustEat</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-gray-400">
            <button onClick={() => navigate("/customer/home")} className="hover:text-rose-500 transition">Home</button>
            <button onClick={() => navigate("/customer/preferences")} className="hover:text-rose-500 transition">Preferences</button>
          </div>
          <p className="text-gray-300 text-xs">&copy; {new Date().getFullYear()} JustEat</p>
        </div>
      </footer>
    </div>
  );
}

