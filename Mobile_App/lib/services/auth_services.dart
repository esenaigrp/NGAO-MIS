import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/env.dart';
import '../models/user.dart';
import '../storage/token_storage.dart';

class AuthService {
  final TokenStorage _tokenStorage = TokenStorage();

  String get _baseUrl => Env.apiBaseUrl;

  /// Login with username + password
  Future<Map<String, dynamic>> login({
    required String username,
    required String password,
  }) async {
    final url = Uri.parse("$_baseUrl/auth/login/");

    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"username": username, "password": password}),
    );

    if (response.statusCode != 200) {
      throw Exception("Invalid credentials");
    }

    return jsonDecode(response.body);
  }

  /// Request OTP for login / 2FA
  Future<void> requestOtp(String phone) async {
    final url = Uri.parse("$_baseUrl/auth/request-otp/");

    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"phone": phone}),
    );

    if (response.statusCode != 200) {
      throw Exception("Unable to send OTP");
    }
  }

  /// Verify OTP to login or verify phone
  Future<Map<String, dynamic>> verifyOtp({
    required String phone,
    required String otp,
  }) async {
    final url = Uri.parse("$_baseUrl/auth/verify-otp/");

    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"phone": phone, "otp": otp}),
    );

    if (response.statusCode != 200) {
      throw Exception("Invalid OTP");
    }

    return jsonDecode(response.body);
  }

  /// Fetch logged-in officer’s profile
  Future<User> getProfile() async {
    final token = await _tokenStorage.getAccessToken();
    if (token == null) throw Exception("Not authenticated");

    final url = Uri.parse("$_baseUrl/auth/me/");

    final response = await http.get(
      url,
      headers: {"Authorization": "Bearer $token"},
    );

    if (response.statusCode != 200) {
      throw Exception("Failed to fetch profile");
    }

    return User.fromJson(jsonDecode(response.body));
  }

  /// Refresh the token silently
  Future<String?> refreshToken() async {
    final refresh = await _tokenStorage.getRefreshToken();
    if (refresh == null) return null;

    final url = Uri.parse("$_baseUrl/auth/token/refresh/");

    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"refresh": refresh}),
    );

    if (response.statusCode != 200) {
      return null; // triggers logout
    }

    final data = jsonDecode(response.body);
    final newAccess = data["access"];
    await _tokenStorage.saveAccessToken(newAccess);

    return newAccess;
  }

  /// Request password reset via email/phone
  Future<void> requestPasswordReset(String emailOrPhone) async {
    final url = Uri.parse("$_baseUrl/auth/password-reset/request/");

    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"identifier": emailOrPhone}),
    );

    if (response.statusCode != 200) {
      throw Exception("Unable to process request");
    }
  }

  /// Confirm password reset using OTP or token
  Future<void> confirmPasswordReset({
    required String identifier,
    required String code,
    required String newPassword,
  }) async {
    final url = Uri.parse("$_baseUrl/auth/password-reset/confirm/");

    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "identifier": identifier,
        "code": code,
        "new_password": newPassword,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception("Password reset failed");
    }
  }
}
