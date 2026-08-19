import { iconBaseProps, type IconProps } from "./Icon";

export function LibraryIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 18, props)}>
      <rect x="2.5" y="3" width="6" height="6" rx="1.1" />
      <rect x="11.5" y="3" width="6" height="6" rx="1.1" />
      <rect x="2.5" y="11" width="6" height="6" rx="1.1" />
      <rect x="11.5" y="11" width="6" height="6" rx="1.1" />
    </svg>
  );
}

export function EditorIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 18, props)}>
      <line x1="4" y1="3" x2="4" y2="17" />
      <circle cx="4" cy="7" r="1.6" fill="currentColor" stroke="none" />
      <line x1="10" y1="3" x2="10" y2="17" />
      <circle cx="10" cy="12.5" r="1.6" fill="currentColor" stroke="none" />
      <line x1="16" y1="3" x2="16" y2="17" />
      <circle cx="16" cy="9" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BackupsIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 18, props)}>
      <path d="M4 6.5A6 6 0 1 1 3.2 11" />
      <path d="M2.5 4v3h3" />
      <path d="M10 7v3.4l2.4 1.6" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 18, props)}>
      <circle cx="10" cy="10" r="2.6" />
      <path d="M10 2.7v2.1M10 15.2v2.1M17.3 10h-2.1M4.8 10H2.7M15.1 4.9l-1.5 1.5M6.4 13.6l-1.5 1.5M15.1 15.1l-1.5-1.5M6.4 6.4 4.9 4.9" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 16, props)}>
      <path d="M5.5 3.6a.8.8 0 0 1 1.24-.66l9 5.9a.8.8 0 0 1 0 1.34l-9 5.9A.8.8 0 0 1 5.5 15.5V3.6Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PauseIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 16, props)}>
      <rect x="5.5" y="3.5" width="3" height="13" rx="0.8" fill="currentColor" stroke="none" />
      <rect x="11.5" y="3.5" width="3" height="13" rx="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 16, props)}>
      <path d="M4 10.5 8 14.5 16 6" />
    </svg>
  );
}

export function AlertTriangleIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 16, props)}>
      <path d="M10 3.2 17.6 16.2H2.4L10 3.2Z" />
      <line x1="10" y1="8.2" x2="10" y2="11.6" />
      <circle cx="10" cy="13.8" r="0.15" fill="currentColor" />
    </svg>
  );
}

export function AlertCircleIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 16, props)}>
      <circle cx="10" cy="10" r="7.2" />
      <line x1="10" y1="6.4" x2="10" y2="10.8" />
      <circle cx="10" cy="13.4" r="0.15" fill="currentColor" />
    </svg>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 16, props)}>
      <circle cx="10" cy="10" r="7.2" />
      <line x1="10" y1="9" x2="10" y2="13.6" />
      <circle cx="10" cy="6.6" r="0.15" fill="currentColor" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 16, props)}>
      <path d="M7.5 4.5 13 10l-5.5 5.5" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 16, props)}>
      <path d="M4.5 7.5 10 13l5.5-5.5" />
    </svg>
  );
}

export function ReplaceIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 16, props)}>
      <path d="M3 9.5a7 7 0 0 1 11.6-5.2M17 4v4.2h-4.2" />
      <path d="M17 10.5a7 7 0 0 1-11.6 5.2M3 16v-4.2h4.2" />
    </svg>
  );
}

export function DisableIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 16, props)}>
      <circle cx="10" cy="10" r="7.2" />
      <line x1="5.3" y1="14.7" x2="14.7" y2="5.3" />
    </svg>
  );
}

export function UndoIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 16, props)}>
      <path d="M5 8.5H12a4 4 0 1 1 0 8h-1.5" />
      <path d="M8 5 5 8.5 8 12" />
    </svg>
  );
}

