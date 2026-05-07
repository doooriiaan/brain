import { motion } from "framer-motion";
import { animationVariants, transitions } from "../utils/animationVariants";

/**
 * Animated badge component
 */
export function AnimatedBadge({ 
  label, 
  variant = "default" 
}: { 
  label: string; 
  variant?: "default" | "success" | "warning" | "error" | "info";
}) {
  const colors = {
    default: "bg-white/10 text-white",
    success: "bg-green-500/20 text-green-200",
    warning: "bg-yellow-500/20 text-yellow-200",
    error: "bg-red-500/20 text-red-200",
    info: "bg-blue-500/20 text-blue-200",
  };

  return (
    <motion.span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[variant]}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={transitions.snappy}
    >
      {label}
    </motion.span>
  );
}

/**
 * Animated metric card
 */
export function AnimatedMetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon?: React.ElementType;
}) {
  return (
    <motion.div
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm"
      variants={animationVariants.fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{
        y: -5,
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-white/50">{label}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          {detail && (
            <p className="mt-1 text-xs text-white/40">{detail}</p>
          )}
        </div>
        {Icon && (
          <Icon className="h-8 w-8 text-[var(--accent)] opacity-50" />
        )}
      </div>
    </motion.div>
  );
}

/**
 * Animated loading skeleton
 */
export function AnimatedSkeleton() {
  return (
    <motion.div
      className="h-12 rounded-lg bg-gradient-to-r from-white/5 to-white/10"
      animate={{
        backgroundPosition: ["0% 0%", "100% 0%"],
      }}
      transition={{
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
      }}
    />
  );
}

/**
 * Animated progress bar
 */
export function AnimatedProgressBar({ 
  value = 75,
  label = "Progress"
}: { 
  value?: number; 
  label?: string;
}) {
  return (
    <motion.div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-white/70">{label}</span>
        <motion.span 
          className="text-xs font-bold text-[var(--accent)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {value}%
        </motion.span>
      </div>
      <motion.div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/50"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay: 0.1 }}
        />
      </motion.div>
    </motion.div>
  );
}

/**
 * Animated button with ripple effect
 */
export function AnimatedButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const styles = {
    primary: "bg-[var(--accent)] text-black hover:bg-[var(--accent)]/90",
    secondary: "bg-white/10 text-white hover:bg-white/20",
    ghost: "bg-transparent text-white border border-white/20 hover:bg-white/5",
  };

  return (
    <motion.button
      className={`relative px-6 py-2 rounded-lg font-semibold ${styles[variant]} transition-colors overflow-hidden`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {children}
      <motion.div
        className="absolute inset-0 bg-white/20"
        initial={{ opacity: 0, scale: 0 }}
        whileHover={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}

/**
 * Animated counter
 */
export function AnimatedCounter({
  from = 0,
  to = 100,
  duration = 1,
  suffix = "",
}: {
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
}) {
  void to;
  void duration;

  return (
    <motion.span>
      {from}
      {suffix}
    </motion.span>
  );
}

/**
 * Animated list with stagger effect
 */
export function AnimatedList({
  items,
  children,
}: {
  items: Array<unknown>;
  children: (item: unknown, index: number) => React.ReactNode;
}) {
  return (
    <motion.div
      variants={animationVariants.containerStagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="space-y-3"
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={animationVariants.itemStagger}
        >
          {children(item, index)}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Animated status indicator
 */
export function AnimatedStatusIndicator({
  status = "online",
  label = "Status",
}: {
  status?: "online" | "offline" | "busy" | "idle";
  label?: string;
}) {
  const colors = {
    online: "bg-green-500",
    offline: "bg-gray-500",
    busy: "bg-red-500",
    idle: "bg-yellow-500",
  };

  return (
    <motion.div className="flex items-center gap-2">
      <motion.div
        className={`h-3 w-3 rounded-full ${colors[status]}`}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      />
      <span className="text-sm font-semibold text-white/70">{label}</span>
    </motion.div>
  );
}
