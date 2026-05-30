import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'controllers/staff_complaint_controller.dart';
import '../resident/models/complaint.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    final complaintState = ref.watch(staffComplaintControllerProvider);
    final complaintNotifier = ref.read(staffComplaintControllerProvider.notifier);

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
              const Color(0xFF007AFF), 
            ],
            stops: const [0.0, 1.0],
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
                          _buildHeaderIcon(Icons.notifications_none),
                          const SizedBox(width: 12),
                          _buildHeaderIcon(Icons.settings_outlined),
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
                        child: Icon(Icons.business_center, color: Colors.white, size: 30),
                      ),
                      const SizedBox(width: 16),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'นิติบุคคล',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'ผู้ดูแลระบบ',
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
                    data: (complaints) {
                      final total = complaints.length;
                      final pending = complaints.where((c) => c.status == 'pending').length;
                      final approved = complaints.where((c) => c.status == 'approved').length;
                      final inMeeting = complaints.where((c) => c.status == 'in_meeting').length;
                      final inProgress = complaints.where((c) => c.status == 'in_progress').length;
                      final resolved = complaints.where((c) => c.status == 'resolved' || c.status == 'closed').length;
                      final rejected = complaints.where((c) => c.status == 'rejected').length;

                      // Urgent: pending sorted by oldest first
                      final urgent = complaints.where((c) => c.status == 'pending').toList()
                        ..sort((a, b) => a.createdAt.compareTo(b.createdAt));
                      // Recent: all sorted by newest first
                      final recent = complaints.toList()
                        ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
                      
                      final combinedMap = <int, Complaint>{};
                      for (var c in urgent) {
                        combinedMap[c.id] = c;
                      }
                      for (var c in recent) {
                        if (!combinedMap.containsKey(c.id)) {
                          combinedMap[c.id] = c;
                        }
                      }
                      final displayComplaints = combinedMap.values.take(8).toList();

                      return Column(
                        children: [
                          _buildSummaryCard(
                            'เรื่องร้องเรียนทั้งหมด',
                            total.toString(),
                            Icons.inbox,
                            Colors.indigoAccent,
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: _buildSummaryCard(
                                  'รอดำเนินการ',
                                  pending.toString(),
                                  Icons.access_time,
                                  Colors.grey,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: _buildSummaryCard(
                                  'อนุมัติรับเรื่อง',
                                  approved.toString(),
                                  Icons.fact_check,
                                  Colors.teal,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: _buildSummaryCard(
                                  'เข้าที่ประชุม',
                                  inMeeting.toString(),
                                  Icons.groups,
                                  Colors.purpleAccent,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: _buildSummaryCard(
                                  'กำลังดำเนินการ',
                                  inProgress.toString(),
                                  Icons.trending_up,
                                  Colors.blue,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: _buildSummaryCard(
                                  'แก้ไขแล้ว / ปิด',
                                  resolved.toString(),
                                  Icons.check_circle,
                                  Colors.green,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: _buildSummaryCard(
                                  'ปฏิเสธ',
                                  rejected.toString(),
                                  Icons.cancel,
                                  Colors.redAccent,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 40),

                          // --- Recent Complaints List ---
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'เรื่องร้องเรียนล่าสุด',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              TextButton(
                                onPressed: () => context.go('/staff/complaints'),
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
                            child: displayComplaints.isEmpty
                                ? Padding(
                                    padding: const EdgeInsets.all(24.0),
                                    child: Center(
                                      child: Text(
                                        'ยังไม่มีข้อมูลคำร้อง',
                                        style: TextStyle(color: Colors.white.withValues(alpha: 0.6)),
                                      ),
                                    ),
                                  )
                                : ListView.separated(
                                    shrinkWrap: true,
                                    physics: const NeverScrollableScrollPhysics(),
                                    itemCount: displayComplaints.length,
                                    separatorBuilder: (context, index) => Divider(color: Colors.white.withValues(alpha: 0.1), height: 1),
                                    itemBuilder: (context, index) {
                                      return _buildComplaintListItem(context, displayComplaints[index]);
                                    },
                                  ),
                          ),
                          const SizedBox(height: 120), // Extra space for bottom nav
                        ],
                      );
                    },
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

  Widget _buildHeaderIcon(IconData icon) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.white.withValues(alpha: 0.1),
        border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
      ),
      child: Icon(icon, color: Colors.white.withValues(alpha: 0.8), size: 20),
    );
  }

  Widget _buildSummaryCard(
    String title,
    String count,
    IconData icon,
    Color iconColor,
  ) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: iconColor.withValues(alpha: 0.2),
                    ),
                    child: Icon(
                      icon,
                      color: iconColor,
                      size: 24,
                    ),
                  ),
                  Text(
                    count,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      height: 1.0,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.8),
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
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
    } else if (complaint.status == 'approved') {
      statusColor = Colors.tealAccent;
      statusBgColor = Colors.teal.withValues(alpha: 0.2);
      statusText = 'อนุมัติรับเรื่อง';
    } else if (complaint.status == 'in_meeting') {
      statusColor = Colors.purpleAccent;
      statusBgColor = Colors.purple.withValues(alpha: 0.2);
      statusText = 'เข้าที่ประชุม';
    } else if (complaint.status == 'in_progress') {
      statusColor = Colors.lightBlueAccent;
      statusBgColor = Colors.blue.withValues(alpha: 0.2);
      statusText = 'กำลังดำเนินการ';
    } else if (complaint.status == 'resolved') {
      statusColor = const Color(0xFF007AFF);
      statusBgColor = const Color(0xFF007AFF).withValues(alpha: 0.2);
      statusText = 'แก้ไขแล้ว';
    } else if (complaint.status == 'closed') {
      statusColor = Colors.grey;
      statusBgColor = Colors.grey.withValues(alpha: 0.2);
      statusText = 'ปิดเรื่อง';
    } else if (complaint.status == 'rejected') {
      statusColor = Colors.redAccent;
      statusBgColor = Colors.red.withValues(alpha: 0.2);
      statusText = 'ปิดงาน';
    }

    String mockId = 'TK260528-${(complaint.id.hashCode % 10000).toString().padLeft(4, '0')}';

    return GestureDetector(
      onTap: () => context.push('/staff/complaints/detail', extra: complaint),
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
