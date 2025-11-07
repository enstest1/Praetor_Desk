import { useState, useEffect } from "react";
import {
  listAirdrops,
  createAirdrop,
  updateAirdrop,
  deleteAirdrop,
  listAirdropTypes,
  listAirdropDailyTasks,
  createAirdropDailyTask,
  markTaskDoneToday,
  type Airdrop,
  type AirdropType,
  type AirdropDailyTask,
} from "../api/airdrops";
import { PageHeader } from "../components/layout/PageHeader";
import { AirdropCard } from "../components/airdrop/AirdropCard";
import { NewAirdropModal } from "../components/airdrop/NewAirdropModal";

function AirdropsTab() {
  const [airdrops, setAirdrops] = useState<Airdrop[]>([]);
  const [types, setTypes] = useState<AirdropType[]>([]);
  const [dailyTasks, setDailyTasks] = useState<Record<number, AirdropDailyTask[]>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadAirdrops();
    loadTypes();
  }, []);

  const loadAirdrops = async () => {
    try {
      const data = await listAirdrops();
      setAirdrops(data);
      // Load daily tasks for each airdrop
      for (const airdrop of data) {
        loadDailyTasks(airdrop.id);
      }
    } catch (error) {
      console.error("Failed to load airdrops:", error);
    }
  };

  const loadTypes = async () => {
    try {
      const data = await listAirdropTypes();
      setTypes(data);
    } catch (error) {
      console.error("Failed to load airdrop types:", error);
    }
  };

  const loadDailyTasks = async (airdropId: number) => {
    try {
      const tasks = await listAirdropDailyTasks(airdropId);
      setDailyTasks((prev) => {
        const updated = { ...prev };
        updated[airdropId] = tasks;
        return updated;
      });
    } catch (error) {
      console.error("Failed to load daily tasks:", error);
      throw error;
    }
  };

  const handleCreate = async (data: Parameters<typeof createAirdrop>[0]) => {
    try {
      await createAirdrop(data);
      setShowAddModal(false);
      loadAirdrops();
    } catch (error) {
      console.error("Failed to create airdrop:", error);
      alert("Failed to create airdrop");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this airdrop?")) return;
    try {
      await deleteAirdrop(id);
      loadAirdrops();
    } catch (error) {
      console.error("Failed to delete airdrop:", error);
      alert("Failed to delete airdrop");
    }
  };

  const handleMarkTaskDone = async (taskId: number, airdropId: number) => {
    try {
      await markTaskDoneToday(taskId, airdropId);
      loadDailyTasks(airdropId);
    } catch (error) {
      console.error("Failed to mark task done:", error);
      alert("Failed to mark task as done");
    }
  };

  const handleAddTask = async (airdropId: number, title: string) => {
    try {
      const currentTasks = dailyTasks[airdropId] || [];
      const nextOrder = currentTasks.length > 0 
        ? Math.max(...currentTasks.map(t => t.order)) + 1 
        : 0;
      
      console.log("Creating task:", { airdropId, title, order: nextOrder });
      const taskId = await createAirdropDailyTask({
        airdrop_id: airdropId,
        title,
        order: nextOrder,
      });
      console.log("Task created with ID:", taskId);
      
      // Reload tasks immediately after creation
      await loadDailyTasks(airdropId);
      console.log("Tasks reloaded for airdrop:", airdropId);
    } catch (error) {
      console.error("Failed to create task:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Failed to create task: ${errorMessage}`);
      throw error; // Re-throw so UI can handle it
    }
  };

  const handleUpdateWallet = async (id: number, walletAddress: string) => {
    try {
      await updateAirdrop({ id, wallet_address: walletAddress });
      loadAirdrops();
    } catch (error) {
      console.error("Failed to update wallet address:", error);
      alert("Failed to update wallet address");
    }
  };

  const filteredAirdrops = airdrops.filter((airdrop) =>
    airdrop.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Airdrops"
        action={{
          label: "Add Airdrop",
          onClick: () => setShowAddModal(true),
        }}
      />

      {/* Search */}
      {airdrops.length > 0 && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search airdrops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-all duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      )}

      {/* Airdrops grid */}
      {filteredAirdrops.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAirdrops.map((airdrop) => (
            <AirdropCard
              key={airdrop.id}
              airdrop={airdrop}
              dailyTasks={dailyTasks[airdrop.id] || []}
              onDelete={handleDelete}
              onMarkTaskDone={handleMarkTaskDone}
              onUpdateWallet={handleUpdateWallet}
              onAddTask={handleAddTask}
              onReloadTasks={loadDailyTasks}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-slate-400">
            {searchQuery
              ? "No airdrops match your search."
              : "No airdrops yet. Click 'Add Airdrop' to get started."}
          </p>
        </div>
      )}

      <NewAirdropModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreate}
        types={types}
      />
    </div>
  );
}

export default AirdropsTab;
