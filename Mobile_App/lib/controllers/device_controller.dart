import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../services/auth_services.dart';
import 'package:geolocator/geolocator.dart';


class DeviceController {
  static final DeviceController _instance = DeviceController._internal();
  factory DeviceController() => _instance;
  DeviceController._internal();

  String getDeviceId() {
    // generate a unique ID if none exists
    return Uuid().v4();
  }

  Future<Map<String, dynamic>> registerDevice() async {
  String deviceId = getDeviceId();
  Position? position;
  try {
    position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
  } catch (_) {}
  return await AuthServices.registerDevice(
    deviceId: deviceId,
    lat: position?.latitude,
    lon: position?.longitude
  );
}

  Future<Map<String, dynamic>> approveDevice({required String deviceId}) async {
    return await AuthServices.approveDevice(deviceId: deviceId);
  }
}
