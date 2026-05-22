/**
 * User Model — đại diện cho tài khoản người dùng trong hệ thống.
 * Roles: 'admin' | 'manager' | 'tenant' | 'visitor'
 */
export class User {
  constructor({
    id,
    fullName,
    email,
    phone,
    role,
    avatar = null,
    status = 'active', // 'active' | 'locked' | 'pending'
    propertyIds = [], // chỉ áp dụng cho manager
    createdAt,
  }) {
    this.id = id;
    this.fullName = fullName;
    this.email = email;
    this.phone = phone;
    this.role = role;
    this.avatar = avatar;
    this.status = status;
    this.propertyIds = propertyIds;
    this.createdAt = createdAt;
  }

  get displayName() {
    return this.fullName || this.email;
  }

  get initials() {
    if (!this.fullName) return '?';
    return this.fullName
      .split(' ')
      .map((s) => s[0])
      .slice(-2)
      .join('')
      .toUpperCase();
  }

  isAdmin() { return this.role === 'admin'; }
  isManager() { return this.role === 'manager'; }
  isTenant() { return this.role === 'tenant'; }
}
