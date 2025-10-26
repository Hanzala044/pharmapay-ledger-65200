import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Party {
  id: string;
  name: string;
}

interface PartyManagementProps {
  parties: Party[];
  onPartyChange: () => void;
}

export function PartyManagement({ parties, onPartyChange }: PartyManagementProps) {
  const { role } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [partyName, setPartyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partyToDelete, setPartyToDelete] = useState<Party | null>(null);

  const handleOpenDialog = (party?: Party) => {
    if (party) {
      setEditingParty(party);
      setPartyName(party.name);
    } else {
      setEditingParty(null);
      setPartyName("");
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingParty(null);
    setPartyName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!partyName.trim()) {
      toast.error("Party name is required");
      return;
    }

    setLoading(true);

    try {
      if (editingParty) {
        // Update existing party
        const { error } = await supabase
          .from("parties")
          .update({ name: partyName.trim() })
          .eq("id", editingParty.id);

        if (error) throw error;
        toast.success("Party updated successfully");
      } else {
        // Create new party
        const { error } = await supabase
          .from("parties")
          .insert([{ name: partyName.trim() }]);

        if (error) {
          if (error.code === "23505") {
            toast.error("A party with this name already exists");
          } else {
            throw error;
          }
          return;
        }
        toast.success("Party created successfully");
      }

      handleCloseDialog();
      onPartyChange();
    } catch (error: any) {
      toast.error("Failed to save party: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (party: Party) => {
    setPartyToDelete(party);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!partyToDelete) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("parties")
        .delete()
        .eq("id", partyToDelete.id);

      if (error) {
        if (error.code === "23503") {
          toast.error("Cannot delete party with existing transactions");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Party deleted successfully");
      setDeleteDialogOpen(false);
      setPartyToDelete(null);
      onPartyChange();
    } catch (error: any) {
      toast.error("Failed to delete party: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Manage Parties</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Party
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingParty ? "Edit Party" : "Add New Party"}
                </DialogTitle>
                <DialogDescription>
                  {editingParty
                    ? "Update the party name below."
                    : "Enter the name of the pharmaceutical business."}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="partyName">Party Name</Label>
                <Input
                  id="partyName"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="e.g., ISHA PHARMA"
                  className="mt-2 glass-card border-border/50"
                  required
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingParty ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {parties.map((party) => (
          <div
            key={party.id}
            className="flex items-center justify-between p-3 glass-card border-border/50 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <span className="font-medium">{party.name}</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenDialog(party)}
                className="hover:bg-primary/10"
              >
                <Edit className="h-4 w-4" />
              </Button>
              {role === "owner" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(party)}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{partyToDelete?.name}</strong>.
              This action cannot be undone. Note: You cannot delete a party with existing transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
