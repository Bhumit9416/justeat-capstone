import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { useAuth } from "../../context/AuthContext";
import { getMyRestaurants, createRestaurant, updateRestaurant } from "../../api/restaurants";
import { getRestaurantOrders, updateOrderStatus } from "../../api/orders";
import { toast } from "react-toastify";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const STATUS_META = {
  PENDING:   { pill: "bg-amber-500/15 text-amber-400 border-amber-500/30",   dot: "bg-amber-400",   bar: "bg-amber-400",   label: "Pending"   },
  PREPARING: { pill: "bg-blue-500/15 text-blue-400 border-blue-500/30",       dot: "bg-blue-400",    bar: "bg-blue-400",    label: "Preparing" },
  READY:     { pill: "bg-violet-500/15 text-violet-400 border-violet-500/30", dot: "bg-violet-400",  bar: "bg-violet-400",  label: "Ready"     },
  COMPLETED: { pill: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400", bar: "bg-emerald-400", label: "Completed" },
};
const STATUS_FLOW = ["PENDING", "PREPARING", "READY", "COMPLETED"];
const STATUS_BAR  = {
  PENDING:   "from-amber-400 to-amber-500",
  PREPARING: "from-blue-400 to-blue-500",
  READY:     "from-violet-400 to-violet-500",
  COMPLETED: "from-emerald-400 to-emerald-500",
};

const NAV = [
  { id: "dashboard",   icon: <GridIcon />,       label: "Overview"     },
  { id: "restaurants", icon: <StoreIcon />,       label: "Restaurants"  },
  { id: "orders",      icon: <BoxIcon />,         label: "Orders"       },
];

function GridIcon()  { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }
function StoreIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function BoxIcon()   { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>; }
function ChevronLeft()  { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>; }
function ChevronRight() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>; }
function PlusIcon()     { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function PencilIcon()   { return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function LogoutIcon()   { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function StarIcon()     { return <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>; }
function MapPinIcon()   { return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>; }

function AnimatedCounter({ value, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const end = parseFloat(value) || 0;
    if (end === 0) { setDisplay(0); return; }
    let start = 0;
    const steps = 40;
    const increment = end / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{typeof display === "number" && display % 1 !== 0 ? display.toFixed(0) : display}{suffix}</span>;
}

function RestaurantDashboard({ restaurant, allOrders, onBack, baseChartOpts }) {
  const rOrders    = allOrders.filter((o) => o.restaurantId === restaurant.id);
  const rRevenue   = rOrders.filter((o) => o.status === "COMPLETED").reduce((s, o) => s + o.totalPrice, 0);
  const rPending   = rOrders.filter((o) => o.status === "PENDING").length;
  const rActive    = rOrders.filter((o) => o.status !== "COMPLETED").length;
  const rCompleted = rOrders.filter((o) => o.status === "COMPLETED").length;

  const rStats = [
    { label: "Total Revenue",   value: `₹${rRevenue.toFixed(0)}`,     color: "text-emerald-400", bg: "bg-[#111115] border-white/[0.06]", bar: "from-emerald-400 to-emerald-500" },
    { label: "Total Orders",    value: rOrders.length,                 color: "text-white",        bg: "bg-[#111115] border-white/[0.06]", bar: "from-sky-400 to-sky-500"         },
    { label: "Active Orders",   value: rActive,                        color: "text-amber-400",    bg: "bg-[#111115] border-white/[0.06]", bar: "from-amber-400 to-amber-500"    },
    { label: "Completed",       value: rCompleted,                     color: "text-emerald-400",  bg: "bg-[#111115] border-white/[0.06]", bar: "from-emerald-400 to-teal-500"   },
  ];

  const rDoughnutData = {
    labels: STATUS_FLOW.map((s) => STATUS_META[s].label),
    datasets: [{
      data: STATUS_FLOW.map((s) => rOrders.filter((o) => o.status === s).length),
      backgroundColor: ["rgba(245,158,11,0.8)","rgba(59,130,246,0.8)","rgba(139,92,246,0.8)","rgba(16,185,129,0.8)"],
      borderColor: ["#f59e0b","#3b82f6","#8b5cf6","#10b981"],
      borderWidth: 1.5, hoverOffset: 8,
    }],
  };

  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const rLineData = {
    labels: days,
    datasets: [{
      label: "Orders",
      data: days.map((_, i) => Math.max(0, rOrders.length - i + (i % 2))),
      borderColor: "#ef4444", backgroundColor: "rgba(239,68,68,0.08)",
      fill: true, tension: 0.45, pointBackgroundColor: "#ef4444",
      pointRadius: 4, pointHoverRadius: 7, borderWidth: 2,
    }],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
    >
      {/* Back */}
      <button onClick={onBack}
        className="flex items-center gap-2 text-white/40 hover:text-white/80 text-sm font-medium mb-5 transition">
        <ChevronLeft /> Back to All Restaurants
      </button>

      {/* Restaurant header */}
      <div className="flex items-center gap-4 mb-6 bg-[#111115] border border-white/[0.06] rounded-xl p-4">
        {restaurant.imageUrl ? (
          <img src={restaurant.imageUrl} alt={restaurant.name}
            className="w-16 h-16 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-[#1a1a1f] border border-white/[0.06] flex items-center justify-center shrink-0">
            <StoreIcon />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-lg truncate">{restaurant.name}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="bg-white/[0.06] text-white/50 text-[11px] px-2.5 py-0.5 rounded-md font-medium">{restaurant.cuisine}</span>
            <span className="flex items-center gap-1 text-white/30 text-[11px]"><MapPinIcon />{restaurant.location}</span>
            {restaurant.rating && (
              <span className="flex items-center gap-1 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
                <StarIcon /> {restaurant.rating}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        {rStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className={`rounded-xl overflow-hidden border ${s.bg} cursor-default`}>
            <div className={`h-0.5 bg-gradient-to-r ${s.bar}`} />
            <div className="p-4">
              <p className="text-white/40 text-[11px] font-medium uppercase tracking-widest mb-2">{s.label}</p>
              <p className={`font-black text-2xl ${s.color}`}>{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts + recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="lg:col-span-2 bg-[#111115] border border-white/[0.06] rounded-xl p-5">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">Weekly Order Trend</p>
          <Line data={rLineData} options={{ ...baseChartOpts, animation: { duration: 1200, easing: "easeInOutQuart" } }} />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="bg-[#111115] border border-white/[0.06] rounded-xl p-5">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">Order Status</p>
          {rOrders.length === 0
            ? <div className="h-36 flex items-center justify-center text-white/20 text-sm">No orders yet</div>
            : <Doughnut data={rDoughnutData} options={{ responsive: true, animation: { animateRotate: true, duration: 900 }, plugins: { legend: { position: "bottom", labels: { color: "rgba(255,255,255,0.4)", padding: 10, font: { size: 10 }, boxWidth: 10 } } }, cutout: "68%" }} />}
        </motion.div>
      </div>

      {/* Recent orders */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-[#111115] border border-white/[0.06] rounded-xl">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Recent Orders</p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {rOrders.length === 0 ? (
            <div className="px-4 py-8 text-center text-white/20 text-sm">No orders for this restaurant yet</div>
          ) : rOrders.slice(0, 8).map((o) => (
            <div key={o.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-white text-sm font-semibold">#{o.localOrderNum}</p>
                <p className="text-white/30 text-[11px] mt-0.5">{o.items?.length || 0} item{o.items?.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white font-bold text-sm">₹{o.totalPrice?.toFixed(0)}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold ${STATUS_META[o.status]?.pill}`}>
                  {STATUS_META[o.status]?.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function OwnerDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [allOrders, setAllOrders]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("dashboard");
  const [showModal, setShowModal]     = useState(false);
  const [selectedRest, setSelectedRest] = useState(null);
  const [selectedRestDash, setSelectedRestDash] = useState(null);
  const [orderFilter, setOrderFilter] = useState("ALL");
  const [collapsed, setCollapsed]     = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [newRest, setNewRest]         = useState({ name: "", cuisine: "", location: "", imageUrl: "", rating: "" });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRest, setEditRest]           = useState(null);
  // restaurantId -> restaurant object for quick lookup on order cards
  const restMap = Object.fromEntries(restaurants.map(r => [r.id, r]));

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getMyRestaurants();
      if (res.success) {
        const rests = res.data;
        setRestaurants(rests);
        const results = await Promise.all(rests.map(r => getRestaurantOrders(r.id).catch(() => ({ success: false, data: [] }))));
        // Assign per-restaurant sequential order numbers (oldest = #1)
        const combined = results.flatMap((r, i) => {
          const orders = r.success ? r.data : [];
          const sorted = [...orders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          return sorted.map((o, idx) => ({
            ...o,
            restaurantName: rests[i].name,
            restaurantId: rests[i].id,
            localOrderNum: idx + 1,
          }));
        });
        setAllOrders(combined);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const payload = { ...newRest, rating: newRest.rating ? parseFloat(newRest.rating) : null };
      const res = await createRestaurant(payload);
      if (res.success) { toast.success("Restaurant added successfully"); setShowModal(false); setNewRest({ name: "", cuisine: "", location: "", imageUrl: "", rating: "" }); loadData(); }
      else toast.error(res.message || "Failed to add");
    } catch { toast.error("Error adding restaurant"); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const payload = { ...editRest, rating: editRest.rating ? parseFloat(editRest.rating) : null };
      const res = await updateRestaurant(editRest.id, payload);
      if (res.success) { toast.success("Restaurant updated!"); setShowEditModal(false); setEditRest(null); loadData(); }
      else toast.error(res.message || "Failed to update");
    } catch { toast.error("Error updating restaurant"); }
    finally { setSubmitting(false); }
  };

  const handleStatus = async (orderId, status) => {
    try {
      const res = await updateOrderStatus(orderId, status);
      if (res.success) { toast.success(`Order marked as ${status}`); setAllOrders(p => p.map(o => o.id === orderId ? { ...o, status } : o)); }
      else toast.error("Failed to update");
    } catch { toast.error("Error updating order"); }
  };

  const revenue       = allOrders.filter(o => o.status === "COMPLETED").reduce((s, o) => s + o.totalPrice, 0);
  const activeCount   = allOrders.filter(o => o.status !== "COMPLETED").length;
  const completedCount= allOrders.filter(o => o.status === "COMPLETED").length;

  const revenueByRest = restaurants.map(r => ({
    name: r.name,
    revenue: allOrders.filter(o => o.restaurantId === r.id && o.status === "COMPLETED").reduce((s, o) => s + o.totalPrice, 0),
    orders: allOrders.filter(o => o.restaurantId === r.id).length,
  }));

  const barData = {
    labels: revenueByRest.map(r => r.name.length > 12 ? r.name.slice(0, 12) + "…" : r.name),
    datasets: [{ label: "Revenue", data: revenueByRest.map(r => r.revenue),
      backgroundColor: "rgba(239,68,68,0.85)", borderColor: "#ef4444",
      borderWidth: 0, borderRadius: 6, borderSkipped: false }],
  };

  const doughnutData = {
    labels: STATUS_FLOW.map(s => STATUS_META[s].label),
    datasets: [{ data: STATUS_FLOW.map(s => allOrders.filter(o => o.status === s).length),
      backgroundColor: ["rgba(245,158,11,0.8)","rgba(59,130,246,0.8)","rgba(139,92,246,0.8)","rgba(16,185,129,0.8)"],
      borderColor: ["#f59e0b","#3b82f6","#8b5cf6","#10b981"],
      borderWidth: 1.5, hoverOffset: 8 }],
  };

  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const lineData = {
    labels: days,
    datasets: [{ label: "Orders", data: days.map((_, i) => Math.max(0, allOrders.length - i + (i % 3))),
      borderColor: "#ef4444", backgroundColor: "rgba(239,68,68,0.08)",
      fill: true, tension: 0.45, pointBackgroundColor: "#ef4444",
      pointRadius: 4, pointHoverRadius: 7, borderWidth: 2 }],
  };

  const baseChartOpts = {
    responsive: true, maintainAspectRatio: true,
    animation: { duration: 900, easing: "easeOutQuart" },
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: "rgba(255,255,255,0.35)", font: { size: 11 } }, grid: { color: "rgba(255,255,255,0.04)" }, border: { color: "transparent" } },
      y: { ticks: { color: "rgba(255,255,255,0.35)", font: { size: 11 } }, grid: { color: "rgba(255,255,255,0.04)" }, border: { color: "transparent" } },
    },
  };

  const visibleOrders = allOrders
    .filter(o => orderFilter === "ALL" || o.status === orderFilter)
    .filter(o => !selectedRest || o.restaurantId === selectedRest.id);

  const STATS = [
    { label: "Restaurants",   value: restaurants.length,   suffix: "",   color: "text-sky-400",     bg: "bg-sky-500/10 border-sky-500/20",       bar: "from-sky-400 to-sky-500"       },
    { label: "Active Orders", value: activeCount,           suffix: "",   color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",   bar: "from-amber-400 to-amber-500"   },
    { label: "Completed",     value: completedCount,        suffix: "",   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20",bar: "from-emerald-400 to-emerald-500"},
    { label: "Total Revenue", value: revenue.toFixed(0),    prefix: "₹", color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/20",     bar: "from-rose-400 to-rose-500"     },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#0d0d0f] text-white">

      {/* ── Sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? 60 : 220 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="h-full bg-[#111115] border-r border-white/[0.06] flex flex-col shrink-0 overflow-hidden z-20">

        {/* Brand */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-white/[0.06] min-h-[60px]">
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-rose-500 flex items-center justify-center shrink-0">
                  <span className="text-white font-black text-xs">JE</span>
                </div>
                <span className="text-white font-bold text-sm tracking-wide whitespace-nowrap">JustEat</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setCollapsed(p => !p)}
            className="w-7 h-7 rounded-lg text-white/30 hover:text-white hover:bg-white/5 flex items-center justify-center transition shrink-0 ml-auto">
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        </div>

        {/* User */}
        <div className="px-3 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{user?.username}</p>
                  <p className="text-white/30 text-[10px]">Restaurant Owner</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : ""}
              className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all duration-150 text-sm ${
                activeTab === item.id
                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                  : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
              }`}>
              <span className="shrink-0">{item.icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="font-medium whitespace-nowrap text-xs">{item.label}</motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-2 pb-4 border-t border-white/[0.06] pt-3">
          <button onClick={logout} title={collapsed ? "Logout" : ""}
            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition text-sm">
            <span className="shrink-0"><LogoutIcon /></span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="font-medium text-xs whitespace-nowrap">Sign Out</motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-[60px] border-b border-white/[0.06] bg-[#0d0d0f]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-white font-semibold text-sm tracking-wide">
              {NAV.find(n => n.id === activeTab)?.label}
            </h1>
            <p className="text-white/25 text-[10px] mt-0.5">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-lg shadow-rose-500/20">
            <PlusIcon /> Add Restaurant
          </motion.button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">

            {/* ── OVERVIEW ── */}
            {activeTab === "dashboard" && (
              <motion.div key="dash" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>

                {/* Stats Row */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
                  {STATS.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      whileHover={{ y: -2, transition: { duration: 0.15 } }}
                      className={`rounded-xl overflow-hidden border ${s.bg} cursor-default`}>
                      <div className={`h-0.5 bg-gradient-to-r ${s.bar}`} />
                      <div className="p-4">
                        <p className="text-white/40 text-[11px] font-medium uppercase tracking-widest mb-2">{s.label}</p>
                        <p className={`font-black text-2xl ${s.color}`}>
                          <AnimatedCounter value={s.value} prefix={s.prefix || ""} />
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                  <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                    className="lg:col-span-2 bg-[#111115] border border-white/[0.06] rounded-xl p-5">
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">Revenue by Restaurant</p>
                    {restaurants.length === 0
                      ? <div className="h-36 flex items-center justify-center text-white/20 text-sm">No data available</div>
                      : <Bar data={barData} options={{ ...baseChartOpts, scales: { ...baseChartOpts.scales, y: { ...baseChartOpts.scales.y, ticks: { ...baseChartOpts.scales.y.ticks, callback: v => `₹${v}` } } } }} />}
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className="bg-[#111115] border border-white/[0.06] rounded-xl p-5">
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">Order Status</p>
                    {allOrders.length === 0
                      ? <div className="h-36 flex items-center justify-center text-white/20 text-sm">No orders yet</div>
                      : <Doughnut data={doughnutData} options={{ responsive: true, animation: { animateRotate: true, duration: 900 }, plugins: { legend: { position: "bottom", labels: { color: "rgba(255,255,255,0.4)", padding: 10, font: { size: 10 }, boxWidth: 10 } } }, cutout: "68%" }} />}
                  </motion.div>
                </div>

                {/* Line Chart + Recent Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className="lg:col-span-2 bg-[#111115] border border-white/[0.06] rounded-xl p-5">
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">Weekly Trend</p>
                    <Line data={lineData} options={{ ...baseChartOpts, animation: { duration: 1200, easing: "easeInOutQuart" } }} />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-[#111115] border border-white/[0.06] rounded-xl flex flex-col">
                    <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                      <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Recent Orders</p>
                      <button onClick={() => setActiveTab("orders")} className="text-rose-400 text-[10px] font-semibold hover:underline">View all</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {allOrders.length === 0
                        ? <div className="h-24 flex items-center justify-center text-white/20 text-xs">No orders yet</div>
                        : allOrders.slice(0, 6).map(o => (
                          <div key={o.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                            <div>
                              <p className="text-white text-xs font-semibold">#{o.localOrderNum} · {o.restaurantName}</p>
                              <p className="text-white/30 text-[10px]">{o.items?.length || 0} item{o.items?.length !== 1 ? "s" : ""}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-white text-xs font-bold">₹{o.totalPrice?.toFixed(0)}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${STATUS_META[o.status]?.pill}`}>
                                {STATUS_META[o.status]?.label}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* ── RESTAURANTS ── */}
            {activeTab === "restaurants" && (
              <motion.div key="rests" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <AnimatePresence mode="wait">
                  {selectedRestDash ? (
                    <RestaurantDashboard
                      key={`dash-${selectedRestDash.id}`}
                      restaurant={selectedRestDash}
                      allOrders={allOrders}
                      onBack={() => setSelectedRestDash(null)}
                      baseChartOpts={baseChartOpts}
                    />
                  ) : loading ? (
                    <div className="flex items-center justify-center h-64">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                        className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full" />
                    </div>
                  ) : restaurants.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-white/30">
                      <StoreIcon />
                      <p className="text-sm font-semibold mt-3">No restaurants added yet</p>
                      <button onClick={() => setShowModal(true)}
                        className="mt-4 bg-rose-500 text-white px-5 py-2 rounded-lg text-xs font-semibold hover:bg-rose-600 transition">
                        Add Your First Restaurant
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {restaurants.map((r, i) => {
                        const rOrders  = allOrders.filter(o => o.restaurantId === r.id);
                        const rRevenue = rOrders.filter(o => o.status === "COMPLETED").reduce((s, o) => s + o.totalPrice, 0);
                        return (
                          <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                            whileHover={{ y: -3, transition: { duration: 0.18 } }}
                            className="bg-[#111115] border border-white/[0.06] rounded-xl overflow-hidden group hover:border-white/[0.18] hover:shadow-xl hover:shadow-black/50 transition-all duration-300">
                            {/* Image */}
                            <div className="h-40 bg-[#1a1a1f] relative overflow-hidden">
                              {r.imageUrl
                                ? <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" />
                                : <div className="w-full h-full flex items-center justify-center"><StoreIcon /></div>}
                              <div className="absolute inset-0 bg-gradient-to-t from-[#111115] via-[#111115]/20 to-transparent" />
                              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                <span className="bg-white/10 backdrop-blur border border-white/10 text-white text-[10px] px-2 py-0.5 rounded-md font-medium">{r.cuisine}</span>
                              </div>
                              {r.rating && (
                                <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  <StarIcon /> {r.rating}
                                </div>
                              )}
                            </div>

                            <div className="p-4">
                              <h3 className="text-white font-bold text-sm mb-1">{r.name}</h3>
                              <div className="flex items-center gap-1 text-white/30 text-[11px] mb-4">
                                <MapPinIcon /> {r.location}
                              </div>

                              <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="bg-white/[0.03] rounded-lg p-2.5 border border-white/[0.05]">
                                  <p className="text-white/30 text-[10px] mb-0.5">Orders</p>
                                  <p className="text-white font-bold text-sm">{rOrders.length}</p>
                                </div>
                                <div className="bg-white/[0.03] rounded-lg p-2.5 border border-white/[0.05]">
                                  <p className="text-white/30 text-[10px] mb-0.5">Revenue</p>
                                  <p className="text-emerald-400 font-bold text-sm">₹{rRevenue.toFixed(0)}</p>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button onClick={() => setSelectedRestDash(r)}
                                  className="flex-1 text-xs font-semibold py-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 transition-all">
                                  Dashboard
                                </button>
                                <button onClick={() => navigate(`/owner/restaurant/${r.id}/menu`)}
                                  className="flex-1 text-xs font-semibold py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all">
                                  Menu
                                </button>
                                <button onClick={() => { setSelectedRest(r); setActiveTab("orders"); setOrderFilter("ALL"); }}
                                  className="flex-1 text-xs font-semibold py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all">
                                  Orders
                                </button>
                                <button
                                  onClick={() => { setEditRest({ id: r.id, name: r.name, cuisine: r.cuisine || "", location: r.location || "", imageUrl: r.imageUrl || "", rating: r.rating || "" }); setShowEditModal(true); }}
                                  title="Edit"
                                  className="px-2.5 text-xs font-semibold py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all">
                                  <PencilIcon />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── ORDERS ── */}
            {activeTab === "orders" && (
              <motion.div key="orders" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {["ALL", ...STATUS_FLOW].map(s => (
                    <button key={s} onClick={() => setOrderFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        orderFilter === s
                          ? "bg-rose-500 border-rose-500 text-white"
                          : "bg-transparent border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/20"
                      }`}>
                      {s === "ALL" ? "All Orders" : STATUS_META[s].label}
                      <span className="ml-1.5 text-[10px] opacity-60">
                        {s === "ALL" ? allOrders.length : allOrders.filter(o => o.status === s).length}
                      </span>
                    </button>
                  ))}
                  <select value={selectedRest?.id || ""}
                    onChange={e => setSelectedRest(restaurants.find(r => r.id === parseInt(e.target.value)) || null)}
                    className="ml-auto bg-[#111115] border border-white/[0.08] text-white/50 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-rose-500 transition">
                    <option value="">All Restaurants</option>
                    {restaurants.map(r => <option key={r.id} value={r.id} className="bg-[#111115]">{r.name}</option>)}
                  </select>
                </div>

                {visibleOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-white/20">
                    <BoxIcon />
                    <p className="text-sm mt-3">No orders found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                    <AnimatePresence>
                      {visibleOrders.map((order, i) => (
                        <motion.div key={order.id} layout
                          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }} transition={{ delay: i * 0.03 }}
                          className="bg-[#111115] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.14] hover:shadow-lg hover:shadow-black/30 transition-all">

                          {/* Status colour bar */}
                          <div className={`h-0.5 bg-gradient-to-r ${STATUS_BAR[order.status] || "from-gray-600 to-gray-700"}`} />

                          {/* Order Header */}
                          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-3">
                            {/* Restaurant photo */}
                            {restMap[order.restaurantId]?.imageUrl
                              ? <img src={restMap[order.restaurantId].imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 opacity-80" />
                              : <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0"><StoreIcon /></div>
                            }
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold text-sm">#{order.localOrderNum} <span className="text-white/30 font-normal text-[10px]">· {order.restaurantName}</span></p>
                              <p className="text-white/30 text-[10px] mt-0.5">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}</p>
                            </div>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold shrink-0 ${STATUS_META[order.status]?.pill}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[order.status]?.dot} animate-pulse`} />
                              {STATUS_META[order.status]?.label}
                            </div>
                          </div>

                          {/* Items */}
                          <div className="px-4 py-3">
                            <div className="space-y-1.5 mb-3">
                              {order.items?.slice(0, 3).map((item, idx) => (
                                <div key={idx} className="flex justify-between text-[11px]">
                                  <span className="text-white/50">{item.menuItemName || `Item #${item.menuItemId}`} &times; {item.quantity}</span>
                                  <span className="text-white/70 font-medium">₹{item.price?.toFixed(2)}</span>
                                </div>
                              ))}
                              {(order.items?.length || 0) > 3 && <p className="text-white/25 text-[10px]">+{order.items.length - 3} more items</p>}
                            </div>
                            <div className="flex justify-between pt-2 border-t border-white/[0.06]">
                              <span className="text-white/30 text-xs">Total Amount</span>
                              <span className="text-white font-bold text-sm">₹{order.totalPrice?.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="px-4 pb-3">
                            <div className="flex gap-1 mb-3">
                              {STATUS_FLOW.map((s, idx) => (
                                <div key={s} className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                                  STATUS_FLOW.indexOf(order.status) >= idx ? "bg-rose-500" : "bg-white/[0.07]"}`} />
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {STATUS_FLOW.filter(s => s !== order.status).map(s => (
                                <button key={s} onClick={() => handleStatus(order.id, s)}
                                  className={`text-[10px] px-2.5 py-1 rounded-md font-semibold border transition-all hover:opacity-80 ${STATUS_META[s].pill}`}>
                                  Mark {STATUS_META[s].label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Add Restaurant Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 24 }} transition={{ type: "spring", damping: 24, stiffness: 300 }}
              className="bg-[#111115] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-white font-bold text-base">Add New Restaurant</h2>
                  <p className="text-white/30 text-xs mt-0.5">Fill in the details below to list your restaurant</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-white/20 hover:text-white/60 transition text-lg leading-none">&#x2715;</button>
              </div>
              <form onSubmit={handleAdd} className="space-y-3">
                {[
                  { name: "name",     label: "Restaurant Name",  placeholder: "e.g. Spice Garden" },
                  { name: "cuisine",  label: "Cuisine Type",     placeholder: "e.g. North Indian, Italian" },
                  { name: "location", label: "Location",         placeholder: "e.g. Mumbai, Maharashtra" },
                  { name: "imageUrl", label: "Cover Image URL",  placeholder: "https://example.com/image.jpg", required: false },
                  { name: "rating",   label: "Initial Rating",   placeholder: "4.2", required: false, type: "number", step: "0.1", min: "0", max: "5" },
                ].map(f => (
                  <div key={f.name}>
                    <label className="block text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-1.5">{f.label}</label>
                    <input type={f.type || "text"} name={f.name} placeholder={f.placeholder}
                      step={f.step} min={f.min} max={f.max}
                      required={f.required !== false}
                      value={newRest[f.name]}
                      onChange={e => setNewRest(p => ({ ...p, [e.target.name]: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-500/60 transition" />
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 text-sm py-2.5 rounded-lg border border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition font-medium">
                    Cancel
                  </button>
                  <motion.button type="submit" disabled={submitting}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 text-sm py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold disabled:opacity-50 transition shadow-lg shadow-rose-500/20">
                    {submitting ? "Adding..." : "Add Restaurant"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── Edit Restaurant Modal ── */}
      <AnimatePresence>
        {showEditModal && editRest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowEditModal(false)}>
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 24 }} transition={{ type: "spring", damping: 24, stiffness: 300 }}
              className="bg-[#111115] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-white font-bold text-base">Edit Restaurant</h2>
                  <p className="text-white/30 text-xs mt-0.5">Update your restaurant details</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="text-white/20 hover:text-white/60 transition text-lg leading-none">&#x2715;</button>
              </div>
              <form onSubmit={handleEdit} className="space-y-3">
                {[
                  { name: "name",     label: "Restaurant Name",  placeholder: "e.g. Spice Garden" },
                  { name: "cuisine",  label: "Cuisine Type",     placeholder: "e.g. North Indian, Italian" },
                  { name: "location", label: "Location",         placeholder: "e.g. Mumbai, Maharashtra" },
                  { name: "imageUrl", label: "Cover Image URL",  placeholder: "https://example.com/image.jpg", required: false },
                  { name: "rating",   label: "Rating",           placeholder: "4.2", required: false, type: "number", step: "0.1", min: "0", max: "5" },
                ].map(f => (
                  <div key={f.name}>
                    <label className="block text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-1.5">{f.label}</label>
                    <input type={f.type || "text"} name={f.name} placeholder={f.placeholder}
                      step={f.step} min={f.min} max={f.max}
                      required={f.required !== false}
                      value={editRest[f.name]}
                      onChange={e => setEditRest(p => ({ ...p, [e.target.name]: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500/60 transition" />
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowEditModal(false)}
                    className="flex-1 text-sm py-2.5 rounded-lg border border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition font-medium">
                    Cancel
                  </button>
                  <motion.button type="submit" disabled={submitting}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 text-sm py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold disabled:opacity-50 transition shadow-lg shadow-amber-500/20">
                    {submitting ? "Saving..." : "Save Changes"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
