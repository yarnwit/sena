import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class StaffShell extends StatelessWidget {
  final Widget child;

  const StaffShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final int selectedIndex = _calculateSelectedIndex(context);

    return Scaffold(
      extendBody: true,
      body: child,
      bottomNavigationBar: SafeArea(
        child: Container(
          height: 70,
          margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(35),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF161D19).withValues(alpha: 0.85),
                  borderRadius: BorderRadius.circular(35),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildNavItem(
                      icon: Icons.grid_view_outlined,
                      activeIcon: Icons.grid_view,
                      label: 'ภาพรวมงาน',
                      index: 0,
                      selectedIndex: selectedIndex,
                      onTap: () => context.go('/staff/dashboard'),
                    ),
                    _buildNavItem(
                      icon: Icons.note_add_outlined,
                      activeIcon: Icons.note_add,
                      label: 'สร้างเรื่องร้องเรียน',
                      index: 1,
                      selectedIndex: selectedIndex,
                      onTap: () => context.push('/staff-new-complaint'),
                    ),
                    _buildNavItem(
                      icon: Icons.receipt_long_outlined,
                      activeIcon: Icons.receipt_long,
                      label: 'จัดการร้องเรียน',
                      index: 2,
                      selectedIndex: selectedIndex,
                      onTap: () => context.go('/staff/complaints'),
                    ),
                    _buildNavItem(
                      icon: Icons.person_outline,
                      activeIcon: Icons.person,
                      label: 'โปรไฟล์',
                      index: 3,
                      selectedIndex: selectedIndex,
                      onTap: () => context.go('/staff/profile'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    required IconData activeIcon,
    required String label,
    required int index,
    required int selectedIndex,
    required VoidCallback onTap,
  }) {
    final isSelected = selectedIndex == index;
    final color = isSelected ? const Color(0xFF007AFF) : Colors.white.withValues(alpha: 0.5);
    final displayIcon = isSelected ? activeIcon : icon;
    
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(displayIcon, color: color, size: 24),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: color,
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  static int _calculateSelectedIndex(BuildContext context) {
    final String location = GoRouterState.of(context).matchedLocation;
    if (location.startsWith('/staff/dashboard')) return 0;
    if (location.endsWith('/new')) return 1;
    if (location.startsWith('/staff/complaints')) return 2;
    if (location.startsWith('/staff/profile')) return 3;
    return 0;
  }
}
