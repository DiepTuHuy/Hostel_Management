import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertCircle, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card, Button } from '../../components/common';
import { formatCurrency } from '../../utils/format.js';
import { API_HOST } from '../../services/api.js';

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const status = searchParams.get('status');
  const amount = searchParams.get('amount');
  const invoiceId = searchParams.get('invoiceId');
  const invoiceCode = searchParams.get('invoiceCode') || 'N/A';
  const errorMessage = searchParams.get('message') || 'Giao dịch không thành công hoặc đã bị hủy bỏ.';

  useEffect(() => {
    // Giả lập load ngắn cho mượt
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-ink-muted">Đang đối soát kết quả giao dịch VNPay...</p>
        </div>
      </div>
    );
  }

  const isSuccess = status === 'success';

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-[fadeInScale_0.35s_ease-out]">
        <Card className="border border-line rounded-3xl bg-white shadow-elevated p-6 relative overflow-hidden">
          
          {/* Decorative Top Accent line */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${isSuccess ? 'bg-success' : 'bg-danger'}`} />

          {isSuccess ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-200/50 shadow-sm animate-pulse">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-lg font-bold text-ink tracking-tight">Thanh toán thành công!</h2>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Cảm ơn bạn. Hóa đơn đã được ghi nhận thanh toán hoàn tất trên hệ thống.
                </p>
              </div>

              <div className="bg-gray-50 border border-line rounded-2xl p-4 text-xs divide-y divide-line/60">
                <div className="flex justify-between py-2.5">
                  <span className="text-ink-muted">Mã Hóa đơn</span>
                  <span className="font-bold text-primary">{invoiceCode}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-ink-muted">Số tiền thanh toán</span>
                  <span className="font-bold text-ink">{formatCurrency(Number(amount))}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-ink-muted">Phương thức</span>
                  <span className="font-semibold text-ink">Ví điện tử VNPay</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-ink-muted">Thời gian giao dịch</span>
                  <span className="font-semibold text-ink-muted flex items-center gap-1">
                    <Calendar size={12} /> {new Date().toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex gap-2 text-[10px] text-emerald-800 leading-relaxed">
                <ShieldCheck size={14} className="shrink-0 text-emerald-600 mt-0.5" />
                <span>Giao dịch này được bảo mật và xác thực chính thức bởi cổng thanh toán VNPay Sandbox. Bạn có thể tải file PDF biên lai bất cứ lúc nào.</span>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 rounded-xl h-11 text-xs"
                  onClick={() => navigate('/tenant/invoices')}
                >
                  Quay lại Hóa đơn <ArrowRight size={14} />
                </Button>
                {invoiceId && (
                  <a
                    href={`${API_HOST}/api/invoices/${invoiceId}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gray-50 hover:bg-gray-100 border border-line rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs text-ink transition-colors h-11"
                  >
                    Tải PDF Hóa đơn
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-red-50 text-danger rounded-full flex items-center justify-center mx-auto border border-red-200/50 shadow-sm">
                  <XCircle size={32} />
                </div>
                <h2 className="text-lg font-bold text-ink tracking-tight">Thanh toán thất bại</h2>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Giao dịch không thành công hoặc xảy ra sự cố trong quá trình thanh toán.
                </p>
              </div>

              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-xs text-red-800">
                <AlertCircle size={18} className="shrink-0 text-danger" />
                <div>
                  <span className="font-bold block">Chi tiết lỗi</span>
                  {errorMessage}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  className="w-full rounded-xl h-11 text-xs"
                  onClick={() => navigate('/tenant/invoices')}
                >
                  Quay lại danh sách Hóa đơn
                </Button>
              </div>
            </div>
          )}

        </Card>
      </div>
    </div>
  );
}
