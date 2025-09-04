import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Smartphone, ShirtIcon } from "lucide-react";
import type { Product } from "@shared/schema";

interface LowStockAlertsProps {
  data?: Product[];
}

const categoryIcons = {
  "電子機器": Smartphone,
  "衣料品": ShirtIcon,
  "食品": Package,
};

export default function LowStockAlerts({ data = [] }: LowStockAlertsProps) {
  const getAlertLevel = (currentStock: number, minStock: number) => {
    const ratio = currentStock / minStock;
    if (ratio <= 0.5) return { level: "critical", color: "bg-red-100 text-red-600", bgColor: "bg-red-50" };
    if (ratio <= 0.8) return { level: "warning", color: "bg-yellow-100 text-yellow-600", bgColor: "bg-yellow-50" };
    return { level: "normal", color: "bg-green-100 text-green-600", bgColor: "bg-green-50" };
  };

  return (
    <Card className="bg-white rounded-3xl p-6 shadow-xl mb-8 border-0 card-hover" data-testid="low-stock-alerts">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900" data-testid="alerts-title">在庫不足アラート</h3>
        <Badge className="bg-red-100 text-red-600 text-sm px-3 py-1.5 rounded-full font-semibold" data-testid="alerts-count">
          {data.length}件
        </Badge>
      </div>
      
      <div className="space-y-3" data-testid="alerts-list">
        {data.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground" data-testid="no-alerts">
            在庫不足の商品はありません
          </div>
        ) : (
          data.map((item, index) => {
            const alert = getAlertLevel(item.currentStock, item.minStock);
            const IconComponent = categoryIcons[item.category as keyof typeof categoryIcons] || Package;
            
            return (
              <div 
                key={item.id} 
                className={`flex items-center justify-between p-3 rounded-xl ${alert.bgColor}`}
                data-testid={`alert-item-${index}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${alert.color}`}>
                    <IconComponent size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground" data-testid={`alert-name-${index}`}>
                      {item.name}
                    </p>
                    <p className="text-sm text-muted-foreground" data-testid={`alert-code-${index}`}>
                      SKU: {item.code}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${alert.level === 'critical' ? 'text-red-600' : 'text-yellow-600'}`} data-testid={`alert-stock-${index}`}>
                    {item.currentStock}{item.unit}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`alert-min-${index}`}>
                    最小: {item.minStock}{item.unit}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
