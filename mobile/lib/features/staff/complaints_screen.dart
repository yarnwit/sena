import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'controllers/staff_complaint_controller.dart';
import '../resident/models/complaint.dart';

class ComplaintsScreen extends ConsumerStatefulWidget {
  const ComplaintsScreen({super.key});

  @override
  ConsumerState<ComplaintsScreen> createState() => _ComplaintsScreenState();
}

class _ComplaintsScreenState extends ConsumerState<ComplaintsScreen> {
  String _selectedStatus = 'All';

  @override
  Widget build(BuildContext context) {
    final complaintState = ref.watch(staffComplaintControllerProvider);

    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('รายการคำร้องทั้งหมด', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        automaticallyImplyLeading: false,
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
          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildFilterChip('All', 'ทั้งหมด'),
                const SizedBox(width: 8),
                _buildFilterChip('Pending', 'รอดำเนินการ'),
                const SizedBox(width: 8),
                _buildFilterChip('In Progress', 'กำลังแก้ไข'),
                const SizedBox(width: 8),
                _buildFilterChip('Resolved', 'แก้ไขแล้ว'),
                const SizedBox(width: 8),
                _buildFilterChip('Closed', 'ปิดงาน'),
              ],
            ),
          ),
          
          Expanded(
            child: complaintState.when(
              data: (complaints) {
                final filtered = _selectedStatus == 'All' 
                    ? complaints 
                    : complaints.where((c) => c.status == _selectedStatus).toList();

                if (filtered.isEmpty) {
                  return Center(
                    child: Text('ไม่มีข้อมูล', style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 16)),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () => ref.read(staffComplaintControllerProvider.notifier).refresh(),
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
              loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFF28ED0A))),
              error: (error, _) => Center(
                child: Text('เกิดข้อผิดพลาด: $error', style: const TextStyle(color: Colors.redAccent)),
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
      'Pending': Colors.orange,
      'In Progress': Colors.purple,
      'Resolved': const Color(0xFF28ED0A),
      'Closed': Colors.grey,
      'Rejected': Colors.red,
    };
    final color = statusColors[complaint.status] ?? Colors.white;

    return GestureDetector(
      onTap: () {
        context.push('/staff/complaints/detail', extra: complaint);
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    complaint.title,
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: color.withValues(alpha: 0.5)),
                  ),
                  child: Text(
                    complaint.status,
                    style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              complaint.description,
              style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 14),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Icon(Icons.calendar_today, size: 14, color: Colors.white.withValues(alpha: 0.5)),
                const SizedBox(width: 4),
                Text(
                  DateFormat('dd MMM yyyy, HH:mm').format(complaint.createdAt),
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 12),
                ),
                const Spacer(),
                Icon(Icons.person, size: 14, color: Colors.white.withValues(alpha: 0.5)),
                const SizedBox(width: 4),
                Text(
                  'ลูกบ้าน', // Could show resident name if available
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 12),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
