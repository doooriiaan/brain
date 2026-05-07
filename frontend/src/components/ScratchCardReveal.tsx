/**
 * Scratch Card Reveal Component
 * Interactive card reveal form with animations
 */

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Copy, Check, AlertCircle } from "lucide-react";
import axios from "axios";

export function ScratchCardReveal({
  userId,
  company,
  onCardRevealed,
}: {
  userId: string;
  company: string;
  onCardRevealed?: (card: any) => void;
}) {
  const [step, setStep] = useState<"initial" | "revealing" | "revealed" | "validating" | "success">(
    "initial",
  );
  const [revealedCard, setRevealedCard] = useState<any>(null);
  const [validationCode, setValidationCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(15);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Timer for 15 minute expiry
  useEffect(() => {
    if (step !== "revealed") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setStep("initial");
          setRevealedCard(null);
          setMessage("Card reservation expired. Reveal a new card.");
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  // Draw scratch card animation
  useEffect(() => {
    if (step !== "revealing" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 200;

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 300, 200);
    gradient.addColorStop(0, "#f2b84b");
    gradient.addColorStop(1, "#f29f42");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 200);

    // Draw scratches animation
    let scratchProgress = 0;
    const scratch = () => {
      scratchProgress += 5;
      
      for (let i = 0; i < scratchProgress; i++) {
        const x = Math.random() * 300;
        const y = Math.random() * 200;
        ctx.clearRect(x - 10, y - 10, 20, 20);
      }

      if (scratchProgress < 100) {
        requestAnimationFrame(scratch);
      } else {
        setStep("revealed");
      }
    };

    scratch();
  }, [step]);

  async function handleRevealCard() {
    setError("");
    setMessage("");
    setStep("revealing");

    try {
      const response = await axios.post("/api/scratch/reveal", {
        userId,
        company,
      });

      setRevealedCard(response.data);
      setMessage(response.data.message);
      setTimeLeft(Math.ceil(response.data.expiresIn / 1000 / 60));

      onCardRevealed?.(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to reveal scratch card. Please try again.",
      );
      setStep("initial");
    }
  }

  async function handleValidateCard() {
    if (!validationCode.trim()) {
      setError("Please enter the card code.");
      return;
    }

    setError("");
    setMessage("");
    setStep("validating");

    try {
      const response = await axios.post("/api/scratch/validate", {
        userId,
        company,
        code: validationCode,
      });

      setMessage(response.data.message);
      setStep("success");

      // Reset after 3 seconds
      setTimeout(() => {
        setStep("initial");
        setRevealedCard(null);
        setValidationCode("");
        setTimeLeft(15);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid card code.");
      setStep("revealed");
    }
  }

  function copyToClipboard() {
    if (revealedCard?.code) {
      navigator.clipboard.writeText(revealedCard.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Initial State - Reveal Button */}
      {step === "initial" && (
        <motion.div
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-6"
          >
            <div className="mx-auto h-20 w-32 rounded-lg bg-gradient-to-br from-[#f2b84b] to-[#f29f42] flex items-center justify-center">
              <span className="text-3xl">🎟️</span>
            </div>
          </motion.div>

          <h3 className="text-xl font-semibold text-white">Reveal Your Scratch Card</h3>
          <p className="mt-2 text-sm text-white/60">
            Get instant credits and unlock exclusive features
          </p>

          <motion.button
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-black transition-all hover:bg-[var(--accent)]/90"
            onClick={handleRevealCard}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye className="h-5 w-5" />
            Reveal Card
          </motion.button>

          {message && (
            <motion.p className="mt-4 text-sm text-green-400" initial={{ opacity: 0 }}>
              ✓ {message}
            </motion.p>
          )}
        </motion.div>
      )}

      {/* Scratching Animation */}
      {step === "revealing" && (
        <motion.div
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="mb-6 text-white">Scratching your card...</p>
          <canvas
            ref={canvasRef}
            className="mx-auto rounded-lg"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </motion.div>
      )}

      {/* Revealed Card */}
      {step === "revealed" && revealedCard && (
        <motion.div
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Your Card Code</h3>
            <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1 text-xs text-white/60">
              ⏱️ {timeLeft}m left
            </div>
          </div>

          <div className="rounded-xl border-2 border-dashed border-[var(--accent)]/50 bg-gradient-to-r from-[var(--accent)]/10 to-white/5 p-6 text-center">
            <p className="text-xs text-white/50 uppercase tracking-widest">Card Code</p>
            <motion.p
              className="mt-3 font-mono text-2xl font-bold text-[var(--accent)]"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {revealedCard.code}
            </motion.p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-white/50">Sector</p>
                <p className="mt-1 font-semibold text-white capitalize">{revealedCard.sector}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Plan</p>
                <p className="mt-1 font-semibold text-white capitalize">{revealedCard.plan}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <motion.button
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2 font-semibold text-white transition-all hover:bg-white/20"
              onClick={copyToClipboard}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Code
                </>
              )}
            </motion.button>
          </div>

          <div className="mt-6 space-y-3">
            <label className="block text-sm font-semibold text-white">Validate Code</label>
            <input
              type="text"
              placeholder="Paste or type the code here"
              value={validationCode}
              onChange={(e) => setValidationCode(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-mono text-white placeholder-white/30 focus:border-[var(--accent)] focus:outline-none"
            />

            <motion.button
              className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition-all hover:bg-green-700"
              onClick={handleValidateCard}
              disabled={!validationCode.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Activate Card
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Validating State */}
      {step === "validating" && (
        <motion.div
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-[var(--accent)] border-t-transparent"
          />
          <p className="text-white">Validating your card...</p>
        </motion.div>
      )}

      {/* Success State */}
      {step === "success" && (
        <motion.div
          className="rounded-2xl border border-green-500/20 bg-green-500/10 p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="mb-4 text-4xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
          >
            ✓
          </motion.div>
          <p className="text-lg font-semibold text-green-400">{message}</p>
          <p className="mt-2 text-sm text-white/60">Your account has been updated with new credits.</p>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-sm text-red-200">{error}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default ScratchCardReveal;
