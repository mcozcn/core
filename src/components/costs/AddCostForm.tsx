
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getCosts, setCosts, type Cost } from "@/utils/localStorage";

interface AddCostFormProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  costs: Cost[];
}

const AddCostForm = ({ showForm, setShowForm, costs }: AddCostFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newCost: Cost = {
        id: Date.now(),
        description: formData.description,
        amount: Number(formData.amount),
        category: formData.category,
        date: new Date(formData.date),
      };

      const updatedCosts = [...costs, newCost];
      setCosts(updatedCosts);
      queryClient.setQueryData(['costs'], updatedCosts);

      console.log('Cost item saved:', newCost);

      toast({
        title: "Başarıyla kaydedildi",
        description: `${newCost.description} maliyet listenize eklendi.`,
      });

      setFormData({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error saving cost:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.",
      });
    }
  };

  if (!showForm) return null;

  return (
    <Card className="p-6 mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Açıklama</Label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Maliyet açıklamasını girin"
            required
          />
        </div>

        <div>
          <Label>Tutar (₺)</Label>
          <Input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="Maliyet tutarını girin"
            required
          />
        </div>

        <div>
          <Label>Kategori</Label>
          <Input
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Maliyet kategorisini girin"
            required
          />
        </div>

        <div>
          <Label>Tarih</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            Kaydet
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowForm(false)}
          >
            İptal
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AddCostForm;
