import {
  Loader2,
  User,
  Mail,
  Image as ImageIcon,
  Moon,
  Sun,
} from "lucide-react";

export const Icons = {
  spinner: Loader2,
  user: User,
  mail: Mail,
  image: ImageIcon,
  moon: Moon,
  sun: Sun,
};

export type Icon = keyof typeof Icons;
