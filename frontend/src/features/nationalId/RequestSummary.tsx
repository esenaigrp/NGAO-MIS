import React from "react";
import { useAppSelector } from "../../store/hooks";

const RequestSummary = () => {
  const currentRequest = useAppSelector((state) => state.nationalId.currentRequest);

  if (!currentRequest) return <div>Select a request to see summary</div>;

  return (
    <div>
      <h3>National ID Request Summary</h3>
      <p>Reference: {currentRequest.reference_number}</p>
      <p>Applicant: {currentRequest.applicant.first_name} {currentRequest.applicant.last_name}</p>
      <p>Mother Verified: {currentRequest.mother_verified ? "Yes" : "No"}</p>
      <p>Father Verified: {currentRequest.father_verified ? "Yes" : "No"}</p>
      <p>Status: {currentRequest.status}</p>
      <p>Verified By Chief: {currentRequest.verified_by_chief?.username ?? "N/A"}</p>
      <p>Created At: {new Date(currentRequest.created_at).toLocaleString()}</p>
    </div>
  );
};

export default RequestSummary;
