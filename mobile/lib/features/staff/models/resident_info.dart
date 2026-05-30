class ResidentInfo {
  final int id;
  final String houseNo;
  final String? phoneNumber;
  final String? residentType;
  final String? phase;
  final String? soi;
  final String? firstName;
  final String? lastName;

  ResidentInfo({
    required this.id,
    required this.houseNo,
    this.phoneNumber,
    this.residentType,
    this.phase,
    this.soi,
    this.firstName,
    this.lastName,
  });

  factory ResidentInfo.fromJson(Map<String, dynamic> json) {
    return ResidentInfo(
      id: json['resident_id'] ?? json['id'] ?? 0,
      houseNo: json['house_no'] ?? '-',
      phoneNumber: json['phone_number'],
      residentType: json['resident_type'],
      phase: json['phase'],
      soi: json['soi'],
      firstName: json['first_name'],
      lastName: json['last_name'],
    );
  }

  String get fullName => '${firstName ?? ''} ${lastName ?? ''}'.trim();
}
