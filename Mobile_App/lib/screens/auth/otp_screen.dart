// lib/screens/auth/otp_screen.dart
// OTP screen where user enters code received by SMS.

import 'package:flutter/material.dart';
import '../../services/auth_service.dart';

class OtpScreen extends StatefulWidget {
  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _codeCtrl = TextEditingController();
  bool _loading = false;
  String? _error;
  String? phone;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
    phone = args?['phone'] as String?;
  }

  Future<void> _verify() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final resp = await AuthService().verifyOtp(phone: phone ?? '', code: _codeCtrl.text.trim());
      // If backend returns tokens, AuthService saved them; route to dashboard
      Navigator.pushReplacementNamed(context, '/dashboard');
    } catch (e) {
      setState(() => _error = 'OTP verify failed: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Enter OTP')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Text('Enter the code sent to ${phone ?? "your phone"}'),
            const SizedBox(height: 12),
            TextField(controller: _codeCtrl, decoration: InputDecoration(labelText: 'OTP Code')),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: _verify, child: _loading ? CircularProgressIndicator(color: Colors.white) : Text('Verify')),
            if (_error != null) Text(_error!, style: TextStyle(color: Colors.red)),
          ],
        ),
      ),
    );
  }
}
