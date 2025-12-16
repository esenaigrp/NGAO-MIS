// lib/screens/auth/password_reset_request_screen.dart
// Request password reset (email). Put in lib/screens/auth/password_reset_request_screen.dart

import 'package:flutter/material.dart';
import '../../services/auth_service.dart';
import '../../widgets/loading_button.dart';

class PasswordResetRequestScreen extends StatefulWidget {
  @override
  State<PasswordResetRequestScreen> createState() => _PasswordResetRequestScreenState();
}

class _PasswordResetRequestScreenState extends State<PasswordResetRequestScreen> {
  final _emailCtrl = TextEditingController();
  bool _loading = false;
  String? _message;

  Future<void> _send() async {
    setState(() {
      _loading = true;
      _message = null;
    });
    try {
      await AuthService().passwordResetRequest(email: _emailCtrl.text.trim());
      setState(() => _message = 'Check your email for reset instructions.');
    } catch (e) {
      setState(() => _message = 'Error: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext c) {
    return Scaffold(
      appBar: AppBar(title: Text('Password Reset')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(controller: _emailCtrl, decoration: InputDecoration(labelText: 'Email')),
            SizedBox(height: 12),
            LoadingButton(onPressed: _send, label: 'Request Reset', isLoading: _loading),
            if (_message != null) Padding(padding: EdgeInsets.symmetric(vertical: 8), child: Text(_message!)),
          ],
        ),
      ),
    );
  }
}
