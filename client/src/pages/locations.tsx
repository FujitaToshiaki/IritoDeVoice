import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Home, Users, Package, ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface LocationsResponse {
  locations: string[];
}

export default function Locations() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const { data, isLoading } = useQuery<LocationsResponse>({
    queryKey: ["/api/locations"],
  });

  const locations = data?.locations || [];

  const getLocationIcon = (locationName: string) => {
    // Simple logic to assign icons based on location name
    if (locationName.includes('A')) return Package;
    if (locationName.includes('B')) return Users;
    return MapPin;
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
        {locations.map((location, index) => {
          const IconComponent = getLocationIcon(location);
          
          return (
            <Card 
              key={location}
              className={`bg-white/20 backdrop-blur-sm border border-white/30 rounded-3xl cursor-pointer transition-all duration-200 hover:bg-white/30 ${
                selectedLocation === location ? 'ring-2 ring-white/50' : ''
              }`}
              onClick={() => setSelectedLocation(selectedLocation === location ? null : location)}
              data-testid={`location-card-${location}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-green-500/30 border border-green-400/50">
                      <IconComponent className="text-white text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg" data-testid={`location-name-${location}`}>
                        {location}
                      </h3>
                      <p className="text-white/80 text-sm" data-testid={`location-type-${location}`}>
                        倉庫エリア
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-400" data-testid={`location-status-${location}`}></div>
                    <ChevronRight className="text-white/60 h-5 w-5" />
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedLocation === location && (
                  <div className="mt-4 pt-4 border-t border-white/20 space-y-3" data-testid={`location-details-${location}`}>
                    <div className="text-white/90 text-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span>エリア名:</span>
                        <span className="text-right" data-testid={`location-address-${location}`}>
                          {location}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span>ステータス:</span>
                        <span className="font-semibold" data-testid={`location-items-${location}`}>
                          稼働中
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-4">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
                        data-testid={`view-details-button-${location}`}
                      >
                        詳細を見る
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
                        data-testid={`switch-location-button-${location}`}
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
                <span className="font-semibold">{locations.length}箇所</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}