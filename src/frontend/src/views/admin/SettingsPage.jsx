import { useState, useRef } from 'react';
import { Save, Upload, X, Shield, Lock, Radio, Key, Mail, Check, Loader2, Sparkles } from 'lucide-react';
import { Button, PageHeader, Card, CardHeader, Input, Toast, Badge } from '../../components/common';

// Notification Channel Configuration Modal
function ConfigChannelModal({ channelName, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    server: channelName === 'Email SMTP' ? 'smtp.boardinghouse.vn' : 'https://api.zalo.me/oa',
    port: '587',
    username: channelName === 'Email SMTP' ? 'billing@boardinghouse.vn' : 'Zalo-OA-1025',
    secret: '••••••••••••••••••••••••••••'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSave(channelName);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md p-5 overflow-hidden animate-[fadeInScale_0.3s_ease-out]">
        <div className="flex justify-between items-center pb-4 border-b border-line mb-4">
          <div className="flex items-center gap-2">
            <Radio className="text-primary animate-pulse" size={20} />
            <h3 className="font-bold text-ink">Cấu hình kết nối {channelName}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-ink-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink-muted uppercase mb-1">Máy chủ / Endpoint API</label>
            <input
              type="text"
              value={formData.server}
              onChange={(e) => setFormData({ ...formData, server: e.target.value })}
              className="w-full h-10 px-3 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-ink-muted uppercase mb-1">Tài khoản kết nối</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full h-10 px-3 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-bold text-ink-muted uppercase mb-1">Port</label>
              <input
                type="text"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                className="w-full h-10 px-3 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-muted uppercase mb-1 flex items-center gap-1"><Lock size={12} /> Access Token / Mật khẩu</label>
            <input
              type="password"
              value={formData.secret}
              onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
              className="w-full h-10 px-3 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-line">
            <Button type="submit" className="flex-1" loading={loading}>Lưu cấu hình</Button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-line rounded-xl text-sm font-medium text-ink hover:bg-gray-50 transition-colors"
            >
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Payment Gateway API Manager Modal
function ConfigGatewayModal({ gatewayName, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    terminalId: gatewayName === 'VNPay' ? 'VNP_BHPRO_2026' : 'MOMO_BH_2026',
    secretKey: '83f5647a98db2cf984aef5476a21cf92',
    apiUrl: gatewayName === 'VNPay' ? 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html' : 'https://test-payment.momo.vn/v2/gateway/api'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSave(gatewayName);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md p-5 overflow-hidden animate-[fadeInScale_0.3s_ease-out]">
        <div className="flex justify-between items-center pb-4 border-b border-line mb-4">
          <div className="flex items-center gap-2">
            <Key className="text-amber-500 animate-spin-slow" size={20} />
            <h3 className="font-bold text-ink">Quản lý API Key {gatewayName}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-ink-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink-muted uppercase mb-1">Mã kết nối (Terminal ID)</label>
            <input
              type="text"
              value={formData.terminalId}
              onChange={(e) => setFormData({ ...formData, terminalId: e.target.value })}
              className="w-full h-10 px-3 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-muted uppercase mb-1">Mã khóa bảo mật (Checksum / Hash Key)</label>
            <input
              type="text"
              value={formData.secretKey}
              onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
              className="w-full h-10 px-3 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-muted uppercase mb-1">Địa chỉ API Cổng thanh toán</label>
            <input
              type="text"
              value={formData.apiUrl}
              onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
              className="w-full h-10 px-3 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-line">
            <Button type="submit" className="flex-1" loading={loading}>Cập nhật API Key</Button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-line rounded-xl text-sm font-medium text-ink hover:bg-gray-50 transition-colors"
            >
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [saveLoading, setSaveLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Công ty TNHH BoardingHouse Pro',
    taxCode: '0123456789',
    address: '12 Nguyễn Cư Trinh, Quận 1, TP.HCM',
    phone: '1900 8686',
    email: 'hello@boardinghouse.vn',
    representative: 'Nguyễn Văn An'
  });
  
  // Drag & drop file upload template simulation states
  const [fileProgress, setFileProgress] = useState(null); // null, number (0-100), 'success'
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Config Modals States
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState(null);

  const handleSaveCompanyInfo = () => {
    setSaveLoading(true);
    setTimeout(() => {
      setSaveLoading(false);
      setToast({
        message: `Đã lưu thay đổi thông tin doanh nghiệp "${companyInfo.name}" thành công!`,
        type: 'success'
      });
    }, 650);
  };

  const handleFileUploadSimulate = (e) => {
    const file = e.target?.files?.[0] || { name: 'Mau_Hop_Dong_Thue_2026.docx', size: 1048576 };
    setUploadedFile({ name: file.name, size: (file.size / 1024 / 1024).toFixed(2) });
    setFileProgress(0);

    let curr = 0;
    const interval = setInterval(() => {
      curr += 20;
      setFileProgress(curr);
      if (curr >= 100) {
        clearInterval(interval);
        setFileProgress('success');
        setToast({
          message: `Tải mẫu hợp đồng "${file.name}" thành công!`,
          type: 'success'
        });
      }
    }, 200);
  };

  const triggerFileSelector = () => {
    fileInputRef.current?.click();
  };

  const handleSaveChannel = (name) => {
    setSelectedChannel(null);
    setToast({
      message: `Cập nhật cấu hình cổng liên lạc "${name}" thành công!`,
      type: 'success'
    });
  };

  const handleSaveGateway = (name) => {
    setSelectedGateway(null);
    setToast({
      message: `Đã đồng bộ kết nối API Key của cổng thanh toán "${name}" thành công!`,
      type: 'success'
    });
  };

  return (
    <>
      <PageHeader title="Cài đặt hệ thống" subtitle="Thông tin doanh nghiệp, mẫu hợp đồng, kênh thông báo, tích hợp" />

      <div className="space-y-gutter mb-gutter animate-[fadeIn_0.3s_ease-out]">
        <Card className="border border-line rounded-3xl bg-white shadow-sm">
          <CardHeader title="Thông tin doanh nghiệp" subtitle="Hiển thị trên hợp đồng, biên lai, email" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Tên doanh nghiệp" 
              value={companyInfo.name} 
              onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })} 
            />
            <Input 
              label="Mã số thuế" 
              value={companyInfo.taxCode} 
              onChange={(e) => setCompanyInfo({ ...companyInfo, taxCode: e.target.value })} 
            />
            <Input 
              label="Địa chỉ trụ sở" 
              value={companyInfo.address} 
              onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })} 
            />
            <Input 
              label="Hotline" 
              value={companyInfo.phone} 
              onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })} 
            />
            <Input 
              label="Email liên hệ" 
              value={companyInfo.email} 
              onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })} 
            />
            <Input 
              label="Đại diện pháp luật" 
              value={companyInfo.representative} 
              onChange={(e) => setCompanyInfo({ ...companyInfo, representative: e.target.value })} 
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button icon={<Save size={16} />} onClick={handleSaveCompanyInfo} loading={saveLoading}>Lưu thay đổi</Button>
          </div>
        </Card>

        <Card className="border border-line rounded-3xl bg-white shadow-sm">
          <CardHeader title="Mẫu hợp đồng" subtitle="Upload mẫu PDF/DOCX dùng làm template tạo hợp đồng" />
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUploadSimulate}
            className="hidden"
            accept=".pdf,.docx"
          />

          <div 
            onClick={triggerFileSelector}
            className="border-2 border-dashed border-line hover:border-primary/50 transition-colors duration-300 rounded-2xl p-8 text-center cursor-pointer bg-gray-50/50 hover:bg-primary/5"
          >
            <Upload className="mx-auto text-ink-muted animate-bounce" size={36} />
            <p className="mt-3 text-sm font-semibold text-ink">Kéo thả file vào đây hoặc nhấn để chọn</p>
            <p className="text-xs text-ink-muted mt-1">PDF, DOCX — tối đa 5MB</p>
            
            {fileProgress !== null && (
              <div className="mt-4 max-w-sm mx-auto space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-ink">{uploadedFile?.name} ({uploadedFile?.size} MB)</span>
                  <span className="text-primary font-bold">{fileProgress === 'success' ? 'Đã hoàn thành' : `${fileProgress}%`}</span>
                </div>
                
                {/* Progress Bar Display */}
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-200 ${fileProgress === 'success' ? 'bg-success' : 'bg-primary'}`}
                    style={{ width: `${fileProgress === 'success' ? 100 : fileProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="border border-line rounded-3xl bg-white shadow-sm">
          <CardHeader title="Kênh thông báo" subtitle="Cấu hình email, SMS, Zalo OA" />
          <div className="space-y-3">
            {[
              { name: 'Email SMTP', desc: 'smtp.boardinghouse.vn:587', status: 'Đã kết nối' },
              { name: 'Zalo OA',    desc: 'OA: BoardingHouse Pro',     status: 'Đã kết nối' },
              { name: 'SMS Brand',  desc: 'Brandname: BHPRO',          status: 'Chưa cấu hình' },
            ].map((row) => (
              <div key={row.name} className="flex items-center justify-between p-4 border border-line rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="font-semibold text-ink flex items-center gap-1.5">
                    {row.name}
                    <Badge color={row.status === 'Đã kết nối' ? 'success' : 'neutral'}>{row.status}</Badge>
                  </div>
                  <div className="text-xs sm:text-sm text-ink-muted mt-0.5">{row.desc}</div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setSelectedChannel(row.name)}>Cấu hình</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border border-line rounded-3xl bg-white shadow-sm">
          <CardHeader title="Tích hợp cổng thanh toán" subtitle="VNPay, MoMo, QR ngân hàng" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['VNPay', 'MoMo', 'QR Banking'].map((g) => (
              <div key={g} className="border border-line rounded-2xl p-4 bg-gray-50/30 hover:shadow-md transition-shadow">
                <div className="font-bold text-ink mb-1">{g}</div>
                <div className="text-xs text-success flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-success rounded-full animate-ping" />
                  Đang hoạt động
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-3 -ml-2 text-xs"
                  onClick={() => setSelectedGateway(g)}
                >
                  Quản lý API key
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {selectedChannel && (
        <ConfigChannelModal
          channelName={selectedChannel}
          onClose={() => setSelectedChannel(null)}
          onSave={handleSaveChannel}
        />
      )}

      {selectedGateway && (
        <ConfigGatewayModal
          gatewayName={selectedGateway}
          onClose={() => setSelectedGateway(null)}
          onSave={handleSaveGateway}
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
