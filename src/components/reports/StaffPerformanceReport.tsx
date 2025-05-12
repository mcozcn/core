
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getServiceSales } from "@/utils/localStorage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// For demo purposes, we'll create mock staff data
const mockStaff = [
  { id: 1, name: "Ayşe Yılmaz", role: "Stilist" },
  { id: 2, name: "Mehmet Kaya", role: "Kuaför" },
  { id: 3, name: "Zeynep Demir", role: "Manikür Uzmanı" },
  { id: 4, name: "Ali Öztürk", role: "Masör" }
];

// Mock staff service assignments
const mockStaffServices = [
  { staffId: 1, serviceIds: [1, 3, 5] },
  { staffId: 2, serviceIds: [1, 2, 4] },
  { staffId: 3, serviceIds: [6, 7] },
  { staffId: 4, serviceIds: [8, 9, 10] }
];

const StaffPerformanceReport = () => {
  const [period, setPeriod] = useState("30"); // Default 30 days
  
  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: getServiceSales,
  });

  // Filter sales by period
  const filterSales = () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(period));
    
    return serviceSales.filter(sale => new Date(sale.saleDate) >= cutoffDate);
  };

  const filteredSales = filterSales();

  // Calculate staff performance
  const getStaffPerformance = () => {
    const staffPerformance = mockStaff.map(staff => {
      // Find services assigned to this staff member
      const staffServiceIds = mockStaffServices
        .find(s => s.staffId === staff.id)?.serviceIds || [];
      
      // Filter sales by services this staff member provides
      const staffSales = filteredSales.filter(sale => 
        staffServiceIds.includes(sale.serviceId)
      );
      
      const servicesProvided = staffSales.length;
      const totalRevenue = staffSales.reduce((sum, sale) => sum + sale.price, 0);
      
      // Calculate average rating (mock data between 4-5)
      const avgRating = 4 + Math.random();
      
      return {
        ...staff,
        servicesProvided,
        totalRevenue,
        avgRating: avgRating > 5 ? 5 : avgRating.toFixed(1)
      };
    });
    
    return staffPerformance.sort((a, b) => b.totalRevenue - a.totalRevenue);
  };

  const staffPerformance = getStaffPerformance();

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Personel Performans Raporu</h3>
        
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
            <TableHead>Personel</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead className="text-right">Verilen Hizmet</TableHead>
            <TableHead className="text-right">Gelir</TableHead>
            <TableHead className="text-right">Ortalama Değerlendirme</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffPerformance.map((staff) => (
            <TableRow key={staff.id}>
              <TableCell className="font-medium">{staff.name}</TableCell>
              <TableCell>{staff.role}</TableCell>
              <TableCell className="text-right">{staff.servicesProvided}</TableCell>
              <TableCell className="text-right">₺{staff.totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</TableCell>
              <TableCell className="text-right">{staff.avgRating}/5</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default StaffPerformanceReport;
