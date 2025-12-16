// lib/models/user.dart
// Minimal user model used by app for role checks.

class User {
  final String? email;
  final String? firstName;
  final String? lastName;
  final String? role;

  User({this.email, this.firstName, this.lastName, this.role});

  factory User.fromMap(Map<String, dynamic> m) {
    return User(
      email: m['email'] as String?,
      firstName: m['first_name'] as String? ?? m['firstName'] as String?,
      lastName: m['last_name'] as String? ?? m['lastName'] as String?,
      role: m['role'] as String?,
    );
  }
}
