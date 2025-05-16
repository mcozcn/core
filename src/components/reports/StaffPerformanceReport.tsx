
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getStaffPerformance } from "@/utils/storage/staff";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/utils/format";

const StaffPerformanceReport = () => {
  const [period, setPeriod] = useState("30"); // Default 30 days
  
  // Fix: Remove the argument as it's not expected by the function
  const { data: staffPerformance = [] } = useQuery({
    queryKey: ['staffPerformance', period],
    queryFn: () => getStaffPerformance(),
  });

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
          {staffPerformance.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                Bu periyotta personel performans verisi bulunamadı.
              </TableCell>
            </TableRow>
          ) : (
            staffPerformance.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell className="font-medium">{staff.name}</TableCell>
                <TableCell>{staff.role}</TableCell>
                <TableCell className="text-right">{staff.servicesProvided}</TableCell>
                <TableCell className="text-right">{formatCurrency(staff.totalRevenue)}</TableCell>
                <TableCell className="text-right">{staff.avgRating}/5</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default StaffPerformanceReport;
