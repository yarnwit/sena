import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../resident/models/complaint.dart';

class StaffComplaintController extends AsyncNotifier<List<Complaint>> {
  late Dio _dio;

  @override
  Future<List<Complaint>> build() async {
    _dio = ref.watch(dioProvider);
    return fetchAllComplaints();
  }

  Future<List<Complaint>> fetchAllComplaints() async {
    try {
      final response = await _dio.get('/complaints/all');
      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'];
        return data.map((json) => Complaint.fromJson(json)).toList();
      }
      throw Exception('Failed to load complaints');
    } catch (e) {
      throw Exception('Error fetching complaints: $e');
    }
  }

  Future<bool> updateComplaintStatus(int id, String newStatus) async {
    try {
      final response = await _dio.patch(
        '/complaints/staff/$id/status',
        data: {'status': newStatus},
      );
      if (response.statusCode == 200 && response.data['success'] == true) {
        // Optimistically update state
        if (state.hasValue) {
          final currentComplaints = state.value!;
          final updatedComplaints = currentComplaints.map((c) {
            if (c.id == id) {
              return c.copyWith(status: newStatus);
            }
            return c;
          }).toList();
          state = AsyncValue.data(updatedComplaints);
        }
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
  
  Future<void> refresh() async {
    state = const AsyncValue.loading();
    try {
      final complaints = await fetchAllComplaints();
      state = AsyncValue.data(complaints);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final staffComplaintControllerProvider = AsyncNotifierProvider<StaffComplaintController, List<Complaint>>(() {
  return StaffComplaintController();
});
