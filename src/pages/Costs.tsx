import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AddCostForm from "@/components/costs/AddCostForm";
import CostsTable from "@/components/costs/CostsTable";
import { useQuery } from "@tanstack/react-query";
import { getCosts } from "@/utils/localStorage";

const Costs = () => {
  const [showForm, setShowForm] = useState(false);
  
  const { data: costs = [] } = useQuery({
    queryKey: ['costs'],
    queryFn: getCosts,
  });

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-serif">Maliyet Yönetimi</h1>
        <Button onClick={() => setShowForm(true)}>
          Yeni Maliyet Ekle
        </Button>
      </div>

      <AddCostForm 
        showForm={showForm} 
        setShowForm={setShowForm} 
        costs={costs}
      />

      <Card>
        <CostsTable costs={costs} />
      </Card>
    </div>
  );
};

export default Costs;