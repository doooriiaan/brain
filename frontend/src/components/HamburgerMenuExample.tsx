import { Briefcase, Zap, Heart, Cog } from "lucide-react";
import { HamburgerMenu } from "./HamburgerMenu";

/**
 * Example integration of the HamburgerMenu component with the 4 sectors:
 * - Business
 * - Commercial
 * - Healthcare
 * - Industry
 */

// Define the sector items with icons
const SECTOR_ITEMS = [
  {
    key: "business",
    label: "Business AI",
    icon: <Briefcase size={18} />,
  },
  {
    key: "commercial",
    label: "Commercial AI",
    icon: <Zap size={18} />,
  },
  {
    key: "healthcare",
    label: "Healthcare AI",
    icon: <Heart size={18} />,
  },
  {
    key: "industry",
    label: "Industry 4.0",
    icon: <Cog size={18} />,
  },
];

// Example usage in a component:
export function HamburgerMenuExample() {
  const handleNavigate = (sectorKey: string) => {
    console.log("Navigating to sector:", sectorKey);
    // Handle navigation to the selected sector
    // e.g., window.location.href = `/sectors/${sectorKey}`;
  };

  return (
    <HamburgerMenu
      sectors={SECTOR_ITEMS}
      onNavigate={handleNavigate}
      activeSector="business"
    />
  );
}

/**
 * Integration with LandingTopBar - you can add the hamburger menu
 * to the right side of your topbar:
 *
 * <div className="topbar-main-actions brain-topbar-actions">
 *   {publicMode ? (
 *     <>
 *       <button>About</button>
 *       <button>Help</button>
 *       <button>Buyer login</button>
 *       <HamburgerMenu
 *         sectors={SECTOR_ITEMS}
 *         onNavigate={handleSectorNavigation}
 *         activeSector={activeNavigationKey}
 *       />
 *     </>
 *   ) : null}
 * </div>
 */
