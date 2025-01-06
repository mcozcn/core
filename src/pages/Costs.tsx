import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { RotateCcw } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import AddCostForm from "@/components/costs/AddCostForm";
import CostsTable from "@/components/costs/CostsTable";
import { useQuery } from "@tanstack/react-query";
import { getCosts } from "@/utils/localStorage";

const Costs = () => {
  const [showForm, setShowForm] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined
  });
  
  const { data: costs = [] } = useQuery({
    queryKey: ['costs'],
    queryFn: getCosts,
  });

  const resetDateFilter = () => {
    setDateRange({
      from: undefined,
      to: undefined
    });
  };

  const filteredCosts = costs.filter(cost => {
    if (!dateRange.from) return true;
    
    const costDate = new Date(cost.date);
    const from = dateRange.from;
    const to = dateRange.to || from;

    return costDate >= from && costDate <= to;
  });

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-serif">Masraf Yönetimi</h1>
        <Button onClick={() => setShowForm(true)}>
          Yeni Masraf Ekle
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        <Button 
          variant="outline" 
          size="icon" 
          onClick={resetDateFilter} 
          title="Filtreyi Sıfırla"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <AddCostForm 
        showForm={showForm} 
        setShowForm={setShowForm} 
        costs={costs}
      />

      <Card>
        <CostsTable costs={filteredCosts} />
      </Card>
    </div>
  );
};

export default Costs;