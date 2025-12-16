// lib/app.dart
// Compose Providers and the MaterialApp; register routes.

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/dashboard/officer_dashboard.dart';
import 'screens/auth/otp_screen.dart';
import 'screens/auth/password_reset_request_screen.dart';
import 'screens/auth/password_reset_confirm_screen.dart';

return MultiProvider(
  providers: [
    ChangeNotifierProvider(create: (_) => AuthProvider()),
    ChangeNotifierProvider(create: (_) => DashboardProvider()), // NEW
  ],
  child: MaterialApp(
    ...
  ),
);

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<AuthProvider>(
      create: (_) => AuthProvider(),
      child: MaterialApp(
        title: 'NGAO MIS Mobile',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(primarySwatch: Colors.blue),
        initialRoute: '/',
        routes: {
          '/': (c) => Consumer<AuthProvider>(
                builder: (ctx, auth, _) {
                  if (auth.loading) return Scaffold(body: Center(child: CircularProgressIndicator()));
                  if (!auth.isAuthenticated) return LoginScreen();
                  return OfficerDashboard();
                },
              ),
          '/login': (_) => LoginScreen(),
          '/otp': (_) => OtpScreen(),
          '/password-reset': (_) => PasswordResetRequestScreen(),
          '/password-reset-confirm': (_) => PasswordResetConfirmScreen(),
          '/dashboard': (_) => OfficerDashboard(),
        },
      ),
    );
  }
}
