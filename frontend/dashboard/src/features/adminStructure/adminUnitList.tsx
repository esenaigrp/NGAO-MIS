import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchAdminUnits,
  deleteAdminUnit,
  setCurrentItem,
} from "../../store/slices/adminStructureSlice";

const AdminUnitList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { units, loading, error } = useAppSelector((state) => state.adminStructure);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAdminUnits());
  }, [dispatch]);

  const handleDelete = (uid: string) => {
    if (window.confirm("Are you sure you want to delete this unit?")) {
      dispatch(deleteAdminUnit(uid));
    }
  };

  const handleSelect = (uid: string) => {
    setSelectedUnit(uid === selectedUnit ? null : uid);
  };

  if (loading) return <p>Loading admin units...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Admin Units</h2>
      <table className="w-full border table-auto">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Code</th>
            <th>Parent Unit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {units.map((u) => (
            <tr key={u.uid}>
              <td>{u.name}</td>
              <td>{u.unit_type}</td>
              <td>{u.code}</td>
              <td>{typeof u.parent_unit === "string" ? u.parent_unit : u.parent_unit?.name}</td>
              <td className="space-x-2">
                <button onClick={() => handleSelect(u.uid)} className="btn-primary">
                  Edit
                </button>
                <button onClick={() => handleDelete(u.uid)} className="btn-danger">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUnit && (
        <div className="p-4 mt-4 bg-gray-100 border">
          <h3>Edit Admin Unit</h3>
          {/* You can render AdminUnitForm here and pass selectedUnit */}
        </div>
      )}
    </div>
  );
};

export default AdminUnitList;
