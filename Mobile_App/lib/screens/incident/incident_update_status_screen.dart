import 'package:flutter/material.dart';
import '../../services/incident_service.dart';
import '../../widgets/loading_button.dart';

class IncidentUpdateStatusScreen extends StatefulWidget {
  final int id;
  final String currentStatus;

  const IncidentUpdateStatusScreen({
    super.key,
    required this.id,
    required this.currentStatus,
  });

  @override
  State<IncidentUpdateStatusScreen> createState() =>
      _IncidentUpdateStatusScreenState();
}

class _IncidentUpdateStatusScreenState
    extends State<IncidentUpdateStatusScreen> {
  final IncidentService _service = IncidentService();
  String _selectedStatus = "";
  bool _loading = false;

  final List<String> statuses = [
    "Open",
    "Under Review",
    "Resolved",
    "Closed"
  ];

  @override
  void initState() {
    super.initState();
    _selectedStatus = widget.currentStatus;
  }

  Future<void> _submit() async {
    setState(() => _loading = true);

    await _service.updateIncidentStatus(widget.id, _selectedStatus);

    setState(() => _loading = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Status updated")),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Update Status")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            DropdownButtonFormField(
              value: _selectedStatus,
              items: statuses
                  .map((s) => DropdownMenuItem(
                        value: s,
                        child: Text(s),
                      ))
                  .toList(),
              onChanged: (v) => setState(() => _selectedStatus = v ?? ""),
            ),
            const SizedBox(height: 24),
            LoadingButton(
              loading: _loading,
              text: "Submit",
              onPressed: _submit,
            ),
          ],
        ),
      ),
    );
  }
}
