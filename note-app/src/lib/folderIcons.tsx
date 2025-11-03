import { 
  Folder, 
  Briefcase, 
  BookOpen, 
  Code, 
  Heart, 
  Star, 
  Lightbulb, 
  Target,
  Rocket,
  Coffee,
  Music,
  Camera,
  Palette,
  Globe,
  Zap,
  Package,
  type LucideIcon
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Folder,
  Briefcase,
  BookOpen,
  Code,
  Heart,
  Star,
  Lightbulb,
  Target,
  Rocket,
  Coffee,
  Music,
  Camera,
  Palette,
  Globe,
  Zap,
  Package,
};

export function getFolderIcon(iconName?: string): LucideIcon {
  if (!iconName || !iconMap[iconName]) {
    return Folder; // Default icon
  }
  return iconMap[iconName];
}

