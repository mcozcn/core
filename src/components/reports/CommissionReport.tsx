
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getSales, getServiceSales, getUsers } from "@/utils/localStorage";
import { CommissionFilters } from "./commission/CommissionFilters";
import { CommissionSummary } from "./commission/CommissionSummary";
import { CommissionStaffList } from "./commission/CommissionStaffList";
import { useCommissionData } from "./commission/useCommissionData";

const CommissionReport = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30),
  });
  
  const [selectedStaffId, setSelectedStaffId] = useState<string>("all");

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => getSales(),
  });

  const { data: serviceSales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: () => getServiceSales(),
  });
  
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  // Use our custom hook to get the processed commission data
  const { 
    staffCommissionData, 
    totalCommissionAmount, 
    isEmpty 
  } = useCommissionData(sales, serviceSales, date, selectedStaffId, users);

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h3 className="text-xl font-semibold">Personel Hakediş Raporu</h3>
        <CommissionFilters
          selectedStaffId={selectedStaffId}
          setSelectedStaffId={setSelectedStaffId}
          date={date}
          setDate={setDate}
        />
      </div>

      {isEmpty ? (
        <div className="text-center py-8 text-muted-foreground">
          Seçilen kriterlere uygun hakediş bilgisi bulunamadı.
        </div>
      ) : (
        <>
          <CommissionSummary 
            totalCommissionAmount={totalCommissionAmount} 
            date={date} 
          />
          
          <CommissionStaffList staffCommissionData={staffCommissionData} />
        </>
      )}
    </Card>
  );
};

export default CommissionReport;
