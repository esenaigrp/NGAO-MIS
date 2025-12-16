import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// A production-ready wrapper around FlutterSecureStorage.
/// Provides encrypted key-value storage for sensitive data.
///
/// This class is intentionally static to avoid unnecessary instantiation.
/// It can be imported and used anywhere in the app.
///
/// Example:
///   await SecureStorage.write('token', 'abc123');
///   final token = await SecureStorage.read('token');
class SecureStorage {
  // Create one instance only (best practice)
  static const FlutterSecureStorage _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true, // Ensures encryption on Android
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock, // More secure on iOS
    ),
  );

  /// Write a secure value.
  static Future<void> write(String key, String value) async {
    await _storage.write(key: key, value: value);
  }

  /// Read a secure value.
  static Future<String?> read(String key) async {
    return await _storage.read(key: key);
  }

  /// Delete a specific key.
  static Future<void> delete(String key) async {
    await _storage.delete(key: key);
  }

  /// Delete *everything* stored securely.
  static Future<void> clear() async {
    await _storage.deleteAll();
  }
}
class SecureStorage {
  static final _storage = FlutterSecureStorage();

  static Future<void> write(String key, String value) async {
    await _storage.write(key: key, value: value);
  }

  static Future<String?> read(String key) async {
    return await _storage.read(key: key);
  }

  static Future<void> delete(String key) async {
    await _storage.delete(key: key);
  }

  static Future<void> clear() async {
    await _storage.deleteAll();
  }
}