/**
 * User Model — đại diện cho tài khoản người dùng trong hệ thống.
 * Roles: 'admin' | 'manager' | 'tenant' | 'visitor'
 */
export class User {
  constructor(data) {
    const {
      id,
      fullName,
      email,
      phone,
      role,
      avatar = null,
      status = 'active',
      propertyIds = [],
      createdAt,
    } = data || {};
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
