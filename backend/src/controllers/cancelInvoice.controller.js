exports.cancelInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Delete related membership
    await Membership.findByIdAndDelete(invoice.membershipId);

    // Delete invoice
    await Invoice.findByIdAndDelete(invoiceId);

    res.json({ message: 'Invoice cancelled successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};