
import React from 'react';
import { Card } from "@/components/ui/card";
import { LucideIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    percentage: number;
    direction: 'up' | 'down' | 'none';
  };
  showTrend?: boolean;
  className?: string;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  showTrend = true,
  className 
}: StatCardProps) => (
  <Card className={cn("p-6 card-hover", className)}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-semibold mt-1">{value}</h3>
        {showTrend && trend && trend.percentage !== 0 && (
          <p className={`text-xs mt-1 ${
            trend.direction === 'up' 
              ? 'text-green-500' 
              : trend.direction === 'down' 
                ? 'text-red-500' 
                : 'text-gray-500'
          }`}>
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} 
            Geçen aya göre {Math.abs(trend.percentage)}% {
              trend.direction === 'up' 
                ? 'artış' 
                : trend.direction === 'down' 
                  ? 'azalış' 
                  : 'değişim yok'
            }
          </p>
        )}
      </div>
      <Icon className="text-primary" size={24} />
    </div>
  </Card>
);

export default StatCard;
