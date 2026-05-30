import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'controllers/complaint_controller.dart';
import 'models/complaint.dart';
import '../notifications/notification_controller.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final complaintState = ref.watch(complaintControllerProvider);
    final complaintNotifier = ref.read(complaintControllerProvider.notifier);

    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: Colors.transparent,
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              const Color(0xFF161D19).withValues(alpha: 0.9),
              const Color(0xFF225114).withValues(alpha: 0.9),
              const Color(0xFF38BC0B), 
            ],
            stops: const [0.0, 0.5, 1.0],
          ),
        ),
        child: SafeArea(
          bottom: false,
          child: RefreshIndicator(
            onRefresh: () => complaintNotifier.refresh(),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // --- Header ---
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'หน้าหลัก',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Row(
                        children: [
                          _buildNotificationIcon(context, ref),
                          const SizedBox(width: 12),
                          _buildHeaderIcon(Icons.settings_outlined, onTap: () => context.push('/settings')),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // --- Profile Section ---
                  Row(
                    children: [
                      const CircleAvatar(
                        radius: 28,
                        backgroundColor: Colors.white24,
                        backgroundImage: NetworkImage('https://i.pravatar.cc/150?img=12'),
                      ),
                      const SizedBox(width: 16),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'สมชาย ใจดี',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'บ้านเลขที่ 88/1 เฟส 1 ซอย 1',
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.7),
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 40),

                  // --- Stats Cards (Vertical) ---
                  complaintState.when(
                    data: (_) => Column(
                      children: [
                        _buildStatCard(
                          icon: Icons.access_time_filled,
                          count: complaintNotifier.pendingCount.toString(),
                          title: 'Pending',
                          subtitle: 'เรื่องที่รอดำเนินการ',
                        ),
                        const SizedBox(height: 16),
                        _buildStatCard(
                          icon: Icons.build,
                          count: complaintNotifier.inProgressCount.toString(),
                          title: 'In-Progress',
                          subtitle: 'เรื่องที่แก้ไขแล้ว',
                        ),
                        const SizedBox(height: 16),
                        _buildStatCard(
                          icon: Icons.check_circle,
                          count: complaintNotifier.resolvedCount.toString(),
                          title: 'Approved',
                          subtitle: 'คำร้องที่ได้รับการอนุมัติ',
                          iconColor: const Color(0xFF28ED0A),
                        ),
                        const SizedBox(height: 16),
                        _buildStatCard(
                          icon: Icons.cancel,
                          count: '0',
                          title: 'Rejected',
                          subtitle: 'คำร้องที่ไม่ได้รับการอนุมัติ',
                          iconColor: Colors.redAccent,
                        ),
                        const SizedBox(height: 40),

                        // --- Recent Complaints List (Web Data Style) ---
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'ติดตามสถานะคำร้องล่าสุด',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            TextButton(
                              onPressed: () => context.go('/resident/complaints'),
                              child: Text(
                                'ดูทั้งหมด >',
                                style: TextStyle(color: Colors.white.withValues(alpha: 0.7)),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                          ),
                          child: Builder(
                            builder: (context) {
                              final recentComplaints = complaintNotifier.recentComplaints;
                              if (recentComplaints.isEmpty) {
                                return Padding(
                                  padding: const EdgeInsets.all(24.0),
                                  child: Center(child: Text('ยังไม่มีข้อมูลคำร้อง', style: TextStyle(color: Colors.white.withValues(alpha: 0.6)))),
                                );
                              }
                              return ListView.separated(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                itemCount: recentComplaints.length,
                                separatorBuilder: (context, index) => Divider(color: Colors.white.withValues(alpha: 0.1), height: 1),
                                itemBuilder: (context, index) {
                                  return _buildComplaintListItem(context, recentComplaints[index]);
                                },
                              );
                            },
                          ),
                        ),
                        const SizedBox(height: 120), // Extra space for bottom nav
                      ],
                    ),
                    loading: () => const Center(child: CircularProgressIndicator(color: Colors.white)),
                    error: (err, _) => Center(child: Text('Error: $err', style: const TextStyle(color: Colors.white))),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderIcon(IconData icon, {VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.white.withValues(alpha: 0.1),
          border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
        ),
        child: Icon(icon, color: Colors.white.withValues(alpha: 0.8), size: 20),
      ),
    );
  }

  Widget _buildNotificationIcon(BuildContext context, WidgetRef ref) {
    final notifications = ref.watch(notificationControllerProvider);
    final hasUnread = notifications.any((n) => !n.isRead);

    return GestureDetector(
      onTap: () => context.push('/notifications'),
      child: Stack(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white.withValues(alpha: 0.1),
              border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
            ),
            child: const Icon(Icons.notifications_none, color: Colors.white, size: 20),
          ),
          if (hasUnread)
            Positioned(
              right: 8,
              top: 8,
              child: Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: Colors.redAccent,
                  shape: BoxShape.circle,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String count,
    required String title,
    required String subtitle,
    Color? iconColor,
  }) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.1),
                ),
                child: Icon(
                  icon,
                  color: iconColor ?? Colors.white.withValues(alpha: 0.9),
                  size: 20,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.6),
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                count,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 40,
                  fontWeight: FontWeight.bold,
                  height: 1.0,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildComplaintListItem(BuildContext context, Complaint complaint) {
    Color statusColor = Colors.white;
    Color statusBgColor = Colors.white.withValues(alpha: 0.1);
    String statusText = complaint.status;
    
    if (complaint.status == 'pending') {
      statusColor = Colors.orangeAccent;
      statusBgColor = Colors.orange.withValues(alpha: 0.2);
      statusText = 'รอดำเนินการ';
    } else if (complaint.status == 'in_progress') {
      statusColor = Colors.lightGreenAccent;
      statusBgColor = Colors.green.withValues(alpha: 0.2);
      statusText = 'แก้ไขแล้ว';
    } else if (complaint.status == 'resolved' || complaint.status == 'completed') {
      statusColor = Colors.lightGreenAccent;
      statusBgColor = Colors.green.withValues(alpha: 0.2);
      statusText = 'อนุมัติ';
    } else if (complaint.status == 'rejected') {
      statusColor = Colors.redAccent;
      statusBgColor = Colors.red.withValues(alpha: 0.2);
      statusText = 'ไม่อนุมัติ';
    }

    String mockId = 'TK260528-${(complaint.id.hashCode % 10000).toString().padLeft(4, '0')}';

    return GestureDetector(
      onTap: () => context.push('/resident/complaints/detail', extra: complaint),
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16.0, horizontal: 16.0),
        child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            flex: 2,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  complaint.title,
                  style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.white, fontSize: 15),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 6),
                Text(
                  mockId,
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 13),
                ),
              ],
            ),
          ),
          Expanded(
            flex: 1,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: statusBgColor,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: statusColor.withValues(alpha: 0.5)),
                ),
                child: Text(
                  statusText,
                  style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ),
            ),
          ),
        ],
      ),
      ),
    );
  }
}
