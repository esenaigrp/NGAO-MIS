// lib/services/dashboard_service.dart
// Place under lib/services/
// Production-ready simple HTTP client for dashboard endpoints.
// Uses `http` package. Replace API_BASE with your backend base URL.

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/incident.dart';
import '../config/env.dart';
import '../models/stats.dart';
import '../storage/token_storage.dart'

// TODO: Replace with your actual API URL (e.g., "http://localhost:8000/api")
const String API_BASE = "http://localhost:8000/api";

class DashboardService {

  static Future<Map<String, dynamic>> fetchProfile() async {
    final token = await TokenStorage.getAccessToken();
    final response = await http.get(
      Uri.parse("${Env.apiBaseUrl}/auth/me/"),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json"
      },
    );
  if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception("Failed to load officer profile");
    }
  }
 static Future<List<String>> fetchPermissions() async {
    final token = await TokenStorage.getAccessToken();
    final response = await http.get(
      Uri.parse("${Env.apiBaseUrl}/auth/permissions/"),
      headers: {
        "Authorization": "Bearer $token",
      },
    );

    if (response.statusCode == 200) {
      return List<String>.from(jsonDecode(response.body));
    } else {
      throw Exception("Failed to load permissions");
    }
  }
}
// Fetch officer permissions from Django
  static Future<List<String>> fetchPermissions() async {
    final token = await TokenStorage.getAccessToken();
    final response = await http.get(
      Uri.parse("${Env.apiBaseUrl}/auth/permissions/"),
      headers: {
        "Authorization": "Bearer $token",
      },
    );

    if (response.statusCode == 200) {
      return List<String>.from(jsonDecode(response.body));
    } else {
      throw Exception("Failed to load permissions");
    }
  }
}
  final http.Client _client;
  final String authToken; // passed in by provider or auth service

  DashboardService({
    required this.authToken,
    http.Client? client,
  }) : _client = client ?? http.Client();

  Map<String, String> _headers() => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (authToken.isNotEmpty) 'Authorization': 'Bearer $authToken',
      };

  /// GET /api/officers/me/ - returns officer profile (optional)
  Future<Map<String, dynamic>> fetchOfficerProfile() async {
    final res = await _client.get(Uri.parse('$API_BASE/officers/me/'), headers: _headers());
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to load officer profile: ${res.statusCode} ${res.body}');
  }

  /// GET /api/dashboard/stats/ - returns aggregated stats
  Future<DashboardStats> fetchStats() async {
    final res = await _client.get(Uri.parse('$API_BASE/dashboard/stats/'), headers: _headers());
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return DashboardStats.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
    }
    throw Exception('Failed to load stats: ${res.statusCode} ${res.body}');
  }

  /// GET /api/incidents/assigned/?limit=20 - returns incidents assigned to the officer
  Future<List<Incident>> fetchAssignedIncidents({int limit = 20}) async {
    final res = await _client.get(Uri.parse('$API_BASE/incidents/assigned/?limit=$limit'), headers: _headers());
    if (res.statusCode >= 200 && res.statusCode < 300) {
      final list = jsonDecode(res.body) as List;
      return list.map((e) => Incident.fromJson(e as Map<String, dynamic>)).toList();
    }
    throw Exception('Failed to load incidents: ${res.statusCode} ${res.body}');
  }

  void dispose() {
    _client.close();
  }
}
