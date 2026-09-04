import type { SVGProps } from "react";

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12.5 5 7.5 10l5 5" />
    </svg>
  );
}

export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M7.5 5l5 5-5 5" />
    </svg>
  );
}

export function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="4.5" width="13" height="12" rx="2" />
      <path d="M3.5 8.5h13M7 3v3M13 3v3" />
    </svg>
  );
}

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="10" r="6.75" />
      <path d="M10 6.5V10l2.5 1.5" />
    </svg>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 10.5 8 14l7.5-8" />
    </svg>
  );
}

export function AlertIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M10 3.5 17 16H3L10 3.5Z" />
      <path d="M10 8.25v3.25M10 14.25v.01" />
    </svg>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="8.75" cy="8.75" r="5.25" />
      <path d="M16 16l-3.6-3.6" />
    </svg>
  );
}

export function LogOutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M8 3.5H5a1.5 1.5 0 0 0-1.5 1.5v10A1.5 1.5 0 0 0 5 16.5h3" />
      <path d="M13 13.5 16.5 10 13 6.5M16.5 10h-9" />
    </svg>
  );
}

export function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 8.5a5 5 0 0 1 10 0c0 3.5 1 4.5 1.5 5.25H3.5C4 13 5 12 5 8.5Z" />
      <path d="M8.25 15.75a1.75 1.75 0 0 0 3.5 0" />
    </svg>
  );
}

export function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="7" r="3" />
      <path d="M3.75 16.25c0-2.9 2.8-5 6.25-5s6.25 2.1 6.25 5" />
    </svg>
  );
}

export function GridIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="5.5" height="5.5" rx="1.2" />
      <rect x="11" y="3.5" width="5.5" height="5.5" rx="1.2" />
      <rect x="3.5" y="11" width="5.5" height="5.5" rx="1.2" />
      <rect x="11" y="11" width="5.5" height="5.5" rx="1.2" />
    </svg>
  );
}

export function DownloadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M10 3.5v9.5M6.5 9.5 10 13l3.5-3.5" />
      <path d="M4 15.5v.75c0 .69.56 1.25 1.25 1.25h9.5c.69 0 1.25-.56 1.25-1.25v-.75" />
    </svg>
  );
}

export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...props}>
      <path d="M10 2.75l2.12 4.3 4.75.69-3.44 3.35.81 4.73L10 13.5l-4.24 2.32.81-4.73-3.44-3.35 4.75-.69L10 2.75Z" />
    </svg>
  );
}
