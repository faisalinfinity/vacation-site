"use client";
import { format } from 'date-fns';
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; // Ensure you have a Switch component
import { toast } from "sonner";

export interface IInventoryItem {
  date: string; // ISO string format
  available: boolean;
}

interface InventoryManagementProps {
  productId: string;
}

const InventoryManagement: React.FC<InventoryManagementProps> = ({
  productId,
}) => {
  // Initialize selectedDate with the current date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [inventory, setInventory] = useState<IInventoryItem[]>([]);
  const [available, setAvailable] = useState<boolean>(true);

  // Fetch current inventory for the product
  useEffect(() => {
    const fetchInventory = async () => {
      const res = await fetch(`/api/products/${productId}/inventory`);
      if (res.ok) {
        const data = await res.json();
        setInventory(data.inventory);
      }
    };
    fetchInventory();
  }, [productId]);

  const handleDateChange = (
    value: Date | Date[] | null,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    // If value is null, default to today's date
    const newDate = Array.isArray(value)
      ? value[0]
      : value ?? new Date();
    setSelectedDate(newDate);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existing = inventory.find((item) => item.date.startsWith(dateStr));
    setAvailable(existing ? existing.available : true);
  };
  
  const handleSaveInventory = async () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    let newInventory = [...inventory];
    const index = newInventory.findIndex((item) =>
      item.date.startsWith(dateStr)
    );
    if (index !== -1) {
      newInventory[index].available = available;
    } else {
      newInventory.push({
        date: new Date(dateStr).toISOString(),
        available,
      });
    }
    const res = await fetch(`/api/products/${productId}/inventory`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inventory: newInventory }),
    });
    if (res.ok) {
      setInventory(newInventory);
      toast("Inventory updated successfully");
    } else {
      toast("Error updating inventory");
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-2">Inventory Management</h2>
      <Calendar onChange={handleDateChange} value={selectedDate} />
      {selectedDate && (
        <div className="mt-4 flex items-center space-x-4">
          <span>Available:</span>
          <Switch
            checked={available}
            onCheckedChange={(checked) => setAvailable(checked)}
          />
          <Button onClick={handleSaveInventory}>Save</Button>
        </div>
      )}
      <div className="mt-6">
        <h3 className="text-md font-semibold">Current Inventory</h3>
        <ul>
          {inventory.map((item) => (
            <li key={item.date}>
              {new Date(item.date).toLocaleDateString()} -{" "}
              {item.available ? "Available" : "Unavailable"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InventoryManagement;
