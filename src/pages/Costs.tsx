
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { RotateCcw, Plus } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, startOfDay, endOfDay } from "date-fns";
import AddCostForm from "@/components/costs/AddCostForm";
import CostsTable from "@/components/costs/CostsTable";
import CostsDashboard from "@/components/costs/CostsDashboard";
import CostsCategoryChart from "@/components/costs/CostsCategoryChart";
import CostsTrendChart from "@/components/costs/CostsTrendChart";
import { useQuery } from "@tanstack/react-query";
import { getCosts } from "@/utils/storage";
import { tr } from 'date-fns/locale';
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

const Costs = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 7)
  });
  const [showAddForm, setShowAddForm] = useState(false);

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

  // Filter costs by date range - include today
  const filteredCosts = costs.filter(cost => {
    if (!dateRange.from || !dateRange.to) return true;
    const costDate = new Date(cost.date);
    const fromDate = startOfDay(dateRange.from);
    const toDate = endOfDay(dateRange.to);
    return costDate >= fromDate && costDate <= toDate;
  });

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-serif">Masraf Yönetimi</h1>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Masraf Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <AddCostForm 
              showForm={showAddForm} 
              setShowForm={setShowAddForm} 
            />
          </DialogContent>
        </Dialog>
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

      <div className="space-y-8">
        {/* Dashboard Cards */}
        <CostsDashboard dateRange={dateRange} />
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CostsCategoryChart dateRange={dateRange} />
          <CostsTrendChart dateRange={dateRange} />
        </div>
        
        {/* Costs Table */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Masraf Detayları</h2>
          <CostsTable costs={filteredCosts} />
        </Card>
      </div>
    </div>
  );
};

export default Costs;
