export default function Logo({ className = "h-12 w-12" }) {
  return (
    <img
      src="/Logo.png"
      alt="Niger Today TV"
      className={`block object-contain ${className}`}
    />
  );
}