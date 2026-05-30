class Complaint {
  final int id;
  final String title;
  final String description;
  final String status;
  final String? category;
  final String? committeeComment;
  final DateTime createdAt;
  final DateTime updatedAt;

  Complaint({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    this.category,
    this.committeeComment,
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
      committeeComment: json['petition']?.toString(),
      createdAt: json['reported_date'] != null 
          ? DateTime.parse(json['reported_date']) 
          : DateTime.now(),
      updatedAt: json['updated_at'] != null 
          ? DateTime.parse(json['updated_at']) 
          : DateTime.now(),
    );
  }
}
