type DeviceModelProps = {
  src?: string;
  alt?: string;
  className?: string;
};

export default function DeviceModel({ src, alt = "device", className = "" }: DeviceModelProps) {
  const is3D = typeof src === "string" && (src.endsWith(".glb") || src.endsWith(".gltf"));

  if (is3D) {
    return (
      <div className={`device-model ${className}`} aria-label={alt}>
        <div className="device-model-placeholder">
          {/* Placeholder when a .glb/.gltf model is available. Replace with react-three-fiber when desired. */}
          <div className="device-model-cube" />
          <div className="device-model-note">3D model available</div>
        </div>
      </div>
    );
  }

  // Fallback to image
  return <img loading="lazy" src={src || "/brand/brain-hero.svg"} alt={alt} className={className} />;
}
