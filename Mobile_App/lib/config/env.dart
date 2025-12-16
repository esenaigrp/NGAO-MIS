// lib/config/env.dart
// Loads environment variables at app start. Use dotenv to configure API base URL.

import 'package:flutter_dotenv/flutter_dotenv.dart';

class Env {
  /// Call `await Env.init()` at app startup (main.dart) before using Env.apiBase.
  static Future<void> init() async {
    await dotenv.load(fileName: ".env");
  }

  /// Example key in .env: REACT_API_BASE=http://localhost:8000/api
  static String get apiBase => dotenv.env'REACT_API_BASE=REACT_API_BASE=http://10.0.2.2:8000/api;
}
