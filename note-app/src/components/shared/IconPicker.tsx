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

export const PRESET_ICONS: { name: string; icon: LucideIcon; value: string }[] = [
  { name: 'Folder', icon: Folder, value: 'Folder' },
  { name: 'Briefcase', icon: Briefcase, value: 'Briefcase' },
  { name: 'Book', icon: BookOpen, value: 'BookOpen' },
  { name: 'Code', icon: Code, value: 'Code' },
  { name: 'Heart', icon: Heart, value: 'Heart' },
  { name: 'Star', icon: Star, value: 'Star' },
  { name: 'Lightbulb', icon: Lightbulb, value: 'Lightbulb' },
  { name: 'Target', icon: Target, value: 'Target' },
  { name: 'Rocket', icon: Rocket, value: 'Rocket' },
  { name: 'Coffee', icon: Coffee, value: 'Coffee' },
  { name: 'Music', icon: Music, value: 'Music' },
  { name: 'Camera', icon: Camera, value: 'Camera' },
  { name: 'Palette', icon: Palette, value: 'Palette' },
  { name: 'Globe', icon: Globe, value: 'Globe' },
  { name: 'Zap', icon: Zap, value: 'Zap' },
  { name: 'Package', icon: Package, value: 'Package' },
];

interface IconPickerProps {
  selectedIcon?: string;
  onIconSelect: (icon: string) => void;
  color?: string;
}

export function IconPicker({ selectedIcon, onIconSelect, color }: IconPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">Icon</label>
      <div className="grid grid-cols-8 gap-2">
        {PRESET_ICONS.map(({ name, icon: Icon, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => onIconSelect(value)}
            className={`p-2 rounded border-2 hover:bg-accent transition-colors ${
              selectedIcon === value 
                ? 'border-primary bg-accent' 
                : 'border-border'
            }`}
            title={name}
          >
            <Icon 
              className="w-4 h-4" 
              style={color ? { color } : undefined}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

