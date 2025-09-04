import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Home, Users, Package, ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface Location {
  id: string;
  name: string;
  address: string;
  type: 'warehouse' | 'store' | 'distribution';
  isActive: boolean;
  totalItems: number;
  staff: number;
  lastUpdate: string;
}

export default function Locations() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
    // Fallback data for development
    placeholderData: [
      {
        id: "1",
        name: "東京倉庫A",
        address: "東京都江東区豊洲1-1-1",
        type: "warehouse",
        isActive: true,
        totalItems: 1250,
        staff: 12,
        lastUpdate: "2分前"
      },
      {
        id: "2", 
        name: "大阪配送センター",
        address: "大阪府大阪市住之江区南港北1-1-1",
        type: "distribution",
        isActive: true,
        totalItems: 892,
        staff: 8,
        lastUpdate: "5分前"
      },
      {
        id: "3",
        name: "名古屋店舗",
        address: "愛知県名古屋市中村区名駅1-1-1",
        type: "store",
        isActive: false,
        totalItems: 350,
        staff: 5,
        lastUpdate: "30分前"
      }
    ]
  });

  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case 'warehouse': return '倉庫';
      case 'store': return '店舗';
      case 'distribution': return '配送センター';
      default: return type;
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'warehouse': return Package;
      case 'store': return MapPin;
      case 'distribution': return Users;
      default: return MapPin;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-lg">ロケーションを読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto gradient-bg min-h-screen relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-6 pt-16 text-white" data-testid="header">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" data-testid="back-button">
              <Home className="h-6 w-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold" data-testid="page-title">ロケーション</h1>
            <p className="text-sm opacity-90" data-testid="page-subtitle">倉庫・店舗一覧</p>
          </div>
        </div>
      </header>

      {/* Locations List */}
      <div className="px-6 py-4 space-y-4" data-testid="locations-list">
        {locations.map((location) => {
          const IconComponent = getLocationIcon(location.type);
          
          return (
            <Card 
              key={location.id}
              className={`bg-white/20 backdrop-blur-sm border border-white/30 rounded-3xl cursor-pointer transition-all duration-200 hover:bg-white/30 ${
                selectedLocation === location.id ? 'ring-2 ring-white/50' : ''
              }`}
              onClick={() => setSelectedLocation(selectedLocation === location.id ? null : location.id)}
              data-testid={`location-card-${location.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      location.isActive 
                        ? 'bg-green-500/30 border border-green-400/50' 
                        : 'bg-gray-500/30 border border-gray-400/50'
                    }`}>
                      <IconComponent className="text-white text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg" data-testid={`location-name-${location.id}`}>
                        {location.name}
                      </h3>
                      <p className="text-white/80 text-sm" data-testid={`location-type-${location.id}`}>
                        {getLocationTypeLabel(location.type)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      location.isActive ? 'bg-green-400' : 'bg-gray-400'
                    }`} data-testid={`location-status-${location.id}`}></div>
                    <ChevronRight className="text-white/60 h-5 w-5" />
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedLocation === location.id && (
                  <div className="mt-4 pt-4 border-t border-white/20 space-y-3" data-testid={`location-details-${location.id}`}>
                    <div className="text-white/90 text-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span>住所:</span>
                        <span className="text-right" data-testid={`location-address-${location.id}`}>
                          {location.address}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span>総アイテム数:</span>
                        <span className="font-semibold" data-testid={`location-items-${location.id}`}>
                          {location.totalItems.toLocaleString()}個
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span>スタッフ数:</span>
                        <span data-testid={`location-staff-${location.id}`}>
                          {location.staff}人
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>最終更新:</span>
                        <span className="text-white/70" data-testid={`location-update-${location.id}`}>
                          {location.lastUpdate}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-4">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
                        data-testid={`view-details-button-${location.id}`}
                      >
                        詳細を見る
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
                        data-testid={`switch-location-button-${location.id}`}
                      >
                        切り替え
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Card */}
      <div className="px-6 py-4">
        <Card className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-3xl" data-testid="locations-summary">
          <CardContent className="p-6">
            <h4 className="text-white font-semibold mb-3" data-testid="summary-title">全体サマリー</h4>
            <div className="space-y-2 text-white/90 text-sm">
              <div className="flex justify-between" data-testid="total-locations">
                <span>総ロケーション数:</span>
                <span className="font-semibold">{locations.length}箇所</span>
              </div>
              <div className="flex justify-between" data-testid="active-locations">
                <span>稼働中:</span>
                <span className="font-semibold">
                  {locations.filter(l => l.isActive).length}箇所
                </span>
              </div>
              <div className="flex justify-between" data-testid="total-items-all">
                <span>総アイテム数:</span>
                <span className="font-semibold">
                  {locations.reduce((sum, l) => sum + l.totalItems, 0).toLocaleString()}個
                </span>
              </div>
              <div className="flex justify-between" data-testid="total-staff-all">
                <span>総スタッフ数:</span>
                <span className="font-semibold">
                  {locations.reduce((sum, l) => sum + l.staff, 0)}人
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}