"use client";

import { useEffect, useState } from "react";
import {
  getUserMemories,
  deleteMemory,
  deleteAllMemories,
} from "@/lib/actions/memory";

type Memory = {
  id: string;
  text: string;
};

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  // confirmation state
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

  // delete one
  const handleDelete = async (id: string) => {
    await deleteMemory(id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
    setConfirmId(null);
  };

  // delete all
  const handleDeleteAll = async () => {
    await deleteAllMemories();
    setMemories([]);
    setConfirmAll(false);
  };

  if (loading) {
    return <p className="p-6 text-center">Loading memories...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 py-8">
      <h1 className="text-2xl md:text-5xl font-bold mb-6"> Your Memories</h1>

      {memories.length === 0 ? (
        <p className="text-gray-500">No memories found.</p>
      ) : (
        <div className="space-y-4">
          {memories.map((m) => (
            <div
              key={m.id}
              className="relative border rounded-lg p-4 flex justify-between items-center"
            >
              <p className="text-sm pr-4">{m.text}</p>

              <div className="relative">
                <button
                  onClick={() => setConfirmId(m.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>

                {/* ✅ SMALL RIGHT-SIDE CONFIRMATION */}
                {confirmId === m.id && (
                  <div className="absolute right-0 top-8 w-44 bg-white border shadow-lg rounded-md p-3 text-xs z-10">
                    <p className="mb-2">Delete this memory?</p>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setConfirmId(null)}
                        className="text-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="text-red-500 font-medium"
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

      {/* DELETE ALL BUTTON */}
      {memories.length > 0 && (
        <div className="mt-6 relative">
          <button
            onClick={() => setConfirmAll(true)}
            className="bg-white border-gray-200 border-2 rounded-md text-red-800 px-4 py-2 rounded-md"
          >
            Delete All Memories
          </button>

          {/* ✅ RIGHT SIDE CONFIRM FOR DELETE ALL */}
          {confirmAll && (
            <div className="absolute right-0 mt-2 w-48 bg-white border shadow-lg rounded-md p-3 text-xs">
              <p className="mb-2">Delete ALL memories?</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirmAll(false)}
                  className="text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="text-red-500 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}