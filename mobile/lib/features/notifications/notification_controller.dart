import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'notification_model.dart';

class NotificationController extends Notifier<List<NotificationModel>> {
  @override
  List<NotificationModel> build() {
    _loadMockNotifications();
    return [];
  }

  Future<void> _loadMockNotifications() async {
    final prefs = await SharedPreferences.getInstance();
    final String? saved = prefs.getString('mock_notifications');
    
    if (saved != null) {
      try {
        final List<dynamic> decoded = jsonDecode(saved);
        state = decoded.map((item) => NotificationModel(
          id: item['id'],
          title: item['title'],
          message: item['message'],
          createdAt: DateTime.parse(item['createdAt']),
          isRead: item['isRead'],
          type: item['type'],
        )).toList();
        return;
      } catch (e) {
        // Fallback to initial mock if error
      }
    }

    // Initial Mock Data
    state = [
      NotificationModel(
        id: '1',
        title: 'อัปเดตสถานะคำร้อง #TK260528-1234',
        message: 'คำร้อง "ไฟหน้าโครงการดับ" ของคุณได้รับการอนุมัติแล้ว',
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
        isRead: false,
        type: 'status_update',
      ),
      NotificationModel(
        id: '2',
        title: 'แจ้งเตือนนิติบุคคล',
        message: 'มีการประชุมคณะกรรมการพรุ่งนี้เวลา 10:00 น.',
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
        isRead: true,
        type: 'announcement',
      ),
    ];
    _saveMockNotifications();
  }

  Future<void> _saveMockNotifications() async {
    final prefs = await SharedPreferences.getInstance();
    final String encoded = jsonEncode(state.map((n) => {
      'id': n.id,
      'title': n.title,
      'message': n.message,
      'createdAt': n.createdAt.toIso8601String(),
      'isRead': n.isRead,
      'type': n.type,
    }).toList());
    await prefs.setString('mock_notifications', encoded);
  }

  void markAsRead(String id) {
    state = state.map((n) {
      if (n.id == id) {
        return n.copyWith(isRead: true);
      }
      return n;
    }).toList();
    _saveMockNotifications();
  }

  void markAllAsRead() {
    state = state.map((n) => n.copyWith(isRead: true)).toList();
    _saveMockNotifications();
  }
}

final notificationControllerProvider = NotifierProvider<NotificationController, List<NotificationModel>>(() {
  return NotificationController();
});
