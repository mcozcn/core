-- Üyelik Paketleri Tablosu
CREATE TABLE public.membership_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL DEFAULT 30,
  price DECIMAL(10,2) NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Müşteriler Tablosu
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  gender TEXT,
  birth_date DATE,
  address TEXT,
  notes TEXT,
  membership_package_id UUID REFERENCES public.membership_packages(id),
  membership_start_date DATE,
  membership_end_date DATE,
  group_number INTEGER,
  time_slot TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_debt DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Personel Tablosu
CREATE TABLE public.personnel (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'staff',
  hire_date DATE,
  salary DECIMAL(10,2),
  commission_rate DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Check-in Kayıtları Tablosu
CREATE TABLE public.check_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  check_out_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Vücut Ölçüleri Tablosu
CREATE TABLE public.body_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  weight DECIMAL(5,2),
  body_fat_percentage DECIMAL(5,2),
  muscle_mass DECIMAL(5,2),
  chest DECIMAL(5,2),
  waist DECIMAL(5,2),
  hips DECIMAL(5,2),
  arm DECIMAL(5,2),
  thigh DECIMAL(5,2),
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ödemeler Tablosu
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_type TEXT NOT NULL, -- 'installment', 'debt', 'membership'
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Giderler/Masraflar Tablosu
CREATE TABLE public.costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  cost_date DATE NOT NULL DEFAULT CURRENT_DATE,
  personnel_id UUID REFERENCES public.personnel(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Stok/Ürünler Tablosu
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  purchase_price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Satışlar Tablosu
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id),
  personnel_id UUID REFERENCES public.personnel(id),
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  sale_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Hizmetler Tablosu
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Hizmet Satışları Tablosu
CREATE TABLE public.service_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id),
  personnel_id UUID REFERENCES public.personnel(id),
  service_id UUID REFERENCES public.services(id),
  price DECIMAL(10,2) NOT NULL,
  sale_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.membership_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_sales ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view all membership_packages" ON public.membership_packages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage membership_packages" ON public.membership_packages FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view all customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage customers" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view all personnel" ON public.personnel FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage personnel" ON public.personnel FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view all check_ins" ON public.check_ins FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage check_ins" ON public.check_ins FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view all body_metrics" ON public.body_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage body_metrics" ON public.body_metrics FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view all payments" ON public.payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage payments" ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view all costs" ON public.costs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage costs" ON public.costs FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view all products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view all sales" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage sales" ON public.sales FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view all services" ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage services" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view all service_sales" ON public.service_sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage service_sales" ON public.service_sales FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_membership_packages_updated_at BEFORE UPDATE ON public.membership_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_personnel_updated_at BEFORE UPDATE ON public.personnel FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();