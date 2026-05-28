import { useState, useEffect } from 'react';
import { Plus, FileText, ChevronRight, X, User, Home, DollarSign, Calendar, ShieldCheck, HelpCircle } from 'lucide-react';
import { Button, PageHeader, Card, CardHeader, Table, Badge, Modal, Input, Toast } from '../../components/common';
import { useContracts } from '../../controllers/useContracts.js';
import { useRooms } from '../../controllers/useRooms.js';
import { CONTRACT_STATUS_META } from '../../models/Contract.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

import { propertyService, contractService } from '../../services/index.js';

export default function ManagerContractsPage() {
  const [propertyId, setPropertyId] = useState(localStorage.getItem('bhpro_selected_property_id') || '');
  const [propertyName, setPropertyName] = useState('Đang tải cơ sở...');

  useEffect(() => {
    const handlePropertyChange = () => {
      const activeId = localStorage.getItem('bhpro_selected_property_id') || '';
      setPropertyId(activeId);
    };
    window.addEventListener('bhpro_property_changed', handlePropertyChange);
    return () => {
      window.removeEventListener('bhpro_property_changed', handlePropertyChange);
    };
  }, []);

  useEffect(() => {
    if (propertyId) {
      propertyService.list().then(res => {
        const found = res.find(p => p.id === propertyId);
        if (found) {
          setPropertyName(found.name);
        } else {
          setPropertyName('Cơ sở không xác định');
        }
      }).catch(err => {
        console.error("Error loading property name in contracts page:", err);
        setPropertyName('Cơ sở');
      });
    } else {
      setPropertyName('Chưa chọn cơ sở');
    }
  }, [propertyId]);

  const { data: fetchedContracts = [], loading: loadingContracts } = useContracts({ propertyId });
  const { data: rooms = [] } = useRooms({ propertyId });
  
  const [contracts, setContracts] = useState([]);
  const [toast, setToast] = useState(null);

  // States for detailed view modal
  const [selectedContract, setSelectedContract] = useState(null);

  // States for new contract multi-step wizard modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [step, setStep] = useState(1); // steps: 1 (Room), 2 (Tenant), 3 (Terms)

  // Step 1: Room Selection state
  const [selectedRoomId, setSelectedRoomId] = useState('');
  
  // Step 2: Tenant information states
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantCccd, setTenantCccd] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');

  // Step 3: Terms states
  const [monthlyRent, setMonthlyRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2027-06-01');

  // Sync initial contracts
  useEffect(() => {
    if (!loadingContracts) {
      setContracts(fetchedContracts || []);
    }
  }, [fetchedContracts, loadingContracts]);

  // Handle room selection to auto-fill rent
  useEffect(() => {
    if (selectedRoomId) {
      const room = rooms.find((r) => r.id === selectedRoomId);
      if (room) {
        setMonthlyRent(room.price || '3500000');
        setDeposit(room.price ? String(room.price * 2) : '7000000'); // 2 months deposit default
      }
    }
  }, [selectedRoomId, rooms]);

  const handleOpenCreate = () => {
    setIsCreateOpen(true);
    setStep(1);
    setSelectedRoomId('');
    setTenantName('');
    setTenantPhone('');
    setTenantCccd('');
    setTenantEmail('');
    setMonthlyRent('');
    setDeposit('');
    setStartDate('2026-06-01');
    setEndDate('2027-06-01');
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedRoomId) {
      setToast({ message: 'Vui lòng chọn phòng để tiếp tục', type: 'error' });
      return;
    }
    if (step === 2) {
      if (!tenantName.trim() || !tenantPhone.trim() || !tenantCccd.trim() || !tenantEmail.trim()) {
        setToast({ message: 'Vui lòng điền đầy đủ thông tin khách thuê', type: 'error' });
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handlePrevStep = () => {
    setStep((s) => s - 1);
  };

  const handleCreateSubmit = async () => {
    if (!monthlyRent || !deposit || !startDate || !endDate) {
      setToast({ message: 'Vui lòng điền đầy đủ các điều khoản hợp đồng', type: 'error' });
      return;
    }

    try {
      const newContract = await contractService.create({
        roomId: selectedRoomId,
        tenantName,
        tenantPhone,
        tenantCccd,
        tenantEmail,
        startDate,
        endDate,
        deposit: parseFloat(deposit),
        monthlyRent: parseFloat(monthlyRent)
      });

      setContracts((prev) => [newContract, ...prev]);
      setToast({
        message: `Đã lập hợp đồng ${newContract.code} thành công và gửi liên kết ký số qua email: ${tenantEmail}!`,
        type: 'success'
      });
      setIsCreateOpen(false);
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Lỗi hệ thống khi lập hợp đồng', type: 'error' });
    }
  };

  const handleSimulateSign = (contractId) => {
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? { ...c, status: 'active', statusMeta: { label: 'Hiệu lực', color: 'success' } }
          : c
      )
    );
    setSelectedContract((prev) =>
      prev ? { ...prev, status: 'active', statusMeta: { label: 'Hiệu lực', color: 'success' } } : null
    );
    setToast({ message: 'Đã giả lập ký hợp đồng trực tuyến thành công!', type: 'success' });
  };

  // Filter vacant rooms for contract wizard
  const vacantRooms = rooms.filter((r) => r.status === 'vacant' || !r.currentTenantId);

  return (
    <>
      <PageHeader
        title="Khách thuê & hợp đồng"
        subtitle="Quản lý hợp đồng các phòng do bạn phụ trách"
        actions={
          <Button icon={<Plus size={16} />} className="apple-press" onClick={handleOpenCreate}>
            Lập hợp đồng mới
          </Button>
        }
      />

      <Card className="mb-gutter bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 p-6 rounded-2xl">
        <h3 className="text-title-lg font-semibold text-ink mb-3">Quy trình lập hợp đồng mới (3 bước)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { n: 1, t: 'Chọn phòng', d: 'Từ danh sách phòng trống' },
            { n: 2, t: 'Khách thuê', d: 'Tạo mới hoặc chọn từ DB' },
            { n: 3, t: 'Điều khoản & ký', d: 'Gửi link ký số qua email' },
          ].map((s) => (
            <div key={s.n} className="flex items-center gap-3 bg-white/60 backdrop-blur p-3 rounded-xl border border-line/40">
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">{s.n}</div>
              <div>
                <div className="font-semibold text-ink text-sm">{s.t}</div>
                <div className="text-xs text-ink-muted">{s.d}</div>
              </div>
              {s.n < 3 && <ChevronRight className="ml-auto text-ink-muted hidden md:block" />}
            </div>
          ))}
        </div>
      </Card>

      <Card padded={false}>
        <CardHeader title="Hợp đồng tại cơ sở" subtitle={propertyName} />
        {loadingContracts && contracts.length === 0 ? (
          <div className="p-8 text-center text-ink-muted">Đang tải danh sách hợp đồng...</div>
        ) : (
          <Table
            columns={[
              { key: 'code', header: 'Mã HĐ', render: (c) => <span className="font-semibold text-primary">{c.code}</span> },
              { key: 'room', header: 'Phòng', render: (c) => c.roomId },
              { key: 'tenant', header: 'Khách thuê', render: (c) => c.tenantId || '—' },
              { key: 'start',  header: 'Bắt đầu', render: (c) => formatDate(c.startDate) },
              { key: 'end',    header: 'Kết thúc', render: (c) => formatDate(c.endDate) },
              { key: 'rent',   header: 'Giá thuê', className: 'text-right', render: (c) => formatCurrency(c.monthlyRent) },
              { key: 'status', header: 'Trạng thái', render: (c) => <Badge color={CONTRACT_STATUS_META[c.status]?.color || c.statusMeta?.color}>{c.statusMeta?.label || 'Chờ ký'}</Badge> },
              {
                key: 'action',
                header: '',
                render: (c) => (
                  <button 
                    onClick={() => setSelectedContract(c)}
                    className="text-primary text-sm hover:underline flex items-center gap-1 apple-press font-semibold"
                  >
                    <FileText size={14}/> Xem
                  </button>
                )
              },
            ]}
            data={contracts}
          />
        )}
      </Card>

      {/* Contract Detail Modal */}
      <Modal
        open={!!selectedContract}
        onClose={() => setSelectedContract(null)}
        title={`Chi tiết Hợp đồng ${selectedContract?.code}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelectedContract(null)} className="apple-press">Đóng</Button>
            {selectedContract?.status === 'pending_sign' && (
              <Button onClick={() => handleSimulateSign(selectedContract.id)} className="apple-press">
                Giả lập ký duyệt online
              </Button>
            )}
          </>
        }
      >
        {selectedContract && (
          <div className="space-y-6">
            {/* General status banner */}
            <div className={`p-4 rounded-xl flex items-center justify-between ${
              selectedContract.status === 'active' ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-amber-50 text-amber-800 border border-amber-100'
            }`}>
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} />
                <span className="font-semibold text-sm">
                  Trạng thái hợp đồng: {selectedContract.statusMeta?.label || 'Đang xác thực'}
                </span>
              </div>
              <Badge color={CONTRACT_STATUS_META[selectedContract.status]?.color || selectedContract.statusMeta?.color}>
                {selectedContract.statusMeta?.label}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-line/60 rounded-xl p-4 bg-gray-50/50">
                <h4 className="font-bold text-ink text-sm flex items-center gap-2 mb-3">
                  <User size={16} className="text-primary" /> Khách thuê
                </h4>
                <div className="space-y-2 text-sm text-ink-muted">
                  <div>Họ tên: <strong className="text-ink">{selectedContract.tenantId}</strong></div>
                  <div>SĐT: <strong className="text-ink">0987.654.321 (Giả lập)</strong></div>
                  <div>CCCD: <strong className="text-ink">001096008123 (Giả lập)</strong></div>
                  <div>Email: <strong className="text-ink">{selectedContract.tenantId.toLowerCase().replace(/ /g, '')}@gmail.com</strong></div>
                </div>
              </div>

              <div className="border border-line/60 rounded-xl p-4 bg-gray-50/50">
                <h4 className="font-bold text-ink text-sm flex items-center gap-2 mb-3">
                  <Home size={16} className="text-primary" /> Phòng thuê
                </h4>
                <div className="space-y-2 text-sm text-ink-muted">
                  <div>Mã số phòng: <strong className="text-ink">{selectedContract.roomId}</strong></div>
                  <div>Cơ sở: <strong className="text-ink">{propertyName}</strong></div>
                  <div>Giá thuê: <strong className="text-primary font-semibold">{formatCurrency(selectedContract.monthlyRent)} / tháng</strong></div>
                  <div>Tiền cọc giữ: <strong className="text-ink font-semibold">{formatCurrency(selectedContract.deposit)}</strong></div>
                </div>
              </div>
            </div>

            <div className="border border-line/60 rounded-xl p-4 bg-gray-50/50">
              <h4 className="font-bold text-ink text-sm flex items-center gap-2 mb-3">
                <Calendar size={16} className="text-primary" /> Thời hạn & Điều khoản
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-ink-muted">
                <div>Ngày bắt đầu: <strong className="text-ink">{formatDate(selectedContract.startDate)}</strong></div>
                <div>Ngày kết thúc: <strong className="text-ink">{formatDate(selectedContract.endDate)}</strong></div>
              </div>
              <div className="mt-3 pt-3 border-t border-line text-xs text-ink-muted">
                * Ký kết số trực tuyến qua email, hỗ trợ chữ ký số quốc gia Smart-CA và VNPT.
              </div>
            </div>

            <div className="border border-line/60 rounded-xl p-4 bg-gray-50/50">
              <h4 className="font-bold text-ink text-sm flex items-center gap-2 mb-3">
                <DollarSign size={16} className="text-primary" /> Tiện ích đi kèm
              </h4>
              <ul className="space-y-1.5 text-sm text-ink">
                {selectedContract.services && selectedContract.services.length > 0 ? (
                  selectedContract.services.map((srv, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span className="text-ink-muted">{srv.split(' (')[0]}</span>
                      <span className="font-medium">({srv.split(' (')[1] || 'đã bao gồm'}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex justify-between"><span className="text-ink-muted">Điện tiêu thụ</span><span className="font-medium">3.000đ / kWh</span></li>
                    <li className="flex justify-between"><span className="text-ink-muted">Nước tiêu thụ</span><span className="font-medium">20.000đ / m³</span></li>
                    <li className="flex justify-between"><span className="text-ink-muted">Internet tốc độ cao</span><span className="font-medium">Miễn phí</span></li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}
      </Modal>

      {/* Create New Contract Wizard */}
      <Modal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={`Lập hợp đồng thuê mới — Bước ${step} / 3`}
        footer={
          <div className="flex justify-between w-full">
            {step > 1 ? (
              <Button variant="secondary" onClick={handlePrevStep} className="apple-press">Quay lại</Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="apple-press">Huỷ</Button>
              {step < 3 ? (
                <Button onClick={handleNextStep} className="apple-press">Tiếp tục</Button>
              ) : (
                <Button onClick={handleCreateSubmit} className="apple-press">Hoàn tất & Gửi ký số</Button>
              )}
            </div>
          </div>
        }
      >
        {/* Step 1: Select Room */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="font-bold text-ink text-base mb-2">Bước 1: Chọn phòng trống</h4>
            <p className="text-sm text-ink-muted">Chỉ hiển thị các phòng hiện đang trống tại cơ sở {propertyName}.</p>
            
            {vacantRooms.length === 0 ? (
              <div className="p-8 text-center text-ink-muted border border-dashed border-line rounded-xl">
                Không tìm thấy phòng trống khả dụng. Vui lòng giải phóng phòng trước khi lập hợp đồng mới.
              </div>
            ) : (
              <div className="space-y-3">
                <label className="label">Chọn phòng thuê</label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full input"
                >
                  <option value="">-- Chọn phòng trống --</option>
                  {vacantRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.code} — {formatCurrency(r.price)} / tháng
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  {vacantRooms.map((r) => (
                    <div 
                      key={r.id}
                      onClick={() => setSelectedRoomId(r.id)}
                      className={`border p-4 rounded-xl cursor-pointer text-center transition-all duration-200 ${
                        selectedRoomId === r.id 
                          ? 'border-primary bg-primary-soft/30 font-semibold ring-2 ring-primary/10'
                          : 'border-line/60 bg-gray-50/50 hover:bg-gray-100/50'
                      }`}
                    >
                      <div className="text-ink font-semibold text-lg">{r.code}</div>
                      <div className="text-xs text-ink-muted mt-1">{formatCurrency(r.price)}/tháng</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Tenant Info */}
        {step === 2 && (
          <div className="space-y-4">
            <h4 className="font-bold text-ink text-base mb-2">Bước 2: Thông tin khách thuê mới</h4>
            
            <Input
              label="Họ và tên khách thuê"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              placeholder="Ví dụ: Hoàng Thuỳ Linh"
            />

            <Input
              label="Số điện thoại liên hệ"
              value={tenantPhone}
              onChange={(e) => setTenantPhone(e.target.value)}
              placeholder="Ví dụ: 0987654321"
            />

            <Input
              label="Số CMND/CCCD"
              value={tenantCccd}
              onChange={(e) => setTenantCccd(e.target.value)}
              placeholder="Ví dụ: 001096008123"
            />

            <Input
              label="Địa chỉ Email (nhận liên kết chữ ký số)"
              value={tenantEmail}
              type="email"
              onChange={(e) => setTenantEmail(e.target.value)}
              placeholder="Ví dụ: linh.hoang@gmail.com"
            />
          </div>
        )}

        {/* Step 3: Terms & Rent */}
        {step === 3 && (
          <div className="space-y-4">
            <h4 className="font-bold text-ink text-base mb-2">Bước 3: Thiết lập điều khoản</h4>
            
            <div className="p-4 bg-gray-50 rounded-xl mb-3 text-sm">
              <div className="font-semibold text-ink mb-1">Tóm tắt thông tin:</div>
              <div className="text-ink-muted">
                Phòng đăng ký: <strong className="text-ink">{rooms.find(r => r.id === selectedRoomId)?.code}</strong>
                <br />
                Khách thuê: <strong className="text-ink">{tenantName}</strong>
              </div>
            </div>

            <Input
              label="Giá thuê hàng tháng (VNĐ)"
              value={monthlyRent}
              type="number"
              onChange={(e) => setMonthlyRent(e.target.value)}
              prefix={<DollarSign size={16} className="mt-0.5" />}
            />

            <Input
              label="Tiền đặt cọc (VNĐ)"
              value={deposit}
              type="number"
              onChange={(e) => setDeposit(e.target.value)}
              prefix={<DollarSign size={16} className="mt-0.5" />}
              helper="Thường bằng từ 1-2 tháng tiền thuê phòng."
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ngày bắt đầu"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="Ngày kết thúc"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Toast Alert */}
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
