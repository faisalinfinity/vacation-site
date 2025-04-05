"use client";

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
  const [inventory, setInventory] = useState<IInventoryItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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

  // When a date is selected, check if it exists in inventory
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    const dateStr = date.toISOString().split("T")[0];
    const existing = inventory.find((item) => item.date.startsWith(dateStr));
    if (existing) {
      setAvailable(existing.available);
    } else {
      setAvailable(true);
    }
  };

  const handleSaveInventory = async () => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toISOString().split("T")[0];
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
      <Calendar
        onChange={handleDateChange}
        value={selectedDate || new Date()}
      />
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
