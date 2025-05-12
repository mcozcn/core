
import { useQuery } from "@tanstack/react-query";
import { getSales, getStock } from "@/utils/localStorage";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TopSellingProducts = () => {
  const [period, setPeriod] = useState("30"); // Default 30 days
  
  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: getSales,
  });

  const { data: stock = [] } = useQuery({
    queryKey: ['stock'],
    queryFn: getStock,
  });

  // Filter sales by period
  const filterSales = () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(period));
    
    return sales.filter(sale => new Date(sale.saleDate) >= cutoffDate);
  };

  const filteredSales = filterSales();

  // Compute product sales statistics
  const getProductStats = () => {
    const stats = new Map();
    
    filteredSales.forEach(sale => {
      if (!stats.has(sale.productId)) {
        stats.set(sale.productId, {
          productId: sale.productId,
          productName: sale.productName,
          quantity: 0,
          revenue: 0,
          cost: 0
        });
      }
      
      const product = stats.get(sale.productId);
      product.quantity += sale.quantity;
      product.revenue += sale.totalPrice;
      
      // Calculate cost
      const stockItem = stock.find(item => item.productId === sale.productId);
      if (stockItem) {
        product.cost += stockItem.cost * sale.quantity;
      }
    });
    
    return Array.from(stats.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10); // Top 10
  };

  const topProducts = getProductStats();

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">En Çok Satan Ürünler</h3>
        
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Son 7 Gün</SelectItem>
            <SelectItem value="30">Son 30 Gün</SelectItem>
            <SelectItem value="90">Son 3 Ay</SelectItem>
            <SelectItem value="365">Son 1 Yıl</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ürün</TableHead>
            <TableHead className="text-right">Satış Adeti</TableHead>
            <TableHead className="text-right">Toplam Gelir</TableHead>
            <TableHead className="text-right">Toplam Maliyet</TableHead>
            <TableHead className="text-right">Kar</TableHead>
            <TableHead className="text-right">Kar Marjı</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                Bu dönem için satış verisi bulunamadı.
              </TableCell>
            </TableRow>
          ) : (
            topProducts.map((item) => {
              const profit = item.revenue - item.cost;
              const margin = item.revenue > 0 ? (profit / item.revenue) * 100 : 0;
              
              return (
                <TableRow key={item.productId}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">₺{item.revenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-right">₺{item.cost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-right">₺{profit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-right">{margin.toFixed(2)}%</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default TopSellingProducts;
