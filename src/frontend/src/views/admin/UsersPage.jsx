import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button, PageHeader, Card, Tabs, Table, Badge, Avatar, Input } from '../../components/common';
import { useFetch } from '../../controllers/useFetch.js';
import { userService } from '../../services/index.js';
import { formatDate } from '../../utils/format.js';

const STATUS_MAP = {
  active: { color: 'success', label: 'Hoạt động' },
  locked: { color: 'danger', label: 'Khoá' },
  pending: { color: 'warning', label: 'Chờ kích hoạt' },
};

export default function UsersPage() {
  const [tab, setTab] = useState('all');
  const { data: users = [] } = useFetch(() => userService.list(), []);
  const filtered = tab === 'all' ? users : users.filter((u) => u.role === tab);
  const counts = {
    all: users.length,
    admin: users.filter((u) => u.role === 'admin').length,
    manager: users.filter((u) => u.role === 'manager').length,
    tenant: users.filter((u) => u.role === 'tenant').length,
  };

  return (
    <>
      <PageHeader
        title="Người dùng & phân quyền"
        subtitle="Quản lý tài khoản và phân quyền cho từng vai trò"
        actions={<Button icon={<Plus size={16} />}>Tạo Quản lý mới</Button>}
      />

      <Card className="mb-4" padded={false}>
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
          <Input prefix={<Search size={16} />} placeholder="Tìm theo tên, email…" className="flex-1 max-w-sm" />
          <Button variant="secondary" icon={<Filter size={16} />}>Lọc</Button>
        </div>
      </Card>

      <Table
        columns={[
          { key: 'name',  header: 'Họ tên',
            render: (u) => (
              <div className="flex items-center gap-3">
                <Avatar name={u.fullName} size="sm" />
                <div>
                  <div className="font-medium text-ink">{u.fullName}</div>
                  <div className="text-xs text-ink-muted">{u.email}</div>
                </div>
              </div>
            ),
          },
          { key: 'phone', header: 'SĐT',     render: (u) => u.phone },
          { key: 'role',  header: 'Vai trò', render: (u) => <Badge color="primary">{u.role}</Badge> },
          { key: 'props', header: 'Phụ trách',
            render: (u) => u.propertyIds.length ? `${u.propertyIds.length} cơ sở` : '—' },
          { key: 'status', header: 'Trạng thái',
            render: (u) => <Badge color={STATUS_MAP[u.status]?.color || 'neutral'}>{STATUS_MAP[u.status]?.label}</Badge> },
          { key: 'created', header: 'Tạo lúc', render: (u) => formatDate(u.createdAt) },
        ]}
        data={filtered}
      />
    </>
  );
}
