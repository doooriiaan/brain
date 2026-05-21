import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Sparkles, Ticket } from "lucide-react";

type BrainScratchCardMode = "reveal" | "validate";

type BrainScratchCardProps = {
  busy: boolean;
  code: string;
  compact?: boolean;
  mode?: BrainScratchCardMode;
  planLabel: string;
  revealed: boolean;
  sectorLabel: string;
  tone?: "light" | "dark";
  onAction?: () => void;
  pillLabelOverride?: string;
  titleOverride?: string;
  descriptionOverride?: string;
  backLabelOverride?: string;
  lockedLabelOverride?: string;
  backCopyOverride?: string;
  actionLabelOverride?: string;
};

export function BrainScratchCard({
  busy,
  code,
  compact = false,
  mode = "reveal",
  planLabel,
  revealed,
  sectorLabel,
  tone,
  onAction,
  pillLabelOverride,
  titleOverride,
  descriptionOverride,
  backLabelOverride,
  lockedLabelOverride,
  backCopyOverride,
  actionLabelOverride,
}: BrainScratchCardProps) {
  const isValidateMode = mode === "validate";
  const pillLabel =
    pillLabelOverride ??
    (isValidateMode ? "brAIn secure validate" : "brAIn secure reveal");
  const title =
    titleOverride ??
    (isValidateMode
    ? "Private AI Validation Card"
    : "Private AI Activation Card");
  const description =
    descriptionOverride ??
    (isValidateMode
    ? "One code. One validation. One secure cloud entry."
    : "One reveal. One activation. One secure cloud entry.");
  const backLabel =
    backLabelOverride ?? (isValidateMode ? "Validation code" : "Reveal code");
  const lockedLabel =
    lockedLabelOverride ?? (isValidateMode ? "CODE REQUIRED" : "REVEAL LOCKED");
  const backCopy =
    backCopyOverride ??
    (isValidateMode
    ? revealed
      ? "Validate this code in the workspace."
      : "Enter the code you received, then validate it."
    : revealed
      ? "Validate this code in the workspace."
      : "Use the button below to reveal your brAIn code.");
  const actionLabel =
    actionLabelOverride ??
    (isValidateMode
    ? busy
      ? "Validating..."
      : "Validate Card"
    : busy
      ? "Revealing..."
      : revealed
        ? "Reveal New Card"
        : "Reveal Card");
  const ActionIcon = isValidateMode ? CheckCircle2 : Ticket;
  const resolvedTone = tone ?? (isValidateMode ? "dark" : "light");
  const shellToneClass = [
    "scratch-card-shell",
    resolvedTone === "dark" ? "scratch-card-shell-dark" : "scratch-card-shell-light",
    compact ? "scratch-card-shell-compact" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="scratch-scene">
      <motion.div
        animate={{
          rotateY: revealed ? 180 : 0,
          rotateZ: revealed ? -2 : 2,
          y: [0, -8, 0],
        }}
        className={shellToneClass}
        transition={{
          rotateY: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
          rotateZ: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
          y: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <div className="scratch-card-face scratch-card-front">
          <div className="scratch-card-aura scratch-card-aura-primary" />
          <div className="scratch-card-aura scratch-card-aura-secondary" />
          <div className="scratch-card-grid" />
          <div className="scratch-card-logo-watermark">
            <img alt="" loading="eager" src="/brand/brain-logo.svg" />
          </div>
          <div className="scratch-card-stream scratch-card-stream-one" />
          <div className="scratch-card-stream scratch-card-stream-two" />
          <div className="scratch-card-brand">
            <span className="scratch-card-pill">
              <Sparkles size={13} />
              {pillLabel}
            </span>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>

          <div className="scratch-card-front-meta">
            <div>
              <span>Sector</span>
              <strong>{sectorLabel}</strong>
            </div>
            <div>
              <span>Plan</span>
              <strong>{planLabel}</strong>
            </div>
          </div>

          <div className="scratch-card-chip">
            <ShieldCheck size={18} />
          </div>
        </div>

        <div className="scratch-card-face scratch-card-back">
          <div className="scratch-card-aura scratch-card-aura-primary" />
          <div className="scratch-card-grid scratch-card-grid-soft" />
          <div className="scratch-card-band" />
          <div className="scratch-card-reveal">
            <span className="scratch-card-reveal-label">{backLabel}</span>
            <strong>{revealed ? code : lockedLabel}</strong>
            <p>{backCopy}</p>
          </div>
          <div className="scratch-card-qr">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </motion.div>

      {onAction ? (
        <button
          className="scratch-reveal-button"
          disabled={busy}
          onClick={onAction}
          type="button"
        >
          <ActionIcon size={16} />
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
