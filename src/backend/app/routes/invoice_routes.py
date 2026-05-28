from flask import Blueprint
from app.controllers.invoice_controller import InvoiceController

invoice_bp = Blueprint('invoice', __name__)

@invoice_bp.route('', methods=['GET'])
@invoice_bp.route('/', methods=['GET'])
def list_invoices():
    return InvoiceController.list_invoices()

@invoice_bp.route('/<id>', methods=['GET'])
def get_by_id(id):
    return InvoiceController.get_by_id(id)

@invoice_bp.route('/<id>/pay', methods=['POST'])
def pay_invoice(id):
    return InvoiceController.pay_invoice(id)
