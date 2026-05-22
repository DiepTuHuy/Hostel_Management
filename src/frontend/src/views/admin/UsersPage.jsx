import { useState, useEffect } from 'react';
import { Plus, Search, X, Check, Save, Edit, Trash2, Lock, Unlock } from 'lucide-react';
import { Button, PageHeader, Card, Tabs, Table, Badge, Avatar, Input, Toast } from '../../components/common';
import { useFetch } from '../../controllers/useFetch.js';
import { userService } from '../../services/index.js';
import { formatDate } from '../../utils/format.js';

const STATUS_MAP = {
  active: { color: 'success', label: 'Hoạt động' },
  locked: { color: 'danger', label: 'Khoá' },
  pending: { color: 'warning', label: 'Chờ kích hoạt' },
};

const AVAILABLE_PROPERTIES = [
  { id: 'b1', name: 'BoardingHouse Q.1' },
  { id: 'b2', name: 'BoardingHouse Q.7' },
  { id: 'b3', name: 'BoardingHouse Bình Thạnh' },
  { id: 'b4', name: 'BoardingHouse Thủ Đức' }
];

function CreateManagerModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    properties: []
  });
  const [validationError, setValidationError] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationError) setValidationError('');
  };

  const handlePropertyToggle = (propId) => {
    setFormData(prev => {
      const exists = prev.properties.includes(propId);
      return {
        ...prev,
        properties: exists 
          ? prev.properties.filter(id => id !== propId)
          : [...prev.properties, propId]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone) {
      setValidationError('Vui lòng nhập đầy đủ các thông tin bắt buộc (*)');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-[fadeInScale_0.3s_ease-out]">
        <div className="flex items-center justify-between p-5 border-b border-line">
          <div>
            <h2 className="text-lg font-bold text-ink">Tạo tài khoản Quản lý mới</h2>
            <p className="text-sm text-ink-muted mt-0.5">Phân quyền tài khoản phụ trách chi nhánh</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-ink-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-10rem)]">
          {validationError && (
            <div className="p-3 bg-red-50 text-danger text-sm rounded-xl font-medium animate-[fadeIn_0.2s_ease-out]">
              {validationError}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Họ tên quản lý <span className="text-danger">*</span></label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
              placeholder="VD: Nguyễn Hoàng Nam"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Địa chỉ Email <span className="text-danger">*</span></label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                placeholder="nam@boardinghouse.vn"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Số điện thoại <span className="text-danger">*</span></label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                placeholder="0905xxxxxx"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-2">Cơ sở phụ trách quản lý</label>
            <div className="bg-gray-50 p-4 border border-line rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_PROPERTIES.map(prop => (
                <label key={prop.id} className="flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.properties.includes(prop.id)}
                    onChange={() => handlePropertyToggle(prop.id)}
                    className="h-4 w-4 rounded border-line text-primary focus:ring-primary/20 cursor-pointer"
                  />
                  <span>{prop.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-line">
            <Button type="submit" className="flex-1" icon={<Plus size={16} />}>Tạo tài khoản</Button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-line text-sm font-medium text-ink-muted hover:bg-gray-50 transition-colors"
            >
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'manager',
    status: user.status || 'active',
    properties: user.propertyIds || []
  });
  const [validationError, setValidationError] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationError) setValidationError('');
  };

  const handlePropertyToggle = (propId) => {
    setFormData(prev => {
      const exists = prev.properties.includes(propId);
      return {
        ...prev,
        properties: exists 
          ? prev.properties.filter(id => id !== propId)
          : [...prev.properties, propId]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone) {
      setValidationError('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }
    onSave({
      ...user,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      status: formData.status,
      propertyIds: formData.role === 'manager' ? formData.properties : []
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-[fadeInScale_0.3s_ease-out]">
        <div className="flex items-center justify-between p-5 border-b border-line">
          <div>
            <h2 className="text-lg font-bold text-ink">Chỉnh sửa tài khoản</h2>
            <p className="text-sm text-ink-muted mt-0.5">Cập nhật thông tin chi tiết và phân quyền</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-ink-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-10rem)]">
          {validationError && (
            <div className="p-3 bg-red-50 text-danger text-sm rounded-xl font-medium animate-[fadeIn_0.2s_ease-out]">
              {validationError}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Họ tên <span className="text-danger">*</span></label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Địa chỉ Email <span className="text-danger">*</span></label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Số điện thoại <span className="text-danger">*</span></label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Vai trò</label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full h-10 px-3 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
              >
                <option value="admin">Chủ trọ</option>
                <option value="manager">Quản lý</option>
                <option value="tenant">Khách thuê</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full h-10 px-3 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
              >
                <option value="active">Hoạt động</option>
                <option value="locked">Khóa tài khoản</option>
                <option value="pending">Chờ kích hoạt</option>
              </select>
            </div>
          </div>

          {formData.role === 'manager' && (
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Cơ sở phụ trách quản lý</label>
              <div className="bg-gray-50 p-4 border border-line rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AVAILABLE_PROPERTIES.map(prop => (
                  <label key={prop.id} className="flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.properties.includes(prop.id)}
                      onChange={() => handlePropertyToggle(prop.id)}
                      className="h-4 w-4 rounded border-line text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <span>{prop.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-3 border-t border-line">
            <Button type="submit" className="flex-1" icon={<Save size={16} />}>Lưu thay đổi</Button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-line text-sm font-medium text-ink-muted hover:bg-gray-50 transition-colors"
            >
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ user, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-6 overflow-hidden animate-[fadeInScale_0.3s_ease-out] text-center">
        <div className="h-12 w-12 bg-red-50 text-danger rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <Trash2 size={24} />
        </div>
        <h3 className="text-lg font-bold text-ink mb-1.5">Xác nhận xóa tài khoản</h3>
        <p className="text-sm text-ink-muted mb-5">
          Bạn có chắc chắn muốn xóa tài khoản của <strong className="text-ink">{user.fullName}</strong>? Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 h-10 bg-danger text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors shadow-sm"
          >
            Xóa vĩnh viễn
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-10 border border-line rounded-xl text-sm font-semibold text-ink-muted hover:bg-gray-50 transition-colors"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const { data: initialUsers = [], loading } = useFetch(() => userService.list(), []);
  const [localUsers, setLocalUsers] = useState([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Sync loaded users
  useEffect(() => {
    if (initialUsers.length > 0 && localUsers.length === 0) {
      setLocalUsers(initialUsers);
    }
  }, [initialUsers, localUsers]);

  // Handle new manager registration
  const handleSaveManager = (formData) => {
    const newId = `u-${localUsers.length + 5}`;
    const newUser = {
      id: newId,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      role: 'manager',
      status: 'active',
      propertyIds: formData.properties,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setLocalUsers(prev => [newUser, ...prev]);
    setShowAddModal(false);

    setToast({
      message: `Đã đăng ký tài khoản quản lý "${formData.fullName}" thành công!`,
      type: 'success'
    });
  };

  // Handle editing user account details
  const handleUpdateUser = (updatedUser) => {
    setLocalUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setEditingUser(null);
    setToast({
      message: `Đã cập nhật tài khoản "${updatedUser.fullName}" thành công!`,
      type: 'success'
    });
  };

  // Toggle user account lock/unlock status
  const handleToggleLock = (user) => {
    const nextStatus = user.status === 'locked' ? 'active' : 'locked';
    setLocalUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
    
    setToast({
      message: nextStatus === 'locked' 
        ? `Đã khóa tài khoản của "${user.fullName}" thành công!`
        : `Đã mở khóa tài khoản của "${user.fullName}" thành công!`,
      type: 'success'
    });
  };

  // Confirm and execute user deletion
  const handleDeleteConfirm = () => {
    if (!deletingUser) return;
    setLocalUsers(prev => prev.filter(u => u.id !== deletingUser.id));
    
    setToast({
      message: `Đã xóa tài khoản "${deletingUser.fullName}" khỏi hệ thống thành công!`,
      type: 'success'
    });
    setDeletingUser(null);
  };

  // Roles Vietnamese mappings
  const ROLES_MAP = {
    admin: { label: 'Chủ trọ', color: 'rose' },
    manager: { label: 'Quản lý', color: 'primary' },
    tenant: { label: 'Khách thuê', color: 'info' }
  };

  // Filter users by search string and role tabs
  const filteredSearch = localUsers.filter((u) => {
    const term = search.toLowerCase();
    const nameMatch = u.fullName?.toLowerCase().includes(term);
    const emailMatch = u.email?.toLowerCase().includes(term);
    const phoneMatch = u.phone?.toLowerCase().includes(term);
    return nameMatch || emailMatch || phoneMatch;
  });

  const filtered = tab === 'all' 
    ? filteredSearch 
    : filteredSearch.filter((u) => u.role === tab);

  const counts = {
    all: localUsers.length,
    admin: localUsers.filter((u) => u.role === 'admin').length,
    manager: localUsers.filter((u) => u.role === 'manager').length,
    tenant: localUsers.filter((u) => u.role === 'tenant').length,
  };

  return (
    <>
      <PageHeader
        title="Người dùng &amp; phân quyền"
        subtitle="Quản lý tài khoản và phân quyền cho từng vai trò"
        actions={<Button icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>Tạo Quản lý mới</Button>}
      />

      <Card className="mb-4 animate-[fadeIn_0.3s_ease-out]" padded={false}>
        <div className="px-6 pt-4">
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'all',     label: 'Tất cả',     count: counts.all },
              { value: 'admin',   label: 'Chủ trọ',    count: counts.admin },
              { value: 'manager', label: 'Quản lý',    count: counts.manager },
              { value: 'tenant',  label: 'Khách thuê', count: counts.tenant },
            ]}
          />
        </div>
        <div className="flex gap-3 p-4 border-b border-line bg-gray-50">
          <Input 
            prefix={<Search size={16} className="text-ink-muted" />} 
            placeholder="Tìm theo tên, email, sđt…" 
            className="flex-1 max-w-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {loading && localUsers.length === 0 ? <Loading /> : (
        <div className="animate-[fadeIn_0.3s_ease-out] border border-line rounded-3xl bg-white shadow-sm overflow-hidden">
          <Table
            columns={[
              { key: 'name',  header: 'Họ tên',
                render: (u) => (
                  <div className="flex items-center gap-3">
                    <Avatar name={u.fullName} size="sm" />
                    <div>
                      <div className="font-semibold text-ink">{u.fullName}</div>
                      <div className="text-xs text-ink-muted">{u.email}</div>
                    </div>
                  </div>
                ),
              },
              { key: 'phone', header: 'SĐT',     render: (u) => u.phone || '—' },
              { key: 'role',  header: 'Vai trò', 
                render: (u) => {
                  const roleMeta = ROLES_MAP[u.role] || { label: u.role, color: 'neutral' };
                  return <Badge color={roleMeta.color}>{roleMeta.label}</Badge>;
                } 
              },
              { key: 'props', header: 'Phụ trách',
                render: (u) => u.propertyIds && u.propertyIds.length ? `${u.propertyIds.length} cơ sở` : '—' },
              { key: 'status', header: 'Trạng thái',
                render: (u) => <Badge color={STATUS_MAP[u.status]?.color || 'neutral'}>{STATUS_MAP[u.status]?.label}</Badge> },
              { key: 'created', header: 'Tạo lúc', render: (u) => formatDate(u.createdAt) },
              { key: 'action', header: 'Thao tác', className: 'text-center',
                render: (u) => (
                  <div className="flex items-center justify-center gap-1">
                    <button 
                      onClick={() => setEditingUser(u)}
                      className="p-1.5 hover:bg-primary-soft hover:text-primary rounded-lg text-ink-muted transition-colors apple-press"
                      title="Chỉnh sửa tài khoản"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleToggleLock(u)}
                      className={`p-1.5 rounded-lg transition-colors apple-press ${u.status === 'locked' ? 'hover:bg-success-soft hover:text-success text-danger' : 'hover:bg-amber-50 hover:text-amber-600 text-ink-muted'}`}
                      title={u.status === 'locked' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                    >
                      {u.status === 'locked' ? <Unlock size={14} /> : <Lock size={14} />}
                    </button>
                    {u.role !== 'admin' && (
                      <button 
                        onClick={() => setDeletingUser(u)}
                        className="p-1.5 hover:bg-red-50 hover:text-danger rounded-lg text-ink-muted transition-colors apple-press"
                        title="Xóa tài khoản"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )
              }
            ]}
            data={filtered}
            emptyText="Không tìm thấy người dùng phù hợp"
          />
        </div>
      )}

      {showAddModal && (
        <CreateManagerModal 
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveManager}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleUpdateUser}
        />
      )}

      {deletingUser && (
        <ConfirmDeleteModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  );
}
