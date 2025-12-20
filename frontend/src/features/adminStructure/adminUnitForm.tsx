import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  createAdminUnit,
  updateAdminUnit,
  fetchAdminUnits,
} from "../../store/slices/adminStructureSlice";

interface AdminUnitFormProps {
  uid?: string;
  onClose?: () => void;
}

const AdminUnitForm: React.FC<AdminUnitFormProps> = ({ uid, onClose }) => {
  const dispatch = useAppDispatch();
  const { units } = useAppSelector((state) => state.adminStructure);

  const editingUnit = units.find((u) => u.uid === uid);

  const [name, setName] = useState(editingUnit?.name || "");
  const [unitType, setUnitType] = useState(editingUnit?.unit_type || "");
  const [code, setCode] = useState(editingUnit?.code || "");
  const [parentUnit, setParentUnit] = useState(editingUnit?.parent_unit || "");

  useEffect(() => {
    dispatch(fetchAdminUnits());
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, unit_type: unitType, code, parent_unit: parentUnit || null };

    if (uid) {
      dispatch(updateAdminUnit({ uid, data: payload }));
    } else {
      dispatch(createAdminUnit(payload));
    }

    if (onClose) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border rounded">
      <div className="mb-2">
        <label>Name</label>
        <input
          className="w-full p-1 border"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <label>Unit Type</label>
        <input
          className="w-full p-1 border"
          value={unitType}
          onChange={(e) => setUnitType(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <label>Code</label>
        <input
          className="w-full p-1 border"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <label>Parent Unit</label>
        <select
          className="w-full p-1 border"
          value={typeof parentUnit === "string" ? parentUnit : parentUnit?.uid || ""}
          onChange={(e) => setParentUnit(e.target.value)}
        >
          <option value="">None</option>
          {units.map((u) => (
            <option key={u.uid} value={u.uid}>
              {u.name}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn-primary">
        {uid ? "Update" : "Create"} Unit
      </button>
      {onClose && (
        <button type="button" onClick={onClose} className="ml-2 btn-secondary">
          Cancel
        </button>
      )}
    </form>
  );
};

export default AdminUnitForm;
