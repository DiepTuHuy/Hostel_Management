import { Plus, MapPin, Users, MoreVertical } from 'lucide-react';
import { Button, PageHeader, Card, Badge, Loading } from '../../components/common';
import { useProperties } from '../../controllers/useProperties.js';

export default function PropertiesPage() {
  const { data: properties = [], loading } = useProperties();

  return (
    <>
      <PageHeader
        title="Nhà trọ & chi nhánh"
        subtitle="Quản lý các nhà trọ trong chuỗi của bạn"
        actions={<Button icon={<Plus size={16} />}>Thêm nhà trọ</Button>}
      />

      {loading ? <Loading /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {properties.map((p) => (
            <Card key={p.id} padded={false} className="overflow-hidden">
              <div className="h-44 bg-gray-100 relative">
                {p.image && <img src={p.image} alt={p.name} className="h-full w-full object-cover" />}
                <Badge color="success" className="absolute top-3 left-3">Hoạt động</Badge>
                <button className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-md text-ink-muted hover:bg-white">
                  <MoreVertical size={16} />
                </button>
              </div>
              <div className="p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-ink line-clamp-1">{p.name}</h3>
                  <span className="text-xs text-ink-muted">{p.code}</span>
                </div>
                <p className="text-sm text-ink-muted mt-1 flex items-start gap-1.5">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  <span className="line-clamp-1">{p.address}, {p.district}</span>
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-ink-muted uppercase">Phòng</div>
                    <div className="font-semibold text-ink">{p.occupiedRooms} / {p.totalRooms}</div>
                  </div>
                  <div>
                    <div className="text-xs text-ink-muted uppercase">Tỉ lệ lấp</div>
                    <div className="font-semibold text-success">{p.occupancyRate}%</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-line flex items-center justify-between text-xs text-ink-muted">
                  <span className="flex items-center gap-1">
                    <Users size={14} /> {p.managerIds.length} quản lý
                  </span>
                  <button className="text-primary font-medium hover:underline">Xem chi tiết →</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
