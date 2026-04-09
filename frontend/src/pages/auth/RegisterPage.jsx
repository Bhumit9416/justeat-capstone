import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "CUSTOMER" });
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const setFieldError = (field, msg) => setFieldErrors(p => ({ ...p, [field]: msg }));
  const clearFieldError = (field) => setFieldErrors(p => { const n = { ...p }; delete n[field]; return n; });

  const validate = () => {
    const errs = {};
    if (!form.username.trim() || form.username.trim().length < 3)
      errs.username = "Username must be at least 3 characters.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Please enter a valid email address.";
    if (!form.password || form.password.length < 8)
      errs.password = "Password must be at least 8 characters.";
    else if (!/[A-Z]/.test(form.password))
      errs.password = "Password must contain at least one uppercase letter.";
    else if (!/[0-9]/.test(form.password))
      errs.password = "Password must contain at least one number.";
    else if (!/[^A-Za-z0-9]/.test(form.password))
      errs.password = "Password must contain at least one special character (!@#$…).";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const ok = await register(form);
      if (ok) navigate(form.role === "OWNER" ? "/owner/dashboard" : "/onboarding");
    } catch (err) {
      const msg = err?.response?.data?.message || "";
      if (msg.toLowerCase().includes("username"))
        setFieldError("username", msg);
      else if (msg.toLowerCase().includes("email"))
        setFieldError("email", msg);
      else
        setFieldError("general", msg || "Registration failed. Please try again.");
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
            Join thousands<br />of food lovers<br />today
          </h2>
          <p className="text-rose-200 text-base">Free to join · No subscription fees</p>
        </div>
        <div className="relative z-10 space-y-3">
          {[
            { role: "Customer", desc: "Order from your favourite restaurants" },
            { role: "Restaurant Owner", desc: "List your restaurant & manage orders" },
          ].map(r => (
            <div key={r.role} className="bg-white/10 border border-white/20 rounded-xl px-4 py-3">
              <p className="text-white text-sm font-bold">{r.role}</p>
              <p className="text-rose-200 text-xs mt-0.5">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-md py-8">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xs">JE</span>
            </div>
            <span className="text-gray-900 font-black text-xl">JustEat</span>
          </div>

          <h1 className="text-gray-900 font-black text-3xl mb-1">Create account</h1>
          <p className="text-gray-400 text-sm mb-8">Start your food journey today</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[{ value: "CUSTOMER", label: "Customer", desc: "I want to order food" },
              { value: "OWNER",    label: "Restaurant Owner", desc: "I want to list my restaurant" }
            ].map(r => (
              <button key={r.value} type="button" onClick={() => setForm(p => ({ ...p, role: r.value }))}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  form.role === r.value
                    ? "border-rose-500 bg-rose-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}>
                <p className={`font-bold text-sm ${form.role === r.value ? "text-rose-600" : "text-gray-700"}`}>{r.label}</p>
                <p className="text-gray-400 text-[11px] mt-0.5">{r.desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: "username", label: "Username",      type: "text",  placeholder: "Pick a username",   autoComplete: "username" },
              { name: "email",    label: "Email address", type: "email", placeholder: "you@example.com",    autoComplete: "email" },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1.5">{f.label}</label>
                <input type={f.type} name={f.name} required autoComplete={f.autoComplete}
                  value={form[f.name]}
                  onChange={e => { clearFieldError(f.name); setForm(p => ({ ...p, [e.target.name]: e.target.value })); }}
                  placeholder={f.placeholder}
                  className={`w-full bg-white border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 text-sm focus:outline-none focus:ring-2 transition ${
                    fieldErrors[f.name] ? "border-red-300 focus:border-red-400 focus:ring-red-500/10" : "border-gray-200 focus:border-rose-400 focus:ring-rose-500/10"
                  }`} />
                <AnimatePresence>
                  {fieldErrors[f.name] && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-red-500 text-[11px] mt-1.5 flex items-center gap-1">
                      <span>⚠️</span> {fieldErrors[f.name]}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            ))}

            <div>
              <label className="block text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1.5">Password</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} name="password" required autoComplete="new-password"
                  value={form.password}
                  onChange={e => { clearFieldError("password"); setForm(p => ({ ...p, password: e.target.value })); }}
                  placeholder="Min 8 chars, uppercase, number, symbol"
                  className={`w-full bg-white border rounded-xl px-4 py-3 pr-12 text-gray-900 placeholder-gray-300 text-sm focus:outline-none focus:ring-2 transition ${
                    fieldErrors.password ? "border-red-300 focus:border-red-400 focus:ring-red-500/10" : "border-gray-200 focus:border-rose-400 focus:ring-rose-500/10"
                  }`} />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition text-xs font-semibold">
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
              <AnimatePresence>
                {fieldErrors.password ? (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-red-500 text-[11px] mt-1.5 flex items-center gap-1">
                    <span>⚠️</span> {fieldErrors.password}
                  </motion.p>
                ) : (
                  <p className="text-gray-400 text-[11px] mt-1.5">Must contain uppercase, number &amp; special character</p>
                )}
              </AnimatePresence>
            </div>

            {/* General server error */}
            <AnimatePresence>
              {fieldErrors.general && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <span className="text-base leading-none mt-0.5">🚫</span>
                  <span>{fieldErrors.general}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={submitting}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3.5 rounded-xl font-bold text-sm transition shadow-lg shadow-rose-500/25 disabled:opacity-60 mt-2">
              {submitting ? "Creating account..." : "Create Account"}
            </motion.button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-rose-500 font-semibold hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
