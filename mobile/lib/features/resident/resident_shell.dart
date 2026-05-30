import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ResidentShell extends StatelessWidget {
  final Widget child;
  
  const ResidentShell({super.key, required this.child});

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
                      icon: Icons.home_filled,
                      label: 'ภาพรวม',
                      index: 0,
                      selectedIndex: selectedIndex,
                      onTap: () => context.go('/resident/dashboard'),
                    ),
                    _buildNavItem(
                      icon: Icons.add_circle_outline,
                      label: 'สร้างคำร้อง',
                      index: 1,
                      selectedIndex: selectedIndex,
                      onTap: () => context.push('/resident/complaints/new'),
                    ),
                    _buildNavItem(
                      icon: Icons.receipt_long,
                      label: 'ประวัติ',
                      index: 2,
                      selectedIndex: selectedIndex,
                      onTap: () => context.go('/resident/complaints'),
                    ),
                    _buildNavItem(
                      icon: Icons.person_outline,
                      label: 'โปรไฟล์',
                      index: 3,
                      selectedIndex: selectedIndex,
                      onTap: () => context.go('/resident/profile'),
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
    required String label,
    required int index,
    required int selectedIndex,
    required VoidCallback onTap,
  }) {
    final isSelected = selectedIndex == index;
    final color = isSelected ? Colors.white : Colors.white.withValues(alpha: 0.5);
    
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 24),
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
    if (location.startsWith('/resident/dashboard')) return 0;
    // Note: /resident/complaints/new is a sub-route pushed on top, but we can highlight index 1 if needed.
    // However, context.push doesn't change the bottom nav index if it's not a ShellRoute.
    // For now, let's keep index 1 for new, index 2 for list.
    if (location.endsWith('/new')) return 1; 
    if (location.startsWith('/resident/complaints')) return 2;
    if (location.startsWith('/resident/profile')) return 3;
    return 0;
  }
}
