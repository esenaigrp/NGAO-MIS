import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerDevice } from "../../store/slices/devicesSlice";
import { RootState } from "../../store";

const DeviceRegister = () => {
  const dispatch = useDispatch();
  const { status, message } = useSelector((state: RootState) => state.devices);

 useEffect(() => {
  const device_id = localStorage.getItem("device_id") || crypto.randomUUID();
  localStorage.setItem("device_id", device_id);

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      dispatch(registerDevice({
        device_id,
        lat: pos.coords.latitude,
        lon: pos.coords.longitude
      }));
    },
    (err) => {
      console.warn("Geolocation error, proceeding without location", err);
      dispatch(registerDevice({ device_id }));
    }
  );
}, [dispatch])}


