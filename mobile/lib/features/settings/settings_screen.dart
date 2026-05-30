import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../auth/auth_controller.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _pushNotificationsEnabled = true;
  bool _emailNotificationsEnabled = false;
  bool _darkModeEnabled = true;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _pushNotificationsEnabled = prefs.getBool('push_notifications') ?? true;
      _emailNotificationsEnabled = prefs.getBool('email_notifications') ?? false;
      _darkModeEnabled = prefs.getBool('dark_mode') ?? true;
    });
  }

  Future<void> _saveSetting(String key, bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(key, value);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: const Color(0xFF161D19),
      appBar: AppBar(
        title: const Text('ตั้งค่าระบบ', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('การแจ้งเตือน', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                _buildSwitchTile(
                  title: 'แจ้งเตือนผ่านมือถือ (Push Notifications)',
                  icon: Icons.notifications_active,
                  value: _pushNotificationsEnabled,
                  onChanged: (val) {
                    setState(() => _pushNotificationsEnabled = val);
                    _saveSetting('push_notifications', val);
                  },
                ),
                _buildSwitchTile(
                  title: 'แจ้งเตือนผ่านอีเมล',
                  icon: Icons.email,
                  value: _emailNotificationsEnabled,
                  onChanged: (val) {
                    setState(() => _emailNotificationsEnabled = val);
                    _saveSetting('email_notifications', val);
                  },
                ),
                
                const SizedBox(height: 32),
                const Text('การแสดงผล', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                _buildSwitchTile(
                  title: 'โหมดกลางคืน (Dark Mode)',
                  icon: Icons.dark_mode,
                  value: _darkModeEnabled,
                  onChanged: (val) {
                    setState(() => _darkModeEnabled = val);
                    _saveSetting('dark_mode', val);
                    // Note: In a real app, this would update a ThemeProvider
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('กำลังบันทึกการตั้งค่าธีม...')),
                    );
                  },
                ),

                const SizedBox(height: 48),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      ref.read(authControllerProvider.notifier).logout();
                    },
                    icon: const Icon(Icons.logout, color: Colors.white),
                    label: const Text('ออกจากระบบ', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.redAccent.withValues(alpha: 0.8),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSwitchTile({
    required String title,
    required IconData icon,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: SwitchListTile(
        title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 15)),
        secondary: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: Colors.white70, size: 20),
        ),
        value: value,
        onChanged: onChanged,
        activeThumbColor: const Color(0xFF28ED0A),
      ),
    );
  }
}
