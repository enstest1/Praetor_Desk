import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Card, CardTitle, CardDescription, CardSection } from "../components/ui/Card";
import { listIdeas, createIdea, deleteIdea, type Idea } from "../api/ideas";

function IdeasTab() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIdea, setNewIdea] = useState({
    title: "",
    notes: "",
  });

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      const data = await listIdeas();
      setIdeas(data);
    } catch (error) {
      console.error("Failed to load ideas:", error);
    }
  };

  const handleCreate = async () => {
    if (!newIdea.title.trim()) {
      alert("Title is required");
      return;
    }

    try {
      await createIdea({
        title: newIdea.title.trim(),
        notes: newIdea.notes.trim() || undefined,
      });
      setNewIdea({ title: "", notes: "" });
      setShowAddForm(false);
      loadIdeas();
    } catch (error) {
      console.error("Failed to create idea:", error);
      alert("Failed to create idea");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this idea?")) return;
    try {
      await deleteIdea(id);
      loadIdeas();
    } catch (error) {
      console.error("Failed to delete idea:", error);
      alert("Failed to delete idea");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ideas"
        action={{
          label: showAddForm ? "Close" : "Add Idea",
          onClick: () => setShowAddForm((v) => !v),
        }}
      />

      {showAddForm && (
        <Card className="space-y-4">
          <div>
            <CardTitle>Capture a new idea</CardTitle>
            <CardDescription>Add notes to remember why it matters.</CardDescription>
          </div>
          <CardSection>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Title *</label>
              <input
                value={newIdea.title}
                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                placeholder="Idea title"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Notes</label>
              <textarea
                value={newIdea.notes}
                onChange={(e) => setNewIdea({ ...newIdea, notes: e.target.value })}
                placeholder="Optional context or next steps"
                rows={4}
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
              Save Idea
            </button>
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ideas.map((idea) => (
          <Card key={idea.id} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>{idea.title}</CardTitle>
                <CardDescription>
                  Created {new Date(idea.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <button
                onClick={() => handleDelete(idea.id)}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-xs font-medium text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {idea.notes && (
              <CardDescription className="text-sm text-slate-200">
                {idea.notes}
              </CardDescription>
            )}
          </Card>
        ))}
      </div>

      {ideas.length === 0 && !showAddForm && (
        <Card className="text-center text-sm text-slate-400">
          No ideas yet. Click "Add Idea" to get started.
        </Card>
      )}
    </div>
  );
}

export default IdeasTab;
