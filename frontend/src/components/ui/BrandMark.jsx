export default function BrandMark({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="var(--color-text)" />
      <path
        d="M10 16a6 6 0 1 0 6-6"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="16" cy="10" r="2.2" fill="#6b8de3" />
    </svg>
  );
}
