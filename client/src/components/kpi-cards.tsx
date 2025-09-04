import { Card } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import type { DailyKpi } from "@shared/schema";

interface KpiCardsProps {
  data?: DailyKpi;
}

export default function KpiCards({ data }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8" data-testid="kpi-cards">
      <Card className="bg-white rounded-3xl p-6 shadow-xl border-0 card-hover" data-testid="inbound-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-500 text-sm font-medium">今日の入荷</span>
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <ArrowDownIcon className="text-green-600" size={20} />
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1" data-testid="inbound-count">
          {data?.totalInbound?.toLocaleString() || "0"}
        </div>
        <div className="text-sm text-green-600 font-semibold" data-testid="inbound-change">+12.5%</div>
      </Card>
      
      <Card className="bg-white rounded-3xl p-6 shadow-xl border-0 card-hover" data-testid="outbound-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-500 text-sm font-medium">今日の出荷</span>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <ArrowUpIcon className="text-blue-600" size={20} />
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1" data-testid="outbound-count">
          {data?.totalOutbound?.toLocaleString() || "0"}
        </div>
        <div className="text-sm text-blue-600 font-semibold" data-testid="outbound-change">+8.3%</div>
      </Card>
    </div>
  );
}
