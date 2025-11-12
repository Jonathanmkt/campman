export function BrandLogo({ className }: { className?: string }) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="32" cy="32" r="32" fill="url(#gradient)" />
      <path
        d="M20 32C20 25.3726 25.3726 20 32 20C38.6274 20 44 25.3726 44 32C44 38.6274 38.6274 44 32 44"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M32 44C25.3726 44 20 38.6274 20 32"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 4"
      />
      <circle cx="32" cy="32" r="6" stroke="white" strokeWidth="2" />
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B4513" />
          <stop offset="1" stopColor="#A67B5B" />
        </linearGradient>
      </defs>
    </svg>
  )
}
