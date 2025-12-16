import 'package:flutter/material.dart';
import '../../services/incident_service.dart';
import '../incident/incident_detail_screen.dart';

class IncidentListScreen extends StatefulWidget {
  const IncidentListScreen({super.key});

  @override
  State<IncidentListScreen> createState() => _IncidentListScreenState();
}

class _IncidentListScreenState extends State<IncidentListScreen> {
  final IncidentService _service = IncidentService();
  List<dynamic> _incidents = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    loadIncidents();
  }

  Future<void> loadIncidents() async {
    final data = await _service.fetchIncidents();
    setState(() {
      _incidents = data;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Incidents")),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _incidents.length,
              itemBuilder: (context, index) {
                final item = _incidents[index];
                return ListTile(
                  title: Text(item['title'] ?? "No Title"),
                  subtitle: Text("Status: ${item['status']}"),
                  trailing: const Icon(Icons.arrow_forward_ios),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => IncidentDetailScreen(id: item['id']),
                      ),
                    );
                  },
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        child: const Icon(Icons.add),
        onPressed: () => Navigator.pushNamed(context, "/incident/create"),
      ),
    );
  }
}
