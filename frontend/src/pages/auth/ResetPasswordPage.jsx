import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { resetPassword } from "../../api/auth";

const FLOATS = [["🍕",8,12,0],["🍔",82,60,0.5],["🌮",22,72,0.3],["🍣",88,25,0.8],["🥘",52,85,0.2],["🍜",65,6,1.0],["🍦",40,48,0.7],["🧁",75,38,0.9]];

function StrengthBar({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-500", "bg-amber-400", "bg-blue-500", "bg-emerald-500"];
  const textColors = ["", "text-red-500", "text-amber-500", "text-blue-500", "text-emerald-600"];

  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-gray-200"}`} />
        ))}
      </div>
      <p className={`text-[11px] font-semibold ${textColors[score]}`}>{labels[score]}</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  const [searchParams]          = useSearchParams();
  const navigate                = useNavigate();

  const [code, setCode]         = useState(searchParams.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!code.trim())         { setError("Please enter the 4-digit code from your email."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }
    setSubmitting(true);
    try {
      await resetPassword(code.trim(), password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Reset failed. The link may have expired.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-rose-600 via-rose-500 to-orange-400 flex-col justify-between p-12 relative overflow-hidden">
        {FLOATS.map(([e,x,y,d],i) => (
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
            Create a new<br />strong password<br />you'll remember.
          </h2>
          <p className="text-rose-200 text-base">Your security is our priority.</p>
        </div>
        <div className="relative z-10 flex gap-3 flex-wrap">
          {[{label:"8+ chars",icon:"📏"},{label:"Uppercase",icon:"🔠"},{label:"Number",icon:"🔢"},{label:"Symbol",icon:"🔣"}].map(f => (
            <div key={f.label} className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 backdrop-blur-sm">
              <p className="text-white/70 text-[10px] font-semibold">{f.icon} {f.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xs">JE</span>
            </div>
            <span className="text-gray-900 font-black text-xl">JustEat</span>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              /* ── Success state ── */
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-emerald-100">
                  <span className="text-4xl">✅</span>
                </div>
                <h1 className="text-gray-900 font-black text-3xl mb-2">Password updated!</h1>
                <p className="text-gray-400 text-sm mb-6">
                  Your password has been changed successfully.<br />
                  Redirecting you to sign in…
                </p>
                <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
                  <span className="w-3 h-3 border-2 border-gray-300 border-t-rose-500 rounded-full animate-spin" />
                  Redirecting in 3 seconds…
                </div>
                <Link to="/login" className="mt-4 inline-block text-rose-500 font-semibold text-sm hover:underline">
                  Sign in now →
                </Link>
              </motion.div>
            ) : (
              /* ── Form state ── */
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-gray-900 font-black text-3xl mb-1">Set new password</h1>
                <p className="text-gray-400 text-sm mb-8">
                  Enter the 4-digit code sent to your email, then choose a new password.
                </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 4-digit code */}
                    <div>
                      <label className="block text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1.5">
                        4-Digit Reset Code
                      </label>
                      <input
                        type="text" inputMode="numeric" maxLength={4} required
                        value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="e.g. 4821"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 text-sm text-center tracking-[0.4em] font-bold text-lg focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10 transition" />
                      <p className="text-gray-400 text-[11px] mt-1">Check your inbox — the code expires in 15 minutes.</p>
                    </div>
                    {/* New password */}
                    <div>
                      <label className="block text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <input type={showPwd ? "text" : "password"} required autoComplete="new-password"
                          value={password} onChange={e => setPassword(e.target.value)}
                          placeholder="Min 8 chars, uppercase, number, symbol"
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pr-12 text-gray-900 placeholder-gray-300 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10 transition" />
                        <button type="button" onClick={() => setShowPwd(p => !p)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition text-xs font-semibold">
                          {showPwd ? "Hide" : "Show"}
                        </button>
                      </div>
                      <StrengthBar password={password} />
                    </div>

                    {/* Confirm password */}
                    <div>
                      <label className="block text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1.5">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input type={showConfirm ? "text" : "password"} required autoComplete="new-password"
                          value={confirm} onChange={e => setConfirm(e.target.value)}
                          placeholder="Re-enter your new password"
                          className={`w-full bg-white border rounded-xl px-4 py-3 pr-12 text-gray-900 placeholder-gray-300 text-sm focus:outline-none focus:ring-2 transition ${
                            confirm && confirm !== password
                              ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
                              : confirm && confirm === password
                              ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/10"
                              : "border-gray-200 focus:border-rose-400 focus:ring-rose-500/10"
                          }`} />
                        <button type="button" onClick={() => setShowConfirm(p => !p)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition text-xs font-semibold">
                          {showConfirm ? "Hide" : "Show"}
                        </button>
                      </div>
                      <AnimatePresence>
                        {confirm && confirm !== password && (
                          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="text-red-500 text-[11px] mt-1.5">Passwords don't match</motion.p>
                        )}
                        {confirm && confirm === password && (
                          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="text-emerald-600 text-[11px] mt-1.5">✓ Passwords match</motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                          <span>⚠️</span> {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button type="submit" disabled={submitting || !password || password !== confirm}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3.5 rounded-xl font-bold text-sm transition shadow-lg shadow-rose-500/25 disabled:opacity-50 mt-2">
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Updating password…
                        </span>
                      ) : "Update Password"}
                    </motion.button>
                  </form>

                <p className="text-center text-gray-400 text-sm mt-6">
                  <Link to="/login" className="text-rose-500 font-semibold hover:underline">← Back to Sign In</Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
