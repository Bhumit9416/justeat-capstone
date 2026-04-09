import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { forgotPassword, resetPassword } from "../../api/auth";

const FLOATS = [["🍕",8,12,0],["🍔",82,60,0.5],["🌮",22,72,0.3],["🍣",88,25,0.8],["🥘",52,85,0.2],["🍜",65,6,1.0],["🍦",40,48,0.7],["🧁",75,38,0.9]];

function StrengthBar({ password }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length;
  const colors = ["bg-gray-200","bg-red-400","bg-orange-400","bg-yellow-400","bg-emerald-500"];
  const labels = ["","Weak","Fair","Good","Strong"];
  const textColors = ["text-gray-300","text-red-400","text-orange-400","text-yellow-500","text-emerald-500"];
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-gray-100"}`} />
        ))}
      </div>
      <p className={`text-[11px] font-semibold mt-1 ${textColors[score]}`}>{labels[score]}</p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Step 1 state
  const [email, setEmail]           = useState("");
  const [sending, setSending]       = useState(false);
  const [step, setStep]             = useState(1); // 1 = email, 2 = code+password, 3 = success

  // Step 2 state
  const [code, setCode]             = useState("");
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [showPwd, setShowPwd]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError]           = useState("");

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      await forgotPassword(email);
      setStep(2);
    } catch (err) {
      setError(err?.response?.data?.message || "No account found with that email.");
    } finally {
      setSending(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    if (!code.trim())         { setError("Please enter the 4-digit code from your email."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }
    setSubmitting(true);
    try {
      await resetPassword(code.trim(), password);
      setStep(3);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid or expired code. Please try again.");
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
            {step === 1 ? <>Forgot your<br />password?<br />No worries.</> : step === 2 ? <>Check your<br />inbox for<br />the code.</> : <>Password<br />updated<br />successfully!</>}
          </h2>
          <p className="text-rose-200 text-base">
            {step === 1 ? "We'll send a 4-digit code to your inbox." : step === 2 ? "Enter the code and choose a new password." : "You can now sign in with your new password."}
          </p>
        </div>
        <div className="relative z-10 flex gap-3 flex-wrap">
          {[{label:"Secure reset",icon:"🔒"},{label:"15-min code",icon:"⏱️"},{label:"Instant email",icon:"📧"}].map(f => (
            <div key={f.label} className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 backdrop-blur-sm">
              <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest">{f.icon} {f.label}</p>
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

          {/* Step indicator */}
          {step < 3 && (
            <div className="flex items-center gap-2 mb-8">
              {[1, 2].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= s ? "bg-rose-500 text-white" : "bg-gray-200 text-gray-400"
                  }`}>{s}</div>
                  {s < 2 && <div className={`w-10 h-0.5 rounded transition-all ${step > s ? "bg-rose-500" : "bg-gray-200"}`} />}
                </div>
              ))}
              <span className="ml-2 text-xs text-gray-400 font-medium">
                {step === 1 ? "Enter email" : "Enter code & new password"}
              </span>
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* ── Step 1: Email ── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h1 className="text-gray-900 font-black text-3xl mb-1">Forgot password?</h1>
                <p className="text-gray-400 text-sm mb-8">
                  Enter your account email and we'll send a 4-digit reset code.
                </p>
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div>
                    <label className="block text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1.5">
                      Email address
                    </label>
                    <input type="email" required autoComplete="email"
                      value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10 transition" />
                  </div>
                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                        <span>⚠️</span> {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.button type="submit" disabled={sending}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3.5 rounded-xl font-bold text-sm transition shadow-lg shadow-rose-500/25 disabled:opacity-60 mt-2">
                    {sending ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Sending code…
                      </span>
                    ) : "Send Code →"}
                  </motion.button>
                </form>
                <p className="text-center text-gray-400 text-sm mt-6">
                  Remember it?{" "}
                  <Link to="/login" className="text-rose-500 font-semibold hover:underline">Sign in</Link>
                </p>
              </motion.div>
            )}

            {/* ── Step 2: Code + new password ── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h1 className="text-gray-900 font-black text-3xl mb-1">Enter reset code</h1>
                <p className="text-gray-400 text-sm mb-2">
                  We sent a 4-digit code to
                </p>
                <p className="text-rose-500 font-bold text-sm mb-6">{email}</p>

                <form onSubmit={handleReset} className="space-y-4">
                  {/* 4-digit code */}
                  <div>
                    <label className="block text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1.5">
                      4-Digit Code
                    </label>
                    <input type="text" inputMode="numeric" maxLength={4} required
                      value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="e.g. 4821"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-center tracking-[0.5em] font-bold text-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10 transition" />
                    <p className="text-gray-400 text-[11px] mt-1">Code expires in 15 minutes. Check your spam folder too.</p>
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
                          confirm && confirm !== password ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
                          : confirm && confirm === password ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/10"
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

                  <motion.button type="submit" disabled={submitting || !password || password !== confirm || code.length < 4}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3.5 rounded-xl font-bold text-sm transition shadow-lg shadow-rose-500/25 disabled:opacity-50 mt-2">
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Updating password…
                      </span>
                    ) : "Update Password →"}
                  </motion.button>
                </form>

                <button onClick={() => { setStep(1); setError(""); setCode(""); }}
                  className="block w-full text-center text-gray-400 text-sm mt-4 hover:text-rose-500 transition">
                  ← Use a different email
                </button>
              </motion.div>
            )}

            {/* ── Step 3: Success ── */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-emerald-100">
                  <span className="text-4xl">✅</span>
                </div>
                <h1 className="text-gray-900 font-black text-3xl mb-2">Password updated!</h1>
                <p className="text-gray-400 text-sm mb-6">
                  Your password has been changed successfully.<br />
                  Redirecting you to sign in…
                </p>
                <div className="flex items-center justify-center gap-2 text-gray-400 text-xs mb-4">
                  <span className="w-3 h-3 border-2 border-gray-300 border-t-rose-500 rounded-full animate-spin" />
                  Redirecting in 3 seconds…
                </div>
                <Link to="/login" className="text-rose-500 font-semibold text-sm hover:underline">
                  Sign in now →
                </Link>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}


