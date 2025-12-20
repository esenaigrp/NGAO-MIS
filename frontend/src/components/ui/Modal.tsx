// src/components/ui/Modal.tsx
import React from "react";

export default function Modal({ open, onClose, children, title }: { open:boolean; onClose: ()=>void; children:React.ReactNode; title?:string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="w-full max-w-2xl p-4 bg-white rounded shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="px-2 py-1">Close</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
