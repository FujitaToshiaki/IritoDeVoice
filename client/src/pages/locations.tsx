import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Product } from "@shared/schema";

export default function Locations() {
  const { data: locationsData } = useQuery<{ locations: string[] }>({
    queryKey: ["/api/locations"],
  });
  const locations = locationsData?.locations || [];
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    if (!selected && locations.length > 0) {
      setSelected(locations[0]);
    }
  }, [locations, selected]);

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/locations", encodeURIComponent(selected), "products"],
    enabled: !!selected,
  });

  return (
    <div className="max-w-md mx-auto gradient-bg min-h-screen relative overflow-hidden">
      <header className="flex items-center justify-between p-6 pt-16 text-white">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 text-white hover:bg-white/30"
            >
              <ArrowLeft className="text-xl" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">拠点在庫</h1>
            <p className="text-sm opacity-90">拠点別在庫一覧</p>
          </div>
        </div>
      </header>

      <div className="px-6 pb-6">
        {locations.length > 0 && (
          <select
            className="w-full mb-4 p-3 rounded-lg text-gray-800"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            data-testid="location-select"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        )}

        {products && (
          <Card className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-3xl p-4" data-testid="location-inventory">
            <table className="w-full text-white text-sm">
              <thead>
                <tr className="text-left">
                  <th className="pb-2">商品名</th>
                  <th className="pb-2">コード</th>
                  <th className="pb-2 text-right">在庫</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-white/20">
                    <td className="py-2">{p.name}</td>
                    <td className="py-2">{p.code}</td>
                    <td className="py-2 text-right">
                      {p.currentStock}
                      {p.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
