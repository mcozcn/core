
import { CommissionStaffItem } from "./CommissionStaffItem";

interface CommissionStaffListProps {
  staffCommissionData: any[];
}

export const CommissionStaffList = ({ staffCommissionData }: CommissionStaffListProps) => {
  return (
    <div className="space-y-6">
      {staffCommissionData.map((staffData) => (
        <CommissionStaffItem 
          key={staffData.staffId}
          staffData={staffData}
        />
      ))}
    </div>
  );
};
