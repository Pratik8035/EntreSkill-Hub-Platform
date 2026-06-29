'use strict';

/**
 * invoiceService.js — Sprint 12 Phase 2
 * Invoice CRUD with auto-numbering and status management
 */

const Invoice = require('../models/Invoice');
const AppError = require('../utils/AppError');

class InvoiceService {

  static async listInvoices(userId, query = {}) {
    const { status, startDate, endDate, page = 1, limit = 20, search, sort = '-issueDate' } = query;
    const filter = { userId };
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.issueDate = {};
      if (startDate) filter.issueDate.$gte = new Date(startDate);
      if (endDate) filter.issueDate.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [invoices, total] = await Promise.all([
      Invoice.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
      Invoice.countDocuments(filter),
    ]);
    return { invoices, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
  }

  static async getInvoiceById(id, userId) {
    const invoice = await Invoice.findOne({ _id: id, userId }).lean();
    if (!invoice) throw new AppError('Invoice not found', 404);
    return invoice;
  }

  static async createInvoice(data, userId) {
    // Auto-generate invoice number if not provided
    if (!data.invoiceNumber) {
      const count = await Invoice.countDocuments({ userId });
      data.invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}-${Date.now().toString().slice(-4)}`;
    }
    // Calculate totals from items
    if (data.items && data.items.length > 0) {
      data.items = data.items.map((item) => ({
        ...item,
        total: item.quantity * item.unitPrice,
      }));
      data.subtotal = data.items.reduce((s, i) => s + i.total, 0);
      const taxAmount = (data.subtotal * (data.taxRate || 0)) / 100;
      data.taxAmount = taxAmount;
      data.totalAmount = data.subtotal + taxAmount - (data.discount || 0);
    }
    return Invoice.create({ ...data, userId });
  }

  static async updateInvoice(id, data, userId) {
    // Recalculate totals if items changed
    if (data.items && data.items.length > 0) {
      data.items = data.items.map((item) => ({
        ...item,
        total: item.quantity * item.unitPrice,
      }));
      data.subtotal = data.items.reduce((s, i) => s + i.total, 0);
      const taxAmount = (data.subtotal * (data.taxRate || 0)) / 100;
      data.taxAmount = taxAmount;
      data.totalAmount = data.subtotal + taxAmount - (data.discount || 0);
    }
    const invoice = await Invoice.findOneAndUpdate(
      { _id: id, userId },
      { ...data, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!invoice) throw new AppError('Invoice not found', 404);
    return invoice;
  }

  static async deleteInvoice(id, userId) {
    const invoice = await Invoice.findOneAndDelete({ _id: id, userId });
    if (!invoice) throw new AppError('Invoice not found', 404);
    return invoice;
  }

  static async markAsPaid(id, userId) {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: id, userId },
      { status: 'Paid', paidDate: new Date(), updatedAt: Date.now() },
      { new: true }
    );
    if (!invoice) throw new AppError('Invoice not found', 404);
    return invoice;
  }

  static async markAsSent(id, userId) {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: id, userId, status: 'Draft' },
      { status: 'Sent', updatedAt: Date.now() },
      { new: true }
    );
    if (!invoice) throw new AppError('Invoice not found or not in Draft status', 404);
    return invoice;
  }

  static async getInvoiceSummary(userId) {
    const invoices = await Invoice.find({ userId }).lean();
    const now = new Date();
    const totalRevenue = invoices
      .filter((i) => i.status === 'Paid')
      .reduce((s, i) => s + i.totalAmount, 0);
    const pendingAmount = invoices
      .filter((i) => ['Sent', 'Overdue'].includes(i.status))
      .reduce((s, i) => s + i.totalAmount, 0);
    // Mark overdue invoices
    const overdue = invoices.filter(
      (i) => i.status === 'Sent' && i.dueDate && new Date(i.dueDate) < now
    );
    return {
      totalInvoices: invoices.length,
      draft: invoices.filter((i) => i.status === 'Draft').length,
      sent: invoices.filter((i) => i.status === 'Sent').length,
      paid: invoices.filter((i) => i.status === 'Paid').length,
      overdue: overdue.length,
      cancelled: invoices.filter((i) => i.status === 'Cancelled').length,
      totalRevenue,
      pendingAmount,
      overdueAmount: overdue.reduce((s, i) => s + i.totalAmount, 0),
    };
  }
}

module.exports = InvoiceService;
