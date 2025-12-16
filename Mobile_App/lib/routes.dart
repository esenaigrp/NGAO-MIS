import 'screens/incident/incident_create_screen.dart';
import 'screens/incident/incident_detail_screen.dart';
import 'screens/incident/incident_update_status_screen.dart';
import 'screens/incident/incident_list_screen.dart';

final routes = {
  "/incident/list": (context) => const IncidentListScreen(),
  "/incident/create": (context) => const IncidentCreateScreen(),
};
