import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { type Customer } from "@/utils/localStorage";

interface CustomerSelectionDialogProps {
  customers: Customer[];
  selectedCustomer: Customer | undefined;
  customerSearch: string;
  setCustomerSearch: (search: string) => void;
  onCustomerSelect: (customerId: string) => void;
}

const CustomerSelectionDialog = ({
  customers,
  selectedCustomer,
  customerSearch,
  setCustomerSearch,
  onCustomerSelect,
}: CustomerSelectionDialogProps) => {
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch)
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          type="button"
        >
          {selectedCustomer ? (
            <span>{selectedCustomer.name} - {selectedCustomer.phone}</span>
          ) : (
            <span>Müşteri seçin...</span>
          )}
          <Search className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Müşteri Seç</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Müşteri ara..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
          />
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {filteredCustomers.map((customer) => (
                <Button
                  key={customer.id}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    onCustomerSelect(customer.id.toString());
                    setCustomerSearch('');
                  }}
                >
                  <div className="text-left">
                    <div>{customer.name}</div>
                    <div className="text-sm text-muted-foreground">{customer.phone}</div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerSelectionDialog;