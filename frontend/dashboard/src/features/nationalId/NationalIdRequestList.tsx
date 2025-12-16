import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchRequests,
  setCurrentRequest,
  verifyParents,
  submitToNRB,
  approveRequest,
  rejectRequest,
} from "../../store/slices/nationIdSlice";

const NationalIdRequestList = () => {
  const dispatch = useAppDispatch();
  const { requests, currentRequest, loading } = useAppSelector((state) => state.nationalId);

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  const handleSelect = (request: any) => {
    dispatch(setCurrentRequest(request));
  };

  const handleVerifyParents = () => {
    if (!currentRequest) return;
    dispatch(
      verifyParents({
        id: currentRequest.id,
        mother_ok: true,
        father_ok: true,
      })
    );
  };

  const handleSubmitNRB = () => {
    if (!currentRequest) return;
    dispatch(submitToNRB(currentRequest.id));
  };

  const handleApprove = () => {
    if (!currentRequest) return;
    dispatch(approveRequest(currentRequest.id));
  };

  const handleReject = () => {
    if (!currentRequest) return;
    dispatch(rejectRequest(currentRequest.id));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ display: "flex", gap: "2rem" }}>
      {/* Requests List */}
      <div>
        <h2>National ID Requests</h2>
        <ul>
          {requests.map((r) => (
            <li
              key={r.id}
              style={{
                cursor: "pointer",
                fontWeight: currentRequest?.id === r.id ? "bold" : "normal",
              }}
              onClick={() => handleSelect(r)}
            >
              {r.reference_number} - {r.status}
            </li>
          ))}
        </ul>
      </div>

      {/* Request Actions */}
      {currentRequest && (
        <div>
          <h3>Selected: {currentRequest.reference_number}</h3>
          <p>Status: {currentRequest.status}</p>
          <p>
            Mother Verified: {currentRequest.mother_verified ? "Yes" : "No"} <br />
            Father Verified: {currentRequest.father_verified ? "Yes" : "No"}
          </p>
          <button onClick={handleVerifyParents} disabled={currentRequest.status !== "initiated"}>
            Verify Parents
          </button>
          <button onClick={handleSubmitNRB} disabled={currentRequest.status !== "pending_nrb"}>
            Submit to NRB
          </button>
          <button onClick={handleApprove} disabled={currentRequest.status !== "submitted_to_nrb"}>
            Approve
          </button>
          <button onClick={handleReject} disabled={currentRequest.status !== "submitted_to_nrb"}>
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default NationalIdRequestList;
