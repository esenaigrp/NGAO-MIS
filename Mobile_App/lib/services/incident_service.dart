import 'package:dio/dio.dart';
import '../services/api_client.dart';
import '../storage/token_storage.dart';

class IncidentService {
  final Dio _client = ApiClient.dio;

  Future<List<dynamic>> fetchIncidents() async {
    final token = await TokenStorage.getToken();

    final response = await _client.get(
      "/incidents/",
      options: Options(
        headers: {"Authorization": "Bearer $token"},
      ),
    );

    return response.data;
  }

  Future<Map<String, dynamic>> createIncident(Map<String, dynamic> data) async {
    final token = await TokenStorage.getToken();

    final response = await _client.post(
      "/incidents/create/",
      data: data,
      options: Options(
        headers: {"Authorization": "Bearer $token"},
      ),
    );

    return response.data;
  }

  Future<Map<String, dynamic>> getIncidentDetail(int id) async {
    final token = await TokenStorage.getToken();

    final response = await _client.get(
      "/incidents/$id/",
      options: Options(
        headers: {"Authorization": "Bearer $token"},
      ),
    );

    return response.data;
  }

  Future<Map<String, dynamic>> updateIncidentStatus(int id, String status) async {
    final token = await TokenStorage.getToken();

    final response = await _client.patch(
      "/incidents/$id/status/",
      data: {"status": status},
      options: Options(
        headers: {"Authorization": "Bearer $token"},
      ),
    );

    return response.data;
  }
}
