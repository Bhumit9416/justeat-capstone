import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { savePreferences } from "../../api/preferences";
import { toast } from "react-toastify";

const CUISINE_LIST = [
  "North Indian","South Indian","Chinese","Italian","Pizza","Biryani",
  "Burger","Sushi","Mexican","Thai","Continental","Mediterranean",
  "Japanese","Korean","Lebanese","Street Food",
];

const DIETARY_LIST = [
  "Vegan","Gluten-Free","Dairy-Free","Halal","Kosher","Nut-Free","Low Calorie","Keto","High Protein",
];

const FOOD_TYPES = [
  {
    id: "veg",
    label: "Pure Vegetarian",
    emoji: "🥗",
    desc: "No meat, fish, or eggs",
    bg: "bg-emerald-50",
    border: "border-emerald-500",
    text: "text-emerald-700",
    ring: "ring-emerald-400/30",
  },
  {
    id: "nonveg",
    label: "Non Vegetarian",
    emoji: "🍗",
    desc: "Includes meat, seafood & eggs",
    bg: "bg-rose-50",
    border: "border-rose-500",
    text: "text-rose-700",
    ring: "ring-rose-400/30",
  },
  {
    id: "both",
    label: "Everything",
    emoji: "🍽️",
    desc: "No dietary restrictions",
    bg: "bg-orange-50",
    border: "border-orange-500",
    text: "text-orange-700",
    ring: "ring-orange-400/30",
  },
];

const STEPS = ["Food Type", "Cuisines", "Dietary"];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep]         = useState(0);
  const [foodType, setFoodType] = useState(null);
  const [cuisines, setCuisines] = useState([]);
  const [dietary, setDietary]   = useState([]);
  const [saving, setSaving]     = useState(false);

  const toggleCuisine = (c) => setCuisines((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);
  const toggleDietary = (d) => setDietary((p) => p.includes(d) ? p.filter((x) => x !== d) : [...p, d]);

  const canNext = () => step === 0 ? foodType !== null : true;

  const handleNext = () => {
    if (step < 2) setStep((s) => s + 1);
    else handleFinish();
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const dietaryFull = [
        ...(foodType === "veg" ? ["Vegetarian"] : []),
        ...dietary,
      ];
      await savePreferences({
        preferredCuisines: cuisines,
        dietaryRestrictions: dietaryFull,
        favouriteRestaurantIds: [],
      });
      toast.success("Preferences saved! Enjoy your personalised experience 🎉");
    } catch {
      // preferences are optional — navigate anyway
    } finally {
      setSaving(false);
      navigate("/customer/home");
    }
  };

  const handleSkip = () => navigate("/customer/home");

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xs">JE</span>
            </div>
            <span className="text-gray-900 font-black text-lg">JustEat</span>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 text-sm font-medium hover:text-gray-600 transition"
          >
            Skip for now
          </button>
        </div>
      </header>

      {/* ── Progress bar ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-1 mb-3">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 gap-1">
                <div
                  className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    i < step
                      ? "bg-rose-500 border-rose-500 text-white"
                      : i === step
                      ? "border-rose-500 text-rose-500 bg-rose-50"
                      : "border-gray-200 text-gray-400 bg-white"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span
                  className={`text-xs font-semibold hidden sm:block ${
                    i === step ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {s}
                </span>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 rounded transition-all ${
                      i < step ? "bg-rose-500" : "bg-gray-100"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-xs">
            Step {step + 1} of {STEPS.length} — Takes less than a minute
          </p>
        </div>
      </div>

      {/* ── Step content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-8">
          <AnimatePresence mode="wait">

            {/* Step 0 – Food Type */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.22 }}
              >
                <h2 className="text-gray-900 font-black text-2xl mb-1">What do you eat?</h2>
                <p className="text-gray-400 text-sm mb-6">
                  We'll personalise your restaurant recommendations based on this
                </p>
                <div className="space-y-3">
                  {FOOD_TYPES.map((ft) => (
                    <motion.button
                      key={ft.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setFoodType(ft.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                        foodType === ft.id
                          ? `${ft.bg} ${ft.border} ring-4 ${ft.ring}`
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${
                          foodType === ft.id ? ft.bg : "bg-gray-50"
                        }`}
                      >
                        {ft.emoji}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-bold text-base ${
                            foodType === ft.id ? ft.text : "text-gray-800"
                          }`}
                        >
                          {ft.label}
                        </p>
                        <p className="text-gray-400 text-sm mt-0.5">{ft.desc}</p>
                      </div>
                      {foodType === ft.id && (
                        <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 1 – Cuisines */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.22 }}
              >
                <h2 className="text-gray-900 font-black text-2xl mb-1">Favourite cuisines?</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Pick as many as you like — we'll find matching restaurants for you
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {CUISINE_LIST.map((c, i) => (
                    <motion.button
                      key={c}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleCuisine(c)}
                      className={`px-4 py-2.5 rounded-full border-2 text-sm font-semibold transition-all ${
                        cuisines.includes(c)
                          ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20"
                          : "bg-white border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-500"
                      }`}
                    >
                      {c}
                    </motion.button>
                  ))}
                </div>
                {cuisines.length > 0 && (
                  <p className="text-rose-500 text-sm font-semibold mt-4">
                    {cuisines.length} cuisine{cuisines.length > 1 ? "s" : ""} selected
                  </p>
                )}
                <p className="text-gray-400 text-xs mt-2">
                  No preference? That's fine — you can always update this later
                </p>
              </motion.div>
            )}

            {/* Step 2 – Dietary */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.22 }}
              >
                <h2 className="text-gray-900 font-black text-2xl mb-1">Any dietary needs?</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Completely optional — we'll use this to filter menu items for you
                </p>
                <div className="flex flex-wrap gap-2.5 mb-8">
                  {DIETARY_LIST.map((d, i) => (
                    <motion.button
                      key={d}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleDietary(d)}
                      className={`px-4 py-2.5 rounded-full border-2 text-sm font-semibold transition-all ${
                        dietary.includes(d)
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                          : "bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600"
                      }`}
                    >
                      {d}
                    </motion.button>
                  ))}
                </div>

                {/* Summary */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-4">
                    Your Preferences Summary
                  </p>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-lg shrink-0">
                        {FOOD_TYPES.find((f) => f.id === foodType)?.emoji}
                      </span>
                      <div>
                        <p className="text-gray-400 text-xs">Food Type</p>
                        <p className="font-semibold text-gray-900">
                          {FOOD_TYPES.find((f) => f.id === foodType)?.label}
                        </p>
                      </div>
                    </div>
                    {cuisines.length > 0 && (
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-lg shrink-0">
                          🍜
                        </span>
                        <div>
                          <p className="text-gray-400 text-xs">Cuisines</p>
                          <p className="font-semibold text-gray-900">{cuisines.join(", ")}</p>
                        </div>
                      </div>
                    )}
                    {dietary.length > 0 && (
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-lg shrink-0">
                          🌿
                        </span>
                        <div>
                          <p className="text-gray-400 text-xs">Dietary</p>
                          <p className="font-semibold text-gray-900">{dietary.join(", ")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* ── Footer navigation ── */}
      <div className="bg-white border-t border-gray-100 px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:border-gray-300 hover:bg-gray-50 transition"
            >
              Back
            </button>
          )}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleNext}
            disabled={!canNext() || saving}
            className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold text-sm transition shadow-lg shadow-rose-500/25"
          >
            {saving ? "Saving..." : step === 2 ? "Start Exploring 🎉" : "Continue"}
          </motion.button>
        </div>
      </div>

    </div>
  );
}
