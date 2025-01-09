import { Button } from "@/components/ui/button";
import { Edit2, Trash2, User, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGuests } from "@/hooks/useGuests";
import { Guest } from "@/components/project/types";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGuestCategories } from "@/hooks/useGuestCategories";

interface GuestListProps {
  guests: Guest[];
  onEditGuest: (guest: Guest) => void;
}

export const GuestListComponent = ({ guests, onEditGuest }: GuestListProps) => {
  const { deleteGuest, updateGuest } = useGuests();
  const { categories } = useGuestCategories();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string>("");

  const handleDeleteGuest = async (id: number) => {
    try {
      await deleteGuest.mutateAsync(id);
      toast({
        title: "Success",
        description: "Guest deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete guest",
        variant: "destructive",
      });
    }
  };

  const startEditing = (guest: Guest) => {
    setEditingId(guest.id);
    setEditingName(guest.name);
    setEditingCategoryId(guest.category_id.toString());
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
    setEditingCategoryId("");
  };

  const saveEdit = async (guest: Guest) => {
    if (!editingName.trim()) {
      toast({
        title: "Error",
        description: "Guest name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (!editingCategoryId) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateGuest.mutateAsync({
        id: guest.id,
        name: editingName.trim(),
        categoryId: Number(editingCategoryId),
      });
      toast({
        title: "Success",
        description: "Guest updated successfully",
      });
      setEditingId(null);
      setEditingName("");
      setEditingCategoryId("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update guest",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-8 space-y-4">
      {guests.map((guest) => (
        <div
          key={guest.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <User className="text-wedding-purple" />
            <div className="space-y-2">
              {editingId === guest.id ? (
                <>
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-48"
                    autoFocus
                  />
                  <Select
                    value={editingCategoryId}
                    onValueChange={setEditingCategoryId}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <>
                  <h3 className="font-medium">{guest.name}</h3>
                  <div className="text-sm text-gray-500">
                    Category: {guest.category}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            {editingId === guest.id ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => saveEdit(guest)}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={cancelEditing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => startEditing(guest)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteGuest(guest.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};