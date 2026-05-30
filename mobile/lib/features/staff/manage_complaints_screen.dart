import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ManageComplaintsScreen extends StatelessWidget {
  const ManageComplaintsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: const Color(0xFF161D19),
      appBar: AppBar(
        title: const Text('จัดการเรื่องร้องเรียน', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => GoRouter.of(context).go('/staff/dashboard'),
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
              const Color(0xFF007AFF).withValues(alpha: 0.4), 
            ],
            stops: const [0.0, 1.0],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                Expanded(
                  child: GridView.count(
                    crossAxisCount: 2,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    children: [
                      _buildMenuBox(
                        context,
                        title: 'เรื่องร้องเรียนทั้งหมด',
                        icon: Icons.list_alt,
                        onTap: () => context.push('/staff/complaints/all'),
                      ),
                      _buildMenuBox(
                        context,
                        title: 'รอเข้าที่ประชุม',
                        icon: Icons.groups_outlined,
                        onTap: () => context.push('/staff/complaints/all', extra: {
                          'filterStatus': 'approved',
                          'customTitle': 'รอเข้าที่ประชุม',
                        }),
                      ),
                      _buildMenuBox(
                        context,
                        title: 'นำเรื่องเข้าที่ประชุม',
                        icon: Icons.how_to_vote_outlined,
                        onTap: () => context.push('/staff/complaints/all', extra: {
                          'filterStatus': 'in_meeting',
                          'customTitle': 'นำเรื่องเข้าที่ประชุม',
                        }),
                      ),
                      _buildMenuBox(
                        context,
                        title: 'ติดตามการแก้ไขปัญหา',
                        icon: Icons.track_changes_outlined,
                        onTap: () => context.push('/staff/complaints/all', extra: {
                          'filterStatus': 'in_progress',
                          'customTitle': 'ติดตามการแก้ไขปัญหา',
                        }),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMenuBox(BuildContext context, {required String title, required IconData icon, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFF007AFF).withValues(alpha: 0.5)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 10,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF007AFF).withValues(alpha: 0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 40, color: const Color(0xFF007AFF)),
            ),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              child: Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
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
