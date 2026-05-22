import { useState, useEffect } from 'react';
import { Plus, Eye, FileDown, X, Check, ArrowRight, ArrowLeft, ShieldAlert, Sparkles, Download, FileText } from 'lucide-react';
import { Button, PageHeader, Card, Tabs, Table, Badge, Input, Toast, Loading } from '../../components/common';
import { useContracts } from '../../controllers/useContracts.js';
import { useProperties } from '../../controllers/useProperties.js';
import { CONTRACT_STATUS_META, Contract } from '../../models/Contract.js';
import { formatDate, formatCurrency } from '../../utils/format.js';

// Multi-step Create Contract Wizard component
function CreateContractModal({ onClose, onSave }) {
  const { data: properties = [] } = useProperties();
  const [step, setStep] = useState(1);
  const [validationError, setValidationError] = useState('');
  const [formData, setFormData] = useState({
    roomCode: 'P.101',
    tenantName: '',
    tenantPhone: '',
    tenantEmail: '',
    monthlyRent: '3200000',
    deposit: '3200000',
    startDate: '2026-06-01',
    endDate: '2027-06-01',
    propertyId: 'p-001',
  });

  useEffect(() => {
    if (properties.length > 0 && formData.propertyId === 'p-001') {
      setFormData(prev => ({ ...prev, propertyId: properties[0].id }));
    }
  }, [properties]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationError) setValidationError('');
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.tenantName || !formData.tenantPhone) {
        setValidationError('Vui lòng nhập đầy đủ Tên và Số điện thoại khách thuê');
        return;
      }
    }
    if (step === 2) {
      if (!formData.monthlyRent || !formData.deposit) {
        setValidationError('Vui lòng nhập giá thuê và tiền đặt cọc');
        return;
      }
    }
    setValidationError('');
    setStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setValidationError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden animate-[fadeInScale_0.3s_ease-out] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-line flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-ink">Lập hợp đồng thuê mới</h2>
            <p className="text-sm text-ink-muted mt-0.5">Tiến trình từng bước chuyên nghiệp</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-ink-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="px-6 py-4 bg-gray-50/50 border-b border-line flex items-center justify-between text-xs font-semibold text-ink-muted">
          <div className="flex items-center gap-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>1</span>
            <span className={step >= 1 ? 'text-primary font-bold' : ''}>Khách thuê & Phòng</span>
          </div>
          <div className="h-px bg-line flex-1 mx-3" />
          <div className="flex items-center gap-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>2</span>
            <span className={step >= 2 ? 'text-primary font-bold' : ''}>Giá & Tiền cọc</span>
          </div>
          <div className="h-px bg-line flex-1 mx-3" />
          <div className="flex items-center gap-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>3</span>
            <span className={step >= 3 ? 'text-primary font-bold' : ''}>Xác nhận lập</span>
          </div>
        </div>

        {/* Wizard Body */}
        <div className="p-6 flex-1 overflow-y-auto max-h-[calc(90vh-16rem)] space-y-4">
          {validationError && (
            <div className="p-3 bg-red-50 text-danger text-sm rounded-xl font-medium animate-[fadeIn_0.2s_ease-out]">
              {validationError}
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Cơ sở chi nhánh <span className="text-danger">*</span></label>
                <select
                  value={formData.propertyId}
                  onChange={(e) => handleChange('propertyId', e.target.value)}
                  className="w-full h-10 px-3 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Chọn phòng <span className="text-danger">*</span></label>
                <select
                  value={formData.roomCode}
                  onChange={(e) => handleChange('roomCode', e.target.value)}
                  className="w-full h-10 px-3 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                >
                  <option value="P.101">Phòng P.101 (Trống)</option>
                  <option value="P.104">Phòng P.104 (Trống)</option>
                  <option value="P.202">Phòng P.202 (Trống)</option>
                  <option value="P.301">Phòng P.301 (Trống)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Tên khách thuê <span className="text-danger">*</span></label>
                <input
                  type="text"
                  value={formData.tenantName}
                  onChange={(e) => handleChange('tenantName', e.target.value)}
                  className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                  placeholder="Họ tên đầy đủ người thuê"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1">Số điện thoại <span className="text-danger">*</span></label>
                  <input
                    type="tel"
                    value={formData.tenantPhone}
                    onChange={(e) => handleChange('tenantPhone', e.target.value)}
                    className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                    placeholder="09xx xxx xxx"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1">Địa chỉ Email</label>
                  <input
                    type="email"
                    value={formData.tenantEmail}
                    onChange={(e) => handleChange('tenantEmail', e.target.value)}
                    className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                    placeholder="khachthue@gmail.com"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1">Giá thuê hàng tháng (đ) <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    value={formData.monthlyRent}
                    onChange={(e) => handleChange('monthlyRent', e.target.value)}
                    className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1">Tiền đặt cọc cọc (đ) <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    value={formData.deposit}
                    onChange={(e) => handleChange('deposit', e.target.value)}
                    className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1">Ngày bắt đầu hiệu lực</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className="w-full h-10 px-3 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1">Ngày kết thúc hiệu lực</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className="w-full h-10 px-3 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-sm flex gap-3">
                <Sparkles className="shrink-0 text-emerald-600" size={20} />
                <div>
                  <span className="font-semibold block">Kiểm tra thông tin trước khi xác nhận</span>
                  Hợp đồng sau khi tạo sẽ ở trạng thái <strong>Chờ ký</strong>. Khách thuê sẽ nhận được thông báo ký số từ điện thoại qua Zalo/SMS.
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 text-sm divide-y divide-line">
                <div className="flex justify-between py-2.5">
                  <span className="text-ink-muted">Cơ sở chi nhánh</span>
                  <span className="font-semibold text-ink">
                    {properties.find(p => p.id === formData.propertyId)?.name || formData.propertyId}
                  </span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-ink-muted">Mã phòng thuê</span>
                  <span className="font-bold text-ink">{formData.roomCode}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-ink-muted">Khách thuê</span>
                  <span className="font-semibold text-ink">{formData.tenantName} ({formData.tenantPhone})</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-ink-muted">Giá thuê tháng</span>
                  <span className="font-semibold text-ink text-primary">{formatCurrency(parseInt(formData.monthlyRent))}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-ink-muted">Tiền đặt cọc cọc</span>
                  <span className="font-semibold text-ink">{formatCurrency(parseInt(formData.deposit))}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-ink-muted">Thời hạn</span>
                  <span className="text-ink font-semibold">Từ {formatDate(formData.startDate)} đến {formatDate(formData.endDate)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer */}
        <div className="p-4 border-t border-line flex items-center justify-between bg-gray-50">
          {step > 1 ? (
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-line rounded-xl text-sm font-medium text-ink hover:bg-gray-100 transition-colors apple-press"
            >
              <ArrowLeft size={16} /> Quay lại
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors apple-press ml-auto"
            >
              Tiếp tục <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-success text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors apple-press ml-auto"
            >
              <Check size={16} /> Lập hợp đồng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Beautiful PDF Viewer Drawer with simulated signatures and progress
function ViewPdfModal({ contract, onClose, onDownload }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadClick = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      onDownload(contract.code);
    }, 850);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-[fadeInScale_0.3s_ease-out] flex flex-col">
        {/* Drawer Header */}
        <div className="p-4 border-b border-line flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <FileText className="text-red-500" size={24} />
            <div>
              <h2 className="text-base font-bold text-ink">Bản xem trước Hợp đồng ký số</h2>
              <p className="text-xs text-ink-muted">Mã tài liệu: {contract.code}.pdf</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              icon={<Download size={14} />}
              onClick={handleDownloadClick}
              loading={downloading}
            >
              Tải PDF
            </Button>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl text-ink-muted transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Paper Contract Simulator View */}
        <div className="p-8 flex-1 overflow-y-auto max-h-[calc(90vh-8rem)] bg-gray-100 text-gray-800 text-sm font-serif leading-relaxed">
          <div className="max-w-2xl mx-auto bg-white p-12 shadow-md border border-line/60 rounded-sm relative min-h-[800px]">
            {/* National Title */}
            <div className="text-center font-bold font-sans tracking-wide mb-6">
              <p className="text-base">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="text-sm">Độc lập - Tự do - Hạnh phúc</p>
              <div className="w-40 h-[1.5px] bg-black mx-auto mt-2" />
            </div>

            {/* Document Title */}
            <div className="text-center font-bold font-sans text-lg my-8 tracking-wider uppercase">
              HỢP ĐỒNG THUÊ PHÒNG TRỌ CHI TIẾT
            </div>

            {/* Contract content */}
            <div className="space-y-4 font-sans text-xs sm:text-sm">
              <p>Hôm nay, ngày {new Date(contract.startDate).toLocaleDateString('vi-VN')}, chúng tôi gồm:</p>
              <div>
                <p className="font-bold">BÊN CHO THUÊ (BÊN A): BAN QUẢN TRỊ BOARDINGHOUSE GROUP</p>
                <p>Địa chỉ văn phòng: 123 Nguyễn Thị Minh Khai, Bến Thành, Quận 1, TP. HCM</p>
                <p>Đại diện pháp lý: Ông Nguyễn Văn Admin - Chức vụ: Giám đốc Chuỗi cơ sở</p>
              </div>

              <div>
                <p className="font-bold">BÊN THUÊ PHÒNG (BÊN B): KHÁCH HÀNG THUÊ TRỌ</p>
                <p>Họ và tên khách thuê: <span className="font-bold text-black border-b border-dashed border-gray-400 px-1">{contract.tenantId || 'Nguyễn Văn Hải'}</span></p>
                <p>Số điện thoại: {contract.tenantPhone || '098xxxxxxx'} — Mã căn hộ: {contract.roomId || 'P.102'}</p>
              </div>

              <div>
                <p className="font-bold uppercase text-black">Điều 1: Phòng thuê và Thời hạn</p>
                <p>1. Bên A đồng ý cho Bên B thuê phòng số {contract.roomId} tại cơ sở để cư trú phục vụ đời sống.</p>
                <p>2. Thời gian thuê hợp đồng là 01 năm, tính từ ngày <span className="font-semibold">{formatDate(contract.startDate)}</span> đến hết ngày <span className="font-semibold">{formatDate(contract.endDate)}</span>.</p>
              </div>

              <div>
                <p className="font-bold uppercase text-black">Điều 2: Giá thuê và Phương thức thanh toán</p>
                <p>1. Tiền thuê phòng cố định mỗi tháng là: <span className="font-bold text-primary">{formatCurrency(contract.monthlyRent)}/tháng</span>.</p>
                <p>2. Tiền cọc giữ phòng Bên B bàn giao cho Bên A là: <span className="font-semibold">{formatCurrency(contract.deposit)}</span> (sẽ được hoàn trả đầy đủ sau khi hết hạn thuê phòng nếu không gây hư hại).</p>
                <p>3. Tiền phòng thanh toán từ ngày 01 đến ngày 05 đầu tháng qua chuyển khoản ngân hàng hoặc ví VNPAY/MoMo.</p>
              </div>
            </div>

            {/* Signature Section */}
            <div className="mt-16 flex justify-between text-center font-sans text-xs">
              <div className="w-1/2">
                <p className="font-bold">ĐẠI DIỆN BÊN B</p>
                <p className="text-gray-400 italic mt-1">(Ký và ghi rõ họ tên)</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-gray-300 italic">[Đã ký số điện tử]</span>
                </div>
              </div>
              <div className="w-1/2 relative">
                <p className="font-bold">ĐẠI DIỆN BÊN A (BOARDINGHOUSE)</p>
                <p className="text-gray-400 italic mt-1">(Ký, đóng dấu)</p>
                
                {/* Visual Digital Signature Stamp */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 border-2 border-dashed border-red-500 rounded-lg p-2.5 rotate-[-3deg] bg-red-50/50 max-w-[210px] select-none text-[10px] text-red-600 font-mono tracking-tighter">
                  <p className="font-bold flex items-center gap-1 justify-center"><Check size={12} className="stroke-[3]" /> ĐÃ KÝ SỐ PHÁP LÝ</p>
                  <p className="font-bold uppercase">BOARDINGHOUSE GROUP JSC</p>
                  <p>Thời gian: {new Date(contract.createdAt || contract.startDate).toLocaleString('vi-VN')}</p>
                  <p>Mã chứng thư: CA-BH-PRO-2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContractsPage() {
  const { data: initialContracts = [], loading } = useContracts();
  const [localContracts, setLocalContracts] = useState([]);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  
  // Modals visibility states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPdfContract, setSelectedPdfContract] = useState(null);
  const [excelLoading, setExcelLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Sync initial loading data
  useEffect(() => {
    if (!loading) {
      setLocalContracts(initialContracts || []);
    }
  }, [initialContracts, loading]);

  // Handle Excel download simulation
  const handleExportExcel = () => {
    setExcelLoading(true);
    setTimeout(() => {
      setExcelLoading(false);
      setToast({
        message: 'Đã xuất dữ liệu danh sách hợp đồng ra file Excel thành công!',
        type: 'success'
      });
    }, 600);
  };

  // Handle new contract insertion from Wizard
  const handleSaveContract = (formData) => {
    const newId = `c-${localContracts.length + 3}`;
    const newCode = `HD-2026-00${localContracts.length + 3}`;
    const newContractObj = new Contract({
      id: newId,
      code: newCode,
      propertyId: formData.propertyId,
      roomId: formData.roomCode,
      tenantId: formData.tenantName,
      startDate: formData.startDate,
      endDate: formData.endDate,
      deposit: parseInt(formData.deposit) || 3000000,
      monthlyRent: parseInt(formData.monthlyRent) || 3000000,
      status: 'pending_sign',
      createdAt: new Date().toISOString()
    });

    // Insert new contract at the beginning of table
    setLocalContracts(prev => [newContractObj, ...prev]);
    setShowAddModal(false);

    setToast({
      message: `Lập hợp đồng "${newCode}" thành công! Mã phòng: ${formData.roomCode}.`,
      type: 'success'
    });
  };

  // Handle simulated PDF download inside viewer
  const handleDownloadPdf = (contractCode) => {
    setToast({
      message: `Đã tải bản hợp đồng ${contractCode} dạng PDF về máy thành công!`,
      type: 'success'
    });
  };

  // Filter lists by tabs & search query
  const filteredSearch = localContracts.filter((c) => {
    const term = search.toLowerCase();
    const codeMatch = c.code?.toLowerCase().includes(term);
    const tenantMatch = c.tenantId?.toLowerCase().includes(term);
    const roomMatch = c.roomId?.toLowerCase().includes(term);
    return codeMatch || tenantMatch || roomMatch;
  });

  const filtered = tab === 'all' 
    ? filteredSearch 
    : filteredSearch.filter((c) => c.status === tab);

  const counts = {
    all: localContracts.length,
    active: localContracts.filter((c) => c.status === 'active').length,
    expiring: localContracts.filter((c) => c.status === 'expiring').length,
    pending_sign: localContracts.filter((c) => c.status === 'pending_sign').length,
    ended: localContracts.filter((c) => c.status === 'ended').length,
  };

  return (
    <>
      <PageHeader
        title="Hợp đồng"
        subtitle="Toàn bộ hợp đồng của các nhà trọ trong chuỗi"
        actions={<Button icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>Tạo hợp đồng mới</Button>}
      />

      <Card className="mb-4 animate-[fadeIn_0.3s_ease-out]" padded={false}>
        <div className="px-6 pt-4">
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'all',          label: 'Tất cả',        count: counts.all },
              { value: 'active',       label: 'Hiệu lực',      count: counts.active },
              { value: 'expiring',     label: 'Sắp hết hạn',   count: counts.expiring },
              { value: 'pending_sign', label: 'Chờ ký',        count: counts.pending_sign },
              { value: 'ended',        label: 'Đã kết thúc',   count: counts.ended },
            ]}
          />
        </div>
        <div className="flex gap-3 p-4 border-b border-line bg-gray-50">
          <Input 
            placeholder="Tìm theo mã HĐ, phòng, khách thuê…" 
            className="flex-1 max-w-sm" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button 
            variant="secondary" 
            icon={<FileDown size={16} />} 
            onClick={handleExportExcel}
            loading={excelLoading}
          >
            Xuất Excel
          </Button>
        </div>
      </Card>

      {loading && localContracts.length === 0 ? <Loading /> : (
        <div className="animate-[fadeIn_0.3s_ease-out]">
          <Table
            columns={[
              { key: 'code',    header: 'Mã HĐ', render: (c) => <span className="font-semibold text-primary">{c.code}</span> },
              { key: 'room',    header: 'Phòng',   render: (c) => c.roomId },
              { key: 'tenant',  header: 'Khách thuê', render: (c) => c.tenantId || '—' },
              { key: 'start',   header: 'Bắt đầu', render: (c) => formatDate(c.startDate) },
              { key: 'end',     header: 'Kết thúc', render: (c) => formatDate(c.endDate) },
              { key: 'rent',    header: 'Giá thuê', className: 'text-right font-medium', render: (c) => formatCurrency(c.monthlyRent) },
              { key: 'status',  header: 'Trạng thái',
                render: (c) => {
                  const meta = CONTRACT_STATUS_META[c.status] || { label: c.status, color: 'neutral' };
                  return <Badge color={meta.color}>{meta.label}</Badge>;
                } 
              },
              { key: 'action',  header: '',
                render: (c) => (
                  <button 
                    onClick={() => setSelectedPdfContract(c)}
                    className="text-primary text-sm hover:text-primary-dark font-medium flex items-center gap-1 transition-colors hover:underline px-2.5 py-1 rounded-lg hover:bg-primary/5 apple-press"
                  >
                    <Eye size={14} /> Xem PDF
                  </button>
                )
              },
            ]}
            data={filtered}
            emptyText="Không tìm thấy hợp đồng phù hợp"
          />
        </div>
      )}

      {showAddModal && (
        <CreateContractModal 
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveContract}
        />
      )}

      {selectedPdfContract && (
        <ViewPdfModal 
          contract={selectedPdfContract}
          onClose={() => setSelectedPdfContract(null)}
          onDownload={handleDownloadPdf}
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
