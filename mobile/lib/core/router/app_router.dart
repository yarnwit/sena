import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/login_screen.dart';
import '../../features/auth/auth_controller.dart';
import '../../features/resident/resident_shell.dart';
import '../../features/resident/home_screen.dart';
import '../../features/resident/complaints_screen.dart';
import '../../features/resident/profile_screen.dart';
import '../../features/resident/new_complaint_screen.dart';
import '../../features/resident/complaint_detail_screen.dart';
import '../../features/resident/models/complaint.dart';
import '../../features/resident/models/user_profile.dart';
import '../../features/resident/edit_profile_screen.dart';

// Staff imports with prefixes to avoid name conflicts
import '../../features/staff/staff_shell.dart' as staff;
import '../../features/staff/home_screen.dart' as staff_home;
import '../../features/staff/complaints_screen.dart' as staff_complaints;
import '../../features/staff/complaint_detail_screen.dart' as staff_detail;
import '../../features/staff/profile_screen.dart' as staff_profile;

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');
final GlobalKey<NavigatorState> _shellNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'shell');

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authControllerProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/login',
    redirect: (context, state) {
      if (authState.isLoading) return null;

      final authData = authState.value;
      final isAuthenticated = authData?.isAuthenticated ?? false;
      final role = authData?.role;
      final isLoggingIn = state.matchedLocation == '/login';

      if (!isAuthenticated && !isLoggingIn) {
        return '/login'; 
      }
      if (isAuthenticated && isLoggingIn) {
        if (role == 'staff' || role == 'admin') {
          return '/staff/dashboard';
        } else {
          return '/resident/dashboard';
        }
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/resident/complaints/new',
        builder: (context, state) => const NewComplaintScreen(),
      ),
      GoRoute(
        path: '/resident/complaints/detail',
        builder: (context, state) {
          final complaint = state.extra as Complaint;
          return ComplaintDetailScreen(complaint: complaint);
        },
      ),
      GoRoute(
        path: '/resident/complaints/edit',
        builder: (context, state) {
          final complaint = state.extra as Complaint;
          return NewComplaintScreen(complaintToEdit: complaint);
        },
      ),
      GoRoute(
        path: '/resident/profile/edit',
        builder: (context, state) {
          final profile = state.extra as UserProfile;
          return EditProfileScreen(profile: profile);
        },
      ),
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) {
          return ResidentShell(child: child);
        },
        routes: [
          GoRoute(
            path: '/resident/dashboard',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/resident/complaints',
            builder: (context, state) => const ComplaintsScreen(),
          ),
          GoRoute(
            path: '/resident/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
      ShellRoute(
        navigatorKey: GlobalKey<NavigatorState>(debugLabel: 'staff_shell'),
        builder: (context, state, child) {
          return staff.StaffShell(child: child);
        },
        routes: [
          GoRoute(
            path: '/staff/dashboard',
            builder: (context, state) => const staff_home.HomeScreen(),
          ),
          GoRoute(
            path: '/staff/complaints',
            builder: (context, state) => const staff_complaints.ComplaintsScreen(),
          ),
          GoRoute(
            path: '/staff/complaints/detail',
            builder: (context, state) {
              final complaint = state.extra as Complaint;
              return staff_detail.ComplaintDetailScreen(complaint: complaint);
            },
          ),
          GoRoute(
            path: '/staff/profile',
            builder: (context, state) => const staff_profile.ProfileScreen(),
          ),
        ],
      ),
    ],
  );
});
