import { useState } from "react";
import { Rocket, Wallet, MoreVertical, Copy, Link2, CheckCircle2, Circle, Plus } from "lucide-react";
import { clsx } from "clsx";
import { StatusPill } from "../ui/StatusPill";
import { ChainBadge } from "../ui/ChainBadge";
import { Tooltip } from "../ui/Tooltip";
import type { Airdrop, AirdropDailyTask } from "../../api/airdrops";

interface AirdropCardProps {
  airdrop: Airdrop;
  dailyTasks: AirdropDailyTask[];
  onDelete: (id: number) => void;
  onMarkTaskDone: (taskId: number, airdropId: number) => void;
  onUpdateWallet: (id: number, walletAddress: string) => void;
  onAddTask: (airdropId: number, title: string) => Promise<void>;
  onReloadTasks: (airdropId: number) => Promise<void>;
}

const shortAddress = (addr: string) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "");

export function AirdropCard({
  airdrop,
  dailyTasks,
  onDelete,
  onMarkTaskDone,
  onUpdateWallet,
  onAddTask,
  onReloadTasks,
}: AirdropCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [walletInput, setWalletInput] = useState(airdrop.wallet_address || "");
  const [isEditingWallet, setIsEditingWallet] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  
  const today = new Date().toISOString().split("T")[0];
  const isDoneToday = (task: AirdropDailyTask) => task.done_dates.some((date) => date === today);
  
  const completedCount = dailyTasks.filter(isDoneToday).length;
  const totalCount = dailyTasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSaveWallet = () => {
    onUpdateWallet(airdrop.id, walletInput);
    setIsEditingWallet(false);
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    const titleToAdd = newTaskTitle.trim();
    setNewTaskTitle("");
    setIsAddingTask(false);
    
    try {
      await onAddTask(airdrop.id, titleToAdd);
      // Reload tasks after successful creation
      await onReloadTasks(airdrop.id);
    } catch (error) {
      console.error("Failed to add task:", error);
      alert(`Failed to add task: ${error}`);
      // Restore input on error
      setNewTaskTitle(titleToAdd);
      setIsAddingTask(true);
    }
  };

  const chain = airdrop.chain || "";
  const walletAddress = airdrop.wallet_address || "";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-soft transition-all duration-150 hover:bg-white/[0.07]">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20">
            <Rocket className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold tracking-tight text-slate-100">
                {airdrop.name}
              </h3>
              <StatusPill status={airdrop.active ? "active" : "paused"} />
              {chain && <ChainBadge chain={chain} />}
            </div>
            {airdrop.url && (
              <a
                href={airdrop.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-primary transition-colors"
              >
                <Link2 className="h-3 w-3" />
                {airdrop.url.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>

        {/* Kebab menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-xl border border-white/10 bg-panel shadow-soft">
              <button
                onClick={() => {
                  if (walletAddress) {
                    handleCopy(walletAddress);
                  }
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-white/5"
              >
                <Copy className="h-4 w-4" />
                Copy Address
              </button>
              <button
                onClick={() => {
                  onDelete(airdrop.id);
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-white/5"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Address Input */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-400">
          Wallet Address
        </label>
        {isEditingWallet ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveWallet();
                if (e.key === "Escape") {
                  setIsEditingWallet(false);
                  setWalletInput(airdrop.wallet_address || "");
                }
              }}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-slate-100 transition-all duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="0x... or address..."
              autoFocus
            />
            <button
              onClick={handleSaveWallet}
              className="rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-white transition-all duration-150 hover:bg-primary/90"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditingWallet(false);
                setWalletInput(airdrop.wallet_address || "");
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all duration-150 hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {walletAddress ? (
              <Tooltip content={copied ? "Copied!" : "Click to copy"}>
                <button
                  onClick={() => handleCopy(walletAddress)}
                  className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-mono text-slate-300 transition-colors hover:bg-white/10"
                >
                  <Wallet className="h-3 w-3" />
                  {shortAddress(walletAddress)}
                  {copied && <CheckCircle2 className="h-3 w-3 text-success" />}
                </button>
              </Tooltip>
            ) : (
              <span className="text-xs text-slate-500">No wallet address</span>
            )}
            <button
              onClick={() => setIsEditingWallet(true)}
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
              title="Edit wallet address"
            >
              <Wallet className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-slate-400">
            <span>Progress</span>
            <span>
              {completedCount} / {totalCount}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Tasks */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-medium text-slate-300">Daily Tasks</h4>
          <button
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>

        {/* Add Task Input */}
        {isAddingTask && (
          <div className="mb-2 flex flex-wrap gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddTask();
                }
                if (e.key === "Escape") {
                  setIsAddingTask(false);
                  setNewTaskTitle("");
                }
              }}
              className="flex-1 min-w-[200px] rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-100 transition-all duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Task title..."
              autoFocus
            />
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleAddTask}
                className="rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-white transition-all duration-150 hover:bg-primary/90 whitespace-nowrap"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle("");
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all duration-150 hover:bg-white/10 whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {dailyTasks.length === 0 && !isAddingTask ? (
          <p className="text-sm text-slate-500">No tasks yet. Click "Add" to create one.</p>
        ) : (
          <div className="space-y-2">
            {dailyTasks.map((task) => {
              const done = isDoneToday(task);
              return (
                <div
                  key={task.id}
                  className={clsx(
                    "flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-2.5 transition-all duration-150",
                    done && "opacity-60"
                  )}
                >
                  <button
                    onClick={() => !done && onMarkTaskDone(task.id, airdrop.id)}
                    className="shrink-0 text-slate-400 transition-colors hover:text-primary"
                  >
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </button>
                  <span
                    className={clsx(
                      "flex-1 text-sm text-slate-300",
                      done && "line-through"
                    )}
                  >
                    {task.title}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer meta */}
      {airdrop.notes && (
        <div className="mt-4 border-t border-white/5 pt-3">
          <p className="text-xs text-slate-500">{airdrop.notes}</p>
        </div>
      )}
    </div>
  );
}

