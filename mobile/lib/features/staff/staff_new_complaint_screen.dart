import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'controllers/staff_complaint_controller.dart';
import 'models/resident_info.dart';

class StaffNewComplaintScreen extends ConsumerStatefulWidget {
  const StaffNewComplaintScreen({super.key});

  @override
  ConsumerState<StaffNewComplaintScreen> createState() => _StaffNewComplaintScreenState();
}

class _StaffNewComplaintScreenState extends ConsumerState<StaffNewComplaintScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  
  // Manual Input Controllers
  final _manualFirstNameController = TextEditingController();
  final _manualLastNameController = TextEditingController();
  final _manualPhoneController = TextEditingController();
  final _manualHouseNoController = TextEditingController();
  final _manualPhaseController = TextEditingController();
  final _manualSoiController = TextEditingController();

  bool _isSystemSelect = true; // true = Select from system, false = Manual Input
  ResidentInfo? _selectedResident;
  List<ResidentInfo> _residents = [];
  bool _isLoadingResidents = true;
  bool _isSubmitting = false;

  String _selectedLocation = 'นิติบุคคล'; // Default for staff

  @override
  void initState() {
    super.initState();
    _loadResidents();
  }

  Future<void> _loadResidents() async {
    final list = await ref.read(staffComplaintControllerProvider.notifier).fetchResidentsList();
    if (mounted) {
      setState(() {
        _residents = list;
        _isLoadingResidents = false;
      });
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _manualFirstNameController.dispose();
    _manualLastNameController.dispose();
    _manualPhoneController.dispose();
    _manualHouseNoController.dispose();
    _manualPhaseController.dispose();
    _manualSoiController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_isSystemSelect && _selectedResident == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('กรุณาเลือกลูกบ้านจากระบบ'), backgroundColor: Colors.redAccent),
      );
      return;
    }

    if (_formKey.currentState!.validate()) {
      setState(() => _isSubmitting = true);
      
      final success = await ref.read(staffComplaintControllerProvider.notifier).createComplaintForStaff(
        residentId: _isSystemSelect ? _selectedResident!.id : null,
        manualName: !_isSystemSelect ? '${_manualFirstNameController.text} ${_manualLastNameController.text}'.trim() : null,
        manualPhone: !_isSystemSelect ? _manualPhoneController.text : null,
        manualHouseNo: !_isSystemSelect ? _manualHouseNoController.text : null,
        subject: _titleController.text,
        description: _descriptionController.text,
        locationWritten: _selectedLocation,
        phase: !_isSystemSelect ? _manualPhaseController.text : null,
        soi: !_isSystemSelect ? _manualSoiController.text : null,
        intakeChannel: 'แอปพลิเคชัน (Mobile)',
      );

      if (!mounted) return;
      setState(() => _isSubmitting = false);

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('สร้างคำร้องสำเร็จ!'), backgroundColor: Color(0xFF28ED0A)),
        );
        context.pop();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('เกิดข้อผิดพลาด กรุณาลองใหม่'), backgroundColor: Colors.redAccent),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFF007AFF);
    const gradientColors = [Color(0xFF161D19), Color(0xFF004080), Color(0xFF007AFF)];

    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: const Color(0xFF161D19),
      appBar: AppBar(
        title: const Text('สร้างคำร้องนิติบุคคล', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
            colors: gradientColors,
            stops: [0.0, 0.5, 1.0],
          ),
        ),
        child: SafeArea(
          child: _isLoadingResidents 
            ? const Center(child: CircularProgressIndicator(color: primaryColor))
            : SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // --- Warning Banner ---
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
                            const Icon(Icons.business_center, color: Colors.orangeAccent, size: 36),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'สร้างคำร้องในนามนิติบุคคล',
                                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'สามารถเลือกลูกบ้านที่มีในระบบ หรือกรอกข้อมูลผู้มาติดต่อเองได้',
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

                  // --- Section 1: User Info Mode ---
                  Row(
                    children: [
                      Icon(Icons.person_search, color: Colors.white.withValues(alpha: 0.8), size: 22),
                      const SizedBox(width: 8),
                      const Text(
                        '1. ข้อมูลผู้ร้องเรียน',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Mode Toggle
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _isSystemSelect = true),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: _isSystemSelect ? primaryColor : Colors.white.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            alignment: Alignment.center,
                            child: const Text('เลือกจากระบบ', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _isSystemSelect = false),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: !_isSystemSelect ? primaryColor : Colors.white.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            alignment: Alignment.center,
                            child: const Text('กรอกข้อมูลเอง', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  if (_isSystemSelect) ...[
                    _buildLabel('เลือกลูกบ้าน'),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<ResidentInfo>(
                      initialValue: _selectedResident,
                      dropdownColor: const Color(0xFF161D19),
                      isExpanded: true,
                      style: const TextStyle(color: Colors.white, fontSize: 16),
                      decoration: _inputDecoration('เลือกลูกบ้านจากระบบ...', primaryColor),
                      items: _residents.map((r) => DropdownMenuItem(
                        value: r, 
                        child: Text('${r.houseNo} - ${r.fullName.isNotEmpty ? r.fullName : 'ไม่ระบุชื่อ'}')
                      )).toList(),
                      onChanged: (val) {
                        setState(() => _selectedResident = val);
                      },
                    ),
                    if (_selectedResident != null) ...[
                      const SizedBox(height: 16),
                      _buildReadOnlyField('ชื่อ', _selectedResident!.firstName ?? '-'),
                      _buildReadOnlyField('นามสกุล', _selectedResident!.lastName ?? '-'),
                      _buildReadOnlyField('เบอร์โทรศัพท์', _selectedResident!.phoneNumber ?? '-'),
                      _buildReadOnlyField('บ้านเลขที่', _selectedResident!.houseNo),
                      _buildReadOnlyField('เฟส', _selectedResident!.phase ?? '-'),
                      _buildReadOnlyField('ซอย', _selectedResident!.soi ?? '-'),
                    ]
                  ] else ...[
                    _buildLabel('ชื่อ'),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _manualFirstNameController,
                      style: const TextStyle(color: Colors.white),
                      decoration: _inputDecoration('ชื่อ', primaryColor),
                      validator: (value) => value == null || value.isEmpty ? 'กรุณาระบุชื่อ' : null,
                    ),
                    const SizedBox(height: 16),

                    _buildLabel('นามสกุล'),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _manualLastNameController,
                      style: const TextStyle(color: Colors.white),
                      decoration: _inputDecoration('นามสกุล', primaryColor),
                      validator: (value) => value == null || value.isEmpty ? 'กรุณาระบุนามสกุล' : null,
                    ),
                    const SizedBox(height: 16),

                    _buildLabel('เบอร์โทรศัพท์'),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _manualPhoneController,
                      style: const TextStyle(color: Colors.white),
                      keyboardType: TextInputType.phone,
                      decoration: _inputDecoration('เบอร์โทรศัพท์', primaryColor),
                    ),
                    const SizedBox(height: 16),

                    _buildLabel('บ้านเลขที่'),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _manualHouseNoController,
                      style: const TextStyle(color: Colors.white),
                      decoration: _inputDecoration('บ้านเลขที่', primaryColor),
                      validator: (value) => value == null || value.isEmpty ? 'ระบุบ้านเลขที่' : null,
                    ),
                    const SizedBox(height: 16),

                    _buildLabel('เฟส'),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _manualPhaseController,
                      style: const TextStyle(color: Colors.white),
                      decoration: _inputDecoration('เฟส', primaryColor),
                    ),
                    const SizedBox(height: 16),

                    _buildLabel('ซอย'),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _manualSoiController,
                      style: const TextStyle(color: Colors.white),
                      decoration: _inputDecoration('ซอย', primaryColor),
                    ),
                  ],

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

                  _buildLabel('หัวข้อคำร้อง'),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _titleController,
                    style: const TextStyle(color: Colors.white),
                    decoration: _inputDecoration('เช่น น้ำรั่ว, แอร์ไม่เย็น', primaryColor),
                    validator: (value) => value == null || value.isEmpty ? 'กรุณาระบุหัวข้อ' : null,
                  ),
                  const SizedBox(height: 20),

                  _buildLabel('รายละเอียดเพิ่มเติม (ถ้ามี)'),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _descriptionController,
                    style: const TextStyle(color: Colors.white),
                    maxLines: 4,
                    decoration: _inputDecoration('อธิบายรายละเอียดเพิ่มเติม...', primaryColor).copyWith(
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
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          const SizedBox(width: 16),
                          Icon(Icons.attach_file, color: Colors.white.withValues(alpha: 0.6)),
                          const SizedBox(width: 8),
                          Text('แนบไฟล์เอกสาร/ รูปภาพ', style: TextStyle(color: Colors.white.withValues(alpha: 0.6))),
                        ],
                      ),
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
                            DropdownButtonFormField<String>(
                              initialValue: _selectedLocation,
                              dropdownColor: const Color(0xFF161D19),
                              style: const TextStyle(color: Colors.white, fontSize: 16),
                              decoration: _inputDecoration('', primaryColor).copyWith(
                                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                              ),
                              items: ['นิติบุคคล', 'บ้าน', 'พื้นที่ส่วนกลาง', 'อื่นๆ']
                                  .map((loc) => DropdownMenuItem(value: loc, child: Text(loc)))
                                  .toList(),
                              onChanged: (val) {
                                if (val != null) setState(() => _selectedLocation = val);
                              },
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(child: _buildReadOnlyField('วันที่', DateFormat('dd/MM/yyyy').format(DateTime.now()))),
                    ],
                  ),
                  
                  const SizedBox(height: 40),

                  // --- Submit Button ---
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primaryColor,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: _isSubmitting
                          ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Text(
                              'บันทึกคำร้อง',
                              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
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

  InputDecoration _inputDecoration(String hint, Color primaryColor) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.4)),
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
        borderSide: BorderSide(color: primaryColor),
      ),
      errorStyle: const TextStyle(color: Colors.redAccent),
    );
  }
}
