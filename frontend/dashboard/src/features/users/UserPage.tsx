// src/features/users/UsersPage.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, deleteUser, setPage } from "../../store/slices/usersSlice";
import type { RootState, AppDispatch } from "../../store";
import Table from "../shared/Table";
import Pagination from "../shared/Pagination";
import UserFormModal from "./UserFormModal";
import UsersRow from "./UsersRow";

export default function UsersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, page, pageSize, total } = useSelector((s: RootState) => s.users);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  useEffect(() => { dispatch(fetchUsers({ page, pageSize })); }, [dispatch, page, pageSize]);

  const rows = list.map((u) => (
    <UsersRow
      key={u.user_id}
      user={u}
      onEdit={(user)=>{ setEditing(user); setOpen(true); }}
      onDelete={(id)=>dispatch(deleteUser(id))}
    />
  ));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Users</h2>
        <div>
          <button className="px-3 py-1 text-white bg-blue-600 rounded" onClick={()=>{ setEditing(null); setOpen(true); }}>New User</button>
        </div>
      </div>

      <Table columns={["Email","Name","Role","Phone"]} rows={rows} />

      <Pagination page={page} pageSize={pageSize} total={total} onPage={(p)=>dispatch(setPage(p))} />

      <UserFormModal open={open} onClose={()=>setOpen(false)} editing={editing} />
    </div>
  );
}
