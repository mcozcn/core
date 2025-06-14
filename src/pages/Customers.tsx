
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCustomers, getCustomerRecords, getAppointments } from '@/utils/storage';
import CustomerDetailView from '@/components/customers/CustomerDetailView';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import EditCustomerForm from '@/components/customers/EditCustomerForm';
import CustomersHeader from '@/components/customers/CustomersHeader';
import CustomersStats from '@/components/customers/CustomersStats';
import CustomersTable from '@/components/customers/CustomersTable';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const { data: records = [] } = useQuery({
    queryKey: ['customerRecords'],
    queryFn: getCustomerRecords,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
  });

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleAddSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    setShowAddDialog(false);
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    setShowEditDialog(false);
  };

  const handleCustomerUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

  const handleCustomerDeleted = () => {
    setSelectedCustomerId(null);
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    queryClient.invalidateQueries({ queryKey: ['customerRecords'] });
  };

  const handleSelectCustomer = (customerId: number) => {
    setSelectedCustomerId(customerId);
  };

  const handleEditCustomer = (customerId: number) => {
    setSelectedCustomerId(customerId);
    setShowEditDialog(true);
  };

  return (
    <div className="p-6 pl-72 animate-fadeIn space-y-6">
      <CustomersHeader
        showAddDialog={showAddDialog}
        setShowAddDialog={setShowAddDialog}
        onAddSuccess={handleAddSuccess}
      />

      <CustomersStats customers={customers} records={records} />

      {selectedCustomer ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setSelectedCustomerId(null)}
              className="gap-2"
            >
              ← Müşteri Listesi
            </Button>
          </div>
          <CustomerDetailView 
            customer={selectedCustomer}
            onCustomerUpdated={handleCustomerUpdated}
            onCustomerDeleted={handleCustomerDeleted}
          />
        </div>
      ) : (
        <CustomersTable
          customers={customers}
          records={records}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSelectCustomer={handleSelectCustomer}
          onEditCustomer={handleEditCustomer}
          isLoading={isLoadingCustomers}
        />
      )}

      {/* Edit Customer Modal Dialog */}
      {selectedCustomer && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <EditCustomerForm
              customer={selectedCustomer}
              onSuccess={handleEditSuccess}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Customers;
