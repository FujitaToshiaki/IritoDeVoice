import { Card } from "@/components/ui/card";
import { Plus, Minus, Mic, Package } from "lucide-react";
import type { InventoryTransaction } from "@shared/schema";

interface RecentActivityProps {
  data?: InventoryTransaction[];
}

export default function RecentActivity({ data = [] }: RecentActivityProps) {
  const getActivityIcon = (type: string, isVoiceCommand: boolean) => {
    if (isVoiceCommand) return Mic;
    switch (type) {
      case 'inbound': return Plus;
      case 'outbound': return Minus;
      default: return Package;
    }
  };

  const getActivityColor = (type: string, isVoiceCommand: boolean) => {
    if (isVoiceCommand) return { bg: 'bg-purple-100', text: 'text-primary' };
    switch (type) {
      case 'inbound': return { bg: 'bg-green-100', text: 'text-green-600' };
      case 'outbound': return { bg: 'bg-blue-100', text: 'text-blue-600' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  const getActivityDescription = (transaction: InventoryTransaction) => {
    const action = transaction.type === 'inbound' ? '入荷' : '出荷';
    if (transaction.isVoiceCommand) {
      return `音声コマンド: "${transaction.note || `${action}操作`}"`;
    }
    return `${transaction.orderId || 'システム'}による${action}`;
  };

  const formatTimestamp = (timestamp: Date | null) => {
    if (!timestamp) return "不明";
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return "1分未満前";
    if (minutes < 60) return `${minutes}分前`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}時間前`;
    
    const days = Math.floor(hours / 24);
    return `${days}日前`;
  };

  return (
    <Card className="bg-white rounded-2xl p-6 shadow-lg mb-6 card-hover" data-testid="recent-activity">
      <h3 className="text-lg font-semibold text-card-foreground mb-4" data-testid="activity-title">最近の活動</h3>
      
      <div className="space-y-4" data-testid="activity-list">
        {data.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground" data-testid="no-activity">
            最近の活動はありません
          </div>
        ) : (
          data.map((activity, index) => {
            const isVoiceCommand = Boolean(activity.isVoiceCommand);
            const IconComponent = getActivityIcon(activity.type, isVoiceCommand);
            const colors = getActivityColor(activity.type, isVoiceCommand);
            
            return (
              <div key={activity.id} className="flex items-center space-x-3" data-testid={`activity-item-${index}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colors.bg}`}>
                  <IconComponent className={`text-xs ${colors.text}`} size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground" data-testid={`activity-description-${index}`}>
                    {getActivityDescription(activity)}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`activity-timestamp-${index}`}>
                    {formatTimestamp(activity.timestamp)}
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
