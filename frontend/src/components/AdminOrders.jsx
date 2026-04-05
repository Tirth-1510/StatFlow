import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);

  const fetchOrders = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const response = await axios.get("/api/orders/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
      });
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Grouping logic for Daily Log
  const dailyLog = Array.from(
    orders.reduce((acc, order) => {
      if (order.customer) {
        const datePart = new Date(order.orderDate).toISOString().split("T")[0];
        const sessionKey = `${order.customer._id}_${datePart}`;

        if (!acc.has(sessionKey)) {
          acc.set(sessionKey, {
            sessionId: sessionKey,
            customer: order.customer,
            date: order.orderDate,
            items: [order],
            dayTotal: order.totalPrice,
          });
        } else {
          const existing = acc.get(sessionKey);
          existing.items.push(order);
          existing.dayTotal += order.totalPrice;
        }
      }
      return acc;
    }, new Map()).values()
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  const generateBill = (data, isFullSession = false) => {
    try {
      const doc = new jsPDF();
      const items = isFullSession ? data : [data];
      
      if (!items || items.length === 0) {
        alert("No order data found to print.");
        return;
      }

      const customer = items[0]?.customer || { name: "Guest", email: "N/A" };
      const orderDate = items[0]?.orderDate || new Date();
      const grandTotal = items.reduce((sum, i) => sum + (i.totalPrice || 0), 0);
      const taxRate = 0.18; // 18% GST (assuming inclusive for simplicity, extracting base)
      const baseAmount = grandTotal / (1 + taxRate);
      const taxAmount = grandTotal - baseAmount;

      // Outer Border
      doc.setDrawColor(200);
      doc.setLineWidth(0.5);
      doc.rect(5, 5, 200, 287); 

      // Header Background
      doc.setFillColor(34, 40, 49); // Dark header
      doc.rect(5, 5, 200, 35, 'F');
      
      doc.setFontSize(26).setFont("helvetica", "bold").setTextColor(255, 255, 255);
      doc.text("INVENTORY PRO", 14, 25);
      
      doc.setFontSize(10).setFont("helvetica", "normal").setTextColor(200, 200, 200);
      doc.text("Professional Inventory & Billing Solutions", 14, 32);

      doc.setFontSize(22).setFont("helvetica", "bold").setTextColor(255, 255, 255);
      doc.text("TAX INVOICE", 195, 25, { align: "right" });
      
      // Business details
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(10).setFont("helvetica", "bold");
      doc.text("Billed By:", 14, 55);
      doc.setFont("helvetica", "normal");
      doc.text("Inventory Pro Ltd.\n123 Business Avenue, Suite #404\nTech City, TX 75001\nGSTIN: 22AAAAA0000A1Z5", 14, 62);

      // Customer Details
      doc.setFont("helvetica", "bold");
      doc.text("Billed To:", 105, 55);
      doc.setFont("helvetica", "normal");
      doc.text(`Customer Name: ${customer.name}\nEmail: ${customer.email}`, 105, 62);

      // Invoice Meta
      const invoiceId = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
      doc.setFont("helvetica", "bold");
      doc.text("Invoice Details:", 150, 55);
      doc.setFont("helvetica", "normal");
      doc.text(`Invoice #: ${invoiceId}\nDate: ${new Date(orderDate).toLocaleDateString("en-GB")}`, 150, 62);

      // Divider
      doc.setDrawColor(220);
      doc.line(14, 85, 195, 85);

      autoTable(doc, {
        startY: 95,
        head: [['S No.', 'Product Description', 'Qty', 'Unit Price', 'Total']],
        body: items.map((item, idx) => [
          idx + 1,
          item.product?.name || "Unknown Product",
          item.quantity || 0,
          "Rs. " + (item.product?.price || 0).toLocaleString(), 
          "Rs. " + (item.totalPrice || 0).toLocaleString()
        ]),
        theme: 'striped',
        headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5 },
        alternateRowStyles: { fillColor: [248, 249, 250] },
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      
      // Total Calculation Box
      doc.setDrawColor(200);
      doc.rect(120, finalY, 75, 30);
      
      doc.setFontSize(10).setFont("helvetica", "normal").setTextColor(0);
      doc.text("Taxable Value:", 125, finalY + 8);
      doc.text(`Rs. ${baseAmount.toFixed(2)}`, 190, finalY + 8, { align: "right" });
      
      doc.text("GST (18%):", 125, finalY + 15);
      doc.text(`Rs. ${taxAmount.toFixed(2)}`, 190, finalY + 15, { align: "right" });

      doc.setFont("helvetica", "bold");
      doc.setFillColor(44, 62, 80);
      doc.rect(120, finalY + 20, 75, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text("Grand Total:", 125, finalY + 27);
      doc.text(`Rs. ${grandTotal.toLocaleString()}`, 190, finalY + 27, { align: "right" });

      // Footer / Terms
      doc.setTextColor(100);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Terms & Conditions:", 14, finalY + 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(
        "1. Goods once sold will not be taken back or exchanged.\n2. All disputes are subject to the local jurisdiction.\n3. This is a computer-generated invoice and does not require a physical signature.",
        14, finalY + 12
      );

      doc.setFontSize(10).setFont("helvetica", "italic").setTextColor(50);
      doc.text("Thank you for your business!", 105, 280, { align: "center" });

      const pdfUrl = doc.output("bloburl");
      window.open(pdfUrl, "_blank");

    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Error generating PDF.");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-xl font-bold text-muted">Loading Logs...</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <div>
          <h1 className="text-3xl font-black text-primary flex items-center gap-2">
            Admin Order Log
            {refreshing && <span className="badge badge-primary">Updating...</span>}
          </h1>
          <p className="text-muted">Track and review daily customer sessions and generate invoices.</p>
        </div>
      </div>

      {!selectedSessionId ? (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>S No.</th>
                  <th>Order Date</th>
                  <th>Customer Info</th>
                  <th style={{ textAlign: 'center' }}>Items</th>
                  <th style={{ textAlign: 'right' }}>Revenue</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {dailyLog.map((session, index) => (
                  <tr key={session.sessionId}>
                    <td className="text-muted font-bold">{index + 1}</td>
                    <td className="font-bold text-primary">
                      {new Date(session.date).toLocaleDateString("en-GB")}
                    </td>
                    <td>
                      <p className="font-bold text-primary">{session.customer.name}</p>
                      <p className="text-xs text-muted">{session.customer.email}</p>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-primary">
                        {session.items.length} Units
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontSize: '1.125rem' }} className="font-black text-success">
                      ₹{session.dayTotal.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setFilteredOrders(session.items);
                          setSelectedSessionId(session.sessionId);
                        }}
                        className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex-col gap-4">
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedSessionId(null)}
                className="btn btn-outline"
              >
                ← Back
              </button>
              <div>
                <h2 className="text-2xl font-black text-primary">{filteredOrders[0]?.customer?.name}</h2>
                <p className="text-primary font-bold">
                  Session Log: {new Date(filteredOrders[0]?.orderDate).toLocaleDateString("en-GB")}
                </p>
              </div>
            </div>
            <button
              onClick={() => generateBill(filteredOrders, true)}
              className="btn btn-success"
            >
              Print Full Session Bill
            </button>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
                <table className="table">
                <thead>
                    <tr>
                    <th>Product Details</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Unit Price</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.map((order) => (
                    <tr key={order._id}>
                        <td>
                        <p className="font-bold text-primary">{order.product?.name}</p>
                        <p className="text-xs text-muted font-bold tracking-widest uppercase">
                            Time: {new Date(order.orderDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        </td>
                        <td style={{ textAlign: 'center' }} className="font-bold text-muted">{order.quantity}</td>
                        <td style={{ textAlign: 'right' }} className="text-muted">₹{order.product?.price?.toLocaleString()}</td>
                        <td style={{ textAlign: 'right', fontSize: '1.125rem' }} className="font-black text-primary">₹{order.totalPrice?.toLocaleString()}</td>
                        <td style={{ textAlign: 'center' }}>
                        <button
                            onClick={() => generateBill(order, false)}
                            className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                        >
                            Single Print
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                    <td colSpan="3" style={{ textAlign: 'right', padding: '1.5rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold' }}>Session Grand Total:</td>
                    <td style={{ textAlign: 'right', padding: '1.5rem', fontSize: '1.5rem', fontWeight: '900', color: 'var(--color-primary)' }}>
                        ₹{filteredOrders.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()}
                    </td>
                    <td></td>
                    </tr>
                </tfoot>
                </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;