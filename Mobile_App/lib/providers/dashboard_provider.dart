// lib/providers/dashboard_provider.dart
// Place under lib/providers/
// A ChangeNotifier that loads stats + incident list and holds loading/error states.

import 'package:flutter/foundation.dart';
import '../models/incident.dart';
import '../models/stats.dart';
import '../services/dashboard_service.dart';
import 'package:flutter/material.dart';

enum DashboardState { idle, loading, success, error }

class DashboardProvider with ChangeNotifier {
  bool isLoading = false;
  Map<String, dynamic>? profile;
  List<String> permissions = [];
  String? error;

  final DashboardService _service;

  Future<void> loadDashboard() async {
    try {
      isLoading = true;
      notifyListeners();

      final p = await DashboardService.fetchProfile();
      final perms = await DashboardService.fetchPermissions();

      profile = p;
      permissions = perms;
      error = null;
    } catch (e) {
      error = e.toString();
    }
    isLoading = false;
    notifyListeners();
  }

  bool can(String permission) {
    return permissions.contains(permission);
  }


  DashboardStats? stats;
  List<Incident> incidents = [];
  String? errorMessage;
  DashboardState state = DashboardState.idle;

  DashboardProvider({required DashboardService service}) : _service = service;

  Future<void> loadAll({bool forceRefresh = false}) async {
    try {
      state = DashboardState.loading;
      errorMessage = null;
      notifyListeners();

      final statsFuture = _service.fetchStats();
      final incidentsFuture = _service.fetchAssignedIncidents(limit: 50);

      final results = await Future.wait([statsFuture, incidentsFuture]);

      stats = results[0] as DashboardStats;
      incidents = results[1] as List<Incident>;

      state = DashboardState.success;
      notifyListeners();
    } catch (e) {
      state = DashboardState.error;
      errorMessage = e.toString();
      notifyListeners();
    }
  }

  Future<void> refresh() async {
    return loadAll(forceRefresh: true);
  }
}
