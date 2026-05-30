import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'controllers/complaint_controller.dart';
import 'models/complaint.dart';

class ComplaintsScreen extends ConsumerWidget {
  const ComplaintsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final complaintState = ref.watch(complaintControllerProvider);
    final complaintNotifier = ref.read(complaintControllerProvider.notifier);

    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: const Color(0xFF161D19),
      appBar: AppBar(
        title: const Text('ประวัติคำร้องของฉัน', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => GoRouter.of(context).go('/resident/dashboard'),
        ),
      ),
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF161D19), Color(0xFF225114), Color(0xFF38BC0B)],
            stops: [0.0, 0.5, 1.0],
          ),
        ),
        child: SafeArea(
          child: complaintState.when(
            data: (complaints) {
              if (complaints.isEmpty) {
                return const Center(
                  child: Text(
                    'ยังไม่มีข้อมูลการแจ้งซ่อม',
                    style: TextStyle(color: Colors.white70, fontSize: 16),
                  ),
                );
              }

              return RefreshIndicator(
                onRefresh: () => complaintNotifier.refresh(),
                color: const Color(0xFF28ED0A),
                child: ListView.separated(
                  padding: const EdgeInsets.fromLTRB(24, 16, 24, 120),
                  itemCount: complaints.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 16),
                  itemBuilder: (context, index) {
                    final complaint = complaints[index];
                    return _buildComplaintCard(context, complaint);
                  },
                ),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator(color: Colors.white)),
            error: (err, stack) => Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('เกิดข้อผิดพลาด: $err', style: const TextStyle(color: Colors.white)),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => complaintNotifier.refresh(),
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF28ED0A)),
                    child: const Text('ลองใหม่', style: TextStyle(color: Colors.white)),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildComplaintCard(BuildContext context, Complaint complaint) {
    Color statusColor = Colors.white;
    Color statusBgColor = Colors.white.withValues(alpha: 0.1);
    String statusText = complaint.status;

    if (complaint.status == 'pending') {
      statusColor = Colors.orangeAccent;
      statusBgColor = Colors.orange.withValues(alpha: 0.2);
      statusText = 'รอดำเนินการ';
    } else if (complaint.status == 'in_progress') {
      statusColor = Colors.lightBlueAccent;
      statusBgColor = Colors.blue.withValues(alpha: 0.2);
      statusText = 'กำลังดำเนินการ';
    } else if (complaint.status == 'resolved' || complaint.status == 'completed') {
      statusColor = Colors.lightGreenAccent;
      statusBgColor = Colors.green.withValues(alpha: 0.2);
      statusText = 'อนุมัติ/เสร็จสิ้น';
    } else if (complaint.status == 'rejected') {
      statusColor = Colors.redAccent;
      statusBgColor = Colors.red.withValues(alpha: 0.2);
      statusText = 'ไม่อนุมัติ';
    }

    String mockId = 'TK260528-${(complaint.id.hashCode % 10000).toString().padLeft(4, '0')}';

    return GestureDetector(
      onTap: () {
        // Need to import go_router if not already, but we did that earlier.
        GoRouter.of(context).push('/resident/complaints/detail', extra: complaint);
      },
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.all(20),
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
                children: [
                  Text(
                    mockId,
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 12),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusBgColor,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: statusColor.withValues(alpha: 0.5)),
                    ),
                    child: Text(
                      statusText,
                      style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                complaint.title,
                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 18),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.category, color: Colors.white.withValues(alpha: 0.5), size: 16),
                  const SizedBox(width: 6),
                  Text(
                    complaint.category ?? "ทั่วไป",
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 14),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Icon(Icons.calendar_today, color: Colors.white.withValues(alpha: 0.5), size: 16),
                  const SizedBox(width: 6),
                  Text(
                    complaint.createdAt.toLocal().toString().split(' ')[0],
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 14),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      ),
    );
  }
}
