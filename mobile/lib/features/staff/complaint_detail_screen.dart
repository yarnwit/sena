import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../resident/models/complaint.dart';
import 'controllers/staff_complaint_controller.dart';

class ComplaintDetailScreen extends ConsumerStatefulWidget {
  final Complaint complaint;
  final String? filterStatus;

  const ComplaintDetailScreen({super.key, required this.complaint, this.filterStatus});

  @override
  ConsumerState<ComplaintDetailScreen> createState() => _ComplaintDetailScreenState();
}

class _ComplaintDetailScreenState extends ConsumerState<ComplaintDetailScreen> {
  late String _currentStatus;
  bool _isUpdating = false;

  @override
  void initState() {
    super.initState();
    _currentStatus = widget.complaint.status;
  }

  Future<void> _updateStatus(String newStatus) async {
    setState(() => _isUpdating = true);
    final success = await ref.read(staffComplaintControllerProvider.notifier).updateComplaintStatus(
      widget.complaint.id,
      newStatus,
    );
    setState(() {
      _isUpdating = false;
      if (success) _currentStatus = newStatus;
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success ? 'อัปเดตสถานะสำเร็จ' : 'เกิดข้อผิดพลาดในการอัปเดต'),
          backgroundColor: success ? const Color(0xFF007AFF) : Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('รายละเอียดคำร้อง', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
            // Status Display and Action Section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('จัดการสถานะ', style: TextStyle(color: Colors.white70, fontSize: 14)),
                  const SizedBox(height: 16),
                  _buildStatusBadge(),
                  const SizedBox(height: 24),
                  _buildActionButtons(),
                ],
              ),
            ),
            const SizedBox(height: 24),
            
            // Details Section
            const Text('ข้อมูลคำร้อง', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            _buildDetailField('รหัสคำร้อง', '#${widget.complaint.id}'),
            _buildDetailField('หัวข้อ', widget.complaint.title),
            _buildDetailField('หมวดหมู่', widget.complaint.category ?? '-'),
            _buildDetailField('รายละเอียด', widget.complaint.description),
            _buildDetailField('วันที่แจ้ง', DateFormat('dd MMM yyyy, HH:mm').format(widget.complaint.createdAt)),
            _buildDetailField('อัปเดตล่าสุด', DateFormat('dd MMM yyyy, HH:mm').format(widget.complaint.updatedAt)),
          ],
        ),
      ),
        ),
      ),
    );
  }

  Widget _buildDetailField(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 14)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 16)),
        ],
      ),
    );
  }

  Widget _buildStatusBadge() {
    final statusLabels = {
      'pending': 'รอดำเนินการ',
      'approved': 'อนุมัติรับเรื่อง / รอเข้าที่ประชุม',
      'in_meeting': 'เข้าที่ประชุม',
      'in_progress': 'กำลังดำเนินการ',
      'resolved': 'แก้ไขแล้ว',
      'rejected': 'ไม่อนุมัติ',
      'closed': 'ปิดเรื่อง',
    };
    final statusColors = {
      'pending': Colors.orange,
      'approved': Colors.teal,
      'in_meeting': Colors.purple,
      'in_progress': Colors.blue,
      'resolved': const Color(0xFF28ED0A),
      'rejected': Colors.red,
      'closed': Colors.grey,
    };
    
    final label = statusLabels[_currentStatus] ?? _currentStatus;
    final color = statusColors[_currentStatus] ?? Colors.white;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.5)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 16,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildActionButtons() {
    if (_isUpdating) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF007AFF)));
    }

    if (widget.filterStatus != null && widget.filterStatus != 'all' && _currentStatus != widget.filterStatus) {
      return const Center(
        child: Text(
          'อัปเดตสถานะเรียบร้อยแล้ว',
          style: TextStyle(color: Color(0xFF28ED0A), fontWeight: FontWeight.bold, fontSize: 16),
        ),
      );
    }

    switch (_currentStatus) {
      case 'pending':
        return Column(
          children: [
            _buildActionButton('อนุมัติรับเรื่อง', 'approved', Colors.teal),
            const SizedBox(height: 8),
            _buildActionButton('ไม่อนุมัติ', 'rejected', Colors.red),
          ],
        );
      case 'approved':
        return _buildActionButton('นำเรื่องเข้าที่ประชุม', 'in_meeting', Colors.purple);
      case 'in_meeting':
        return Column(
          children: [
            _buildActionButton('มติ: อนุมัติให้ดำเนินการ', 'in_progress', Colors.blue),
            const SizedBox(height: 8),
            _buildActionButton('มติ: ไม่อนุมัติ', 'rejected', Colors.red),
          ],
        );
      case 'in_progress':
        return _buildActionButton('บันทึกการแก้ไขเสร็จสิ้น', 'resolved', const Color(0xFF28ED0A));
      case 'resolved':
        return _buildActionButton('ปิดเรื่อง', 'closed', Colors.grey);
      default:
        return const SizedBox();
    }
  }

  Widget _buildActionButton(String label, String status, Color color) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: () => _updateStatus(status),
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
