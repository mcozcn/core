
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

export const exportBackup = async (): Promise<string> => {
  try {
    const backupData: BackupData = {
      version: '1.0',
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

    if (!backupData.version || !backupData.data) {
      throw new Error('Geçersiz yedekleme dosyası');
    }

    // Import all data
    await setCustomers(backupData.data.customers || []);
    await setCustomerRecords(backupData.data.customerRecords || []);
    await setAppointments(backupData.data.appointments || []);
    await setServices(backupData.data.services || []);
    await setServiceSales(backupData.data.serviceSales || []);
    await setStockItems(backupData.data.stockItems || []);
    await setSales(backupData.data.sales || []);
    await setCosts(backupData.data.costs || []);
    await setPayments(backupData.data.payments || []);
    await setUsers(backupData.data.users || []);
    await setPersonnel(backupData.data.personnel || []);
    await setPersonnelRecords(backupData.data.personnelRecords || []);
    await setStockMovements(backupData.data.stockMovements || []);

  } catch (error) {
    console.error('Import backup error:', error);
    throw new Error('Geri yükleme sırasında hata oluştu');
  }
};

export const refreshApplication = () => {
  // Force reload the entire application
  window.location.reload();
};
