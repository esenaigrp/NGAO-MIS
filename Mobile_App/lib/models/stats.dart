// lib/models/stats.dart
// Place under lib/models/
// Holds aggregated dashboard numbers.

class DashboardStats {
  final int totalIncidents;
  final int pending;
  final int escalated;
  final int resolved;

  DashboardStats({
    required this.totalIncidents,
    required this.pending,
    required this.escalated,
    required this.resolved,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> j) {
    return DashboardStats(
      totalIncidents: j['total_incidents'] ?? 0,
      pending: j['pending'] ?? 0,
      escalated: j['escalated'] ?? 0,
      resolved: j['resolved'] ?? 0,
    );
  }
}
