import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/auth_service.dart';
import '../storage/token_storage.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  final TokenStorage _tokenStorage = TokenStorage();

  User? _user;
  bool _isLoading = false;
  bool _isAuthenticated = false;

  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;

  /// Load user session on app start
  /// Checks token, refreshes if needed, fetches profile
  Future<void> loadUserSession() async {
    final token = await _tokenStorage.getAccessToken();

    if (token == null) {
      _isAuthenticated = false;
      notifyListeners();
      return;
    }

    try {
      _isLoading = true;
      notifyListeners();

      final userData = await _authService.getProfile();
      _user = userData;
      _isAuthenticated = true;
    } catch (e) {
      // Any error -> logout to avoid corrupted session
      await logout();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Traditional username/password login
  Future<bool> login(String username, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final tokenResponse =
          await _authService.login(username: username, password: password);

      await _tokenStorage.saveTokens(
        tokenResponse['access'],
        tokenResponse['refresh'],
      );

      final userProfile = await _authService.getProfile();
      _user = userProfile;
      _isAuthenticated = true;

      notifyListeners();
      return true;
    } catch (e) {
      _isAuthenticated = false;
      notifyListeners();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Request OTP for login or verification
  Future<bool> requestOtp(String phone) async {
    try {
      await _authService.requestOtp(phone);
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Verify OTP and sign user in
  Future<bool> verifyOtp(String phone, String otpCode) async {
    _isLoading = true;
    notifyListeners();

    try {
      final tokenResponse =
          await _authService.verifyOtp(phone: phone, otp: otpCode);

      await _tokenStorage.saveTokens(
        tokenResponse['access'],
        tokenResponse['refresh'],
      );

      final userProfile = await _authService.getProfile();
      _user = userProfile;
      _isAuthenticated = true;

      notifyListeners();
      return true;
    } catch (e) {
      _isAuthenticated = false;
      notifyListeners();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Reset password (request code)
  Future<bool> requestPasswordReset(String emailOrPhone) async {
    try {
      await _authService.requestPasswordReset(emailOrPhone);
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Confirm password reset with OTP or token
  Future<bool> confirmPasswordReset({
    required String identifier,
    required String code,
    required String newPassword,
  }) async {
    try {
      await _authService.confirmPasswordReset(
        identifier: identifier,
        code: code,
        newPassword: newPassword,
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Log out user and clear everything
  Future<void> logout() async {
    await _tokenStorage.clearTokens();
    _user = null;
    _isAuthenticated = false;
    notifyListeners();
  }
}
