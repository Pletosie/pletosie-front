import {
  ArrowDown,
  Asterisk,
  Circle,
  Download,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  House,
  LayoutGrid,
  MapPin,
  MessageCircle,
  Mic,
  Minus,
  Pause,
  PackageCheck,
  PackageOpen,
  Play,
  Plus,
  Scissors,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";

// Static imports keep the shared icon set consistent without bundling the full catalogue.
const icons: Record<string, LucideIcon> = {
  search: Search,
  bag: ShoppingBag,
  orders: PackageCheck,
  "orders-empty": PackageOpen,
  user: UserRound,
  chat: MessageCircle,
  arrow: ArrowRight,
  "arrow-up-right": ArrowUpRight,
  "arrow-down": ArrowDown,
  asterisk: Asterisk,
  unread: Circle,
  download: Download,
  home: House,
  grid: LayoutGrid,
  mic: Mic,
  truck: Truck,
  needle: Scissors,
  shield: ShieldCheck,
  play: Play,
  pause: Pause,
  check: Check,
  trash: Trash2,
  bell: Bell,
  pin: MapPin,
  send: Send,
  plus: Plus,
  minus: Minus,
  close: X,
  chevron: ChevronRight,
  "chevron-down": ChevronDown,
  filters: SlidersHorizontal,
};
export function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const Component = icons[name] || LayoutGrid;
  return (
    <Component
      size={size}
      strokeWidth={1.8}
      aria-hidden="true"
      focusable="false"
      className="ui-icon"
    />
  );
}
