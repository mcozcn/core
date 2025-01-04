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
import { Search, User } from "lucide-react";
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
          className="w-full justify-between bg-white hover:bg-gray-50 border-2 border-gray-200"
          type="button"
        >
          {selectedCustomer ? (
            <div className="flex items-center gap-2 text-left">
              <User className="h-4 w-4 text-primary" />
              <div>
                <div className="font-medium">{selectedCustomer.name}</div>
                <div className="text-sm text-muted-foreground">{selectedCustomer.phone}</div>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">Müşteri seçin...</span>
          )}
          <Search className="ml-2 h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">Müşteri Seç</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="İsim veya telefon ile ara..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="pl-9 bg-accent/50"
            />
          </div>
          <ScrollArea className="h-[300px] rounded-md border border-input bg-accent/30 p-2">
            <div className="space-y-2">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Müşteri bulunamadı
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <Button
                    key={customer.id}
                    variant="ghost"
                    className="w-full justify-start hover:bg-accent transition-all duration-200"
                    onClick={() => {
                      onCustomerSelect(customer.id.toString());
                      setCustomerSearch('');
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.phone}</div>
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerSelectionDialog;