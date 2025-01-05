import React from 'react';
import { Card } from "@/components/ui/card";
import { Calendar, Users, DollarSign, Clock, Package } from "lucide-react";
import StatCard from './StatCard';
import UpcomingPayments from './UpcomingPayments';
import MonthlyFinancialSummary from './MonthlyFinancialSummary';
import { useQuery } from "@tanstack/react-query";
import { getCustomerRecords, getPayments, getCosts } from "@/utils/localStorage";

const DashboardOverview = () => {
  const { data: customerRecords = [] } = useQuery({
    queryKey: ['customerRecords'],
    queryFn: () => {
      console.log('Fetching customer records');
      return getCustomerRecords();
    }
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: () => {
      console.log('Fetching payments');
      return getPayments();
    }
  });

  const { data: costs = [] } = useQuery({
    queryKey: ['costs'],
    queryFn: () => {
      console.log('Fetching costs');
      return getCosts();
    }
  });

  console.log('Dashboard data:', { payments, customerRecords, costs });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UpcomingPayments records={customerRecords} />
        <MonthlyFinancialSummary 
          payments={payments} 
          customerRecords={customerRecords}
          costs={costs}
        />
      </div>
    </div>
  );
};

export default DashboardOverview;