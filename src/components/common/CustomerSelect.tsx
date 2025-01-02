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

const CustomerSelect = ({ value, onValueChange }: CustomerSelectProps) => {
  const [open, setOpen] = useState(false);

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => {
      console.log('Fetching customers for select');
      return getCustomers();
    },
  });

  const selectedCustomer = customers.find(customer => customer.id.toString() === value);

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
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Müşteri ara..." className="h-9" />
          <CommandEmpty>Müşteri bulunamadı.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {customers.map((customer) => (
              <CommandItem
                key={customer.id}
                value={`${customer.name} ${customer.phone}`}
                onSelect={() => {
                  onValueChange(customer.id.toString());
                  setOpen(false);
                }}
              >
                {customer.name} - {customer.phone}
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === customer.id.toString() ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CustomerSelect;