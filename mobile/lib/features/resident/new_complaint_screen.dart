import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'controllers/complaint_controller.dart';
import 'models/complaint.dart';

class NewComplaintScreen extends ConsumerStatefulWidget {
  final Complaint? complaintToEdit;
  const NewComplaintScreen({super.key, this.complaintToEdit});

  @override
  ConsumerState<NewComplaintScreen> createState() => _NewComplaintScreenState();
}

class _NewComplaintScreenState extends ConsumerState<NewComplaintScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.complaintToEdit != null) {
      _titleController.text = widget.complaintToEdit!.title;
      _descriptionController.text = widget.complaintToEdit!.description;
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);
      
      final bool success;
      if (widget.complaintToEdit != null) {
        success = await ref.read(complaintControllerProvider.notifier).updateComplaint(
          widget.complaintToEdit!.id,
          title: _titleController.text,
          description: _descriptionController.text,
          category: 'ทั่วไป',
        );
      } else {
        success = await ref.read(complaintControllerProvider.notifier).createComplaint(
          title: _titleController.text,
          description: _descriptionController.text,
          category: 'ทั่วไป',
        );
      }

      setState(() => _isLoading = false);

      if (success) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(widget.complaintToEdit != null ? 'แก้ไขคำร้องสำเร็จ!' : 'ส่งคำร้องสำเร็จ!'), backgroundColor: const Color(0xFF28ED0A)),
        );
        context.pop();
        if (widget.complaintToEdit != null) {
          context.pop(); // Return to list view
        }
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('เกิดข้อผิดพลาด กรุณาลองใหม่'), backgroundColor: Colors.redAccent),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: const Color(0xFF161D19),
      appBar: AppBar(
        title: Text(widget.complaintToEdit != null ? 'แก้ไขคำร้อง' : 'สร้างคำร้องใหม่', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
                // --- Warning Banner (Glassmorphism style) ---
                ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.orange.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.orange.withValues(alpha: 0.5)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.warning_amber_rounded, color: Colors.orangeAccent, size: 36),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'สร้างรายการร้องเรียนใหม่',
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'กรอกข้อมูลเพื่อบันทึกเรื่องร้องเรียน',
                                  style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 13),
                                ),
                              ],
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
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
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
                    Text(
                      '(ดึงข้อมูลอัตโนมัติ)',
                      style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 12),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _buildReadOnlyField('ชื่อจริง', 'นพดล'),
                _buildReadOnlyField('นามสกุล', 'ศิริวัฒน์'),
                _buildReadOnlyField('เบอร์โทรศัพท์', '039532532'),
                _buildReadOnlyField('บ้านเลขที่', '88/1'),
                Row(
                  children: [
                    Expanded(child: _buildReadOnlyField('เฟส', '1')),
                    const SizedBox(width: 16),
                    Expanded(child: _buildReadOnlyField('ซอย', '2')),
                  ],
                ),

                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 24.0),
                  child: Divider(color: Colors.white24),
                ),

                // --- Section 2: Complaint Form ---
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

                Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLabel('หัวข้อคำร้อง'),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _titleController,
                        style: const TextStyle(color: Colors.white),
                        decoration: _inputDecoration('เช่น น้ำรั่ว, แอร์ไม่เย็น', Icons.title),
                        validator: (value) => value == null || value.isEmpty ? 'กรุณาระบุหัวข้อ' : null,
                      ),
                      const SizedBox(height: 20),

                      _buildLabel('รายละเอียดเพิ่มเติม (ถ้ามี)'),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _descriptionController,
                        style: const TextStyle(color: Colors.white),
                        maxLines: 4,
                        decoration: _inputDecoration('อธิบายรายละเอียดเพิ่มเติม...', Icons.description).copyWith(
                          alignLabelWithHint: true,
                        ),
                      ),
                      const SizedBox(height: 20),
                      
                      _buildLabel('ไฟล์แนบ/รูปภาพประกอบคำร้อง'),
                      const SizedBox(height: 8),
                      GestureDetector(
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('ฟังก์ชันเลือกไฟล์กำลังพัฒนา...')),
                          );
                        },
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.05),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.3),
                              style: BorderStyle.solid,
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.attach_file, color: Colors.white.withValues(alpha: 0.6)),
                              const SizedBox(width: 8),
                              Text('แนบไฟล์เอกสาร/ รูปภาพ', style: TextStyle(color: Colors.white.withValues(alpha: 0.6))),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                
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
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('สถานที่รับคำร้อง', style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 14, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 8),
                          TextFormField(
                            initialValue: '',
                            style: const TextStyle(color: Colors.white),
                            decoration: _inputDecoration('').copyWith(
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(child: _buildReadOnlyField('วันที่', '30/05/2026')),
                  ],
                ),
                _buildReadOnlyField('ช่องทางการรับเรื่อง', 'แอปพลิเคชัน (Mobile)'),
                const SizedBox(height: 16),
                
                // Warning Box
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF3CD), // Solid light yellow
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.orangeAccent),
                  ),
                  child: Column(
                    children: [
                      const Icon(Icons.warning_rounded, color: Colors.orange, size: 32),
                      const SizedBox(height: 8),
                      const Text(
                        'เงื่อนไขความรับผิดชอบ',
                        style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'ข้าพเจ้าจะดำเนินการทุกอย่างตามระเบียบปฏิบัติของทางนิติบุคคล\nหากเกิดปัญหาหรือมีข้อผิดพลาดเกิดขึ้น ข้าพเจ้ายินดีรับผิดชอบแต่เพียงผู้เดียว',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.red, fontSize: 13, height: 1.4),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 40),

                // --- Submit Buttons ---
                Row(
                  children: [
                    Expanded(
                      flex: 1,
                      child: OutlinedButton(
                        onPressed: _isLoading ? null : () => context.pop(),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 18),
                          side: const BorderSide(color: Colors.white54),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        child: const Text('ยกเลิก', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      flex: 2,
                      child: SizedBox(
                        height: 60,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _submit,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF28ED0A),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            elevation: 10,
                            shadowColor: const Color(0xFF28ED0A).withValues(alpha: 0.5),
                          ),
                          child: _isLoading
                              ? const CircularProgressIndicator(color: Colors.white)
                              : Text(
                                  widget.complaintToEdit != null ? 'บันทึกการแก้ไข' : 'บันทึกคำร้อง',
                                  style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                                ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildReadOnlyField(String label, String value) {
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

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
    );
  }

  InputDecoration _inputDecoration(String hint, [IconData? icon]) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.4)),
      prefixIcon: icon != null ? Icon(icon, color: Colors.white.withValues(alpha: 0.6)) : null,
      filled: true,
      fillColor: Colors.white.withValues(alpha: 0.1),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Color(0xFF28ED0A)),
      ),
      errorStyle: const TextStyle(color: Colors.redAccent),
    );
  }
}
