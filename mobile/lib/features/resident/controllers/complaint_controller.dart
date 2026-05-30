import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../models/complaint.dart';

class ComplaintController extends AsyncNotifier<List<Complaint>> {
  late Dio _dio;

  @override
  Future<List<Complaint>> build() async {
    _dio = ref.watch(dioProvider);
    return _fetchComplaints();
  }

  Future<List<Complaint>> _fetchComplaints() async {
    try {
      final response = await _dio.get('/complaints/my');
      
      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'];
        return data.map((json) => Complaint.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to fetch complaints: $e');
    }
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchComplaints());
  }

  Future<bool> createComplaint({
    required String title,
    required String description,
    required String category,
  }) async {
    try {
      final response = await _dio.post('/complaints', data: {
        'subject': title,
        'description': description,
        'intake_channel': category,
      });
      
      if (response.statusCode == 201 || response.statusCode == 200) {
        // Refresh the list after successful creation
        await refresh();
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Failed to create complaint: $e');
      return false;
    }
  }

  Future<bool> updateComplaint(int id, {
    required String title,
    required String description,
    required String category,
  }) async {
    try {
      final response = await _dio.patch('/complaints/$id', data: {
        'subject': title,
        'description': description,
        'intake_channel': category,
      });
      
      if (response.statusCode == 200 || response.statusCode == 204) {
        await refresh();
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Failed to update complaint: $e');
      return false;
    }
  }

  // Dashboard Stats Helpers
  int get pendingCount {
    return state.value?.where((c) => c.status == 'pending').length ?? 0;
  }

  int get inProgressCount {
    return state.value?.where((c) => c.status == 'in_progress').length ?? 0;
  }

  int get resolvedCount {
    return state.value?.where((c) => c.status == 'resolved' || c.status == 'completed').length ?? 0;
  }

  List<Complaint> get recentComplaints {
    final list = state.value?.toList() ?? [];
    list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return list.take(3).toList();
  }
}

final complaintControllerProvider =
    AsyncNotifierProvider<ComplaintController, List<Complaint>>(() {
  return ComplaintController();
});
