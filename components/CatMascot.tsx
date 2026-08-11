type Props = {
  className?: string;
  expression?: "open" | "closed";
};

export function CatMascot({ className, expression = "open" }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* tail */}
      <path
        d="M47 50c8 1 11-7 6-13"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* front paws */}
      <ellipse cx="24" cy="55" rx="6.5" ry="5" fill="currentColor" />
      <ellipse cx="40" cy="55" rx="6.5" ry="5" fill="currentColor" />
      {/* body */}
      <ellipse cx="32" cy="45" rx="17" ry="15" fill="currentColor" />
      {/* ears */}
      <polygon points="18,24 14,6 29,15" fill="currentColor" />
      <polygon points="46,24 50,6 35,15" fill="currentColor" />
      <polygon points="21,21 18,11 27,17" fill="currentColor" opacity="0.35" />
      <polygon points="43,21 46,11 37,17" fill="currentColor" opacity="0.35" />
      {/* head */}
      <circle cx="32" cy="25" r="15" fill="currentColor" />
      {/* face */}
      {expression === "open" ? (
        <>
          <circle cx="26" cy="24" r="2.6" fill="var(--card)" />
          <circle cx="38" cy="24" r="2.6" fill="var(--card)" />
        </>
      ) : (
        <>
          <path
            d="M23 24c1.5 2 4.5 2 6 0"
            stroke="var(--card)"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M35 24c1.5 2 4.5 2 6 0"
            stroke="var(--card)"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
      <path d="M30 29h4l-2 2.4Z" fill="var(--card)" />
      <path
        d="M32 31.4c-1.5 2-4 2.6-6 1.4M32 31.4c1.5 2 4 2.6 6 1.4"
        stroke="var(--card)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <g stroke="var(--card)" strokeWidth="1.2" strokeLinecap="round" opacity="0.85">
        <path d="M13 26h7M13 30h7" />
        <path d="M51 26h-7M51 30h-7" />
      </g>
    </svg>
  );
}
