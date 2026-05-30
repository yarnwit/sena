import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../resident/models/complaint.dart';
import 'controllers/staff_complaint_controller.dart';

class ComplaintDetailScreen extends ConsumerStatefulWidget {
  final Complaint complaint;

  const ComplaintDetailScreen({super.key, required this.complaint});

  @override
  ConsumerState<ComplaintDetailScreen> createState() => _ComplaintDetailScreenState();
}

class _ComplaintDetailScreenState extends ConsumerState<ComplaintDetailScreen> {
  late String _currentStatus;
  bool _isUpdating = false;

  final List<String> _statuses = ['Pending', 'In Progress', 'Resolved', 'Closed', 'Rejected'];

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
            // Status Update Section
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('สถานะปัจจุบัน', style: TextStyle(color: Colors.white70, fontSize: 14)),
                  const SizedBox(height: 12),
                  InputDecorator(
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.2)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFF007AFF)),
                      ),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _currentStatus,
                        dropdownColor: const Color(0xFF1a2620),
                        style: const TextStyle(color: Colors.white, fontSize: 16),
                        isExpanded: true,
                        items: _statuses.map((status) {
                          return DropdownMenuItem(
                            value: status,
                            child: Text(status),
                          );
                        }).toList(),
                        onChanged: _isUpdating ? null : (val) {
                          if (val != null && val != _currentStatus) {
                            _updateStatus(val);
                          }
                        },
                      ),
                    ),
                  ),
                  if (_isUpdating)
                    const Padding(
                      padding: EdgeInsets.only(top: 16),
                      child: Center(child: CircularProgressIndicator(color: Color(0xFF007AFF))),
                    ),
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
}
