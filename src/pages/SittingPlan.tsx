import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useGuests } from "@/hooks/useGuests";
import { useTables } from "@/hooks/useTables";
import { TableCard } from "@/components/table/TableCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportGuestsToCSV, exportGuestsToXLSX } from "@/utils/guestExportUtils";

export default function SittingPlan() {
  const [newTableName, setNewTableName] = useState("");
  const { toast } = useToast();
  const { guests, guestsLoading, assignGuestToTable } = useGuests();
  const { tables, tablesLoading, addTable, deleteTable, updateTable } = useTables();

  const handleAddTable = async () => {
    if (!newTableName.trim()) {
      toast({
        title: "Error",
        description: "Table name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await addTable.mutateAsync(newTableName);
      setNewTableName("");
      toast({
        title: "Success",
        description: "Table added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add table",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTable = async (id: number) => {
    try {
      const tableGuests = guests.filter(guest => guest.tableId === id);
      await Promise.all(
        tableGuests.map(guest => 
          assignGuestToTable.mutateAsync({ guestId: guest.id, tableId: null })
        )
      );
      
      await deleteTable.mutateAsync(id);
      toast({
        title: "Success",
        description: "Table deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete table",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTableName = async (tableId: number, newName: string) => {
    try {
      await updateTable.mutateAsync({ id: tableId, name: newName });
      toast({
        title: "Success",
        description: "Table name updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update table name",
        variant: "destructive",
      });
    }
  };

  const handleAssignGuest = async (tableId: number, guestId: string) => {
    try {
      await assignGuestToTable.mutateAsync({ 
        guestId: parseInt(guestId), 
        tableId 
      });
      toast({
        title: "Success",
        description: "Guest assigned to table successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign guest to table",
        variant: "destructive",
      });
    }
  };

  const handleRemoveGuest = async (tableId: number, guestId: number) => {
    try {
      await assignGuestToTable.mutateAsync({ 
        guestId, 
        tableId: null 
      });
      toast({
        title: "Success",
        description: "Guest removed from table successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove guest from table",
        variant: "destructive",
      });
    }
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    try {
      switch (format) {
        case 'csv':
          exportGuestsToCSV(guests, tables);
          break;
        case 'xlsx':
          exportGuestsToXLSX(guests, tables);
          break;
      }
      toast({
        title: "Success",
        description: `Sitting plan exported as ${format.toUpperCase()} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to export sitting plan as ${format.toUpperCase()}`,
        variant: "destructive",
      });
    }
  };

  if (guestsLoading || tablesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 md:ml-64 p-2 md:p-8 pt-16 md:pt-8">
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl md:text-3xl font-serif text-wedding-purple">
                Seating Plan
              </h1>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-2">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end"
                  className="bg-white border border-input shadow-md min-w-[8rem] z-50"
                >
                  <DropdownMenuItem 
                    onClick={() => handleExport('csv')}
                    className="hover:bg-gray-100"
                  >
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleExport('xlsx')}
                    className="hover:bg-gray-100"
                  >
                    Export as Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm space-y-4">
              <Input
                placeholder="Table Name"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                className="max-w-md"
              />
              <Button 
                onClick={handleAddTable} 
                className="w-full max-w-md bg-wedding-purple hover:bg-wedding-purple/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Table
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {tables.map((table) => (
                <TableCard
                  key={table.id}
                  table={table}
                  guests={guests}
                  onDeleteTable={handleDeleteTable}
                  onAssignGuest={handleAssignGuest}
                  onRemoveGuest={handleRemoveGuest}
                  onUpdateTableName={handleUpdateTableName}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}