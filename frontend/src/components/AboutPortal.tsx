import { motion } from "framer-motion";
import { X } from "lucide-react";
import { translateAppText } from "../localization";

type AboutPortalProps = {
  open: boolean;
  onClose: () => void;
  onOpenLogin?: () => void;
  selectedLanguage?: string;
};

export function AboutPortal({ open, onClose, onOpenLogin, selectedLanguage = "en" }: AboutPortalProps) {
  if (!open) return null;

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="brain-access-modal-shell"
      initial={{ opacity: 0 }}
    >
      <button
        aria-label="Close about"
        className="brain-access-modal-backdrop"
        onClick={onClose}
        type="button"
      />

      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="brain-access-modal-card executive-surface executive-surface-strong"
        initial={{ opacity: 0, scale: 0.98, y: 14 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="brain-access-modal-head">
          <div>
            <span className="landing-inline-label">About brAIn</span>
            <h2 className="landing-section-title">brAIn — Managed AI device platform</h2>
            <p className="landing-section-copy">
              brAIn connects device hardware, cloud services, activation cards, and
              workspace orchestration into a single flow for commercial, business,
              healthcare, and industrial deployments.
            </p>
          </div>

          <button
            aria-label="Close about"
            className="brain-access-modal-close"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="brain-access-layout">
          <article className="brain-access-context-card">
            <h3>Mission</h3>
            <p>
              Deliver sector-ready AI devices that are easy to deploy and manage,
              with integrated activation, payment, and runtime services.
            </p>
          </article>

          <article className="brain-access-context-card">
            <h3 className="text-white">Contact</h3>
            <p className="landing-section-copy text-slate-200">
              For inquiries, reach out via the contact form on the Help page or
              email hello@brain.example.
            </p>
          </article>

          <div className="brain-access-side">
            <div className="brain-access-context-card">
              <h3 className="text-white">Explore</h3>
              <p className="landing-section-copy text-slate-200">
                Open the Help center for deeper documentation, product plans, and
                device details.
              </p>
              <div className="brain-access-strip-actions">
                <button
                  className="executive-button-secondary"
                  onClick={() => {
                    onOpenLogin?.();
                    onClose();
                  }}
                  type="button"
                >
                  {selectedLanguage ? translateAppText("Login", selectedLanguage) : "Login"}
                </button>
                <a className="executive-button-primary" href="/docs">
                  Read docs
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default AboutPortal;
