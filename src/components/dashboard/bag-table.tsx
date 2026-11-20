"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "motion/react";
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  Download,
  Check,
  X,
  Trash2,
  MoreHorizontal,
} from "lucide-react";

export type ColumnDef = {
  key: string;
  label: string;
  numeric?: boolean;
};

export type TableRow = {
  id: string;
  status?: string;
  cells: Record<string, string | number>;
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03, delayChildren: 0.02 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  const isGreen = ["ACTIVE", "IN STOCK", "COMPLETED", "RESOLVED", "RECEIVED", "AMAN"].includes(s);
  const isAmber = ["RESTOCK", "PENDING", "PROCESSING", "REQUESTED", "DISPATCHED", "DRAFT", "KRITIS"].includes(s);
  const isRed = ["OUT OF STOCK", "CANCELLED", "RETURN"].includes(s);

  const colorClass = isGreen
    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
    : isAmber
      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
      : isRed
        ? "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
        : "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300 border-gray-200 dark:border-neutral-700";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${colorClass}`}>
      <span
        className={`size-1.5 rounded-full ${
          isGreen ? "bg-emerald-500" : isAmber ? "bg-amber-500 animate-pulse" : isRed ? "bg-red-500" : "bg-gray-400"
        }`}
      />
      {status}
    </span>
  );
}

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      aria-pressed={checked}
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors duration-150 cursor-pointer ${
        checked
          ? "border-gray-900 bg-gray-900 dark:border-neutral-100 dark:bg-neutral-100"
          : "border-gray-300 bg-white hover:border-gray-400 dark:border-neutral-600 dark:bg-neutral-900 dark:hover:border-neutral-500"
      }`}
    >
      {checked && (
        <Check
          size={11}
          className="text-white dark:text-neutral-900"
          strokeWidth={3}
        />
      )}
    </button>
  );
}

export function BagTable({
  columns,
  rows,
  onActionClick,
  searchPlaceholder = "Cari data...",
}: {
  columns: ColumnDef[];
  rows: TableRow[];
  onActionClick?: (actionText: string, row: TableRow) => void;
  searchPlaceholder?: string;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Distinct statuses
  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      if (r.status) set.add(r.status);
    });
    return ["ALL", ...Array.from(set)];
  }, [rows]);

  // Filter & Sort
  const filteredRows = useMemo(() => {
    let result = rows;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          Object.values(r.cells).some((v) => String(v).toLowerCase().includes(q)) ||
          r.status?.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "ALL") {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const av = sortKey === "status" ? (a.status ?? "") : (a.cells[sortKey] ?? "");
        const bv = sortKey === "status" ? (b.status ?? "") : (b.cells[sortKey] ?? "");
        const cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [rows, search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === pagedRows.length ? new Set() : new Set(pagedRows.map((r) => r.id)),
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar: Search & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-3">
        <div className="flex items-center gap-2.5 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl bg-gray-100 py-1.5 pl-8 pr-8 text-xs text-gray-800 outline-none placeholder:text-gray-400 dark:bg-neutral-800/80 dark:text-neutral-200"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {statusOptions.length > 2 && (
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "ALL" ? "Semua Status" : opt}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-neutral-400">
          <span>Total: <strong>{filteredRows.length}</strong> data</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="px-6">
        <div className="overflow-hidden overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-500">
                <th className="w-10 py-3 pl-4">
                  <Checkbox
                    checked={pagedRows.length > 0 && selected.size === pagedRows.length}
                    onChange={toggleAll}
                  />
                </th>
                {columns.map((c) => (
                  <th key={c.key} className="py-3 pr-4">
                    <button
                      type="button"
                      onClick={() => handleSort(c.key)}
                      className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-neutral-300 transition-colors cursor-pointer"
                    >
                      <span>{c.label}</span>
                      {sortKey === c.key ? (
                        sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      ) : (
                        <ChevronsUpDown size={11} className="opacity-30" />
                      )}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>

            <motion.tbody variants={stagger} initial="hidden" animate="visible">
              {pagedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="py-12 text-center text-xs text-gray-400 dark:text-neutral-500"
                  >
                    Tidak ada data yang cocok dengan pencarian atau filter Anda.
                  </td>
                </tr>
              ) : (
                pagedRows.map((r) => {
                  const isSelected = selected.has(r.id);

                  return (
                    <motion.tr
                      key={r.id}
                      variants={fadeUp}
                      onClick={() => toggleSelect(r.id)}
                      className={`border-b border-gray-50 text-xs transition-colors duration-150 dark:border-neutral-800/60 cursor-pointer ${
                        isSelected
                          ? "bg-gray-50/90 dark:bg-neutral-800/60 border-l-4 border-l-gray-900 dark:border-l-neutral-100"
                          : "hover:bg-gray-50/50 dark:hover:bg-neutral-800/40"
                      }`}
                    >
                      <td className="py-3 pl-4">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleSelect(r.id)}
                        />
                      </td>

                      {columns.map((c, i) => {
                        if (c.key === "status" && r.status) {
                          return (
                            <td key={c.key} className="py-3 pr-4">
                              <StatusBadge status={r.status} />
                            </td>
                          );
                        }

                        if (c.key === "action" || c.key === "tindakan" || c.label === "Tindakan") {
                          const actionText = String(r.cells[c.key] ?? "");
                          return (
                            <td key={c.key} className="py-2.5 pr-4">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onActionClick?.(actionText, r);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-800 dark:text-neutral-200 border border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600 transition-all shadow-2xs group cursor-pointer"
                              >
                                <span>{actionText}</span>
                                <ArrowUpRight
                                  size={13}
                                  className="text-gray-400 group-hover:text-gray-700 dark:group-hover:text-neutral-100 transition-colors"
                                />
                              </button>
                            </td>
                          );
                        }

                        const val = r.cells[c.key];
                        return (
                          <td
                            key={c.key}
                            className={`py-3 pr-4 ${
                              i === 0
                                ? "font-bold text-gray-900 dark:text-neutral-100"
                                : "text-gray-600 dark:text-neutral-400"
                            }`}
                          >
                            {val ?? "—"}
                          </td>
                        );
                      })}
                    </motion.tr>
                  );
                })
              )}
            </motion.tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-neutral-800 text-xs text-gray-500">
            <span>
              Menampilkan {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, filteredRows.length)} dari {filteredRows.length} data
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex size-7 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-neutral-800 dark:bg-neutral-900 cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-2 font-bold text-gray-800 dark:text-neutral-200">
                Halaman {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex size-7 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-neutral-800 dark:bg-neutral-900 cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar Pill */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
          >
            <span className="text-xs font-semibold text-gray-800 dark:text-neutral-200">
              {selected.size} Selected
            </span>
            <span className="h-3.5 w-px bg-gray-200 dark:bg-neutral-700" />
            <button
              type="button"
              className="text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100 cursor-pointer"
            >
              Apply Code
            </button>
            <button
              type="button"
              className="text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100 cursor-pointer"
            >
              Edit Info
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 cursor-pointer"
            >
              <Trash2 size={12} />
              Delete
            </button>
            <button
              type="button"
              className="flex h-5 w-5 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:text-neutral-500 dark:hover:bg-neutral-800"
            >
              <MoreHorizontal size={13} />
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="flex h-5 w-5 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
            >
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default BagTable;
