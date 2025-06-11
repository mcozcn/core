
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getCosts, setCosts, type Cost } from "@/utils/storage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AddCostFormProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
}

const AddCostForm = ({ showForm, setShowForm }: AddCostFormProps) => {
  const [costData, setCostData] = useState({
    name: '',
    amount: '',
    category: '',
    notes: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!costData.name || !costData.amount || !costData.category) {
        throw new Error("Lütfen tüm zorunlu alanları doldurun");
      }

      const costs = await getCosts();
      const newCost: Cost = {
        id: Date.now(),
        name: costData.name,
        amount: parseFloat(costData.amount),
        category: costData.category,
        date: new Date(),
        notes: costData.notes || undefined
      };

      const updatedCosts = [...costs, newCost];
      await setCosts(updatedCosts);
      queryClient.setQueryData(['costs'], updatedCosts);

      toast({
        title: "Masraf eklendi",
        description: `${costData.name} masrafı başarıyla eklendi.`,
      });

      // Reset form
      setCostData({
        name: '',
        amount: '',
        category: '',
        notes: ''
      });
      
      setShowForm(false);
    } catch (error) {
      console.error('Error adding cost:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error instanceof Error ? error.message : "Masraf eklenirken bir hata oluştu.",
      });
    }
  };

  const handleCancel = () => {
    setCostData({
      name: '',
      amount: '',
      category: '',
      notes: ''
    });
    setShowForm(false);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Yeni Masraf Ekle</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Masraf Açıklaması *</Label>
          <Input
            value={costData.name}
            onChange={(e) => setCostData({ ...costData, name: e.target.value })}
            placeholder="Masraf açıklaması"
            required
          />
        </div>

        <div>
          <Label>Tutar (₺) *</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={costData.amount}
            onChange={(e) => setCostData({ ...costData, amount: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <Label>Kategori *</Label>
          <Select value={costData.category} onValueChange={(value) => setCostData({ ...costData, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kira">Kira</SelectItem>
              <SelectItem value="elektrik">Elektrik</SelectItem>
              <SelectItem value="su">Su</SelectItem>
              <SelectItem value="internet">İnternet</SelectItem>
              <SelectItem value="malzeme">Malzeme</SelectItem>
              <SelectItem value="temizlik">Temizlik</SelectItem>
              <SelectItem value="pazarlama">Pazarlama</SelectItem>
              <SelectItem value="personel">Personel</SelectItem>
              <SelectItem value="vergi">Vergi</SelectItem>
              <SelectItem value="sigorta">Sigorta</SelectItem>
              <SelectItem value="bakım">Bakım/Onarım</SelectItem>
              <SelectItem value="diğer">Diğer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Notlar</Label>
          <Textarea
            value={costData.notes}
            onChange={(e) => setCostData({ ...costData, notes: e.target.value })}
            placeholder="Ek notlar (opsiyonel)"
            rows={2}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            Masraf Ekle
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            İptal
          </Button>
        </div>
      </form>
    </>
  );
};

export default AddCostForm;
