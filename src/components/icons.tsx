import type { SVGProps } from "react";

export type IconName =
  | "dashboard"
  | "book"
  | "feather"
  | "bookmark"
  | "route"
  | "hands"
  | "sparkles"
  | "users"
  | "brain"
  | "compass"
  | "menu"
  | "close"
  | "plus"
  | "check"
  | "trash"
  | "pencil"
  | "chevronRight"
  | "chevronDown"
  | "logout"
  | "search"
  | "heart"
  | "flame"
  | "arrowRight"
  | "sun"
  | "send"
  | "shield"
  | "clock"
  | "quote"
  | "wand";

const paths: Record<IconName, string[]> = {
  dashboard: ["M3 10.5 12 3l9 7.5", "M5 9.5V21h14V9.5", "M9.5 21v-6h5v6"],
  book: ["M4 4.5h6a2.5 2.5 0 0 1 2 2.4v13a2 2 0 0 0-2-1.4H4z", "M20 4.5h-6a2.5 2.5 0 0 0-2 2.4v13a2 2 0 0 1 2-1.4h6z"],
  feather: ["M20 4c-4.5-1-9 1.5-11 5.5S7 18 7 18l-3 3", "M7 18c3-1 5-3 6.5-6", "M12 8h5"],
  bookmark: ["M6 4h12v17l-6-4-6 4z"],
  route: ["M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z", "M18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z", "M8 17h6a4 4 0 0 0 0-8H8"],
  hands: ["M12 21c-4-2.5-7-5.5-7-9a3.5 3.5 0 0 1 7-1 3.5 3.5 0 0 1 7 1c0 3.5-3 6.5-7 9Z"],
  sparkles: ["M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z", "M18.5 15l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z", "M5 15.5l.7 1.8 1.8.7-1.8.7L5 20.5l-.7-1.8-1.8-.7 1.8-.7z"],
  users: ["M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z", "M2.5 20a6.5 6.5 0 0 1 13 0", "M17 4.5a3.5 3.5 0 0 1 0 7", "M18.5 14.5A6.5 6.5 0 0 1 22 20"],
  brain: ["M9.5 4.5A3 3 0 0 0 6.7 8a3 3 0 0 0-1.2 5.6A3 3 0 0 0 8 19a3 3 0 0 0 4-1.4V5.9a2 2 0 0 0-2.5-1.4Z", "M14.5 4.5A3 3 0 0 1 17.3 8a3 3 0 0 1 1.2 5.6A3 3 0 0 1 16 19a3 3 0 0 1-4-1.4"],
  compass: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M15.5 8.5l-2 5-5 2 2-5z"],
  menu: ["M4 7h16", "M4 12h16", "M4 17h16"],
  close: ["M6 6l12 12", "M18 6 6 18"],
  plus: ["M12 5v14", "M5 12h14"],
  check: ["M4.5 12.5 10 18 20 6"],
  trash: ["M4 7h16", "M9 7V4h6v3", "M6 7l1 14h10l1-14", "M10 11v6M14 11v6"],
  pencil: ["M4 20l4-1 11-11-3-3L5 16z", "M15 5l3 3"],
  chevronRight: ["M9 6l6 6-6 6"],
  chevronDown: ["M6 9l6 6 6-6"],
  logout: ["M15 4h4v16h-4", "M11 8l-4 4 4 4", "M7 12h9"],
  search: ["M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z", "M16.5 16.5 21 21"],
  heart: ["M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9Z"],
  flame: ["M12 3c3 4 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2.5-4.5C10.5 6 11 4.5 12 3Z"],
  arrowRight: ["M4 12h15", "M13 6l6 6-6 6"],
  sun: ["M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z", "M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"],
  send: ["M21 3 10.5 13.5", "M21 3l-7 18-3.5-7.5L3 10z"],
  shield: ["M12 3l8 3v6c0 5-3.5 7.7-8 9-4.5-1.3-8-4-8-9V6z"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 7v5l3.5 2"],
  quote: ["M9 6H5v6h4v6", "M19 6h-4v6h4v6"],
  wand: ["M4 20 16 8", "M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1z", "M19 13l.7 1.3 1.3.7-1.3.7L19 17l-.7-1.3L17 15l1.3-.7z"],
};

export function Icon({
  name,
  filled = false,
  ...props
}: { name: IconName; filled?: boolean } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name].map((d) => (
        <path key={d} d={d} fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} />
      ))}
    </svg>
  );
}

export function LumenMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="12" fill="#1f3d33" />
      <path d="M20 8v24" stroke="#f3e4c2" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
      <path d="M11 13c4.5-1.6 7.4-.4 9 2.4 1.6-2.8 4.5-4 9-2.4v13c-4.5-1.6-7.4-.4-9 2.4-1.6-2.8-4.5-4-9-2.4z" fill="#f6f2e9" opacity="0.14" />
      <path d="M20 15.4v13.4" stroke="#f3e4c2" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="20" cy="10" r="2.2" fill="#c9a227" />
    </svg>
  );
}
