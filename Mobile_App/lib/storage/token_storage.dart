// lib/storage/token_storage.dart
// Secure storage for JWT access/refresh tokens using flutter_secure_storage.

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'secure_storage.dart';

class TokenStorage {
  // Single instance of secure storage
  static final _storage = FlutterSecureStorage();

  // Keys
  static const _kAccessToken = 'access_token';
  static const _kRefreshToken = 'refresh_token';
  static const _kRole = 'user_role';

  // Save tokens
  static Future<void> saveTokens({required String accessToken, String? refreshToken}) async {
    await _storage.write(key: _kAccessToken, value: accessToken);
    if (refreshToken != null) await _storage.write(key: _kRefreshToken, value: refreshToken);
  }

  static Future<void> saveRole(String role) async {
    await _storage.write(key: _kRole, value: role);
  }

  // Read tokens
  static Future<String?> get accessToken async => await _storage.read(key: _kAccessToken);
  static Future<String?> get refreshToken async => await _storage.read(key: _kRefreshToken);
  static Future<String?> get role async => await _storage.read(key: _kRole);

  // Delete tokens
  static Future<void> clear() async {
    await _storage.delete(key: _kAccessToken);
    await _storage.delete(key: _kRefreshToken);
    await _storage.delete(key: _kRole);
  }
}
