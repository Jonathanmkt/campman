import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface InfoCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number | null | undefined;
  iconColor?: string;
}

export function InfoCard({ icon: Icon, label, value, iconColor = 'text-blue-600' }: InfoCardProps) {
  if (!value) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              {label}
            </p>
            <p className="text-sm font-medium text-foreground break-words">
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
