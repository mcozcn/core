
import { getCustomers, getCustomerRecords } from './storage/customers';
import { getAppointments } from './storage/appointments';
import { getServices, getServiceSales } from './storage/services';
import { getStockItems, getSales } from './storage/stock';
import { getCosts } from './storage/costs';
import { getPayments } from './storage/payments';
import { getUsers } from './storage/users';
import { getPersonnel, getPersonnelRecords } from './storage/personnel';
import { getStockMovements } from './storage/stockMovements';

import { setCustomers, setCustomerRecords } from './storage/customers';
import { setAppointments } from './storage/appointments';
import { setServices, setServiceSales } from './storage/services';
import { setStockItems, setSales } from './storage/stock';
import { setCosts } from './storage/costs';
import { setPayments } from './storage/payments';
import { setUsers } from './storage/users';
import { setPersonnel, setPersonnelRecords } from './storage/personnel';
import { setStockMovements } from './storage/stockMovements';

export interface BackupData {
  version: string;
  timestamp: string;
  data: {
    customers: any[];
    customerRecords: any[];
    appointments: any[];
    services: any[];
    serviceSales: any[];
    stockItems: any[];
    sales: any[];
    costs: any[];
    payments: any[];
    users: any[];
    personnel: any[];
    personnelRecords: any[];
    stockMovements: any[];
  };
}

// Eski veri formatlarını yeni formata dönüştürme fonksiyonları
const migrateCustomerRecords = (records: any[]): any[] => {
  return records.map(record => ({
    ...record,
    recordType: record.recordType || (record.type === 'payment' ? 'payment' : 'debt'),
    date: record.date instanceof Date ? record.date : new Date(record.date),
    dueDate: record.dueDate ? (record.dueDate instanceof Date ? record.dueDate : new Date(record.dueDate)) : undefined,
    isPaid: record.isPaid !== undefined ? record.isPaid : false
  }));
};

const migrateAppointments = (appointments: any[]): any[] => {
  return appointments.map(appointment => ({
    ...appointment,
    date: typeof appointment.date === 'string' ? appointment.date : appointment.date?.toISOString?.() || new Date().toISOString(),
    createdAt: appointment.createdAt instanceof Date ? appointment.createdAt : new Date(appointment.createdAt || Date.now())
  }));
};

const migrateStockItems = (items: any[]): any[] => {
  return items.map(item => ({
    ...item,
    name: item.name || item.productName || 'Ürün',
    productName: item.productName || item.name || 'Ürün',
    id: item.id || item.productId || Date.now(),
    productId: item.productId || item.id || Date.now(),
    lastUpdated: item.lastUpdated instanceof Date ? item.lastUpdated : new Date(item.lastUpdated || Date.now()),
    createdAt: item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt || Date.now())
  }));
};

const migrateSales = (sales: any[]): any[] => {
  return sales.map(sale => ({
    ...sale,
    saleDate: sale.saleDate instanceof Date ? sale.saleDate : new Date(sale.saleDate || sale.date || Date.now()),
    totalPrice: sale.totalPrice || sale.total || (sale.unitPrice * sale.quantity),
    total: sale.total || sale.totalPrice || (sale.unitPrice * sale.quantity)
  }));
};

const migratePersonnel = (personnel: any[]): any[] => {
  return personnel.map(person => ({
    ...person,
    isActive: person.isActive !== undefined ? person.isActive : true,
    commissionRate: person.commissionRate || 0,
    createdAt: person.createdAt instanceof Date ? person.createdAt : new Date(person.createdAt || Date.now()),
    updatedAt: person.updatedAt instanceof Date ? person.updatedAt : new Date(person.updatedAt || Date.now())
  }));
};

export const exportBackup = async (): Promise<string> => {
  try {
    const backupData: BackupData = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: {
        customers: await getCustomers(),
        customerRecords: await getCustomerRecords(),
        appointments: await getAppointments(),
        services: await getServices(),
        serviceSales: await getServiceSales(),
        stockItems: await getStockItems(),
        sales: await getSales(),
        costs: await getCosts(),
        payments: await getPayments(),
        users: await getUsers(),
        personnel: await getPersonnel(),
        personnelRecords: await getPersonnelRecords(),
        stockMovements: await getStockMovements(),
      }
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    
    // Create download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `salon_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return jsonString;
  } catch (error) {
    console.error('Export backup error:', error);
    throw new Error('Yedekleme sırasında hata oluştu');
  }
};

export const importBackup = async (file: File): Promise<void> => {
  try {
    const text = await file.text();
    const backupData: BackupData = JSON.parse(text);

    if (!backupData.data) {
      throw new Error('Geçersiz yedekleme dosyası');
    }

    console.log('Importing backup version:', backupData.version);

    // Veri migrasyon işlemleri
    const migratedCustomerRecords = migrateCustomerRecords(backupData.data.customerRecords || []);
    const migratedAppointments = migrateAppointments(backupData.data.appointments || []);
    const migratedStockItems = migrateStockItems(backupData.data.stockItems || []);
    const migratedSales = migrateSales(backupData.data.sales || []);
    const migratedPersonnel = migratePersonnel(backupData.data.personnel || []);

    // Import all data with migration
    await setCustomers(backupData.data.customers || []);
    await setCustomerRecords(migratedCustomerRecords);
    await setAppointments(migratedAppointments);
    await setServices(backupData.data.services || []);
    await setServiceSales(backupData.data.serviceSales || []);
    await setStockItems(migratedStockItems);
    await setSales(migratedSales);
    await setCosts(backupData.data.costs || []);
    await setPayments(backupData.data.payments || []);
    await setUsers(backupData.data.users || []);
    await setPersonnel(migratedPersonnel);
    await setPersonnelRecords(backupData.data.personnelRecords || []);
    await setStockMovements(backupData.data.stockMovements || []);

    console.log('Backup imported successfully with migrations');

  } catch (error) {
    console.error('Import backup error:', error);
    throw new Error('Geri yükleme sırasında hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
  }
};

export const refreshApplication = () => {
  // Force reload the entire application
  window.location.reload();
};
