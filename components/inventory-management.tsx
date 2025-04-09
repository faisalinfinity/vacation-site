"use client";

import { format } from "date-fns";
import type React from "react";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch current inventory for the product
  useEffect(() => {
    const fetchInventory = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products/${productId}/inventory`);
        if (res.ok) {
          const data = await res.json();
          setInventory(data.inventory || []);

          // Check if the current selected date is in inventory
          const dateStr = format(selectedDate, "yyyy-MM-dd");
          const existing = data.inventory.find((item: IInventoryItem) =>
            item.date.startsWith(dateStr)
          );
          setAvailable(existing ? existing.available : true);
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInventory();
  }, [productId, selectedDate]);

  const handleDateChange = (value: Date | Date[] | null) => {
    // If value is null, default to today's date
    const newDate = Array.isArray(value) ? value[0] : value ?? new Date();
    setSelectedDate(newDate);

    const dateStr = format(newDate, "yyyy-MM-dd");
    const existing = inventory.find((item) => item.date.startsWith(dateStr));
    setAvailable(existing ? existing.available : true);
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    const dateStr = format(date, "yyyy-MM-dd");
    const inventoryItem = inventory.find((item) =>
      item.date.startsWith(dateStr)
    );

    if (inventoryItem) {
      return inventoryItem.available
        ? "bg-teal-100 text-teal-800"
        : "bg-gray-100 text-gray-400";
    }

    return null;
  };

  const handleSaveInventory = async () => {
    setIsSaving(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const newInventory = [...inventory];
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

    try {
      const res = await fetch(`/api/products/${productId}/inventory`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventory: newInventory }),
      });

      if (res.ok) {
        setInventory(newInventory);
        toast("Availability updated successfully");
      } else {
        toast("Failed to update availability");
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast("Failed to update availability");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              </div>
            ) : (
              <div className="calendar-container">
                <style jsx global>{`
                  .react-calendar {
                    width: 100%;
                    border: none;
                    font-family: inherit;
                  }
                  .react-calendar__tile {
                    height: 60px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                  }
                  .react-calendar__tile--active {
                    background: #0d9488 !important;
                    color: white !important;
                  }
                  .react-calendar__tile:enabled:hover,
                  .react-calendar__tile:enabled:focus {
                    background-color: #f0fdfa;
                  }
                  .react-calendar__month-view__days__day--weekend {
                    color: inherit;
                  }
                  .react-calendar__month-view__weekdays {
                    text-transform: uppercase;
                    font-weight: bold;
                  }
                  .react-calendar__navigation button:enabled:hover,
                  .react-calendar__navigation button:enabled:focus {
                    background-color: #f0fdfa;
                  }
                `}</style>
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  tileClassName={tileClassName}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Selected Date</h3>
            <p className="text-xl font-bold mb-6">
              {format(selectedDate, "MMMM d, yyyy")}
            </p>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="availability-toggle" className="font-medium">
                  Available for booking
                </Label>
                <Switch
                  id="availability-toggle"
                  checked={available}
                  onCheckedChange={(checked) => setAvailable(checked)}
                />
              </div>

              <Button
                onClick={handleSaveInventory}
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save Availability"}
              </Button>
            </div>

            <div className="mt-8">
              <h4 className="font-medium mb-3">Recent Updates</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {inventory.length > 0 ? (
                  inventory
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .slice(0, 10)
                    .map((item, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-md text-sm flex justify-between items-center ${
                          item.available
                            ? "bg-teal-50 text-teal-800"
                            : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        <span>
                          {format(new Date(item.date), "MMM d, yyyy")}
                        </span>
                        <span>
                          {item.available ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    No availability data yet
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryManagement;
