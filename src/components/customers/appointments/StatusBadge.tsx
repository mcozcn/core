
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline">Bekliyor</Badge>;
    case 'confirmed':
      return <Badge variant="default" className="bg-green-500">Onaylandı</Badge>;
    case 'cancelled':
      return <Badge variant="destructive">İptal Edildi</Badge>;
    default:
      return null;
  }
};

export default StatusBadge;
