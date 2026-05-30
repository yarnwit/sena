class Complaint {
  final int id;
  final String title;
  final String description;
  final String status;
  final String? category;
  final String? committeeComment;
  final DateTime createdAt;

  Complaint({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    this.category,
    this.committeeComment,
    required this.createdAt,
  });

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
    );
  }
}
