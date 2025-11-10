import { useState, useEffect, useMemo, type CSSProperties } from "react";
import {
  listAirdrops,
  createAirdrop,
  updateAirdrop,
  deleteAirdrop,
  listAirdropTypes,
  listAirdropDailyTasks,
  createAirdropDailyTask,
  deleteAirdropDailyTask,
  markTaskDoneToday,
  reorderAirdrops,
  type Airdrop,
  type AirdropType,
  type AirdropDailyTask,
} from "../api/airdrops";
import { PageHeader } from "../components/layout/PageHeader";
import { AirdropCard } from "../components/airdrop/AirdropCard";
import { NewAirdropModal } from "../components/airdrop/NewAirdropModal";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function AirdropsTab() {
  const [airdrops, setAirdrops] = useState<Airdrop[]>([]);
  const [types, setTypes] = useState<AirdropType[]>([]);
  const [dailyTasks, setDailyTasks] = useState<Record<number, AirdropDailyTask[]>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  useEffect(() => {
    loadAirdrops();
    loadTypes();
  }, []);

  const canReorder = useMemo(() => searchQuery.trim().length === 0, [searchQuery]);

  const loadAirdrops = async () => {
    try {
      const data = await listAirdrops();
      setAirdrops(data);
      await Promise.all(data.map((airdrop) => loadDailyTasks(airdrop.id)));
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
      setDailyTasks((prev) => ({ ...prev, [airdropId]: tasks }));
    } catch (error) {
      console.error("Failed to load daily tasks:", error);
    }
  };

  const handleCreate = async (data: Parameters<typeof createAirdrop>[0]) => {
    try {
      await createAirdrop(data);
      setShowAddModal(false);
      await loadAirdrops();
    } catch (error) {
      console.error("Failed to create airdrop:", error);
      alert("Failed to create airdrop");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this airdrop?")) return;
    try {
      await deleteAirdrop(id);
      await loadAirdrops();
    } catch (error) {
      console.error("Failed to delete airdrop:", error);
      alert("Failed to delete airdrop");
    }
  };

  const handleMarkTaskDone = async (taskId: number, airdropId: number) => {
    try {
      await markTaskDoneToday(taskId, airdropId);
      await loadDailyTasks(airdropId);
    } catch (error) {
      console.error("Failed to mark task done:", error);
      alert("Failed to mark task as done");
    }
  };

  const handleAddTask = async (airdropId: number, title: string) => {
    try {
      const currentTasks = dailyTasks[airdropId] || [];
      const nextOrder = currentTasks.length > 0
        ? Math.max(...currentTasks.map((t) => t.order)) + 1
        : 0;

      await createAirdropDailyTask({
        airdrop_id: airdropId,
        title,
        order: nextOrder,
      });
      await loadDailyTasks(airdropId);
    } catch (error) {
      console.error("Failed to create task:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Failed to create task: ${errorMessage}`);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: number, airdropId: number) => {
    if (!confirm("Delete this daily task?")) {
      return;
    }

    try {
      await deleteAirdropDailyTask(taskId);
      await loadDailyTasks(airdropId);
    } catch (error) {
      console.error("Failed to delete daily task:", error);
      alert("Failed to delete daily task");
    }
  };

  const handleUpdateWallet = async (id: number, walletAddress: string) => {
    try {
      await updateAirdrop({ id, wallet_address: walletAddress });
      await loadAirdrops();
    } catch (error) {
      console.error("Failed to update wallet address:", error);
      alert("Failed to update wallet address");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!canReorder) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = airdrops.findIndex((item) => item.id === active.id);
    const newIndex = airdrops.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const newOrder = arrayMove(airdrops, oldIndex, newIndex).map((item, index) => ({
      ...item,
      position: index,
    }));

    setAirdrops(newOrder);

    try {
      await reorderAirdrops(newOrder.map(({ id }, index) => ({ id, position: index })));
    } catch (error) {
      console.error("Failed to reorder airdrops:", error);
      alert("Failed to reorder airdrops");
      await loadAirdrops();
    }
  };

  const filteredAirdrops = useMemo(
    () =>
      airdrops.filter((airdrop) =>
        airdrop.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [airdrops, searchQuery]
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

      {filteredAirdrops.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredAirdrops.map((item) => item.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAirdrops.map((airdrop) => (
                <SortableAirdropCard
                  key={airdrop.id}
                  airdrop={airdrop}
                  dailyTasks={dailyTasks[airdrop.id] || []}
                  onDelete={handleDelete}
                  onMarkTaskDone={handleMarkTaskDone}
                  onUpdateWallet={handleUpdateWallet}
                  onAddTask={handleAddTask}
                  onDeleteTask={handleDeleteTask}
                  onReloadTasks={loadDailyTasks}
                  disabled={!canReorder}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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

interface SortableCardProps {
  airdrop: Airdrop;
  dailyTasks: AirdropDailyTask[];
  onDelete: (id: number) => void;
  onMarkTaskDone: (taskId: number, airdropId: number) => void;
  onUpdateWallet: (id: number, walletAddress: string) => void;
  onAddTask: (airdropId: number, title: string) => Promise<void>;
  onDeleteTask: (taskId: number, airdropId: number) => Promise<void>;
  onReloadTasks: (airdropId: number) => Promise<void>;
  disabled: boolean;
}

function SortableAirdropCard({ disabled, ...props }: SortableCardProps) {
  const { airdrop } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: airdrop.id,
    disabled,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <AirdropCard {...props} isDragging={isDragging} />
    </div>
  );
}

export default AirdropsTab;
