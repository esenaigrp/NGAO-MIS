// lib/screens/auth/password_reset_confirm_screen.dart
// When user clicks link from email, you'd deep-link or provide uid/token to this screen.

import 'package:flutter/material.dart';
import '../../services/auth_service.dart';
import '../../widgets/loading_button.dart';

class PasswordResetConfirmScreen extends StatefulWidget {
  @override
  State<PasswordResetConfirmScreen> createState() => _PasswordResetConfirmScreenState();
}

class _PasswordResetConfirmScreenState extends State<PasswordResetConfirmScreen> {
  final _uidCtrl = TextEditingController();
  final _tokenCtrl = TextEditingController();
  final _pwCtrl = TextEditingController();
  bool _loading = false;
  String? _message;

  Future<void> _confirm() async {
    setState(() {
      _loading = true;
      _message = null;
    });
    try {
      await AuthService().passwordResetConfirm(uid: _uidCtrl.text.trim(), token: _tokenCtrl.text.trim(), newPassword: _pwCtrl.text);
      setState(() => _message = 'Password reset successful. Please login.');
      Navigator.pushReplacementNamed(context, '/login');
    } catch (e) {
      setState(() => _message = 'Error: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext c) {
    return Scaffold(
      appBar: AppBar(title: Text('Confirm Password Reset')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(controller: _uidCtrl, decoration: InputDecoration(labelText: 'UID (from email link)')),
            TextField(controller: _tokenCtrl, decoration: InputDecoration(labelText: 'Token (from email link)')),
            TextField(controller: _pwCtrl, decoration: InputDecoration(labelText: 'New password'), obscureText: true),
            SizedBox(height: 12),
            LoadingButton(onPressed: _confirm, label: 'Reset Password', isLoading: _loading),
            if (_message != null) Text(_message!),
          ],
        ),
      ),
    );
  }
}
