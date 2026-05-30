import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/network/api_client.dart';

class AuthController extends AsyncNotifier<bool> {
  late Dio _dio;
  late FlutterSecureStorage _storage;

  @override
  Future<bool> build() async {
    _dio = ref.watch(dioProvider);
    _storage = ref.watch(secureStorageProvider);
    
    // Check if user is already logged in on startup
    final token = await _storage.read(key: 'accessToken');
    return token != null;
  }

  Future<void> login(String username, String password) async {
    state = const AsyncValue.loading();
    
    try {
      final response = await _dio.post('/auth/login', data: {
        'username': username,
        'password': password,
      });

      if (response.statusCode == 200 && response.data['success'] == true) {
        final token = response.data['data']['accessToken'];
        if (token != null) {
          await _storage.write(key: 'accessToken', value: token);
          state = const AsyncValue.data(true);
        } else {
          state = AsyncValue.error('Login failed. Token is missing.', StackTrace.current);
        }
      } else {
        state = AsyncValue.error('Login failed. Invalid response.', StackTrace.current);
      }
    } on DioException catch (e) {
      String errorMessage = 'Failed to connect to server.';
      if (e.response != null) {
        errorMessage = e.response?.data['message'] ?? 'Invalid username or password.';
      }
      state = AsyncValue.error(errorMessage, StackTrace.current);
    } catch (e) {
      state = AsyncValue.error(e.toString(), StackTrace.current);
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'accessToken');
    state = const AsyncValue.data(false);
  }
}

final authControllerProvider = AsyncNotifierProvider<AuthController, bool>(() {
  return AuthController();
});
