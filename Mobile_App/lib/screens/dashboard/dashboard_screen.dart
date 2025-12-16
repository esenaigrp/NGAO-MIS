// lib/screens/dashboard/dashboard_screen.dart
// Place under lib/screens/dashboard/dashboard_screen.dart
//
// This is a full dashboard screen with Drawer menu (hamburger).
// It expects a DashboardProvider to be available above in the widget tree.
// Add the provider in your app root (instructions below).

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../models/incident.dart';
import 'package:intl/intl.dart';

class DashboardScreen extends StatefulWidget {

  // Route name if using named routes
  static const String routeName = '/dashboard';

  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final DateFormat _fmt = DateFormat.yMMMd().add_jm();

  @override
  void initState() {
    super.initState();
    // Kick off initial load
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final prov = Provider.of<DashboardProvider>(context, listen: false);
      prov.loadAll();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Officer Dashboard'),
      ),
      drawer: _buildDrawer(context),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => Provider.of<DashboardProvider>(context, listen: false).refresh(),
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Consumer<DashboardProvider>(builder: (context, prov, _) {
              if (prov.state == DashboardState.loading) {
                return const Center(child: CircularProgressIndicator());
              }

              if (prov.state == DashboardState.error) {
                return _buildError(prov.errorMessage ?? 'Unknown error');
              }

              // success or idle -> show content (if null show placeholders)
              return _buildContent(context, prov.stats, prov.incidents);
            }),
          ),
        ),
      ),
    );
  }

  Widget _buildDrawer(BuildContext context) {
    // Minimal drawer. Add navigation items as needed.
    return Drawer(
      child: SafeArea(
        child: Column(
          children: [
            DrawerHeader(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  CircleAvatar(radius: 28, child: Icon(Icons.person)),
                  SizedBox(height: 12),
                  Text('Officer Name', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  Text('Role • Unit', style: TextStyle(color: Colors.white70)),
                ],
              ),
              decoration: BoxDecoration(color: Theme.of(context).primaryColor),
            ),
            ListTile(
              leading: const Icon(Icons.dashboard),
              title: const Text('Dashboard'),
              onTap: () => Navigator.of(context).pop(),
            ),
            ListTile(
              leading: const Icon(Icons.map),
              title: const Text('Map View'),
              onTap: () {
                // TODO: navigate to map screen
              },
            ),
            ListTile(
              leading: const Icon(Icons.logout),
              title: const Text('Logout'),
              onTap: () {
                // TODO: call auth logout and navigate to login
              },
            ),
            const Spacer(),
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: Text('App v1.0.0', style: Theme.of(context).textTheme.caption),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildError(String message) {
    return ListView(
      children: [
        SizedBox(height: 40),
        Center(child: Icon(Icons.error_outline, size: 60, color: Colors.redAccent)),
        const SizedBox(height: 16),
        Center(child: Text('Failed to load dashboard', style: TextStyle(fontSize: 18))),
        const SizedBox(height: 8),
        Center(child: Text(message, textAlign: TextAlign.center)),
        const SizedBox(height: 16),
        Center(
          child: ElevatedButton.icon(
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
            onPressed: () => Provider.of<DashboardProvider>(context, listen: false).loadAll(),
          ),
        ),
      ],
    );
  }

  Widget _buildContent(BuildContext context, DashboardStats? stats, List<Incident> incidents) {
    return ListView(
      children: [
        _buildHeaderCard(context, stats),
        const SizedBox(height: 12),
        _buildStatsRow(stats),
        const SizedBox(height: 12),
        _buildIncidentsList(incidents),
      ],
    );
  }

  Widget _buildHeaderCard(BuildContext context, DashboardStats? stats) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(14.0),
        child: Row(
          children: [
            const CircleAvatar(radius: 26, child: Icon(Icons.person)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Officer: John Doe', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                const Text('Role: Chief • Narok County', style: TextStyle(color: Colors.black54)),
                const SizedBox(height: 8),
                Text('Total Incidents: ${stats?.totalIncidents ?? '—'}', style: const TextStyle(fontWeight: FontWeight.w600)),
              ]),
            ),
            IconButton(
              onPressed: () => Provider.of<DashboardProvider>(context, listen: false).refresh(),
              icon: const Icon(Icons.refresh),
              tooltip: 'Refresh',
            )
          ],
        ),
      ),
    );
  }

  Widget _buildStatsRow(DashboardStats? stats) {
    Widget card(String label, String value, Color color) {
      return Expanded(
        child: Card(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
            child: Column(
              children: [
                Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
                const SizedBox(height: 8),
                Text(label, style: const TextStyle(fontSize: 12)),
              ],
            ),
          ),
        ),
      );
    }

    return Row(
      children: [
        card('Total', '${stats?.totalIncidents ?? 0}', Colors.black87),
        const SizedBox(width: 8),
        card('Pending', '${stats?.pending ?? 0}', Colors.orange),
        const SizedBox(width: 8),
        card('Escalated', '${stats?.escalated ?? 0}', Colors.red),
        const SizedBox(width: 8),
        card('Resolved', '${stats?.resolved ?? 0}', Colors.green),
      ],
    );
  }

  Widget _buildIncidentsList(List<Incident> incidents) {
    if (incidents.isEmpty) {
      return Padding(
        padding: const EdgeInsets.all(36.0),
        child: Center(child: Text('No assigned incidents. Pull to refresh.')),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 8),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 4.0),
          child: Text('Assigned incidents', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        ),
        const SizedBox(height: 8),
        ...incidents.map((inc) => _buildIncidentRow(inc)).toList(),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildIncidentRow(Incident inc) {
    return Card(
      child: ListTile(
        onTap: () {
          // TODO: Navigate to incident detail passing inc.id
        },
        title: Text(inc.title, maxLines: 2, overflow: TextOverflow.ellipsis),
        subtitle: Text('${inc.locationName} • ${_fmt.format(inc.dateReported)}'),
        trailing: _statusBadge(inc.status),
      ),
    );
  }

  Widget _statusBadge(String status) {
    Color color;
    switch (status.toLowerCase()) {
      case 'pending':
      case 'reported':
        color = Colors.orange;
        break;
      case 'resolved':
        color = Colors.green;
        break;
      case 'escalated':
        color = Colors.red;
        break;
      default:
        color = Colors.grey;
    }
    return Container(padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 10), decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(12)), child: Text(status.toUpperCase(), style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12)));
  }
}
