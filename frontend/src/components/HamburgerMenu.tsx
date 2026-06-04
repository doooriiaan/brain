import { useState } from "react";
import { Menu, X } from "lucide-react";

type SectorItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
};

type HamburgerMenuProps = {
  isOpen?: boolean;
  sectors: SectorItem[];
  onNavigate: (sectorKey: string) => void;
  onToggle?: (isOpen: boolean) => void;
  activeSector?: string;
  showLabel?: boolean;
};

export function HamburgerMenu({
  isOpen = false,
  sectors,
  onNavigate,
  onToggle,
  activeSector,
  showLabel = false,
}: HamburgerMenuProps) {
  const [open, setOpen] = useState(isOpen);

  const handleToggle = () => {
    const newState = !open;
    setOpen(newState);
    onToggle?.(newState);
  };

  const handleNavigate = (sectorKey: string) => {
    onNavigate(sectorKey);
    setOpen(false);
  };

  return (
    <div className="hamburger-menu-container">
      <button
        className="hamburger-menu-toggle"
        aria-label="Toggle sectors menu"
        aria-expanded={open}
        onClick={handleToggle}
        type="button"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
        {showLabel && <span className="hamburger-menu-label-text">Sectors</span>}
      </button>

      {open && (
        <nav className="hamburger-menu-panel">
          <div className="hamburger-menu-content">
            {sectors.map((sector) => (
              <button
                key={sector.key}
                className={`hamburger-menu-item ${
                  activeSector === sector.key ? "hamburger-menu-item-active" : ""
                }`}
                onClick={() => handleNavigate(sector.key)}
                type="button"
              >
                {sector.icon && <span className="hamburger-menu-icon">{sector.icon}</span>}
                <span className="hamburger-menu-label">{sector.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
