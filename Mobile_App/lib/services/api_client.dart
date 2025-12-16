// lib/services/api_client.dart
// A Dio-based API client that attaches access token to requests and attempts refresh on 401.
// Put this at lib/services/api_client.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'secure_storage.dart';
import 'dart:async';
import 'package:dio/dio.dart';
import '../config/env.dart';
import '../storage/token_storage.dart';
import 'auth_service.dart';

const String API_BASE = String.fromEnvironment('API_BASE', defaultValue: 'http://localhost:8000/api');

class ApiClient {
  final Duration timeout = const Duration(seconds: 15);

  Future<Map<String, dynamic>> get(String path) async {
    final token = await SecureStorage.read('access_token');
    final uri = Uri.parse("$API_BASE$path");
    final res = await http.get(uri, headers: _headers(token)).timeout(timeout);
    return _handleResponse(res);
  }
  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> data) async {
    final token = await SecureStorage.read('access_token');
    final uri = Uri.parse("$API_BASE$path");
    final res = await http.post(uri, headers: _headers(token), body: jsonEncode(data)).timeout(timeout);
    return _handleResponse(res);
  }

  Map<String, String> _headers(String? token) {
    final defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token != null) defaultHeaders['Authorization'] = 'Bearer $token';
    return defaultHeaders;
  }

  Map<String, dynamic> _handleResponse(http.Response res) {
    final code = res.statusCode;
    final body = res.body.isNotEmpty ? jsonDecode(res.body) : {};
    if (code >= 200 && code < 300) return body as Map<String, dynamic>;
    throw Exception("API Error ${res.statusCode}: ${res.body}");
  }
}

class ApiClient {
  // Singleton instance
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late final Dio dio;
  bool _refreshing = false;
  Completer<void>? _refreshCompleter;

  ApiClient._internal() {
    final baseUrl = Env.apiBase; // from env.dart
    dio = Dio(BaseOptions(baseUrl: baseUrl, connectTimeout: Duration(seconds: 15)))
      ..interceptors.add(InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Attach Authorization header if token exists
          final token = await TokenStorage.accessToken;
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            // Try token refresh
            if (!_refreshing) {
              _refreshing = true;
              _refreshCompleter = Completer<void>();
              try {
                final success = await AuthService().refreshToken();
                _refreshing = false;
                _refreshCompleter!.complete();
                if (success) {
                  // retry original request with new token
                  final token = await TokenStorage.accessToken;
                  if (token != null) {
                    error.requestOptions.headers['Authorization'] = 'Bearer $token';
                    final opts = Options(method: error.requestOptions.method, headers: error.requestOptions.headers);
                    final cloneReq = await dio.request(error.requestOptions.path, options: opts, data: error.requestOptions.data, queryParameters: error.requestOptions.queryParameters);
                    return handler.resolve(cloneReq);
                  }
                }
              } catch (e) {
                _refreshing = false;
                _refreshCompleter!.completeError(e);
                // fallthrough to logout
              }
            } else {
              // If refreshing already, wait for it
              try {
                await _refreshCompleter!.future;
                final token = await TokenStorage.accessToken;
                if (token != null) {
                  error.requestOptions.headers['Authorization'] = 'Bearer $token';
                  final opts = Options(method: error.requestOptions.method, headers: error.requestOptions.headers);
                  final cloneReq = await dio.request(error.requestOptions.path, options: opts, data: error.requestOptions.data, queryParameters: error.requestOptions.queryParameters);
                  return handler.resolve(cloneReq);
                }
              } catch (_) {}
            }

            // If refresh failed: clear tokens and propagate 401
            await TokenStorage.clear();
          }
          handler.next(error);
        },
      ));
  }
}
