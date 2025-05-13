
/**
 * Format phone number for WhatsApp use by removing non-numeric characters
 */
export const formatPhoneForWhatsApp = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * Create a WhatsApp message link for sharing appointment details
 */
export const createAppointmentWhatsAppLink = (
  phone: string, 
  appointmentData: { 
    service: string; 
    date: string; 
    time: string; 
    staffName: string;
    status: 'pending' | 'confirmed' | 'cancelled';
  }
): string => {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  if (!formattedPhone) return '';
  
  const { service, date, time, staffName, status } = appointmentData;
  
  // Format date as DD.MM.YYYY
  const formattedDate = new Date(date).toLocaleDateString('tr-TR');
  
  let statusText = '';
  switch(status) {
    case 'confirmed':
      statusText = 'onaylandı';
      break;
    case 'cancelled':
      statusText = 'iptal edildi';
      break;
    default:
      statusText = 'beklemede';
      break;
  }
  
  const message = encodeURIComponent(
    `Merhaba,\n\n` +
    `Randevu bilgileriniz:\n` +
    `Hizmet: ${service}\n` +
    `Tarih: ${formattedDate}\n` +
    `Saat: ${time}\n` +
    `Personel: ${staffName}\n` +
    `Durum: ${statusText}\n\n` +
    `Randevunuz için teşekkür ederiz.`
  );
  
  return `https://wa.me/${formattedPhone}?text=${message}`;
};
