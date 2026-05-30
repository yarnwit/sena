import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'controllers/staff_complaint_controller.dart';
import '../resident/models/complaint.dart';

class ComplaintsScreen extends ConsumerStatefulWidget {
  final String? filterStatus;
  final String? customTitle;

  const ComplaintsScreen({super.key, this.filterStatus, this.customTitle});

  @override
  ConsumerState<ComplaintsScreen> createState() => _ComplaintsScreenState();
}

class _ComplaintsScreenState extends ConsumerState<ComplaintsScreen> {
  late String _selectedStatus;

  @override
  void initState() {
    super.initState();
    _selectedStatus = widget.filterStatus ?? 'all';
  }

  @override
  Widget build(BuildContext context) {
    final complaintState = ref.watch(staffComplaintControllerProvider);

    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: Text(
          widget.customTitle ?? 'รายการคำร้องทั้งหมด',
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => context.pop(),
        ),
      ),
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
          child: Column(
            children: [
              // Filter Chips (Hide if filterStatus is provided)
              if (widget.filterStatus == null)
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  child: Row(
                    children: [
                      _buildFilterChip('all', 'ทั้งหมด'),
                      const SizedBox(width: 8),
                      _buildFilterChip('pending', 'รอดำเนินการ'),
                      const SizedBox(width: 8),
                      _buildFilterChip('approved', 'รอเข้าที่ประชุม'),
                      const SizedBox(width: 8),
                      _buildFilterChip('in_meeting', 'เข้าที่ประชุม'),
                      const SizedBox(width: 8),
                      _buildFilterChip('in_progress', 'กำลังดำเนินการ'),
                      const SizedBox(width: 8),
                      _buildFilterChip('resolved', 'แก้ไขแล้ว'),
                      const SizedBox(width: 8),
                      _buildFilterChip('closed', 'ปิดงาน'),
                    ],
                  ),
                ),

              Expanded(
                child: complaintState.when(
                  data: (complaints) {
                    final filtered = _selectedStatus == 'all'
                        ? complaints
                        : complaints
                              .where((c) => c.status == _selectedStatus)
                              .toList();

                    if (filtered.isEmpty) {
                      return Center(
                        child: Text(
                          'ไม่มีข้อมูล',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.5),
                            fontSize: 16,
                          ),
                        ),
                      );
                    }

                    return RefreshIndicator(
                      onRefresh: () => ref
                          .read(staffComplaintControllerProvider.notifier)
                          .refresh(),
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: filtered.length,
                        itemBuilder: (context, index) {
                          final complaint = filtered[index];
                          return _buildComplaintCard(complaint);
                        },
                      ),
                    );
                  },
                  loading: () => const Center(
                    child: CircularProgressIndicator(color: Color(0xFF28ED0A)),
                  ),
                  error: (error, _) => Center(
                    child: Text(
                      'เกิดข้อผิดพลาด: $error',
                      style: const TextStyle(color: Colors.redAccent),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChip(String value, String label) {
    final isSelected = _selectedStatus == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) setState(() => _selectedStatus = value);
      },
      selectedColor: const Color(0xFF007AFF).withValues(alpha: 0.2),
      backgroundColor: Colors.white.withValues(alpha: 0.05),
      labelStyle: TextStyle(
        color: isSelected ? const Color(0xFF007AFF) : Colors.white70,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
      side: BorderSide(
        color: isSelected ? const Color(0xFF007AFF) : Colors.transparent,
      ),
    );
  }

  Widget _buildComplaintCard(Complaint complaint) {
    final statusColors = {
      'pending': Colors.orange,
      'approved': Colors.teal,
      'in_meeting': Colors.purple,
      'in_progress': Colors.blue,
      'resolved': const Color(0xFF28ED0A),
      'rejected': Colors.red,
      'closed': Colors.grey,
    };
    final statusLabels = {
      'pending': 'รอดำเนินการ',
      'approved': 'อนุมัติรับเรื่อง',
      'in_meeting': 'เข้าที่ประชุม',
      'in_progress': 'กำลังดำเนินการ',
      'resolved': 'แก้ไขแล้ว',
      'rejected': 'ไม่อนุมัติ',
      'closed': 'ปิดเรื่อง',
    };
    final color = statusColors[complaint.status] ?? Colors.white;
    final label = statusLabels[complaint.status] ?? complaint.status;

    return GestureDetector(
      onTap: () {
        context.push('/staff/complaints/detail', extra: {
          'complaint': complaint,
          'filterStatus': widget.filterStatus,
        });
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    complaint.ticketNo ?? '#${complaint.id}',
                    style: const TextStyle(
                      color: Color(0xFF007AFF),
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    complaint.title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.home, size: 14, color: Colors.orangeAccent),
                      const SizedBox(width: 4),
                      Text(
                        complaint.houseNo ?? '-',
                        style: const TextStyle(
                          color: Colors.orangeAccent,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          (complaint.firstName != null && complaint.lastName != null)
                              ? '${complaint.firstName} ${complaint.lastName}'
                              : (complaint.firstName ?? ''),
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.5),
                            fontSize: 12,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    DateFormat('dd MMM yyyy, HH:mm').format(complaint.createdAt),
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.5),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 10,
                vertical: 4,
              ),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: color.withValues(alpha: 0.5)),
              ),
              child: Text(
                label,
                style: TextStyle(
                  color: color,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
