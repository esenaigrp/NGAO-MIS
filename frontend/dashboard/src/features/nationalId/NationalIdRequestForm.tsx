import React, { useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { createRequest } from "../../store/slices/nationIdSlice";

const NationalIdRequestForm = () => {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({
    applicant_id: "",
    mother_id: "",
    father_id: "",
    reference_number: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createRequest(form));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="reference_number" placeholder="Reference Number" value={form.reference_number} onChange={handleChange} required />
      <input name="applicant_id" placeholder="Applicant ID" value={form.applicant_id} onChange={handleChange} required />
      <input name="mother_id" placeholder="Mother ID" value={form.mother_id} onChange={handleChange} required />
      <input name="father_id" placeholder="Father ID" value={form.father_id} onChange={handleChange} />
      <button type="submit">Create Request</button>
    </form>
  );
};

export default NationalIdRequestForm;
