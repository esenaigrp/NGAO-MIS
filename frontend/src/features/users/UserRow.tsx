// src/features/users/UsersRow.tsx
import React from "react";
import type { User } from "../../store/slices/usersSlice";

export default function UsersRow({ user, onEdit, onDelete }: { user: User; onEdit:(u:User)=>void; onDelete:(id:string)=>void }) {
  return (
    <>
      <td className="p-2 border-b">{user.email}</td>
      <td className="p-2 border-b">{(user.first_name || "") + " " + (user.last_name || "")}</td>
      <td className="p-2 border-b">{user.role}</td>
      <td className="p-2 border-b">{user.admin_unit}</td>
      <td className="p-2 border-b">
        <button onClick={()=>onEdit(user)} className="px-2 py-1 mr-2 bg-yellow-400 rounded">Edit</button>
        <button onClick={()=>user.user_id && onDelete(user.user_id)} className="px-2 py-1 text-white bg-red-500 rounded">Delete</button>
      </td>
    </>
  );
}
