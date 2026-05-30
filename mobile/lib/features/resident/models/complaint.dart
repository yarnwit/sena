class Complaint {
  final int id;
  final String title;
  final String description;
  final String status;
  final String? category;
  final String? committeeComment;
  final String? ticketNo;
  final String? houseNo;
  final String? firstName;
  final String? lastName;
  final DateTime createdAt;
  final DateTime updatedAt;

  Complaint({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    this.category,
    this.committeeComment,
    this.ticketNo,
    this.houseNo,
    this.firstName,
    this.lastName,
    required this.createdAt,
    required this.updatedAt,
  });

  Complaint copyWith({
    int? id,
    String? title,
    String? description,
    String? status,
    String? category,
    String? committeeComment,
    String? ticketNo,
    String? houseNo,
    String? firstName,
    String? lastName,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Complaint(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      status: status ?? this.status,
      category: category ?? this.category,
      committeeComment: committeeComment ?? this.committeeComment,
      ticketNo: ticketNo ?? this.ticketNo,
      houseNo: houseNo ?? this.houseNo,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  factory Complaint.fromJson(Map<String, dynamic> json) {
    return Complaint(
      id: json['complaint_id'] is int ? json['complaint_id'] : int.tryParse(json['complaint_id']?.toString() ?? '0') ?? 0,
      title: json['subject'] ?? 'ไม่มีหัวข้อ',
      description: json['description'] ?? '',
      status: json['status'] ?? 'pending',
      category: json['intake_channel']?.toString() ?? 'ทั่วไป',
      committeeComment: json['committee_comment']?.toString(),
      ticketNo: json['ticket_no']?.toString(),
      houseNo: json['house_no']?.toString(),
      firstName: json['first_name']?.toString(),
      lastName: json['last_name']?.toString(),
      createdAt: DateTime.tryParse(json['reported_date'] ?? '') ?? DateTime.now(),
      updatedAt: json['updated_at'] != null 
          ? DateTime.parse(json['updated_at']) 
          : DateTime.now(),
    );
  }
}
