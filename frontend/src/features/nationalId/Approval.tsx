import React from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { approveRequest, rejectRequest } from "../../store/slices/nationIdSlice";

const Approval = () => {
  const dispatch = useAppDispatch();
  const currentRequest = useAppSelector((state) => state.nationalId.currentRequest);

  if (!currentRequest) return <div>Select a request to approve/reject</div>;

  return (
    <div>
      <h3>Admin Approval for {currentRequest.reference_number}</h3>
      <p>Status: {currentRequest.status}</p>
      <button disabled={currentRequest.status !== "submitted_to_nrb"} onClick={() => dispatch(approveRequest(currentRequest.id))}>
        Approve
      </button>
      <button disabled={currentRequest.status !== "submitted_to_nrb"} onClick={() => dispatch(rejectRequest(currentRequest.id))}>
        Reject
      </button>
    </div>
  );
};

export default Approval;
