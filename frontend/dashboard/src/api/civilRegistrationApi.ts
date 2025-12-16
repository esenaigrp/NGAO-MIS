import axiosInstance from "./axiosInstance";
import axiosClient from "./axiosClient";

const civilRegistrationApi = axiosClient.create({
  baseURL: "/civil", // or whatever your backend prefix is
});

export default civilRegistrationApi;

export const fetchBirthRegistrations = async () => {
  const response = await axiosInstance.get("/civil/birth/");
  return response.data;
};

export const fetchDeathRegistrations = async () => {
  const response = await axiosInstance.get("/civil/death/");
  return response.data;
};

export const fetchMarriageRegistrations = async () => {
  const response = await axiosInstance.get("/civil/marriage/");
  return response.data;
};

export const approveRegistration = async (type: string, id: number) => {
  const response = await axiosInstance.post(`/civil/${type}/${id}/approve/`);
  return response.data;
};

export const rejectRegistration = async (type: string, id: number) => {
  const response = await axiosInstance.post(`/civil/${type}/${id}/reject/`);
  return response.data;
};

export const verifyParents = async (id: number, motherOk: boolean, fatherOk: boolean) => {
  const response = await axiosInstance.post(`/civil/registration-request/${id}/verify-parents/`, {
    mother_verified: motherOk,
    father_verified: fatherOk,
  });
  return response.data;
};
