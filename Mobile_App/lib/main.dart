// lib/main.dart
// Entrypoint. Put under lib/

import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'config/env.dart';
import 'app.dart';
import 'package:provider/provider.dart';
import 'services/dashboard_service.dart';
import 'providers/dashboard_provider.dart';
import 'screens/dashboard/dashboard_screen.dart';
import 'services/auth_service.dart'; // your existing auth service that holds token
import 'services/api_client.dart';
import 'providers/auth_provider.dart';
import 'screens/login_screen.dart';
import 'screens/officer_dashboard.dart';
import 'screens/password_reset_request.dart';

void main() {
  runApp(const MyApp());
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Env.init(); // load .env
  runApp(MyApp());
}

void main() {
  final apiClient = ApiClient();
  final authService = AuthService(apiClient);
  runApp(MyApp(authService: authService));
}

class MyApp extends StatelessWidget {
  final AuthService authService;
  const MyApp({required this.authService, super.key});
  @override
  Widget build(BuildContext context) {
     final String token = ''; // TODO: resolve token from secure storage / auth provider

    final dashboardService = DashboardService(authToken: token);

    return MultiProvider(
      providers: [
        ChangeNotifierProvider<DashboardProvider>(
          create: (_) => DashboardProvider(service: dashboardService),
        ),
        // Add your existing AuthProvider here
      ],
      child: MaterialApp(
        title: 'NGAO MIS',
        initialRoute: DashboardScreen.routeName,
        routes: {
          DashboardScreen.routeName: (_) => const DashboardScreen(),
    return ChangeNotifierProvider(
      create: (_) => AuthProvider(authService)..init(),
      child: MaterialApp(
        title: 'NGAO MIS',
        initialRoute: '/',
        routes: {
          '/': (ctx) => const LoginScreen(),
          '/dashboard': (ctx) => const OfficerDashboard(),
          '/password-reset': (ctx) => const PasswordResetRequestScreen(),
        },
      ),
    ),
        };
      );

    );
  }
}
