import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaReceipt, FaTrash, FaExclamationTriangle, FaCheckCircle, FaSync, FaChevronDown, FaChevronUp, FaSearch, FaFilter } from "react-icons/fa";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDaysElapsed = (billDate) => {
  const now = new Date();
  const bill = new Date(billDate);
  const diff = now - bill;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const getDaysRemaining = (billDate, creditDays = 60) => {
  return creditDays - getDaysElapsed(billDate);
};

const getBillStatus = (billDate) => {
  const elapsed = getDaysElapsed(billDate);
  if (elapsed >= 60) return "overdue";
  if (elapsed >= 45) return "warning";
  return "normal";
};

// ─── Status Config ─────────────────────────────────────────────────────────────

const statusConfig = {
  normal: {
    rowBg: "transparent",
    rowBorder: "transparent",
    badgeStyle: {
      background: "var(--color-success-faint)",
      color: "var(--color-success)",
      border: "1px solid var(--color-success-light)",
    },
    badgeText: (rem) => `${rem} days left`,
    icon: <FaCheckCircle style={{ color: "var(--color-success)" }} />,
  },
  warning: {
    rowBg: "rgba(239,68,68,0.06)",
    rowBorder: "rgba(239,68,68,0.4)",
    badgeStyle: {
      background: "#fff1f2",
      color: "#ef4444",
      border: "1px solid #fecaca",
      animation: "pulseBadge 1.5s ease-in-out infinite",
    },
    badgeText: (rem) => `⚠️ Due in ${rem} days`,
    icon: <FaExclamationTriangle style={{ color: "#ef4444" }} />,
  },
  overdue: {
    rowBg: "rgba(239,68,68,0.13)",
    rowBorder: "#ef4444",
    badgeStyle: {
      background: "#ef4444",
      color: "#fff",
      border: "1px solid #dc2626",
      fontWeight: "900",
    },
    badgeText: () => "⛔ OVERDUE",
    icon: <FaExclamationTriangle style={{ color: "#dc2626" }} />,
  },
};

// ─── Customer Accordion Card ───────────────────────────────────────────────────

const CustomerCard = ({ customerName, customerAddress, bills, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const totalOutstanding = bills.reduce((s, b) => s + b.totalAmount, 0);
  const hasUrgent = bills.some((b) => getBillStatus(b.billDate) !== "normal");

  const handleDelete = async (billId) => {
    if (confirmId !== billId) {
      setConfirmId(billId);
      return;
    }
    setDeletingId(billId);
    try {
      const token = localStorage.getItem("pos-token");
      await axios.delete(`/api/bills/${billId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDelete(billId);
    } catch (err) {
      console.error("Delete bill error:", err);
      alert("Failed to remove bill. Please try again.");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  return (
    <div
      className="card animate-fade-in"
      style={{
        marginBottom: "1.5rem",
        border: hasUrgent ? "1.5px solid rgba(239,68,68,0.35)" : "1px solid var(--color-border)",
        overflow: "visible",
      }}
    >
      {/* Customer Header */}
      <div
        onClick={() => setExpanded((p) => !p)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 1.5rem",
          cursor: "pointer",
          background: hasUrgent
            ? "linear-gradient(90deg, rgba(239,68,68,0.08) 0%, transparent 100%)"
            : "var(--color-background)",
          borderRadius: expanded ? "var(--radius-lg) var(--radius-lg) 0 0" : "var(--radius-lg)",
          transition: "background 0.3s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Avatar */}
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: hasUrgent
                ? "linear-gradient(135deg, #ef4444, #f97316)"
                : "linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "900",
              fontSize: "1.1rem",
              flexShrink: 0,
            }}
          >
            {customerName.charAt(0).toUpperCase()}
          </div>

          <div>
            <p style={{ fontWeight: "800", fontSize: "1.05rem", color: "var(--color-text-main)" }}>
              {customerName}
            </p>
            <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>{customerAddress}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "700" }}>
              Total Outstanding
            </p>
            <p
              style={{
                fontSize: "1.4rem",
                fontWeight: "900",
                color: hasUrgent ? "#ef4444" : "var(--color-primary)",
              }}
            >
              ₹{totalOutstanding.toLocaleString()}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                padding: "0.2rem 0.6rem",
                borderRadius: "99px",
                fontSize: "0.72rem",
                fontWeight: "700",
                background: "var(--color-primary-faint)",
                color: "var(--color-primary)",
                border: "1px solid var(--color-primary-light)",
              }}
            >
              {bills.length} {bills.length === 1 ? "Bill" : "Bills"}
            </span>

            {expanded ? (
              <button className="btn btn-outline" style={{ marginLeft: '0.5rem', padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Hide Bills</button>
            ) : (
              <button className="btn btn-primary" style={{ marginLeft: '0.5rem', padding: '0.4rem 1rem', fontSize: '0.8rem' }}>View Bills</button>
            )}
          </div>
        </div>
      </div>

      {/* Bills Table */}
      {expanded && (
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Bill #</th>
                <th>Bill Date</th>
                <th style={{ textAlign: "center" }}>Items</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th style={{ textAlign: "center" }}>Days Elapsed</th>
                <th style={{ textAlign: "center" }}>Credit Status</th>
                <th style={{ textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => {
                const status = getBillStatus(bill.billDate);
                const cfg = statusConfig[status];
                const elapsed = getDaysElapsed(bill.billDate);
                const remaining = getDaysRemaining(bill.billDate);
                const isDeleting = deletingId === bill._id;
                const isConfirming = confirmId === bill._id;

                return (
                  <tr
                    key={bill._id}
                    style={{
                      backgroundColor: cfg.rowBg,
                      outline: status !== "normal" ? `1.5px solid ${cfg.rowBorder}` : "none",
                      animation: status === "overdue" ? "shakeRow 0.5s ease-in-out" : undefined,
                    }}
                  >
                    {/* Bill Number */}
                    <td>
                      <span style={{ fontWeight: "700", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                        {bill.billNumber}
                      </span>
                    </td>

                    {/* Date */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {cfg.icon}
                        <span
                          style={{
                            fontWeight: "700",
                            color: status !== "normal" ? "#ef4444" : "var(--color-text-main)",
                          }}
                        >
                          {new Date(bill.billDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Items count */}
                    <td style={{ textAlign: "center" }}>
                      <span className="badge badge-primary">{bill.orders.length} items</span>
                    </td>

                    {/* Amount */}
                    <td style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: "900",
                          color: status !== "normal" ? "#ef4444" : "var(--color-primary)",
                        }}
                      >
                        ₹{bill.totalAmount.toLocaleString()}
                      </span>
                    </td>

                    {/* Days Elapsed */}
                    <td style={{ textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "1.4rem",
                            fontWeight: "900",
                            color: status === "overdue" ? "#dc2626" : status === "warning" ? "#ef4444" : "var(--color-text-muted)",
                          }}
                        >
                          {elapsed}
                        </span>
                        {/* Progress bar */}
                        <div
                          style={{
                            width: "60px",
                            height: "4px",
                            borderRadius: "99px",
                            background: "var(--color-border)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min((elapsed / 60) * 100, 100)}%`,
                              height: "100%",
                              borderRadius: "99px",
                              background:
                                status === "overdue"
                                  ? "#dc2626"
                                  : status === "warning"
                                  ? "#f59e0b"
                                  : "var(--color-success)",
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>/ 60 days</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td style={{ textAlign: "center" }}>
                      <span
                        style={{
                          ...cfg.badgeStyle,
                          padding: "0.3rem 0.8rem",
                          borderRadius: "99px",
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          whiteSpace: "nowrap",
                          display: "inline-block",
                        }}
                      >
                        {cfg.badgeText(remaining > 0 ? remaining : 0)}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => handleDelete(bill._id)}
                        disabled={isDeleting}
                        className={isConfirming ? "btn btn-danger" : "btn btn-outline"}
                        style={{
                          padding: "0.35rem 0.85rem",
                          fontSize: "0.75rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          transition: "all 0.2s ease",
                        }}
                        title="Mark as paid — removes from ledger"
                      >
                        {isDeleting ? (
                          <>
                            <span
                              style={{
                                width: "12px",
                                height: "12px",
                                border: "2px solid rgba(255,255,255,0.4)",
                                borderTopColor: "#fff",
                                borderRadius: "50%",
                                animation: "spin 0.7s linear infinite",
                                display: "inline-block",
                              }}
                            />
                            Removing...
                          </>
                        ) : isConfirming ? (
                          <>
                            <FaCheckCircle />
                            Confirm Paid?
                          </>
                        ) : (
                          <>
                            <FaTrash />
                            Mark Paid
                          </>
                        )}
                      </button>
                      {isConfirming && (
                        <button
                          onClick={() => setConfirmId(null)}
                          style={{
                            marginLeft: "0.4rem",
                            fontSize: "0.7rem",
                            color: "var(--color-text-muted)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          cancel
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Main PaymentLedger Component ──────────────────────────────────────────────

const PaymentLedger = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchBills = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      const token = localStorage.getItem("pos-token");
      const res = await axios.get("/api/bills/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setBills(res.data.bills);
      }
    } catch (err) {
      console.error("Error fetching bills:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // Group bills by customer
  const grouped = bills.reduce((acc, bill) => {
    if (!bill.customer) return acc;
    const key = bill.customer._id;
    if (!acc[key]) {
      acc[key] = {
        customer: bill.customer,
        bills: [],
      };
    }
    acc[key].bills.push(bill);
    return acc;
  }, {});

  const groupedArr = Object.values(grouped);

  // Sort customers: those with urgent/overdue bills come first
  groupedArr.sort((a, b) => {
    const aUrgent = a.bills.some((b) => getBillStatus(b.billDate) !== "normal") ? 0 : 1;
    const bUrgent = b.bills.some((b) => getBillStatus(b.billDate) !== "normal") ? 0 : 1;
    return aUrgent - bUrgent;
  });

  // Apply search and filter
  const finalFilteredArr = groupedArr.filter(({ customer, bills: customerBills }) => {
    // 1. Search by name or address
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = customer.name.toLowerCase().includes(searchLower) || 
                          (customer.address || "").toLowerCase().includes(searchLower);
    if (!matchesSearch) return false;

    // 2. Filter by status
    if (filterStatus === "all") return true;
    
    // Check if the customer has at least one bill matching the selected status
    const hasMatchingBill = customerBills.some(b => getBillStatus(b.billDate) === filterStatus);
    return hasMatchingBill;
  });

  const handleBillDeleted = (deletedId) => {
    setBills((prev) => prev.filter((b) => b._id !== deletedId));
  };

  const grandTotal = bills.reduce((s, b) => s + b.totalAmount, 0);
  const overdueCount = bills.filter((b) => getBillStatus(b.billDate) === "overdue").length;
  const warningCount = bills.filter((b) => getBillStatus(b.billDate) === "warning").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid var(--color-primary-faint)",
              borderTopColor: "var(--color-primary)",
              borderRadius: "50%",
              animation: "spin 0.9s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p className="text-muted font-bold">Loading Payment Ledger...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulseBadge {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.05); }
        }
        @keyframes shakeRow {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          60% { transform: translateX(4px); }
        }
      `}</style>

      {/* Page Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", gap: "1rem" }}>
        <div>
          <h1 className="text-3xl font-black text-primary flex items-center gap-2">
            <FaReceipt />
            Payment Ledger
            {refreshing && <span className="badge badge-primary" style={{ fontSize: "0.7rem" }}>Refreshing...</span>}
          </h1>
          <p className="text-muted" style={{ marginTop: "0.35rem" }}>
            Outstanding bills by customer · 60-day credit window · Bills ≥ 45 days are flagged red
          </p>
        </div>
        <button
          onClick={() => fetchBills(true)}
          disabled={refreshing}
          className="btn btn-outline"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <FaSync style={{ animation: refreshing ? "spin 0.7s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {/* Total Outstanding */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Total Outstanding
          </p>
          <p style={{ fontSize: "1.8rem", fontWeight: "900", color: "var(--color-primary)", marginTop: "0.25rem" }}>
            ₹{grandTotal.toLocaleString()}
          </p>
        </div>

        {/* Active Bills */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Active Bills
          </p>
          <p style={{ fontSize: "1.8rem", fontWeight: "900", color: "var(--color-text-main)", marginTop: "0.25rem" }}>
            {bills.length}
          </p>
        </div>

        {/* Due Soon */}
        <div
          className="card"
          style={{
            padding: "1.25rem",
            background: warningCount > 0 ? "rgba(239,68,68,0.05)" : undefined,
            border: warningCount > 0 ? "1.5px solid rgba(239,68,68,0.25)" : undefined,
          }}
        >
          <p style={{ fontSize: "0.72rem", fontWeight: "700", color: warningCount > 0 ? "#ef4444" : "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Due Soon (45+ days)
          </p>
          <p style={{ fontSize: "1.8rem", fontWeight: "900", color: warningCount > 0 ? "#ef4444" : "var(--color-text-main)", marginTop: "0.25rem" }}>
            {warningCount}
          </p>
        </div>

        {/* Overdue */}
        <div
          className="card"
          style={{
            padding: "1.25rem",
            background: overdueCount > 0 ? "rgba(239,68,68,0.1)" : undefined,
            border: overdueCount > 0 ? "1.5px solid #ef4444" : undefined,
          }}
        >
          <p style={{ fontSize: "0.72rem", fontWeight: "700", color: overdueCount > 0 ? "#dc2626" : "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Overdue (60+ days)
          </p>
          <p style={{ fontSize: "1.8rem", fontWeight: "900", color: overdueCount > 0 ? "#dc2626" : "var(--color-text-main)", marginTop: "0.25rem" }}>
            {overdueCount}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: "1 1 250px", position: "relative" }}>
          <FaSearch style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
          <input
            type="text"
            placeholder="Search by customer name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "0.75rem 1rem 0.75rem 2.75rem", 
              borderRadius: "var(--radius-md)", 
              border: "1px solid var(--color-border)",
              background: "var(--color-background)",
              color: "var(--color-text-main)",
              outline: "none",
              fontFamily: "inherit",
              fontSize: "0.95rem",
              transition: "border-color 0.2s"
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--color-primary)"}
            onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
          />
        </div>
        <div style={{ flex: "0 0 auto", position: "relative", minWidth: "220px" }}>
          <FaFilter style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", zIndex: 1 }} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ 
              width: "100%", 
              appearance: "none", 
              padding: "0.75rem 2.75rem", 
              borderRadius: "var(--radius-md)", 
              border: "1px solid var(--color-border)",
              background: "var(--color-background)",
              color: "var(--color-text-main)",
              outline: "none",
              fontFamily: "inherit",
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "border-color 0.2s"
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--color-primary)"}
            onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
          >
            <option value="all">All Statuses</option>
            <option value="overdue">Overdue (60+ days)</option>
            <option value="warning">Due Soon (45-59 days)</option>
            <option value="normal">Normal (&lt;45 days)</option>
          </select>
          <FaChevronDown style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none", fontSize: "0.8rem" }} />
        </div>
      </div>

      {/* Empty State */}
      {finalFilteredArr.length === 0 ? (
        <div
          className="card"
          style={{ padding: "4rem", textAlign: "center" }}
        >
          {groupedArr.length === 0 ? (
            <>
              <FaCheckCircle style={{ fontSize: "3rem", color: "var(--color-success)", margin: "0 auto 1rem" }} />
              <h2 className="text-xl font-black text-success">All Clear!</h2>
              <p className="text-muted" style={{ marginTop: "0.5rem" }}>
                No outstanding bills in the ledger. Generate a bill from the Orders page when payment is pending.
              </p>
            </>
          ) : (
            <>
              <FaSearch style={{ fontSize: "3rem", color: "var(--color-text-muted)", margin: "0 auto 1rem", opacity: 0.5 }} />
              <h2 className="text-xl font-black text-primary">No results found</h2>
              <p className="text-muted" style={{ marginTop: "0.5rem" }}>
                We couldn't find any customers matching your search or filter criteria.
              </p>
              <button 
                onClick={() => { setSearchTerm(""); setFilterStatus("all"); }} 
                className="btn btn-outline" 
                style={{ marginTop: "1rem" }}
              >
                Clear Filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div>
          {finalFilteredArr.map(({ customer, bills: customerBills }) => (
            <CustomerCard
              key={customer._id}
              customerName={customer.name}
              customerAddress={customer.address || "Address not provided"}
              bills={customerBills}
              onDelete={handleBillDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentLedger;
