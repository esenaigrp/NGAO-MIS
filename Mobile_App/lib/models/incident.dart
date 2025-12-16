// lib/models/incident.dart
// Place this file under lib/models/
// Simple, robust Incident model with factory from JSON.

class Incident {
  final String id;
  final String title;
  final String description;
  final String status;
  final String locationName;
  final DateTime dateReported;

  Incident({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.locationName,
    required this.dateReported,
  });

  factory Incident.fromJson(Map<String, dynamic> j) {
    return Incident(
      id: j['id'].toString(),
      title: j['title'] ?? j['description']?.toString().split('\n')?.first ?? 'No title',
      description: j['description'] ?? '',
      status: j['status'] ?? 'unknown',
      locationName: j['location'] is Map ? (j['location']['name'] ?? 'Unknown') : (j['location']?.toString() ?? 'Unknown'),
      dateReported: DateTime.tryParse(j['date_reported'] ?? j['timestamp'] ?? '') ?? DateTime.now(),
    );
  }
}
