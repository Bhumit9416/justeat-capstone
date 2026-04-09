import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getPreferences, savePreferences } from "../../api/preferences";
import { toast } from "react-toastify";

function ArrowLeftIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>; }
function CheckIcon()     { return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>; }
function PlusIcon()      { return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function XIcon()         { return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }

const CUISINE_LIST = ["North Indian","South Indian","Chinese","Italian","Pizza","Biryani","Burger","Sushi","Mexican","Thai","Continental","Mediterranean","Japanese","Korean","Lebanese","Street Food"];
const DIETARY_LIST = ["Vegan","Gluten-Free","Dairy-Free","Halal","Kosher","Nut-Free","Low Calorie","Keto","High Protein"];

const CUISINE_EMOJIS = {
  "North Indian":"🍛","South Indian":"🥘","Chinese":"🍜","Italian":"🍝",
  "Pizza":"🍕","Biryani":"🍚","Burger":"🍔","Sushi":"🍣","Mexican":"🌮",
  "Thai":"🍱","Continental":"🥐","Mediterranean":"🫒","Japanese":"🥢",
  "Korean":"🥘","Lebanese":"🧆","Street Food":"🌯",
};
const DIETARY_EMOJIS = {
  "Vegan":"🌱","Gluten-Free":"🌾","Dairy-Free":"🥛","Halal":"☪️",
  "Kosher":"✡️","Nut-Free":"🥜","Low Calorie":"⚡","Keto":"🥑","High Protein":"💪",
};

const FOOD_TYPES = [
  { id: "veg",    label: "Vegetarian",     emoji: "🥗", desc: "No meat or eggs",             bg: "bg-emerald-50", border: "border-emerald-500", text: "text-emerald-700", ring: "ring-emerald-400/30" },
  { id: "nonveg", label: "Non-Vegetarian",  emoji: "🍗", desc: "Includes meat & seafood",      bg: "bg-rose-50",    border: "border-rose-500",    text: "text-rose-700",    ring: "ring-rose-400/30"    },
  { id: "both",   label: "Both",            emoji: "🍽️", desc: "No food type restriction",    bg: "bg-orange-50",  border: "border-orange-500",  text: "text-orange-700",  ring: "ring-orange-400/30"  },
];

export default function PreferencesPage() {
  const navigate = useNavigate();
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [cuisines, setCuisines]   = useState([]);
  const [dietary, setDietary]     = useState([]);
  const [foodType, setFoodType]   = useState("both");
  const [favRestaurantIds, setFavRestaurantIds] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getPreferences();
        if (res.success && res.data) {
          const savedDietary = res.data.dietaryRestrictions || [];
          setCuisines(res.data.preferredCuisines || []);
          if (savedDietary.includes("Vegetarian")) {
            setFoodType("veg");
            setDietary(savedDietary.filter((d) => d !== "Vegetarian"));
          } else {
            setFoodType("both");
            setDietary(savedDietary);
          }
          setFavRestaurantIds(res.data.favouriteRestaurantIds || []);
        }
      } catch { /* first time - no prefs yet */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const toggleCuisine = (c) => setCuisines(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);
  const toggleDietary = (d) => setDietary(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const finalDietary = [
        ...(foodType === "veg" ? ["Vegetarian"] : []),
        ...dietary,
      ];
      const res = await savePreferences({ preferredCuisines: cuisines, dietaryRestrictions: finalDietary, favouriteRestaurantIds: favRestaurantIds });
      if (res.success) toast.success("Preferences saved!");
      else toast.error(res.message || "Failed to save");
    } catch { toast.error("Error saving preferences"); }
    finally { setSaving(false); }
  };

  return (
    <div className="w-full min-h-screen bg-[#f5f5f5] flex flex-col">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="w-full max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 h-16 flex items-center gap-4">
          <button onClick={() => navigate("/customer/home")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-sm font-medium">
            <ArrowLeftIcon /> Back
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex-1">
            <h1 className="text-gray-900 font-bold text-base">Food Preferences</h1>
            <p className="text-gray-400 text-xs">Personalise your experience</p>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleSave} disabled={saving || loading}
            className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 rounded-xl text-sm font-semibold transition shadow-lg shadow-rose-500/20 disabled:opacity-60">
            {saving ? "Saving..." : "Save"}
          </motion.button>
        </div>
      </header>

      {/* ── Hero strip ── */}
      <div className="relative bg-gradient-to-r from-rose-500 to-orange-400 overflow-hidden">
        <motion.span className="absolute text-7xl opacity-[0.09] select-none pointer-events-none right-6 -top-2"
          animate={{ rotate: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
          🍽️
        </motion.span>
        <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 py-7">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="text-rose-200 text-xs font-bold uppercase tracking-widest mb-1">Personalise</p>
            <p className="text-white font-black text-2xl sm:text-3xl leading-tight">Your Food Profile</p>
            <p className="text-rose-100 text-sm mt-1.5">Tell us what you love — we'll find your perfect matches 🎯</p>
          </motion.div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="w-full max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 py-8 space-y-6">

          {/* Food Type */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="mb-4">
              <h2 className="text-gray-900 font-bold text-base">Food Type</h2>
              <p className="text-gray-400 text-sm mt-0.5">What kind of food do you prefer?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {FOOD_TYPES.map((ft) => (
                <button key={ft.id} onClick={() => setFoodType(ft.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    foodType === ft.id
                      ? `${ft.bg} ${ft.border} ring-4 ${ft.ring}`
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}>
                  <span className="text-3xl">{ft.emoji}</span>
                  <p className={`font-bold text-sm ${foodType === ft.id ? ft.text : "text-gray-700"}`}>{ft.label}</p>
                  <p className="text-gray-400 text-xs text-center">{ft.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Cuisine preferences */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="mb-4">
              <h2 className="text-gray-900 font-bold text-base">Favourite Cuisines</h2>
              <p className="text-gray-400 text-sm mt-0.5">Select cuisines you enjoy the most</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {CUISINE_LIST.map(c => {
                const selected = cuisines.includes(c);
                return (
                  <button key={c} onClick={() => toggleCuisine(c)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold transition-all ${
                      selected
                        ? "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20"
                        : "bg-white border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-500"
                    }`}>
                    {selected ? <CheckIcon /> : <span className="text-base leading-none">{CUISINE_EMOJIS[c] || "🍽️"}</span>}
                    {c}
                  </button>
                );
              })}
            </div>
            {cuisines.length > 0 && (
              <p className="text-xs text-gray-400 mt-3">{cuisines.length} cuisine{cuisines.length > 1 ? "s" : ""} selected</p>
            )}
          </motion.div>

          {/* Dietary restrictions */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="mb-4">
              <h2 className="text-gray-900 font-bold text-base">Dietary Restrictions</h2>
              <p className="text-gray-400 text-sm mt-0.5">We'll filter out items that don't suit you</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {DIETARY_LIST.map(d => {
                const selected = dietary.includes(d);
                return (
                  <button key={d} onClick={() => toggleDietary(d)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold transition-all ${
                      selected
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : "bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600"
                    }`}>
                    {selected ? <CheckIcon /> : <span className="text-base leading-none">{DIETARY_EMOJIS[d] || "✔"}</span>}
                    {d}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Summary */}
          {(cuisines.length > 0 || dietary.length > 0) && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
              <h2 className="text-rose-700 font-bold text-sm mb-3 uppercase tracking-widest">Your Profile Summary</h2>
              {cuisines.length > 0 && (
                <div className="mb-3">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">Cuisines</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cuisines.map(c => (
                      <span key={c} className="bg-white border border-rose-200 text-rose-600 text-xs px-2.5 py-1 rounded-full font-medium">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {dietary.length > 0 && (
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">Dietary</p>
                  <div className="flex flex-wrap gap-1.5">
                    {dietary.map(d => (
                      <span key={d} className="bg-white border border-emerald-200 text-emerald-600 text-xs px-2.5 py-1 rounded-full font-medium">{d}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Save button bottom */}
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={handleSave} disabled={saving}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3.5 rounded-2xl font-bold text-sm transition shadow-xl shadow-rose-500/20 disabled:opacity-60">
            {saving ? "Saving preferences..." : "Save Preferences"}
          </motion.button>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="w-full max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-black text-[10px]">JE</span>
              </div>
              <span className="text-gray-800 font-bold text-sm">JustEat</span>
            </div>
            <div className="flex items-center gap-5 text-xs text-gray-400">
              <button onClick={() => navigate("/customer/home")} className="hover:text-rose-500 transition">Home</button>
              <button onClick={() => navigate("/customer/orders")} className="hover:text-rose-500 transition">My Orders</button>
            </div>
            <p className="text-gray-300 text-xs">&copy; {new Date().getFullYear()} JustEat</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

