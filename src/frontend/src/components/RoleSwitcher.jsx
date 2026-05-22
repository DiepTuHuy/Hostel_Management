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
        className="h-11 w-11 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center shadow-lg transition-apple-bouncy hover:scale-110 hover:shadow-xl apple-press"
        title="Góc nhìn kiểm thử"
      >
        <Shield size={22} className={`transition-transform duration-500 ${open ? 'rotate-180 text-amber-300' : ''}`} />
      </button>

      {open && (
        <div className="absolute bottom-14 right-0 bg-white text-ink border border-line p-3.5 rounded-2xl shadow-elevated w-52 flex flex-col gap-1.5 origin-bottom-right animate-apple-pop">
          <div className="text-[10px] font-bold text-ink-muted tracking-wider uppercase border-b border-line pb-2 mb-1.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Góc nhìn kiểm thử
          </div>
          <button
            onClick={() => switchRole('visitor')}
            className="text-left text-xs px-3 py-2 hover:bg-primary-soft hover:text-primary rounded-xl font-semibold text-ink apple-press transition-apple duration-200"
          >
            Khách vãng lai
          </button>
          <button
            onClick={() => switchRole('tenant')}
            className="text-left text-xs px-3 py-2 hover:bg-primary-soft hover:text-primary rounded-xl font-semibold text-ink apple-press transition-apple duration-200"
          >
            Khách thuê
          </button>
          <button
            onClick={() => switchRole('manager')}
            className="text-left text-xs px-3 py-2 hover:bg-primary-soft hover:text-primary rounded-xl font-semibold text-ink apple-press transition-apple duration-200"
          >
            Quản lý chi nhánh
          </button>
          <button
            onClick={() => switchRole('admin')}
            className="text-left text-xs px-3 py-2 hover:bg-primary-soft hover:text-primary rounded-xl font-semibold text-ink apple-press transition-apple duration-200"
          >
            Chủ trọ (Admin)
          </button>
        </div>
      )}
    </div>
  );
}
