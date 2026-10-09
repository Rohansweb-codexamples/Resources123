export function LeafLogo({ size = 30 }) {
  return (
    <svg
      className="leaf-logo"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-hidden="true"
    >
      <path
        d="M6 26C6 15 15 6 27 6c0 12-9 21-21 21z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M7 25C12 19 18 14 25 9"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  )
}

export function LeafPreview({ label = 'File' }) {
  return (
    <div className="leaf-preview" aria-hidden="true">
      <svg viewBox="0 0 64 64" width="72" height="72">
        <path
          d="M12 52C12 30 30 12 52 12c0 22-18 40-40 40z"
          fill="currentColor"
          opacity="0.75"
        />
        <path
          d="M14 50C24 38 36 26 50 18"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
      <span className="leaf-preview-label">{label}</span>
    </div>
  )
}
