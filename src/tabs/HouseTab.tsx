import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Card, CardTitle, CardDescription, CardSection } from "../components/ui/Card";
import {
  listHouseItems,
  createHouseItem,
  updateHouseItem,
  deleteHouseItem,
  type HouseItem,
} from "../api/house";
import { clsx } from "clsx";

function HouseTab() {
  const [items, setItems] = useState<HouseItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    notes: "",
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await listHouseItems();
      setItems(data);
    } catch (error) {
      console.error("Failed to load house items:", error);
    }
  };

  const handleCreate = async () => {
    if (!newItem.title.trim()) {
      alert("Title is required");
      return;
    }

    try {
      await createHouseItem({
        title: newItem.title.trim(),
        notes: newItem.notes.trim() || undefined,
      });
      setNewItem({ title: "", notes: "" });
      setShowAddForm(false);
      loadItems();
    } catch (error) {
      console.error("Failed to create house item:", error);
      alert("Failed to create house item");
    }
  };

  const handleToggle = async (item: HouseItem) => {
    try {
      await updateHouseItem({
        id: item.id,
        done: !item.done,
      });
      loadItems();
    } catch (error) {
      console.error("Failed to update house item:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this item?")) return;
    try {
      await deleteHouseItem(id);
      loadItems();
    } catch (error) {
      console.error("Failed to delete house item:", error);
      alert("Failed to delete house item");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="House"
        action={{
          label: showAddForm ? "Close" : "Add Item",
          onClick: () => setShowAddForm((v) => !v),
        }}
      />

      {showAddForm && (
        <Card className="space-y-4">
          <div>
            <CardTitle>Add home task or reminder</CardTitle>
            <CardDescription>Keep track of chores, maintenance, or shopping.</CardDescription>
          </div>
          <CardSection>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Title *</label>
              <input
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Replace air filters"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Notes</label>
              <textarea
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                placeholder="Optional details"
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </CardSection>
          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Save Item
            </button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {items.map((item) => {
          const done = item.done;
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <button
                onClick={() => handleToggle(item)}
                className="mt-1 text-slate-400 transition hover:text-primary"
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </button>
              <div className="flex-1">
                <span
                  className={clsx(
                    "text-sm font-medium text-slate-200",
                    done && "line-through opacity-60"
                  )}
                >
                  {item.title}
                </span>
                {item.notes && (
                  <p className="mt-1 text-xs text-slate-400">{item.notes}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-xs text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>

      {items.length === 0 && !showAddForm && (
        <Card className="text-center text-sm text-slate-400">
          No house items yet. Click "Add Item" to get started.
        </Card>
      )}
    </div>
  );
}

export default HouseTab;
