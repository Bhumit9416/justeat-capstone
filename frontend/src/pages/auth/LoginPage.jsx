import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const ok = await login(form.username, form.password);
      if (ok) {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        navigate(storedUser?.role === "OWNER" ? "/owner/dashboard" : "/customer/home");
      }
    } catch (err) {
      const status = err?.response?.status;
      const msg    = err?.response?.data?.message || "";
      const errMsg =
        status === 401 || status === 403 ? "Incorrect username or password. Please try again."
        : msg || "Something went wrong. Please try again.";
      setError(errMsg);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-rose-600 via-rose-500 to-orange-400 flex-col justify-between p-12 relative overflow-hidden">
        {/* Floating food emoji background */}
        {[["🍕",8,12,0],["🍔",82,60,0.5],["🌮",22,72,0.3],["🍣",88,25,0.8],["🥘",52,85,0.2],["🍜",65,6,1.0],["🍦",40,48,0.7],["🍰",75,38,0.9]].map(([e,x,y,d],i) => (
          <motion.span key={i} className="absolute text-4xl opacity-[0.12] select-none pointer-events-none"
            style={{left:`${x}%`,top:`${y}%`}}
            animate={{y:[-14,14,-14],rotate:[-8,8,-8]}}
            transition={{repeat:Infinity,duration:3+d,ease:"easeInOut",delay:d}}>
            {e}
          </motion.span>
        ))}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">JE</span>
          </div>
          <span className="text-white font-black text-xl">JustEat</span>
        </div>
        <div className="relative z-10">
          <h2 className="text-white font-black text-4xl leading-tight mb-4">
            Order food from
            <br />
            your favourite
            <br />
            restaurants
          </h2>
          <p className="text-rose-200 text-base">
            Fast delivery · Great deals · Easy ordering
          </p>
        </div>
        <div className="relative z-10 flex gap-3 flex-wrap">
          {[
            { label: "Restaurants",  value: "500+",   icon: "🏪" },
            { label: "Avg Delivery", value: "30 min",  icon: "⚡" },
            { label: "Avg Rating",   value: "4.8 ★",  icon: "🌟" },
          ].map((f) => (
            <div key={f.label} className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 backdrop-blur-sm">
              <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest">{f.icon} {f.label}</p>
              <p className="text-white font-black text-lg leading-tight">{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xs">JE</span>
            </div>
            <span className="text-gray-900 font-black text-xl">JustEat</span>
          </div>

          <h1 className="text-gray-900 font-black text-3xl mb-1">
            Welcome back
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            Sign in to continue ordering
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}} transition={{ duration: 0.4 }} className="space-y-4">
              <div>
                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  autoComplete="username"
                  value={form.username}
                  onChange={(e) => { setError(""); setForm((p) => ({ ...p, username: e.target.value })); }}
                  placeholder="Enter your username"
                  className={`w-full bg-white border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 text-sm focus:outline-none focus:ring-2 transition ${
                    error ? "border-red-300 focus:border-red-400 focus:ring-red-500/10" : "border-gray-200 focus:border-rose-400 focus:ring-rose-500/10"
                  }`}
                />
              </div>

              <div>
                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    name="password"
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(e) => { setError(""); setForm((p) => ({ ...p, password: e.target.value })); }}
                    placeholder="Enter your password"
                    className={`w-full bg-white border rounded-xl px-4 py-3 pr-12 text-gray-900 placeholder-gray-300 text-sm focus:outline-none focus:ring-2 transition ${
                      error ? "border-red-300 focus:border-red-400 focus:ring-red-500/10" : "border-gray-200 focus:border-rose-400 focus:ring-rose-500/10"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition text-xs font-semibold"
                  >
                    {showPwd ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Inline error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <span className="text-base leading-none mt-0.5">🚫</span>
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-rose-500 text-xs font-semibold hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3.5 rounded-xl font-bold text-sm transition shadow-lg shadow-rose-500/25 disabled:opacity-60 mt-2"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-rose-500 font-semibold hover:underline"
            >
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
