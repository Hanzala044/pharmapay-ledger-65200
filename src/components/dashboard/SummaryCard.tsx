import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function SummaryCard({ title, value, icon: Icon, trend, trendUp }: SummaryCardProps) {
  return (
    <Card className="glass-card glass-card-hover border-border/50 animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {trend && (
          <p className={`text-xs mt-2 ${trendUp ? "text-green-500" : "text-red-500"}`}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
