import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/utils/localStorage";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const CustomerSelect = ({ value = '', onValueChange }: CustomerSelectProps) => {
  const [open, setOpen] = useState(false);

  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log('Fetching customers for select');
      try {
        const result = await getCustomers();
        console.log('Fetched customers:', result);
        return result || [];
      } catch (err) {
        console.error('Error fetching customers:', err);
        return [];
      }
    },
    initialData: [], // Ensure we always have an array
  });

  const selectedCustomer = customers.find(customer => customer.id.toString() === value);

  if (isLoading) {
    return (
      <Button variant="outline" className="w-full justify-between" disabled>
        <span>Yükleniyor...</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  if (error) {
    console.error('Customer select error:', error);
    return (
      <Button variant="outline" className="w-full justify-between text-red-500" disabled>
        <span>Hata oluştu</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCustomer ? `${selectedCustomer.name} - ${selectedCustomer.phone}` : "Müşteri seçin..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Müşteri ara..." />
          <CommandEmpty>Müşteri bulunamadı.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {customers.map((customer) => (
              <CommandItem
                key={customer.id}
                value={customer.name}
                onSelect={() => {
                  onValueChange(customer.id.toString());
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === customer.id.toString() ? "opacity-100" : "opacity-0"
                  )}
                />
                {customer.name} - {customer.phone}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CustomerSelect;