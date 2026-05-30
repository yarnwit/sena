import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'models/complaint.dart';

class ComplaintDetailScreen extends StatelessWidget {
  final Complaint complaint;

  const ComplaintDetailScreen({super.key, required this.complaint});

  @override
  Widget build(BuildContext context) {
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
    String formattedDate = complaint.createdAt.toLocal().toString().split('.')[0]; // YYYY-MM-DD HH:MM:SS

    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: const Color(0xFF161D19),
      appBar: AppBar(
        title: const Text('รายละเอียดคำร้อง', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        actions: [
          if (complaint.status == 'pending')
            IconButton(
              icon: const Icon(Icons.edit, color: Colors.white),
              onPressed: () {
                context.push('/resident/complaints/edit', extra: complaint);
              },
            ),
        ],
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
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // --- Status Header Card ---
                ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('สถานะปัจจุบัน', style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 14)),
                              const SizedBox(height: 4),
                              Text(mockId, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: statusBgColor,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: statusColor.withValues(alpha: 0.5)),
                            ),
                            child: Text(
                              statusText,
                              style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                // --- Section 1: User Info ---
                Row(
                  children: [
                    Icon(Icons.person_outline, color: Colors.white.withValues(alpha: 0.8), size: 22),
                    const SizedBox(width: 8),
                    const Text(
                      '1. ข้อมูลผู้ร้องเรียน',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _buildDataField('ชื่อจริง', 'นพดล'),
                _buildDataField('นามสกุล', 'ศิริวัฒน์'),
                _buildDataField('เบอร์โทรศัพท์', '039532532'),
                _buildDataField('บ้านเลขที่', '88/1'),
                Row(
                  children: [
                    Expanded(child: _buildDataField('เฟส', '1')),
                    const SizedBox(width: 16),
                    Expanded(child: _buildDataField('ซอย', '2')),
                  ],
                ),

                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 24.0),
                  child: Divider(color: Colors.white24),
                ),

                // --- Section 2: Complaint Info ---
                Row(
                  children: [
                    Icon(Icons.edit_document, color: Colors.white.withValues(alpha: 0.8), size: 22),
                    const SizedBox(width: 8),
                    const Text(
                      '2. ข้อมูลเรื่องร้องเรียน',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _buildDataField('หัวข้อคำร้อง', complaint.title),
                _buildDataField('รายละเอียดเพิ่มเติม', complaint.description.isNotEmpty ? complaint.description : '-'),
                _buildDataField('สถานที่รับคำร้อง', 'สำนักงาน'), // Usually fixed or from data
                
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 24.0),
                  child: Divider(color: Colors.white24),
                ),

                // --- Section 3: Document & Receiving Info ---
                Row(
                  children: [
                    Icon(Icons.list_alt, color: Colors.white.withValues(alpha: 0.8), size: 22),
                    const SizedBox(width: 8),
                    const Text(
                      '3. ข้อมูลเอกสารและการรับเรื่อง',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: _buildDataField('วันที่แจ้ง', formattedDate)),
                    const SizedBox(width: 16),
                    Expanded(child: _buildDataField('ช่องทาง', 'แอปพลิเคชัน')),
                  ],
                ),

                const SizedBox(height: 16),
                Text(
                  'ไฟล์แนบ/รูปภาพประกอบคำร้อง',
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 14, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.1),
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.image_not_supported_outlined, color: Colors.white.withValues(alpha: 0.4), size: 40),
                      const SizedBox(height: 8),
                      Text('ไม่มีไฟล์แนบ', style: TextStyle(color: Colors.white.withValues(alpha: 0.5))),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // --- Consideration Section ---
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
                      const Text(
                        'ส่วนพิจารณาคำร้อง',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text('การพิจารณาผลดำเนินการ หรือ การอนุมัติตามระเบียบนิติบุคคล', style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 12)),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(
                                color: (complaint.status == 'resolved' || complaint.status == 'completed' || complaint.status == 'approved' || complaint.status == 'in_progress') 
                                  ? Colors.lightGreenAccent.withValues(alpha: 0.2) 
                                  : Colors.white.withValues(alpha: 0.05),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: (complaint.status == 'resolved' || complaint.status == 'completed' || complaint.status == 'approved' || complaint.status == 'in_progress') 
                                    ? Colors.lightGreenAccent 
                                    : Colors.white.withValues(alpha: 0.1)
                                ),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    (complaint.status == 'resolved' || complaint.status == 'completed' || complaint.status == 'approved' || complaint.status == 'in_progress') ? Icons.check_circle : Icons.circle_outlined,
                                    color: (complaint.status == 'resolved' || complaint.status == 'completed' || complaint.status == 'approved' || complaint.status == 'in_progress') ? Colors.lightGreenAccent : Colors.white54,
                                    size: 20,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'อนุมัติ',
                                    style: TextStyle(
                                      color: (complaint.status == 'resolved' || complaint.status == 'completed' || complaint.status == 'approved' || complaint.status == 'in_progress') ? Colors.lightGreenAccent : Colors.white54,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(
                                color: complaint.status == 'rejected' ? Colors.redAccent.withValues(alpha: 0.2) : Colors.white.withValues(alpha: 0.05),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: complaint.status == 'rejected' ? Colors.redAccent : Colors.white.withValues(alpha: 0.1)
                                ),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    complaint.status == 'rejected' ? Icons.cancel : Icons.circle_outlined,
                                    color: complaint.status == 'rejected' ? Colors.redAccent : Colors.white54,
                                    size: 20,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'ไม่อนุมัติ',
                                    style: TextStyle(
                                      color: complaint.status == 'rejected' ? Colors.redAccent : Colors.white54,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text('ผู้รับคำร้อง(เจ้าหน้าที่นิติบุคคล)', style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 12)),
                      const SizedBox(height: 4),
                      const Text('-', style: TextStyle(color: Colors.white, fontSize: 14)), // Wait for actual reviewer name if needed
                      const SizedBox(height: 16),
                      Text('ความเห็นคณะกรรมการ (เหตุผลประกอบการพิจารณา)', style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 12)),
                      const SizedBox(height: 8),
                      Container(
                        width: double.infinity,
                        constraints: const BoxConstraints(minHeight: 100), // Make it look like a textarea
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.05),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                        ),
                        child: Text(
                          (complaint.committeeComment != null && complaint.committeeComment!.trim().isNotEmpty)
                              ? complaint.committeeComment!
                              : (complaint.status == 'pending' ? 'รอการพิจารณา' : 'ไม่มีความเห็นเพิ่มเติม'),
                          style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 14),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // --- Timeline Section ---
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
                      Row(
                        children: [
                          Icon(Icons.timeline, color: Colors.white.withValues(alpha: 0.8), size: 22),
                          const SizedBox(width: 8),
                          const Text(
                            'ความคืบหน้า',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      Builder(
                        builder: (context) {
                          final status = complaint.status;
                          final isPending = true;
                          final isApproved = ['approved', 'in_meeting', 'in_progress', 'resolved', 'completed'].contains(status);
                          final isInMeeting = ['in_meeting', 'in_progress', 'resolved', 'completed'].contains(status);
                          final isInProgress = ['in_progress', 'resolved', 'completed'].contains(status);
                          final isResolved = ['resolved', 'completed'].contains(status);

                          return Column(
                            children: [
                              _buildTimelineItem('รอดำเนินการ', isPending, false),
                              _buildTimelineItem('อนุมัติรับเรื่อง', isApproved, false),
                              _buildTimelineItem('เข้าที่ประชุม', isInMeeting, false),
                              _buildTimelineItem('กำลังดำเนินการ', isInProgress, false),
                              _buildTimelineItem('แก้ไขแล้ว', isResolved, true),
                            ],
                          );
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // --- Logs Section ---
                Container(
                  padding: const EdgeInsets.all(20),
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.chat_bubble_outline, color: Colors.white.withValues(alpha: 0.8), size: 20),
                          const SizedBox(width: 8),
                          const Text(
                            'ประวัติการดำเนินการ',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      _buildHistoryLog('นพดล ศิริวัฒน์ (ลูกบ้าน) ได้ทำการสร้างเรื่องร้องเรียนเข้าระบบ', formattedDate),
                      if (complaint.status != 'pending')
                         _buildHistoryLog('เจ้าหน้าที่ (นิติบุคคล) ได้รับเรื่องและอัปเดตสถานะเป็น $statusText', formattedDate),
                    ],
                  ),
                ),

                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDataField(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 14, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
            ),
            child: Text(
              value,
              style: TextStyle(color: Colors.white.withValues(alpha: 0.9), fontSize: 16),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineItem(String text, bool isActive, bool isLast) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 16,
              height: 16,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isActive ? Colors.orangeAccent : Colors.transparent,
                border: Border.all(color: isActive ? Colors.orangeAccent : Colors.white30, width: 2),
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 30,
                color: isActive ? Colors.orangeAccent : Colors.white30,
              ),
          ],
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(bottom: 24.0),
            child: Text(
              text,
              style: TextStyle(
                color: isActive ? Colors.orangeAccent : Colors.white54,
                fontSize: 16,
                fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildHistoryLog(String message, String time) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.access_time, color: Colors.white.withValues(alpha: 0.5), size: 14),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 13),
            ),
          ),
          const SizedBox(width: 8),
          Text(time, style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 12)),
        ],
      ),
    );
  }
}
