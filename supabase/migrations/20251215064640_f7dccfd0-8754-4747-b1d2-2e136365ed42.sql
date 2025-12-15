-- Create group_schedules table for tracking member training schedules
CREATE TABLE public.group_schedules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    group_type TEXT NOT NULL CHECK (group_type IN ('A', 'B')),
    time_slot TEXT NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.group_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view all group_schedules" 
ON public.group_schedules 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage group_schedules" 
ON public.group_schedules 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_group_schedules_customer_id ON public.group_schedules(customer_id);
CREATE INDEX idx_group_schedules_time_slot ON public.group_schedules(time_slot);
CREATE INDEX idx_group_schedules_group_type ON public.group_schedules(group_type);