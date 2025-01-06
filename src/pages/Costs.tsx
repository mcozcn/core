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
import { tr } from 'date-fns/locale';

const Costs = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 7)
  });
  const [showForm, setShowForm] = useState(false);

  const { data: costs = [] } = useQuery({
    queryKey: ['costs'],
    queryFn: getCosts,
  });

  const resetDateFilter = () => {
    setDateRange({
      from: new Date(),
      to: addDays(new Date(), 7)
    });
  };

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-serif">Masraf Yönetimi</h1>
        <Button onClick={() => setShowForm(true)}>
          Yeni Masraf Ekle
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <DatePickerWithRange date={dateRange} setDate={setDateRange} locale={tr} />
        <Button 
          variant="outline" 
          size="icon" 
          onClick={resetDateFilter} 
          title="Filtreyi Sıfırla"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {showForm && (
        <AddCostForm 
          showForm={showForm} 
          setShowForm={setShowForm} 
          costs={costs}
        />
      )}
      <CostsTable costs={costs} />
    </div>
  );
};

export default Costs;