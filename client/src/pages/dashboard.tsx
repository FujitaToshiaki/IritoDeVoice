import { useQuery } from "@tanstack/react-query";
import { PackageIcon, Bell, Home, BarChart3, Mic, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import VoiceRecorder from "@/components/voice-recorder";
import InventoryChart from "@/components/inventory-chart";
import CategoryChart from "@/components/category-chart";
import KpiCards from "@/components/kpi-cards";
import LowStockAlerts from "@/components/low-stock-alerts";
import RecentActivity from "@/components/recent-activity";
import { useWebSocket } from "@/hooks/use-websocket";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("音声認識待機中");
  
  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ["/api/dashboard"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // WebSocket for real-time updates
  useWebSocket("/ws", {
    onMessage: (data) => {
      if (data.type === 'inventory_update' || data.type === 'voice_command') {
        refetch();
      }
    }
  });

  const handleVoiceStart = () => {
    setIsVoiceRecording(true);
    setVoiceStatus("音声認識中...");
  };

  const handleVoiceEnd = () => {
    setIsVoiceRecording(false);
    setVoiceStatus("音声認識待機中");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-lg">データを読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto gradient-bg min-h-screen relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-6 pt-16 text-white" data-testid="header">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
            <PackageIcon className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold" data-testid="app-title">IritoDeVoice</h1>
            <p className="text-sm opacity-90" data-testid="location">東京倉庫A</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <Bell className="text-white text-xl" data-testid="notification-bell" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full notification-badge flex items-center justify-center" data-testid="notification-badge">
              <span className="text-white text-xs font-bold">3</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
            <span className="text-white text-lg font-bold" data-testid="user-avatar">田</span>
          </div>
        </div>
      </header>

      {/* Voice Status Indicator */}
      <div className="px-6 mb-6">
        <Card className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-3xl p-5 flex items-center space-x-4" data-testid="voice-status">
          <div className={`w-4 h-4 rounded-full ${isVoiceRecording ? 'bg-red-400' : 'bg-green-400'} shadow-lg`}></div>
          <span className="text-white text-base font-medium flex-1" data-testid="voice-status-text">{voiceStatus}</span>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Mic className="text-white" />
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="px-6 pb-20">
        {/* KPI Cards */}
        <KpiCards data={dashboardData?.kpis} />

        {/* Inventory Overview Chart */}
        <InventoryChart data={dashboardData?.weeklyTrend} />

        {/* Category Breakdown */}
        <CategoryChart data={dashboardData?.categoryBreakdown} />

        {/* Low Stock Alerts */}
        <LowStockAlerts data={dashboardData?.lowStockProducts} />

        {/* Recent Activity */}
        <RecentActivity data={dashboardData?.recentTransactions} />
      </div>

      {/* Voice Recording Component */}
      <VoiceRecorder
        isRecording={isVoiceRecording}
        onStart={handleVoiceStart}
        onEnd={handleVoiceEnd}
      />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white rounded-t-3xl shadow-2xl border-0" data-testid="bottom-navigation">
        <div className="flex items-center justify-around py-6 px-6">
          <Button variant="ghost" className="flex flex-col items-center space-y-1 text-primary p-2" data-testid="nav-home">
            <Home className="text-xl" />
            <span className="text-xs font-semibold">ホーム</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center space-y-1 text-gray-400 p-2" data-testid="nav-analytics">
            <BarChart3 className="text-xl" />
            <span className="text-xs font-medium">分析</span>
          </Button>
          <Button
            onClick={handleVoiceStart}
            className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-500 rounded-3xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform"
            data-testid="voice-record-button"
          >
            <Mic className="text-white text-2xl" />
          </Button>
          <Button variant="ghost" className="flex flex-col items-center space-y-1 text-gray-400 p-2" data-testid="nav-notifications">
            <Bell className="text-xl" />
            <span className="text-xs font-medium">通知</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center space-y-1 text-gray-400 p-2" data-testid="nav-settings">
            <User className="text-xl" />
            <span className="text-xs font-medium">設定</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
