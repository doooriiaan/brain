import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type SectionDropdownProps = {
  actions?: ReactNode;
  bodyClassName?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  summary: ReactNode;
  toggleLabel?: string;
};

export function SectionDropdown({
  actions,
  bodyClassName = "",
  children,
  defaultOpen = false,
  summary,
  toggleLabel = "details",
}: SectionDropdownProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`section-dropdown ${isOpen ? "is-open" : ""}`}>
      <div className="section-dropdown-head">
        <div className="section-dropdown-summary">{summary}</div>
        <div className="section-dropdown-actions">
          {actions}
          <button
            aria-expanded={isOpen}
            className={`section-dropdown-trigger ${isOpen ? "is-open" : ""}`}
            onClick={() => setIsOpen((current) => !current)}
            type="button"
          >
            <span>{isOpen ? "Hide" : "Show"} {toggleLabel}</span>
            <ChevronDown className="section-dropdown-trigger-icon h-4 w-4" />
          </button>
        </div>
      </div>

      <div className={`${isOpen ? "" : "hidden"} ${bodyClassName}`.trim()}>{children}</div>
    </div>
  );
}
