import 'package:flutter/material.dart';
import '../../services/incident_service.dart';
import '../../widgets/loading_button.dart';

class IncidentCreateScreen extends StatefulWidget {
  const IncidentCreateScreen({super.key});

  @override
  State<IncidentCreateScreen> createState() => _IncidentCreateScreenState();
}

class _IncidentCreateScreenState extends State<IncidentCreateScreen> {
  final _formKey = GlobalKey<FormState>();
  final IncidentService _service = IncidentService();

  String _title = "";
  String _description = "";
  bool _loading = false;

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() => _loading = true);

    final payload = {
      "title": _title,
      "description": _description,
    };

    await _service.createIncident(payload);

    setState(() => _loading = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Incident created successfully")),
      );

      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Create Incident")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                decoration: const InputDecoration(
                  labelText: "Incident Title",
                ),
                onSaved: (v) => _title = v ?? "",
                validator: (v) =>
                    (v == null || v.isEmpty) ? "Required" : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                decoration: const InputDecoration(
                  labelText: "Description",
                ),
                maxLines: 4,
                onSaved: (v) => _description = v ?? "",
                validator: (v) =>
                    (v == null || v.isEmpty) ? "Required" : null,
              ),
              const SizedBox(height: 24),
              LoadingButton(
                loading: _loading,
                text: "Submit",
                onPressed: _submit,
              )
            ],
          ),
        ),
      ),
    );
  }
}
