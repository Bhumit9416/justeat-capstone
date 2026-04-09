import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getMenu, addMenuItem, updateMenuItem, deleteMenuItem, toggleSpecial, toggleDeal } from "../../api/menu";
import { getRestaurantById } from "../../api/restaurants";
import { toast } from "react-toastify";

const EMPTY = { name: "", description: "", price: "", isSpecial: false, isDealOfDay: false, imageUrl: "", isVeg: true };

function ArrowLeftIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>; }
function PlusIcon()      { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function PencilIcon()    { return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function TrashIcon()     { return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>; }
function SearchIcon()    { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }

export default function MenuManagementPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch]         = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const loadData = async () => {
    try {
      setLoading(true);
      const [rRes, mRes] = await Promise.all([getRestaurantById(id), getMenu(id)]);
      if (rRes.success) setRestaurant(rRes.data);
      if (mRes.success) setMenu(mRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [id]);

  const openAdd  = () => { setEditItem(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description || "", price: item.price, isSpecial: item.isSpecial, isDealOfDay: item.isDealOfDay, imageUrl: item.imageUrl || "", isVeg: item.isVeg !== false });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      const res = editItem ? await updateMenuItem(id, editItem.id, payload) : await addMenuItem(id, payload);
      if (res.success) { toast.success(editItem ? "Item updated" : "Item added"); setShowModal(false); loadData(); }
      else toast.error(res.message || "Failed");
    } catch { toast.error("Error saving item"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Remove this item from the menu?")) return;
    try {
      const res = await deleteMenuItem(id, itemId);
      if (res.success) { toast.success("Item removed"); loadData(); }
      else toast.error("Failed to delete");
    } catch { toast.error("Error deleting"); }
  };

  const handleToggle = async (item, type) => {
    try {
      const isSpecialToggle = type === "special";
      const res = isSpecialToggle ? await toggleSpecial(id, item.id, !item.isSpecial) : await toggleDeal(id, item.id, !item.isDealOfDay);
      if (res.success) {
        const key = isSpecialToggle ? "isSpecial" : "isDealOfDay";
        setMenu(prev => prev.map(m => m.id === item.id ? { ...m, [key]: !m[key] } : m));
      }
    } catch { toast.error("Error toggling"); }
  };

  const FILTERS = [
    { id: "ALL",     label: "All Items",   count: menu.length },
    { id: "SPECIAL", label: "Specials",    count: menu.filter(m => m.isSpecial).length },
    { id: "DEAL",    label: "Deal of Day", count: menu.filter(m => m.isDealOfDay).length },
    { id: "POPULAR", label: "Popular",     count: menu.filter(m => m.isMostlyOrdered).length },
  ];

  const filtered = menu
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    .filter(m => {
      if (activeFilter === "SPECIAL") return m.isSpecial;
      if (activeFilter === "DEAL")    return m.isDealOfDay;
      if (activeFilter === "POPULAR") return m.isMostlyOrdered;
      return true;
    });

  const avgPrice = menu.length ? (menu.reduce((s, m) => s + m.price, 0) / menu.length).toFixed(0) : 0;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#0d0d0f] text-white">

      {/* Header */}
      <header className="h-[60px] border-b border-white/[0.06] bg-[#0d0d0f]/80 backdrop-blur-md flex items-center gap-4 px-6 shrink-0">
        <button onClick={() => navigate("/owner/dashboard")}
          className="flex items-center gap-2 text-white/40 hover:text-white transition text-xs font-medium">
          <ArrowLeftIcon /> Back to Dashboard
        </button>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-semibold text-sm">Menu Management</h1>
          {restaurant && <p className="text-white/25 text-[10px]">{restaurant.name} &bull; {restaurant.cuisine} &bull; {restaurant.location}</p>}
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={openAdd}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-lg shadow-rose-500/20 shrink-0">
          <PlusIcon /> Add Item
        </motion.button>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Total Items", value: menu.length,                              color: "text-sky-400",     bg: "bg-sky-500/10 border-sky-500/20",       bar: "from-sky-400 to-sky-500"        },
            { label: "Specials",    value: menu.filter(m => m.isSpecial).length,     color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",   bar: "from-amber-400 to-amber-500"   },
            { label: "Deals Today", value: menu.filter(m => m.isDealOfDay).length,   color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/20",     bar: "from-rose-400 to-rose-500"     },
            { label: "Avg Price",   value: `₹${avgPrice}`,                           color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", bar: "from-emerald-400 to-emerald-500", isText: true },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className={`rounded-xl overflow-hidden border ${s.bg} cursor-default`}>
              <div className={`h-0.5 bg-gradient-to-r ${s.bar}`} />
              <div className="p-4">
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-1.5">{s.label}</p>
                <p className={`font-black text-2xl ${s.color}`}>{s.isText ? s.value : s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activeFilter === f.id
                    ? "bg-rose-500 border-rose-500 text-white"
                    : "bg-transparent border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/20"
                }`}>
                {f.label}
                <span className="ml-1.5 text-[10px] opacity-60">{f.count}</span>
              </button>
            ))}
          </div>
          <div className="sm:ml-auto relative w-full sm:w-56">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"><SearchIcon /></span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..."
              className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/25 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-rose-500/60 transition" />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
              className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-white/20">
            <SearchIcon />
            <p className="text-sm font-semibold mt-3">{search ? "No items match your search" : "No menu items yet"}</p>
            {!search && (
              <button onClick={openAdd} className="mt-4 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 rounded-lg text-xs font-semibold transition">
                Add First Item
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <AnimatePresence>
              {filtered.map((item, i) => (
                <motion.div key={item.id} layout
                  initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }} transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className={`bg-[#111115] border rounded-xl overflow-hidden transition-all duration-200 ${
                    item.isSpecial   ? "border-amber-500/20 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10" :
                    item.isDealOfDay ? "border-rose-500/20 hover:border-rose-500/40 hover:shadow-lg hover:shadow-rose-500/10" :
                    item.isMostlyOrdered ? "border-violet-500/20 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10" :
                    "border-white/[0.06] hover:border-white/[0.14] hover:shadow-lg hover:shadow-black/30"
                  }`}>

                  {/* Card Top */}
                  <div className="px-4 pt-4 pb-3">
                    {/* Item image */}
                    {item.imageUrl && (
                      <div className="mb-3 rounded-lg overflow-hidden h-32 w-full">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-white font-semibold text-sm leading-tight">{item.name}</h3>
                      <span className="text-emerald-400 font-black text-sm shrink-0">₹{item.price}</span>
                    </div>
                    {item.description && (
                      <p className="text-white/35 text-[11px] leading-relaxed line-clamp-2 mb-2">{item.description}</p>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {item.isSpecial && (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] px-1.5 py-0.5 rounded-md font-semibold tracking-wide uppercase">Special</span>
                      )}
                      {item.isDealOfDay && (
                        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] px-1.5 py-0.5 rounded-md font-semibold tracking-wide uppercase">Deal</span>
                      )}
                      {item.isMostlyOrdered && (
                        <span className="bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[9px] px-1.5 py-0.5 rounded-md font-semibold tracking-wide uppercase">Popular</span>
                      )}
                    </div>

                    {/* Toggle Switches */}
                    <div className="grid grid-cols-2 gap-1.5 mb-3">
                      <button onClick={() => handleToggle(item, "special")}
                        className={`text-[10px] py-1.5 rounded-md font-semibold border transition-all ${
                          item.isSpecial
                            ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                            : "bg-white/[0.03] border-white/[0.06] text-white/30 hover:text-white/60 hover:border-white/15"
                        }`}>
                        {item.isSpecial ? "Remove Special" : "Mark Special"}
                      </button>
                      <button onClick={() => handleToggle(item, "deal")}
                        className={`text-[10px] py-1.5 rounded-md font-semibold border transition-all ${
                          item.isDealOfDay
                            ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                            : "bg-white/[0.03] border-white/[0.06] text-white/30 hover:text-white/60 hover:border-white/15"
                        }`}>
                        {item.isDealOfDay ? "Remove Deal" : "Mark Deal"}
                      </button>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="border-t border-white/[0.05] px-4 py-2.5 flex gap-2">
                    <button onClick={() => openEdit(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold py-1.5 rounded-md border border-white/[0.08] text-white/50 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all">
                      <PencilIcon /> Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold py-1.5 rounded-md border border-rose-500/20 text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/40 transition-all">
                      <TrashIcon /> Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }} transition={{ type: "spring", damping: 24, stiffness: 300 }}
              className="bg-[#111115] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-white font-bold text-base">{editItem ? "Edit Menu Item" : "Add Menu Item"}</h2>
                  <p className="text-white/30 text-xs mt-0.5">{editItem ? "Update the details for this dish" : "Add a new dish to your menu"}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-white/20 hover:text-white/60 transition text-lg leading-none">&#x2715;</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {[
                  { name: "name",        label: "Item Name",        placeholder: "e.g. Butter Chicken" },
                  { name: "description", label: "Description",      placeholder: "Brief description of the dish", required: false },
                  { name: "price",       label: "Price (₹)",        placeholder: "e.g. 299", type: "number", step: "0.01", min: "0" },
                  { name: "imageUrl",    label: "Photo URL (optional)", placeholder: "https://example.com/food.jpg", required: false },
                ].map(f => (
                  <div key={f.name}>
                    <label className="block text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-1.5">{f.label}</label>
                    {f.name === "description" ? (
                      <textarea name={f.name} placeholder={f.placeholder} rows={2}
                        value={form[f.name]}
                        onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                        className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-500/60 transition resize-none" />
                    ) : (
                      <>
                        <input type={f.type || "text"} name={f.name} placeholder={f.placeholder}
                          step={f.step} min={f.min} required={f.required !== false}
                          value={form[f.name]}
                          onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                          className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-500/60 transition" />
                        {f.name === "imageUrl" && form.imageUrl && (
                          <div className="mt-2 rounded-lg overflow-hidden h-28 w-full border border-white/[0.08]">
                            <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover"
                              onError={e => { e.target.style.display = "none"; }} />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}

                {/* Toggles */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "isVeg",      label: "Pure Veg",          active: "bg-green-500/15 border-green-500/40 text-green-300" },
                    { key: "isSpecial",  label: "Mark as Special",   active: "bg-amber-500/15 border-amber-500/40 text-amber-300" },
                    { key: "isDealOfDay",label: "Deal of the Day",   active: "bg-rose-500/15 border-rose-500/40 text-rose-300" },
                  ].map(t => (
                    <label key={t.key}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all text-xs font-semibold ${
                        form[t.key] ? t.active : "bg-white/[0.03] border-white/[0.07] text-white/35 hover:border-white/15"
                      }`}>
                      <input type="checkbox" className="hidden" checked={form[t.key]}
                        onChange={e => setForm(p => ({ ...p, [t.key]: e.target.checked }))} />
                      <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                        form[t.key] ? "bg-current border-current" : "border-white/20"}`}>
                        {form[t.key] && <svg className="w-2 h-2 text-[#111115]" fill="currentColor" viewBox="0 0 12 12"><path d="M10 3L5 8.5 2 5.5"/><polyline points="2 5.5 5 8.5 10 3" stroke="currentColor" strokeWidth="2" fill="none"/></svg>}
                      </span>
                      {t.label}
                    </label>
                  ))}
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 text-sm py-2.5 rounded-lg border border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition font-medium">
                    Cancel
                  </button>
                  <motion.button type="submit" disabled={submitting}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 text-sm py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold disabled:opacity-50 transition shadow-lg shadow-rose-500/20">
                    {submitting ? "Saving..." : editItem ? "Save Changes" : "Add to Menu"}
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

