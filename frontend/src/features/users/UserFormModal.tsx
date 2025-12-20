// src/features/users/UserFormModal.tsx
import React, { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import { useDispatch } from "react-redux";
import { createUser, updateUser } from "../../store/slices/usersSlice";
import type { AppDispatch } from "../../store";

export default function UserFormModal({ open, onClose, editing }: { open:boolean; onClose:()=>void; editing?: any }) {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [role, setRole] = useState("");

  useEffect(()=> {
    if (editing) {
      setEmail(editing.email || "");
      setFirstName(editing.first_name || "");
      setLastName(editing.last_name || "");
      setRole(editing.role || "");
    } else {
      setEmail(""); setFirstName(""); setLastName(""); setRole("");
    }
  }, [editing, open]);

  const save = async (e:any) => {
    e.preventDefault();
    const payload = { email, first_name, last_name, role };
    if (editing?.user_id) {
      await dispatch(updateUser({ id: editing.user_id, payload }));
    } else {
      await dispatch(createUser(payload));
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit User" : "Create User"}>
      <form onSubmit={save} className="space-y-3">
        <input className="w-full p-2 border" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <div className="flex gap-2">
          <input className="flex-1 p-2 border" placeholder="First name" value={first_name} onChange={e=>setFirstName(e.target.value)} />
          <input className="flex-1 p-2 border" placeholder="Last name" value={last_name} onChange={e=>setLastName(e.target.value)} />
        </div>
        <select className="w-full p-2 border" value={role} onChange={e=>setRole(e.target.value)}>
          <option value="">-- Select role --</option>
          <option value="admin">Admin</option>
          <option value="rc">Regional Commissioner</option>
          <option value="cc">County Commissioner</option>
          <option value="officer">Officer</option>
        </select>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1 border rounded">Cancel</button>
          <button type="submit" className="px-3 py-1 text-white bg-blue-600 rounded">Save</button>
        </div>
      </form>
    </Modal>
  );
}
