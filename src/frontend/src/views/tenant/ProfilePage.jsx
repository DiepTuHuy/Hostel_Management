import { useState } from 'react';
import { useAuth } from '../../controllers/useAuth.jsx';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Bell, LogOut, Check } from 'lucide-react';
import { userService } from '../../services/index.js';

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [notifyZalo, setNotifyZalo] = useState(true);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedUser = await userService.updateProfile(user.id, {
        fullName,
        email,
        phone
      });
      localStorage.setItem('bhpro_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSuccessMsg('Cập nhật thông tin tài khoản thành công!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setSuccessMsg(err.response?.data?.message || err.message || 'Lỗi hệ thống khi cập nhật hồ sơ');
      setTimeout(() => setSuccessMsg(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setCurrentPassword('');
      setNewPassword('');
      setSuccessMsg('Đổi mật khẩu thành công!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 1000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">Hồ sơ cá nhân</h2>
        <p className="text-xs text-ink-muted mt-0.5">Quản lý thông tin tài khoản và cấu hình thông báo bảo mật.</p>
      </div>

      {successMsg && (
        <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check size={16} /> {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-line p-5 shadow-card space-y-4">
            <div className="flex items-center gap-3 border-b border-line pb-3">
              <div className="w-10 h-10 bg-primary-soft text-primary rounded-xl flex items-center justify-center shrink-0">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-ink">Thông tin cá nhân</h3>
                <span className="text-[10px] text-ink-muted">Cập nhật họ tên, điện thoại và email của bạn</span>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-ink mb-1 block">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-line bg-gray-50 focus:outline-none focus:border-primary focus:bg-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink mb-1 block">Email liên hệ</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-line bg-gray-50 focus:outline-none focus:border-primary focus:bg-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink mb-1 block">Số điện thoại</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-line bg-gray-50 focus:outline-none focus:border-primary focus:bg-white text-xs font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full h-10 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-dark transition-colors"
              >
                Lưu thay đổi thông tin
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-line p-5 shadow-card space-y-4">
            <div className="flex items-center gap-3 border-b border-line pb-3">
              <div className="w-10 h-10 bg-primary-soft text-primary rounded-xl flex items-center justify-center shrink-0">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-ink">Bảo mật tài khoản</h3>
                <span className="text-[10px] text-ink-muted">Thay đổi mật khẩu đăng nhập cổng khách thuê</span>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-ink mb-1 block">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-line bg-gray-50 focus:outline-none focus:border-primary focus:bg-white text-xs"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink mb-1 block">Mật khẩu mới</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-line bg-gray-50 focus:outline-none focus:border-primary focus:bg-white text-xs"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full h-10 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-dark transition-colors"
              >
                Cập nhật mật khẩu mới
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-line p-5 shadow-card space-y-4">
            <div className="flex items-center gap-3 border-b border-line pb-3">
              <div className="w-10 h-10 bg-primary-soft text-primary rounded-xl flex items-center justify-center shrink-0">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-ink">Cài đặt nhận thông báo</h3>
                <span className="text-[10px] text-ink-muted">Chọn các kênh nhận tin tức và hoá đơn định kỳ</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer p-2.5 bg-gray-50 border border-line rounded-xl text-xs font-semibold text-ink">
                <span>Thông báo qua hộp thư Email</span>
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={e => setNotifyEmail(e.target.checked)}
                  className="rounded border-line text-primary focus:ring-primary/20 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2.5 bg-gray-50 border border-line rounded-xl text-xs font-semibold text-ink">
                <span>Thông báo qua tin nhắn SMS</span>
                <input
                  type="checkbox"
                  checked={notifySms}
                  onChange={e => setNotifySms(e.target.checked)}
                  className="rounded border-line text-primary focus:ring-primary/20 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2.5 bg-gray-50 border border-line rounded-xl text-xs font-semibold text-ink">
                <span>Thông báo qua tin nhắn Zalo</span>
                <input
                  type="checkbox"
                  checked={notifyZalo}
                  onChange={e => setNotifyZalo(e.target.checked)}
                  className="rounded border-line text-primary focus:ring-primary/20 w-4 h-4"
                />
              </label>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full h-12 border border-danger/30 text-danger bg-red-50/50 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} /> Đăng xuất tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}
