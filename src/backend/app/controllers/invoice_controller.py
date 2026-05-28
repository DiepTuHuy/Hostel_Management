from flask import request, jsonify
import datetime
from app.models.invoice import Invoice
from app.models.utils import map_invoice

class InvoiceController:
    @staticmethod
    def list_invoices():
        try:
            tenant_id = request.args.get("tenantId")
            property_id = request.args.get("propertyId")
            status = request.args.get("status")
            period = request.args.get("period")
            
            invoices = Invoice.find_all(tenant_id=tenant_id, property_id=property_id, status=status, period=period)
            return jsonify([map_invoice(inv) for inv in invoices if inv]), 200
        except Exception as e:
            return jsonify({"message": f"Lỗi hệ thống: {str(e)}"}), 500

    @staticmethod
    def get_by_id(invoice_id):
        try:
            invoice = Invoice.find_by_id(invoice_id)
            if not invoice:
                return jsonify({"message": "Hoá đơn không tồn tại."}), 404
            return jsonify(map_invoice(invoice)), 200
        except Exception as e:
            return jsonify({"message": f"Lỗi hệ thống: {str(e)}"}), 500

    @staticmethod
    def pay_invoice(invoice_id):
        try:
            body = request.json or {}
            method = body.get("method", "VNPay")
            
            invoice = Invoice.find_by_id(invoice_id)
            if not invoice:
                return jsonify({"message": "Hoá đơn không tồn tại."}), 404
                
            # If cash, status = pending_cash, otherwise paid
            new_status = "paid"
            if method in ["Tiền mặt", "Tiền mặt — tôi sẽ trả cho Quản lý", "cash"]:
                new_status = "pending_cash"
                
            update_data = {
                "status": new_status,
                "paymentMethod": method
            }
            
            if new_status == "paid":
                update_data["paidAt"] = datetime.datetime.utcnow().isoformat() + "Z"
                
            updated_invoice = Invoice.update(invoice_id, update_data)
            transaction_id = f"TX{int(datetime.datetime.utcnow().timestamp() * 1000)}"
            
            return jsonify({
                "ok": True,
                "transactionId": transaction_id,
                "method": method,
                "invoice": map_invoice(updated_invoice)
            }), 200
        except Exception as e:
            return jsonify({"message": f"Lỗi hệ thống khi thanh toán: {str(e)}"}), 500
