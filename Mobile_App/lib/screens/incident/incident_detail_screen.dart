import 'package:flutter/material.dart';
import '../../services/incident_service.dart';
import './incident_update_status_screen.dart';

class IncidentDetailScreen extends StatefulWidget {
  final int id;
  const IncidentDetailScreen({super.key, required this.id});

  @override
  State<IncidentDetailScreen> createState() => _IncidentDetailScreenState();
}

class _IncidentDetailScreenState extends State<IncidentDetailScreen> {
  final IncidentService _service = IncidentService();
  Map<String, dynamic>? _incident;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    loadIncident();
  }

  Future<void> loadIncident() async {
    final data = await _service.getIncidentDetail(widget.id);

    setState(() {
      _incident = data;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Incident Details")),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _incident?['title'] ?? "",
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text("Status: ${_incident?['status']}"),
                  const SizedBox(height: 16),
                  Text(_incident?['description'] ?? ""),
                  const Spacer(),
                  ElevatedButton(
                    child: const Text("Update Status"),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => IncidentUpdateStatusScreen(
                            id: widget.id,
                            currentStatus: _incident?['status'] ?? "",
                          ),
                        ),
                      );
                    },
                  )
                ],
              ),
            ),
    );
  }
}
