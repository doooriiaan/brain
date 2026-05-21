import type { Device } from "../types";
import DeviceModel from "./DeviceModel";

type DeviceGalleryProps = {
  devices: Device[];
  mode?: "grid" | "inline";
  limit?: number;
  className?: string;
};

export function DeviceGallery({ devices, mode = "grid", limit = 6, className = "" }: DeviceGalleryProps) {
  const list = (devices || []).slice(0, limit);

  if (mode === "inline") {
    return (
      <div className={`device-gallery-inline ${className}`}>
        {list.map((d) => (
          <div className="device-gallery-inline-item" key={d.deviceKey}>
            <DeviceModel src={d.imageUrl} alt={d.name} className="device-gallery-inline-image" />
            <span>{d.name}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`device-gallery-grid ${className}`}>
      {list.map((device) => (
        <figure key={device.deviceKey} className="device-gallery-item">
            <DeviceModel src={device.imageUrl} alt={device.name} className="device-gallery-image" />
          <figcaption>
            <span className="device-gallery-item-category">{device.category}</span>
            <strong>{device.name}</strong>
            <p>{device.tagline}</p>
            <div className="device-gallery-item-tags">
              {device.suitedFor.slice(0, 2).map((fit) => (
                <span key={fit}>{fit}</span>
              ))}
            </div>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export default DeviceGallery;
