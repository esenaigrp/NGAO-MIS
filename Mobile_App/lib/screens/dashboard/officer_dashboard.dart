// lib/screens/dashboard/officer_dashboard.dart
// Simple dashboard skeleton. Use role checks from provider to show/hide functionality.

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';

class OfficerDashboard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final role = auth.user?.role ?? 'unknown';

    return Scaffold(
      appBar: AppBar(
        title: Text('Officer Dashboard'),
        actions: [
          IconButton(
            icon: Icon(Icons.logout),
            onPressed: () async {
              await auth.logout();
              Navigator.pushReplacementNamed(context, '/login');
            },
          )
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Welcome ${auth.user?.email ?? ''}', style: TextStyle(fontSize: 18)),
            SizedBox(height: 12),
            Text('Role: $role'),
            SizedBox(height: 24),
            if (auth.hasRole('assistant_chief') || auth.hasRole('chief'))
              ElevatedButton(onPressed: () => _showExample(context), child: Text('Manage Incidents')),
            if (auth.hasRole('acc') || auth.hasRole('dcc') || auth.hasRole('cc') || auth.hasRole('rc'))
              ElevatedButton(onPressed: () => _showExample(context), child: Text('View Regional Reports')),
            // add more role-based widgets here
          ],
        ),
      ),
    );
  }

  void _showExample(BuildContext ctx) {
    ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text('Feature not implemented yet')));
  }
}
