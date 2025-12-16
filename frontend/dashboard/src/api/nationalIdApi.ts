// src/api/nationalIdApi.ts
import axiosInstance from "./axiosInstance";

export const NationalIDApi = {
  // List all requests
  fetchRequests: () => axiosInstance.get("/national-id/requests/"),

  // Get a single request by ID
  fetchRequestById: (id: string) => axiosInstance.get(`/national-id/requests/${id}/`),

  // Create a new National ID registration request
  createRequest: (data: any) => axiosInstance.post("/national-id/requests/", data),

  // Verify parents (step 1 in backend)
  verifyParents: (id: string, payload: { mother_verified: boolean; father_verified?: boolean }) =>
    axiosInstance.post(`/national-id/requests/${id}/verify-parents/`, payload),

  // Submit the request to NRB (step 2 in backend)
  submitToNRB: (id: string) => axiosInstance.post(`/national-id/requests/${id}/submit/`),

  // Approve a request (NRB/Admin step)
  approveRequest: (id: string) => axiosInstance.post(`/national-id/requests/${id}/approve/`),

  // Reject a request
  rejectRequest: (id: string) => axiosInstance.post(`/national-id/requests/${id}/reject/`),
};
