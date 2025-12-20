import React from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { submitToNRB } from "../../store/slices/nationIdSlice";

const SubmitToNRB = () => {
  const dispatch = useAppDispatch();
  const currentRequest = useAppSelector((state) => state.nationalId.currentRequest);

  if (!currentRequest) return <div>Select a request to submit to NRB</div>;

  const handleSubmit = () => {
    dispatch(submitToNRB(currentRequest.id));
  };

  return (
    <div>
      <h3>Submit to NRB: {currentRequest.reference_number}</h3>
      <p>Status: {currentRequest.status}</p>
      <button disabled={currentRequest.status !== "pending_nrb"} onClick={handleSubmit}>
        Submit to NRB
      </button>
    </div>
  );
};

export default SubmitToNRB;
