import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WipBadgeProps {
  className?: string;
}

export function WipBadge({ className = "" }: WipBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={`text-xs bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 ${className}`}
    >
      <Clock className="h-3 w-3 mr-1" />
      WIP
    </Badge>
  );
}
