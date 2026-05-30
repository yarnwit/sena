class UserProfile {
  final String userId;
  final String username;
  final String firstName;
  final String lastName;
  final String houseNo;
  final String phoneNumber;
  final String residentType;
  final String phase;
  final String soi;

  UserProfile({
    required this.userId,
    required this.username,
    required this.firstName,
    required this.lastName,
    required this.houseNo,
    required this.phoneNumber,
    required this.residentType,
    required this.phase,
    required this.soi,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      userId: json['user_id'] ?? '',
      username: json['username'] ?? '',
      firstName: json['first_name'] ?? '',
      lastName: json['last_name'] ?? '',
      houseNo: json['house_no']?.toString() ?? '',
      phoneNumber: json['phone_number']?.toString() ?? '',
      residentType: json['resident_type'] ?? '',
      phase: json['phase']?.toString() ?? '',
      soi: json['soi']?.toString() ?? '',
    );
  }
}
