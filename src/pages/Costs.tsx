
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
    <div className="p-4 md:p-8 md:pl-72 animate-fadeIn">
      <div className="mb-4 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-4xl font-serif">Masraf Yönetimi</h1>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Masraf Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[550px] max-h-[90vh] overflow-y-auto">
            <AddCostForm 
              showForm={showAddForm} 
              setShowForm={setShowAddForm} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
        <DatePickerWithRange date={dateRange} setDate={setDateRange} locale={tr} />
        <Button 
          variant="outline" 
          size="icon" 
          onClick={resetDateFilter} 
          title="Filtreyi Sıfırla"
          className="self-start"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4 md:space-y-8">
        {/* Dashboard Cards */}
        <CostsDashboard dateRange={dateRange} />
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          <CostsCategoryChart dateRange={dateRange} />
          <CostsTrendChart dateRange={dateRange} />
        </div>
        
        {/* Costs Table */}
        <Card className="p-3 md:p-6">
          <h2 className="text-base md:text-xl font-semibold mb-3 md:mb-4">Masraf Detayları</h2>
          <div className="overflow-x-auto -mx-3 md:mx-0">
            <div className="min-w-[600px] md:min-w-0 px-3 md:px-0">
              <CostsTable costs={filteredCosts} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Costs;
