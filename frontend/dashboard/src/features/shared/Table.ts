// src/features/shared/Table.tsx
import React from "react";

export default function Table({ columns, rows }: { columns: string[]; rows: React.ReactNode[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} className="p-2 text-left border-b">{c}</th>
            ))}
            <th className="p-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length + 1} className="p-4 text-center">No records</td></tr>
          ) : (
            rows.map((r, idx) => <tr key={idx}>{r}</tr>)
          )}
        </tbody>
      </table>
    </div>
  );
}
