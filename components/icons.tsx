import {
  Loader2,
  User,
  Mail,
  Image as ImageIcon,
  Moon,
  Sun,
  Check,
  Edit3,
  Minimize2,
  Maximize2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

export const Icons = {
  spinner: Loader2,
  user: User,
  mail: Mail,
  image: ImageIcon,
  moon: Moon,
  sun: Sun,
  check: Check,
  edit: Edit3,
  minimize: Minimize2,
  maximize: Maximize2,
  warning: AlertTriangle,
  sparkles: Sparkles,
};

export type Icon = keyof typeof Icons;
