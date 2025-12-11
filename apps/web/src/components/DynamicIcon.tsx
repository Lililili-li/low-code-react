import { icons, type LucideIcon } from 'lucide-react';


const DynamicIcon = ({ name, ...props }: { name: string } & React.ComponentProps<LucideIcon>) => {
  const iconName = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') as keyof typeof icons;
  const IconComponent = icons[iconName];
  
  if (!IconComponent) {
    return null;
  }
  
  return <IconComponent {...props} />;
};

export default DynamicIcon