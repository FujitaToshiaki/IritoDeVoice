import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link } from "wouter";
import type { Product } from "@shared/schema";

export default function ReorderDashboard() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-lg">発注点データを読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto gradient-bg min-h-screen relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-6 pt-16 text-white" data-testid="header">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Home className="h-6 w-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold" data-testid="page-title">発注点管理</h1>
            <p className="text-sm opacity-90" data-testid="page-subtitle">在庫と発注点の一覧</p>
          </div>
        </div>
      </header>

      {/* Reorder Table */}
      <div className="px-6 pb-6" data-testid="reorder-table">
        <Card className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-3xl">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="text-white">
                  <TableHead className="text-white">商品</TableHead>
                  <TableHead className="text-white">在庫</TableHead>
                  <TableHead className="text-white">発注点</TableHead>
                  <TableHead className="text-white">状態</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(products || []).map((p) => (
                  <TableRow key={p.id} className="text-white">
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      {p.currentStock}
                      {p.unit}
                    </TableCell>
                    <TableCell>
                      {p.minStock}
                      {p.unit}
                    </TableCell>
                    <TableCell>
                      {p.currentStock <= p.minStock ? (
                        <span className="text-red-400 font-bold">要発注</span>
                      ) : (
                        <span className="text-green-400">十分</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

