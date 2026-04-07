"use client";

import { useEffect, useState } from "react";
import { Brain, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAllMemories, deleteMemory, getUserMemories } from "@/lib/actions/memory";

type Memory = {
	id: string;
	text: string;
};

export default function MemoriesPage() {
	const [memories, setMemories] = useState<Memory[]>([]);
	const [loading, setLoading] = useState(true);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [deletingAll, setDeletingAll] = useState(false);

	const loadMemories = async () => {
		try {
			setLoading(true);
			const data = await getUserMemories();
			setMemories(data || []);
		} catch (error) {
			console.error(error);
			toast.error("Unable to load memories.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadMemories();
	}, []);

	const handleDeleteOne = async (id: string) => {
		try {
			setDeletingId(id);
			await deleteMemory(id);
			setMemories((prev) => prev.filter((m) => m.id !== id));
			toast.success("Memory deleted.");
		} catch (error) {
			console.error(error);
			toast.error("Unable to delete memory.");
		} finally {
			setDeletingId(null);
		}
	};

	const handleDeleteAll = async () => {
		try {
			setDeletingAll(true);
			await deleteAllMemories();
			setMemories([]);
			toast.success("All memories deleted.");
		} catch (error) {
			console.error(error);
			toast.error("Unable to delete all memories.");
		} finally {
			setDeletingAll(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-slate-50 p-4 md:p-8">
				<div className="max-w-3xl mx-auto space-y-6 animate-pulse">
					<div className="h-10 w-52 bg-slate-200 rounded" />
					<div className="h-5 w-80 bg-slate-200 rounded" />
					<div className="space-y-4">
						<div className="h-28 bg-white border rounded-2xl" />
						<div className="h-28 bg-white border rounded-2xl" />
						<div className="h-28 bg-white border rounded-2xl" />
					</div>
					<div className="inline-flex items-center gap-2 text-slate-600">
						<Loader2 className="h-4 w-4 animate-spin" />
						Loading memories...
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_50%_-20%,#e8f7ef_0%,#f8fafc_45%,#f8fafc_100%)] p-4 md:p-8">
			<div className="max-w-3xl mx-auto">
				<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
					<div>
						<h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Your Memories</h1>
						<p className="text-slate-600 mt-2">A clean timeline of your saved health context.</p>
					</div>

					{memories.length > 0 && (
						<button
							onClick={handleDeleteAll}
							disabled={deletingAll}
							className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white/90 backdrop-blur px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
						>
							{deletingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
							Delete All
						</button>
					)}
				</div>

				{memories.length === 0 ? (
					<div className="rounded-2xl border border-emerald-100 bg-white/85 backdrop-blur p-10 text-center shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
						<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
							<Brain className="h-7 w-7" />
						</div>
						<h2 className="text-xl font-semibold text-slate-900">No memories yet</h2>
						<p className="text-slate-600 mt-2">Memories will appear here as the assistant learns your preferences.</p>
					</div>
				) : (
					<div className="space-y-4">
						{memories.map((memory) => (
							<article
								key={memory.id}
								className="group rounded-2xl border border-emerald-100 bg-white/88 backdrop-blur px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all hover:shadow-[0_16px_35px_rgba(16,185,129,0.12)]"
							>
								<div className="flex items-start justify-between gap-3">
									<p className="text-slate-700 leading-relaxed text-[15px]">{memory.text}</p>
									<button
										onClick={() => handleDeleteOne(memory.id)}
										disabled={deletingId === memory.id}
										className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-red-600 hover:bg-red-50 disabled:opacity-60"
										aria-label="Delete memory"
									>
										{deletingId === memory.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
									</button>
								</div>
							</article>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