export function VolumeIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 16, props)}>
      <path d="M3.5 7.8h2.7L10.5 4v12L6.2 12.2H3.5z" fill="currentColor" stroke="none" />
      <path d="M13.2 7.2a4 4 0 0 1 0 5.6" />
      <path d="M15.4 5a7.2 7.2 0 0 1 0 10" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 16, props)}>
      <line x1="10" y1="3.5" x2="10" y2="16.5" />
      <line x1="3.5" y1="10" x2="16.5" y2="10" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 16, props)}>
      <path d="M4 6h12" />
      <path d="M8 6V4.2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V6" />
      <path d="M5.5 6l.7 9.5a1 1 0 0 0 1 .9h5.6a1 1 0 0 0 1-.9L14.5 6" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 16, props)}>
      <circle cx="8.6" cy="8.6" r="5.1" />
      <line x1="12.5" y1="12.5" x2="17" y2="17" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 16, props)}>
      <circle cx="10" cy="10" r="3.4" />
      <path d="M10 2.6v1.7M10 15.7v1.7M17.4 10h-1.7M4.3 10H2.6M15.4 4.6l-1.2 1.2M5.8 14.2l-1.2 1.2M15.4 15.4l-1.2-1.2M5.8 5.8 4.6 4.6" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 16, props)}>
      <path d="M16.2 12.4A6.6 6.6 0 0 1 7.6 3.8a6.6 6.6 0 1 0 8.6 8.6Z" />
    </svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 16, props)}>
      <path d="M10 16.3 3.6 10.1a4 4 0 0 1 5.7-5.6L10 5.2l0.7-0.7a4 4 0 0 1 5.7 5.6L10 16.3Z" />
    </svg>
  );
}

export function PlugOffIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 16, props)}>
      <path d="M6.5 2.5v3.7M13.5 2.5v3.7" />
      <path d="M5 6.2h10v2.6a5 5 0 0 1-5 5 5 5 0 0 1-5-5V6.2Z" />
      <line x1="10" y1="13.8" x2="10" y2="17.5" />
      <line x1="3" y1="17" x2="17" y2="3" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 16, props)}>
      <rect x="4.5" y="9" width="11" height="8" rx="1.4" />
      <path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" />
    </svg>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 16, props)}>
      <path d="M3.5 10a6.5 6.5 0 0 1 11-4.6l1.5 1.4" />
      <path d="M16 3v4h-4" />
      <path d="M16.5 10a6.5 6.5 0 0 1-11 4.6L4 13.2" />
      <path d="M4 17v-4h4" />
    </svg>
  );
}

export function SpinnerIcon(props: IconProps) {
  return (
    <svg {...iconBaseProps(props.size ?? 16, props)} className="spinner">
      <path d="M10 3a7 7 0 1 0 7 7" />
    </svg>
  );
}

// Window caption glyphs — thinner stroke and smaller viewBox to match the
// Windows 11 Fluent caption-button convention (10x10 glyph in a 46x32 hit area).
function captionIconBaseProps(size: number, props: IconProps) {
  const { size: _s, ...rest } = props;
  return {
    width: size,
    height: size,
    viewBox: "0 0 10 10",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
    ...rest,
  };
}

export function WindowMinimizeIcon(props: IconProps) {
  return (
    <svg {...captionIconBaseProps(props.size ?? 10, props)}>
      <line x1="1" y1="5" x2="9" y2="5" />
    </svg>
  );
}

export function WindowMaximizeIcon(props: IconProps) {
  return (
    <svg {...captionIconBaseProps(props.size ?? 10, props)}>
      <rect x="1.25" y="1.25" width="7.5" height="7.5" rx="0.5" />
    </svg>
  );
}

export function WindowRestoreIcon(props: IconProps) {
  return (
    <svg {...captionIconBaseProps(props.size ?? 10, props)}>
      <rect x="2.75" y="1.25" width="6" height="6" rx="0.5" />
      <path d="M1.25 3.75V8.25a0.5 0.5 0 0 0 0.5 0.5H6.25" />
    </svg>
  );
}

export function WindowCloseIcon(props: IconProps) {
  return (
    <svg {...captionIconBaseProps(props.size ?? 10, props)}>
      <line x1="1" y1="1" x2="9" y2="9" />
      <line x1="9" y1="1" x2="1" y2="9" />
    </svg>
  );
}
