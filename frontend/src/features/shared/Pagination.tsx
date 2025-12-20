// src/features/shared/Pagination.tsx
import React from "react";

export default function Pagination({ page, pageSize, total, onPage }: { page:number; pageSize:number; total:number; onPage:(p:number)=>void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center gap-2 mt-3">
      <button disabled={page<=1} onClick={()=>onPage(page-1)} className="px-3 py-1 bg-gray-200 rounded">Prev</button>
      <div>Page {page} / {pages}</div>
      <button disabled={page>=pages} onClick={()=>onPage(page+1)} className="px-3 py-1 bg-gray-200 rounded">Next</button>
    </div>
  );
}
