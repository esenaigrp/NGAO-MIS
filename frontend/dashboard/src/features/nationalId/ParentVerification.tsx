// src/features/nationalId/ParentVerification.tsx
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { verifyParents } from "../../store/slices/nationIdSlice";

const ParentVerification = () => {
  const dispatch = useAppDispatch();
  const currentRequest = useAppSelector((state) => state.nationalId.currentRequest);

  const [motherVerified, setMotherVerified] = useState(false);
  const [fatherVerified, setFatherVerified] = useState(false);

  const handleVerify = () => {
    if (!currentRequest) return;
    dispatch(verifyParents({ id: currentRequest.id, payload: { mother_verified: motherVerified, father_verified: fatherVerified } }));
  };

  if (!currentRequest) return <div>Select a request to start verification</div>;

  return (
    <div>
      <h3>Verify Parents for {currentRequest.applicant.first_name} {currentRequest.applicant.last_name}</h3>
      <label>
        <input type="checkbox" checked={motherVerified} onChange={() => setMotherVerified(!motherVerified)} /> Mother Verified
      </label>
      <br/>
      <label>
        <input type="checkbox" checked={fatherVerified} onChange={() => setFatherVerified(!fatherVerified)} /> Father Verified
      </label>
      <br/>
      <button onClick={handleVerify}>Confirm Verification</button>
    </div>
  );
};

export default ParentVerification;
