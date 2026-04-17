import React, { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, TrendingUp, FileText, Clock, ChevronRight } from 'lucide-react';
import PayrollAuth from './PayrollAuth';

export default function PayrollDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const storedEmp = localStorage.getItem('payroll_employees');
    if (storedEmp) {
      try {
        setEmployees(JSON.parse(storedEmp));
      } catch (e) {
        console.error(e);
      }
    }

    const storedHist = localStorage.getItem('payroll_history');
    if (storedHist) {
      try {
        setHistory(JSON.parse(storedHist));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const totalEmployees = employees.length;
  const activeAttendance = employees.filter(e => e.status === 'ACTIVE').length;
  const totalPayroll = history.reduce((sum, run) => sum + run.totalGross, 0);
  const avgDailyRate = employees.length > 0 ? employees.reduce((sum, emp) => sum + emp.dailyRate, 0) / employees.length : 0;

  return (
    <PayrollAuth>
      <div>
        <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>Payroll Dashboard</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Overview of payroll operations and metrics</div>
          </div>
          <button 
            onClick={() => (window as any).renderPayrollProcessingView?.()}
            className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            Process Payroll <ChevronRight size={16} />
          </button>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#eff6ff', color: '#3b82f6', borderRadius: '12px' }}>
              <Users size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Employees</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{totalEmployees}</h3>
            </div>
          </div>
          
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#f0fdf4', color: '#22c55e', borderRadius: '12px' }}>
              <Calendar size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Attendance</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{activeAttendance}</h3>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#fefce8', color: '#eab308', borderRadius: '12px' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Payroll (YTD)</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>₱{totalPayroll.toLocaleString()}</h3>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#f3e8ff', color: '#a855f7', borderRadius: '12px' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Daily Rate</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>₱{avgDailyRate.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h3>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Recent Payroll Runs */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 600, color: 'var(--text-main)' }}>Recent Payroll Runs</h3>
              <button onClick={() => (window as any).renderPayrollProcessingView?.()} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>View All</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: '0.85rem', fontFamily: "'Inter', system-ui, sans-serif" }}>
              <thead style={{ background: 'var(--bg-body)' }}>
                <tr>
                  <th style={{ padding: '14px 24px', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Period</th>
                  <th style={{ padding: '14px 24px', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Employees</th>
                  <th style={{ padding: '14px 24px', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Total Amount</th>
                  <th style={{ padding: '14px 24px', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No recent payroll runs.
                    </td>
                  </tr>
                ) : (
                  history.slice(0, 5).map(run => (
                    <tr key={run.id} style={{ cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-body)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                      <td style={{ padding: '14px 24px', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={16} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{run.period}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 24px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>{run.employeesCount}</td>
                      <td style={{ padding: '14px 24px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, color: 'var(--text-main)' }}>₱{run.totalGross.toLocaleString()}</td>
                      <td style={{ padding: '14px 24px', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: '#dcfce7', color: '#166534', textTransform: 'uppercase' }}>
                          {run.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Upcoming Tasks */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontWeight: 600, color: 'var(--text-main)' }}>Upcoming Tasks</h3>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '4px' }}>Encode Attendance</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Due today for period Apr 12-18</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fefce8', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '4px' }}>Review Deductions</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pending SSS & PhilHealth updates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PayrollAuth>
  );
}
