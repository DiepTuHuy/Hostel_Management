import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../controllers/useAuth.jsx';
import { users } from '../mocks/mockData.js';
import { User } from '../models/User.js';
import { Shield } from 'lucide-react';

export default function RoleSwitcher() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const switchRole = (role) => {
    if (role === 'visitor') {
      localStorage.removeItem('bhpro_token');
      localStorage.removeItem('bhpro_user');
      setUser(null);
      navigate('/');
    } else {
      const found = users.find((u) => u.role === role);
      if (found) {
        const userObj = new User(found);
        localStorage.setItem('bhpro_token', `mock.${found.id}.${Date.now()}`);
        localStorage.setItem('bhpro_user', JSON.stringify(found));
        setUser(userObj);
        const destination = {
          admin: '/admin',
          manager: '/manager',
          tenant: '/tenant'
        }[role];
        navigate(destination);
      }
    }
    setOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="h-10 w-10 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
      >
        <Shield size={20} />
      </button>

      {open && (
        <div className="absolute bottom-12 right-0 bg-white text-ink border border-line p-3 rounded-modal shadow-elevated w-48 flex flex-col gap-2">
          <div className="text-xs font-bold text-ink-muted uppercase border-b border-line pb-1 mb-1">
            Góc nhìn kiểm thử
          </div>
          <button
            onClick={() => switchRole('visitor')}
            className="text-left text-xs px-2.5 py-1.5 hover:bg-gray-50 rounded-lg transition-colors font-medium text-ink"
          >
            Khách vãng lai
          </button>
          <button
            onClick={() => switchRole('tenant')}
            className="text-left text-xs px-2.5 py-1.5 hover:bg-gray-50 rounded-lg transition-colors font-medium text-ink"
          >
            Khách thuê
          </button>
          <button
            onClick={() => switchRole('manager')}
            className="text-left text-xs px-2.5 py-1.5 hover:bg-gray-50 rounded-lg transition-colors font-medium text-ink"
          >
            Quản lý chi nhánh
          </button>
          <button
            onClick={() => switchRole('admin')}
            className="text-left text-xs px-2.5 py-1.5 hover:bg-gray-50 rounded-lg transition-colors font-medium text-ink"
          >
            Chủ trọ (Admin)
          </button>
        </div>
      )}
    </div>
  );
}
