import axiosInstance from "./axiosInstance";

export const fetchOfficers = async () => {
  const response = await axiosInstance.get("/officers/");
  return response.data;
};

export const addOfficer = async (data: any) => {
  const response = await axiosInstance.post("/officers/", data);
  return response.data;
};

export const updateOfficer = async (id: string, data: any) => {
  const response = await axiosInstance.put(`/officers/${id}/`, data);
  return response.data;
};

export const deleteOfficer = async (id: string) => {
  const response = await axiosInstance.delete(`/officers/${id}/`);
  return response.data;
};

export const toggleOfficerStatus = async (id: string, status: string) => {
  const response = await axiosInstance.patch(`/officers/${id}/status/`, { status });
  return response.data;
};
