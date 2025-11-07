import { useState } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";

interface NewAirdropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    url: string;
    chain?: string;
    airdrop_type_id?: number;
    notes?: string;
    wallet_address?: string;
    active: boolean;
  }) => void;
  types: Array<{ id: number; name: string }>;
}

export function NewAirdropModal({ isOpen, onClose, onSubmit, types }: NewAirdropModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    chain: "",
    airdrop_type_id: undefined as number | undefined,
    notes: "",
    wallet_address: "",
    active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (formData.url && !formData.url.match(/^https?:\/\/.+/)) {
      newErrors.url = "URL must start with http:// or https://";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        notes: formData.notes || undefined,
        chain: formData.chain || undefined,
        wallet_address: formData.wallet_address || undefined,
        airdrop_type_id: formData.airdrop_type_id || undefined,
      });
      setFormData({ name: "", url: "", chain: "", airdrop_type_id: undefined, notes: "", wallet_address: "", active: true });
      setErrors({});
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-panel p-6 shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-slate-100">
            Add Airdrop
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={clsx(
                "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100",
                "transition-all duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50",
                errors.name && "border-danger"
              )}
              placeholder="Airdrop name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-danger">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className={clsx(
                "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100",
                "transition-all duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50",
                errors.url && "border-danger"
              )}
              placeholder="https://..."
            />
            {errors.url && (
              <p className="mt-1 text-xs text-danger">{errors.url}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">Optional</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Chain
            </label>
            <input
              type="text"
              value={formData.chain}
              onChange={(e) => setFormData({ ...formData, chain: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 transition-all duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="EVM, Solana, Base, etc."
            />
            <p className="mt-1 text-xs text-slate-500">Optional</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Wallet Address
            </label>
            <input
              type="text"
              value={formData.wallet_address}
              onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 font-mono transition-all duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="0x... or address..."
            />
            <p className="mt-1 text-xs text-slate-500">Optional</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Airdrop Type
            </label>
            <select
              value={formData.airdrop_type_id || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  airdrop_type_id: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 transition-all duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">None</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">Optional</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 transition-all duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Optional notes"
            />
            <p className="mt-1 text-xs text-slate-500">Optional</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all duration-150 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

