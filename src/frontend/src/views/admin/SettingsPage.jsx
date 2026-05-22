import { Save, Upload } from 'lucide-react';
import { Button, PageHeader, Card, CardHeader, Input } from '../../components/common';

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Cài đặt hệ thống" subtitle="Thông tin doanh nghiệp, mẫu hợp đồng, kênh thông báo, tích hợp" />

      <div className="space-y-gutter">
        <Card>
          <CardHeader title="Thông tin doanh nghiệp" subtitle="Hiển thị trên hợp đồng, biên lai, email" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Tên doanh nghiệp" defaultValue="Công ty TNHH BoardingHouse Pro" />
            <Input label="Mã số thuế" defaultValue="0123456789" />
            <Input label="Địa chỉ trụ sở" defaultValue="12 Nguyễn Cư Trinh, Quận 1, TP.HCM" />
            <Input label="Hotline" defaultValue="1900 8686" />
            <Input label="Email liên hệ" defaultValue="hello@boardinghouse.vn" />
            <Input label="Đại diện pháp luật" defaultValue="Nguyễn Văn An" />
          </div>
          <div className="mt-4 flex justify-end">
            <Button icon={<Save size={16} />}>Lưu thay đổi</Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Mẫu hợp đồng" subtitle="Upload mẫu PDF/DOCX dùng làm template tạo hợp đồng" />
          <div className="border-2 border-dashed border-line rounded-lg p-8 text-center">
            <Upload className="mx-auto text-ink-muted" size={36} />
            <p className="mt-3 text-sm text-ink">Kéo thả file vào đây hoặc nhấn để chọn</p>
            <p className="text-xs text-ink-muted mt-1">PDF, DOCX — tối đa 5MB</p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Kênh thông báo" subtitle="Cấu hình email, SMS, Zalo OA" />
          <div className="space-y-3">
            {[
              { name: 'Email SMTP', desc: 'smtp.boardinghouse.vn:587', status: 'Đã kết nối' },
              { name: 'Zalo OA',    desc: 'OA: BoardingHouse Pro',     status: 'Đã kết nối' },
              { name: 'SMS Brand',  desc: 'Brandname: BHPRO',          status: 'Chưa cấu hình' },
            ].map((row) => (
              <div key={row.name} className="flex items-center justify-between p-4 border border-line rounded-lg">
                <div>
                  <div className="font-medium text-ink">{row.name}</div>
                  <div className="text-sm text-ink-muted">{row.desc}</div>
                </div>
                <Button variant="secondary" size="sm">Cấu hình</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Tích hợp cổng thanh toán" subtitle="VNPay, MoMo, QR ngân hàng" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['VNPay', 'MoMo', 'QR Banking'].map((g) => (
              <div key={g} className="border border-line rounded-lg p-4">
                <div className="font-semibold text-ink mb-1">{g}</div>
                <div className="text-xs text-success">● Đang hoạt động</div>
                <Button variant="ghost" size="sm" className="mt-3 -ml-2">Quản lý API key</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
