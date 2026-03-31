"use client";

import { useEffect, useState } from "react";
import {
  getUserMemories,
  deleteMemory,
  deleteAllMemories,
} from "@/lib/actions/memory";
import { Trash2, Info, X, Check, Cloud } from "lucide-react"; // Using Lucide for a pro look

type Memory = {
  id: string;
  text: string;
};

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);

  const fetchMemories = async () => {
    setLoading(true);
    const data = await getUserMemories();
    setMemories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteMemory(id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
    setConfirmId(null);
  };

  const handleDeleteAll = async () => {
    await deleteAllMemories();
    setMemories([]);
    setConfirmAll(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-t-purple-500 border-blue-100 animate-spin" />
          <p className="text-slate-400 font-medium">Loading your Memories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-2xl mx-auto p-6 py-16">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-3">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Memories</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">
            {memories.length} Memories Saved
          </p>
        </div>

        {memories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-3xl">
            <Cloud className="text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-medium">No memories found yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {memories.map((m) => (
              <div
                key={m.id}
                className="group relative bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-purple-200 transition-all duration-300 rounded-2xl p-5 flex justify-between items-center hover:shadow-xl hover:shadow-purple-500/5"
              >
                <div className="flex-1">
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {m.text}
                  </p>
                </div>

                <div className="relative ml-4">
                  <button
                    onClick={() => setConfirmId(m.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>

                  {/* Individual Delete Popover */}
                  {confirmId === m.id && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 shadow-2xl rounded-2xl p-3 z-20 animate-in fade-in zoom-in-95">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter mb-3 px-1">
                        Delete memory?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmId(null)}
                          className="flex-1 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          Keep
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="flex-1 py-1.5 text-xs font-semibold bg-red-500 text-white rounded-lg transition-transform active:scale-95 shadow-lg shadow-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete All Section */}
        {memories.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
            <div className="relative">
              <button
                onClick={() => setConfirmAll(true)}
                className="px-6 py-3 text-sm font-bold text-red-500 hover:text-red-600 bg-red-50/50 hover:bg-red-50 border border-red-100 rounded-full transition-all duration-200 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Clear All Memories
              </button>

              {/* Delete All Overlay */}
              {confirmAll && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 bg-white border border-slate-200 shadow-2xl rounded-2xl p-5 text-center animate-in slide-in-from-bottom-4">
                  <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Info size={20} />
                  </div>
                  <h3 className="text-slate-900 font-bold mb-1">Clear everything?</h3>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    This action is permanent and cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmAll(false)}
                      className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAll}
                      className="flex-1 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-transform active:scale-95 shadow-md shadow-red-200"
                    >
                      Yes, Clear All
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}