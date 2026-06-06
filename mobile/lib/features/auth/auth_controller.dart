import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/network/api_client.dart';
import '../resident/controllers/profile_controller.dart';

class AuthState {
  final bool isAuthenticated;
  final String? role;

  const AuthState({required this.isAuthenticated, this.role});
}

class AuthController extends AsyncNotifier<AuthState> {
  late Dio _dio;
  late FlutterSecureStorage _storage;

  @override
  Future<AuthState> build() async {
    _dio = ref.watch(dioProvider);
    _storage = ref.watch(secureStorageProvider);
    
    // Check if user is already logged in on startup
    final token = await _storage.read(key: 'accessToken');
    final role = await _storage.read(key: 'userRole');
    return AuthState(isAuthenticated: token != null, role: role);
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
        final user = response.data['data']['user'];
        final role = user != null ? user['role'] as String? : null;

        if (token != null) {
          await _storage.write(key: 'accessToken', value: token);
          if (role != null) {
            await _storage.write(key: 'userRole', value: role);
          }
          
          // Invalidate user-specific data providers so the new user's data is fetched
          ref.invalidate(profileControllerProvider);
          
          state = AsyncValue.data(AuthState(isAuthenticated: true, role: role));
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
    await _storage.delete(key: 'userRole');
    
    // Invalidate user-specific data providers
    ref.invalidate(profileControllerProvider);
    
    state = const AsyncValue.data(AuthState(isAuthenticated: false));
  }
}

final authControllerProvider = AsyncNotifierProvider<AuthController, AuthState>(() {
  return AuthController();
});

