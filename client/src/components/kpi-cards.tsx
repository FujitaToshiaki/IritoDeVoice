import { Card } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import type { DailyKpi } from "@shared/schema";

interface KpiCardsProps {
  data?: DailyKpi;
}

export default function KpiCards({ data }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6" data-testid="kpi-cards">
      <Card className="bg-white rounded-2xl p-4 shadow-lg card-hover" data-testid="inbound-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted-foreground text-sm">今日の入荷</span>
          <ArrowDownIcon className="text-green-500" size={20} />
        </div>
        <div className="text-2xl font-bold text-card-foreground" data-testid="inbound-count">
          {data?.totalInbound?.toLocaleString() || "0"}
        </div>
        <div className="text-xs text-green-600 font-medium" data-testid="inbound-change">+12.5%</div>
      </Card>
      
      <Card className="bg-white rounded-2xl p-4 shadow-lg card-hover" data-testid="outbound-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted-foreground text-sm">今日の出荷</span>
          <ArrowUpIcon className="text-blue-500" size={20} />
        </div>
        <div className="text-2xl font-bold text-card-foreground" data-testid="outbound-count">
          {data?.totalOutbound?.toLocaleString() || "0"}
        </div>
        <div className="text-xs text-blue-600 font-medium" data-testid="outbound-change">+8.3%</div>
      </Card>
    </div>
  );
}
