import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../models/user_profile.dart';

class ProfileController extends AsyncNotifier<UserProfile?> {
  late Dio _dio;

  @override
  Future<UserProfile?> build() async {
    _dio = ref.watch(dioProvider);
    return _fetchProfile();
  }

  Future<UserProfile?> _fetchProfile() async {
    try {
      final response = await _dio.get('/users/profile');
      if (response.statusCode == 200 && response.data['success'] == true) {
        return UserProfile.fromJson(response.data['data']);
      }
      return null;
    } catch (e) {
      debugPrint('Failed to fetch profile: $e');
      return null;
    }
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchProfile());
  }

  Future<bool> updateProfile({
    required String firstName,
    required String lastName,
    required String houseNo,
    required String phoneNumber,
    required String phase,
    required String soi,
    required String residentType,
  }) async {
    try {
      final response = await _dio.patch('/users/profile', data: {
        'first_name': firstName,
        'last_name': lastName,
        'house_no': houseNo,
        'phone_number': phoneNumber,
        'phase': phase,
        'soi': soi,
        'resident_type': residentType,
      });

      if (response.statusCode == 200 && response.data['success'] == true) {
        await refresh();
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Failed to update profile: $e');
      return false;
    }
  }

  Future<bool> changePassword({required String newPassword}) async {
    try {
      final response = await _dio.post('/auth/change-password', data: {
        'newPassword': newPassword,
      });

      if (response.statusCode == 200 && response.data['success'] == true) {
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Failed to change password: $e');
      return false;
    }
  }
}

final profileControllerProvider =
    AsyncNotifierProvider<ProfileController, UserProfile?>(() {
  return ProfileController();
});
