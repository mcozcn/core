import React from 'react';
import { Card } from "@/components/ui/card";
import { Calendar, Users, DollarSign, Clock, Package } from "lucide-react";
import StatCard from './StatCard';
import UpcomingPayments from './UpcomingPayments';
import MonthlyFinancialSummary from './MonthlyFinancialSummary';
import { useQuery } from "@tanstack/react-query";
import { getCustomerRecords, getPayments } from "@/utils/localStorage";

const DashboardOverview = () => {
  const { data: customerRecords = [] } = useQuery({
    queryKey: ['customerRecords'],
    queryFn: getCustomerRecords,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: getPayments,
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UpcomingPayments records={customerRecords} />
        <MonthlyFinancialSummary payments={payments} />
      </div>
    </div>
  );
};

export default DashboardOverview;