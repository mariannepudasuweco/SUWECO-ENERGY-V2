import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Users, FileText, CheckCircle, ChevronRight, ChevronLeft, Printer, Save, DollarSign, TrendingUp, ChevronDown } from 'lucide-react';
import PayrollAuth from './PayrollAuth';

const ACTIVITIES = [
  { code: 'M', name: 'MOBILIZATION' },
  { code: 'TF', name: 'TEMPORARY FACILITIES' },
  { code: 'SG', name: 'SITE GRADING' },
  { code: 'RD1', name: 'ROAD DEVELOPMENT 1' },
  { code: 'RD2', name: 'ROAD DEVELOPMENT 2' },
  { code: 'DWS', name: 'DOMESTIC WATER SYSTEM' },
  { code: 'DS', name: 'DRAINAGE SYSTEM' },
  { code: 'SP', name: 'SLOPE PROTECTION' },
  { code: 'CB', name: 'CONTROL BUILDING' },
  { code: 'WWB', name: 'WAREHOUSE AND WORKSHOP BUILDING' },
  { code: 'AAB', name: 'ADMIN AND AMENITIES BUILDING' },
  { code: 'GH', name: 'GUARD HOUSE' },
  { code: 'MRF', name: 'MATERIAL RECOVERY FACILITY' },
  { code: 'LP', name: 'LIGHTNING PROTECTION' },
  { code: 'CHBFG', name: 'CHB FENCE AND GATE' },
  { code: 'CS', name: 'CCTV SYSTEM' },
  { code: 'FW', name: 'FOUNDATION WORKS' },
  { code: 'FS', name: 'FUEL SYSTEM' },
  { code: 'LOS', name: 'LUBE OIL SYSTEM' },
  { code: 'TW', name: 'TRENCH WORKS' },
  { code: 'GSSA', name: 'GENERATOR SET & SKID ASSEMBLY' },
  { code: 'WT', name: 'WIRING AND TERMINATION' },
  { code: 'GS', name: 'GROUNDING SYSTEM' },
  { code: 'TL', name: 'TRANSMISSION LINE' },
  { code: 'TDSF', name: 'TRANSFORMER & DISCONNECT SWITCH FOUNDATION' },
  { code: 'CTMDB', name: 'CABLE TRENCH, MANHOLE AND DUCT BANK' },
  { code: 'TI', name: 'TRANSFORMER INSTALLATION' },
  { code: 'SSP', name: 'SUBSTATION PROTECTION' },
  { code: 'RWT', name: 'REVENUE WIRING AND TERMINATION' },
  { code: 'CWT', name: 'CABLE WIRING AND TERMINATION' },
  { code: 'SFG', name: 'SECLUSION FENCE GATE' },
  { code: 'GSL', name: 'GROUNDING SYSTEM (LABOR)' },
  { code: 'SCADA', name: 'SCADA SYSTEM' },
  { code: 'C', name: 'CONSUMABLES' },
  { code: 'AD', name: 'ADMIN' }
];

export default function PayrollProcessing() {
  const [activeTab, setActiveTab] = useState<'history' | 'attendance' | 'manpower'>('history');
  const [wizardStep, setWizardStep] = useState(0);
  const [payrollStatus, setPayrollStatus] = useState<'NOT_GENERATED' | 'GENERATED'>('NOT_GENERATED');

  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState('All');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [bulkDay, setBulkDay] = useState<number>(-1);
  const [bulkActivity, setBulkActivity] = useState<string>('-');
  const [allocations, setAllocations] = useState<Record<string, Record<number, string>>>({});
  const [projectName, setProjectName] = useState('');
  const [weekStart, setWeekStart] = useState('2026-04-12');
  const [weekEnd, setWeekEnd] = useState('2026-04-18');
  const [printDropdownOpen, setPrintDropdownOpen] = useState(false);
  const [adjForm, setAdjForm] = useState({
    restDay: '', restDayOt: '', restDayNightShiftOt: '',
    regularHoliday: '', regularHolidayOt: '', specialHoliday: '',
    specialHolidayOt: '', nightShiftD: '', specialHolidayNightShiftD: ''
  });

  useEffect(() => {
    const storedEmp = localStorage.getItem('payroll_employees');
    if (storedEmp) {
      try {
        const parsed = JSON.parse(storedEmp);
        setEmployees(parsed);
        // Initialize attendance based on employees
        setAttendance(parsed.map((emp: any) => ({
          id: emp.id,
          name: emp.name,
          position: emp.position,
          rate: emp.dailyRate,
          location: emp.location,
          days: ['A', 'X', 'X', 'X', 'X', 'X', 'A'],
          ot: '',
          ut: '',
          sss: '',
          philhealth: '',
          pagibig: '',
          tax: '',
          adjustments: {
            restDay: '', restDayOt: '', restDayNightShiftOt: '',
            regularHoliday: '', regularHolidayOt: '', specialHoliday: '',
            specialHolidayOt: '', nightShiftD: '', specialHolidayNightShiftD: ''
          }
        })));
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

  const applyDeductionsToSelected = () => {
    if (selectedEmployees.length === 0) return;
    setAttendance(prev => prev.map(emp => {
      if (selectedEmployees.includes(emp.id)) {
        const employeeRecord = employees.find(e => e.id === emp.id);
        if (employeeRecord && employeeRecord.statutory) {
          return {
            ...emp,
            sss: employeeRecord.statutory.sss || '0',
            philhealth: employeeRecord.statutory.philhealth || '0',
            pagibig: employeeRecord.statutory.pagibig || '0',
            tax: employeeRecord.statutory.tax || '0'
          };
        }
      }
      return emp;
    }));
  };

  const calculateDays = (days: string[]) => {
    return days.reduce((total, day) => {
      if (day === 'X') return total + 1;
      if (day === '1/2') return total + 0.5;
      return total;
    }, 0);
  };

  const getAllocatedDaysCount = (empId: string) => {
    let count = 0;
    for (let i = 0; i < 7; i++) {
       if (allocations[empId]?.[i] && allocations[empId]?.[i] !== '-') count++;
    }
    return count;
  };

  const handleAttendanceChange = (empId: string, field: string, value: string) => {
    setAttendance(prev => prev.map(emp => emp.id === empId ? { ...emp, [field]: value } : emp));
  };

  const handlePrint = () => {
    const formatCurrency = (val: any) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      if (isNaN(num) || num === 0) return '₱0';
      return `₱${num.toLocaleString()}`;
    };

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Weekly Attendance Sheet</title>
          <style>
            @page { size: landscape; margin: 10mm; }
            body { font-family: Arial, sans-serif; font-size: 10px; color: #000; background: #fff; width: 100%; margin: 0; padding: 0; }
            h2, h3 { text-align: center; margin: 2px 0; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #d1d5db; padding: 8px 4px; text-align: center; font-size: 9px; color: #000; }
            th { font-weight: bold; color: #1f2937; background-color: #f0f0f0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .signature-box { width: 200px; text-align: center; border-top: 1px solid #000; padding-top: 5px; }
            .legend { font-size: 10px; line-height: 1.2; }
            .bg-half { background-color: #d1fae5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
        </head>
        <body>
          <h2>Payroll Management System</h2>
          <h3>Weekly Attendance Sheet</h3>
          <div style="text-align: center;">Project: ${projectName}</div>
          <div style="text-align: center;">Payroll Period: ${weekStart} to ${weekEnd}</div>
          
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Emp ID</th>
                <th>Employee Name</th>
                <th>Nature of Work</th>
                <th>Rate</th>
                <th>SUN</th><th>MON</th><th>TUE</th><th>WED</th><th>THU</th><th>FRI</th><th>SAT</th>
                <th>Days</th>
                <th>OT</th>
                <th>UT</th>
                <th>RD</th>
                <th>RD OT</th>
                <th>RD NS OT</th>
                <th>RH</th>
                <th>RH OT</th>
                <th>SH</th>
                <th>SH OT</th>
                <th>NSD</th>
                <th>SH NSD</th>
                <th>Gross</th>
                <th>SSS</th>
                <th>PHIC</th>
                <th>Pag-IBIG</th>
                <th>Total Ded.</th>
                <th>Net Pay</th>
              </tr>
            </thead>
            <tbody>
              ${attendance.filter(emp => locationFilter === 'All' || emp.location === locationFilter).map((emp, idx) => {
                const daysList = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                
                let numDays = 0;
                for (let i = 0; i < 7; i++) {
                   const val = emp.days[i];
                   if (val === 'X') numDays += 1;
                   else if (val === '1/2') numDays += 0.5;
                }

                const gross = numDays * emp.rate;
                const sssVal = parseFloat(emp.sss) || 0;
                const phVal = parseFloat(emp.philhealth) || 0;
                const pagibigVal = parseFloat(emp.pagibig) || 0;
                const taxVal = parseFloat(emp.tax) || 0;
                let totalDed = sssVal + phVal + pagibigVal + taxVal;
                
                // Also add cash advances if not included in deduction sum implicitly
                const advances = Array.isArray(emp.cashAdvances) ? emp.cashAdvances.reduce((sum, ca) => sum + (ca.amount || 0), 0) : 0;
                totalDed += advances;

                const netPay = gross - totalDed;
                
                const adj = emp.adjustments || {};
                
                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${emp.id}</td>
                    <td class="text-left">${emp.name}</td>
                    <td class="text-left">${emp.position}</td>
                    <td>${formatCurrency(emp.rate)}</td>
                    ${daysList.map((_, i) => {
                      const d = emp.days[i] || '-';
                      return `<td class="${d === '1/2' ? 'bg-half' : ''}">${d === '-' ? '' : d === '1/2' ? '½' : d}</td>`
                    }).join('')}
                    <td>${numDays}</td>
                    <td>${emp.ot || 0}</td>
                    <td>${emp.ut || 0}</td>
                    <td>${adj.restDay || 0}</td>
                    <td>${adj.restDayOt || 0}</td>
                    <td>${adj.restDayNightShiftOt || 0}</td>
                    <td>${adj.regularHoliday || 0}</td>
                    <td>${adj.regularHolidayOt || 0}</td>
                    <td>${adj.specialHoliday || 0}</td>
                    <td>${adj.specialHolidayOt || 0}</td>
                    <td>${adj.nightShiftD || 0}</td>
                    <td>${adj.specialHolidayNightShiftD || 0}</td>
                    <td>${formatCurrency(gross)}</td>
                    <td>${formatCurrency(sssVal)}</td>
                    <td>${formatCurrency(phVal)}</td>
                    <td>${formatCurrency(pagibigVal)}</td>
                    <td>${formatCurrency(totalDed)}</td>
                    <td>${formatCurrency(netPay)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px;">
            <div class="legend">
              Legend<br/>
              X = Whole Day<br/>
              ½ = Half Day<br/>
              Red = Absent
            </div>
            <div style="display: flex; gap: 100px; margin-right: 20px;">
              <div class="signature-box">HR Master</div>
              <div class="signature-box">Department Head</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                // Close the tab if it was opened via window.open
                if (window.opener) {
                  window.close();
                }
              }, 250);
            };
          </script>
        </body>
      </html>
    `;

    try {
      // First, try opening a new window (safest for printing cleanly)
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        return;
      }
    } catch (e) {
      console.error("Window.open failed:", e);
    }

    // Fallback: If popup blocker blocked the window or we're restricted, use a hidden iframe
    const iframe = document.createElement('iframe');
    // Ensure the iframe is rendered by the layout engine but hidden from the user visually
    iframe.style.position = 'absolute';
    iframe.style.width = '1000px';
    iframe.style.height = '1000px';
    iframe.style.left = '-10000px';
    iframe.style.top = '-10000px';
    document.body.appendChild(iframe);
    
    // We attach the srcdoc which guarantees cross-origin synchronous loading where supported
    iframe.srcdoc = printContent;
    
    // Fallback cleanup if the print dialog blocks or fails
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 10000);
  };

  const handlePrintManpower = (type: 'matrix' | 'summary') => {
    const formatCurrency = (val: any) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      if (isNaN(num) || num === 0) return '₱0';
      return `₱${num.toLocaleString()}`;
    };

    // Prepare Manpower Summary per Activity Data
    const activityTotals: Record<string, number[]> = {};
    ACTIVITIES.forEach(act => {
      activityTotals[act.code] = [0, 0, 0, 0, 0, 0, 0];
    });

    attendance.forEach(emp => {
      emp.days.forEach((val: string, i: number) => {
        if (val !== 'A') {
          const code = allocations[emp.id]?.[i];
          if (code && code !== '-') {
            const cost = emp.rate * (val === 'X' ? 1 : val === '1/2' ? 0.5 : 0);
            if (activityTotals[code]) {
              activityTotals[code][i] += cost;
            }
          }
        }
      });
    });

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${type === 'matrix' ? 'Employee Manpower Matrix' : 'Allocation Summary per Activity'}</title>
          <style>
            @page { size: landscape; margin: 10mm; }
            body { font-family: Arial, sans-serif; font-size: 10px; color: #000; background: #fff; width: 100%; margin: 0; padding: 0; }
            h2, h3 { text-align: center; margin: 2px 0; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #d1d5db; padding: 6px 4px; text-align: center; font-size: 9px; color: #000; }
            th { font-weight: bold; color: #1f2937; background-color: #f0f0f0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .section-title { font-size: 12px; font-weight: bold; margin-top: 20px; text-align: left; background: #e2e8f0; padding: 4px 8px; }
            .signature-box { width: 200px; text-align: center; border-top: 1px solid #000; padding-top: 5px; }
          </style>
        </head>
        <body>
          <h2>Payroll Management System</h2>
          <h3>${type === 'matrix' ? 'Employee Manpower Matrix' : 'Allocation Summary per Activity'}</h3>
          <div style="text-align: center;">Project: ${projectName}</div>
          <div style="text-align: center;">Payroll Period: ${weekStart} to ${weekEnd}</div>
          
          ${type === 'matrix' ? `
          <div class="section-title">Employee Manpower Matrix</div>
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Emp ID</th>
                <th>Employee Name</th>
                <th>Est. Net Pay</th>
                <th>SUN</th><th>MON</th><th>TUE</th><th>WED</th><th>THU</th><th>FRI</th><th>SAT</th>
              </tr>
            </thead>
            <tbody>
              ${attendance.filter(emp => locationFilter === 'All' || emp.location === locationFilter).map((emp, idx) => {
                const daysList = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                const days = getAllocatedDaysCount(emp.id);
                const gross = days * emp.rate;
                const netPay = gross;
                
                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${emp.id}</td>
                    <td class="text-left">${emp.name}</td>
                    <td class="text-right" style="font-weight: bold;">${formatCurrency(netPay)}</td>
                    ${daysList.map((_, i) => {
                      const code = allocations[emp.id]?.[i] || '-';
                      const val = emp.days[i] || '-';
                      if (val === 'A') return '<td style="color:red;font-weight:bold;">A</td>';
                      if (code === '-') return '<td style="color:#94a3b8;">-</td>';
                      return `<td>${val === '1/2' ? '½ ' : ''}${code}</td>`;
                    }).join('')}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          ` : ''}

          ${type === 'summary' ? `
          <div class="section-title" style="margin-top: 30px;">Allocation Summary per Activity</div>
          <table>
            <thead>
              <tr>
                <th class="text-left">Activity</th>
                <th>SUN</th><th>MON</th><th>TUE</th><th>WED</th><th>THU</th><th>FRI</th><th>SAT</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${ACTIVITIES.filter(act => activityTotals[act.code].some(v => v > 0)).map(act => {
                const rowTotal = activityTotals[act.code].reduce((a, b) => a + b, 0);
                return `
                  <tr>
                    <td class="text-left">${act.name} (${act.code})</td>
                    ${activityTotals[act.code].map(v => `<td>${formatCurrency(v)}</td>`).join('')}
                    <td style="font-weight: bold;">${formatCurrency(rowTotal)}</td>
                  </tr>
                `;
              }).join('')}
              <tr>
                <th class="text-left" style="font-weight: bold;">TOTAL</th>
                ${[0,1,2,3,4,5,6].map(i => {
                  const dayTotal = ACTIVITIES.reduce((sum, act) => sum + activityTotals[act.code][i], 0);
                  return `<th style="font-weight: bold;">${formatCurrency(dayTotal)}</th>`;
                }).join('')}
                <th style="font-weight: bold;">${formatCurrency(ACTIVITIES.reduce((total, act) => total + activityTotals[act.code].reduce((sum, val) => sum + val, 0), 0))}</th>
              </tr>
            </tbody>
          </table>
          ` : ''}
          
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px;">
            <div style="display: flex; gap: 100px; margin-right: 20px;">
              <div class="signature-box">Prepared By</div>
              <div class="signature-box">Approved By</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                try {
                  window.onafterprint = function() { window.close(); };
                  window.print();
                } catch(e) {
                  console.error(e);
                }
              }, 250);
            };
          </script>
        </body>
      </html>
    `;

    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        return;
      }
    } catch (e) {
      console.error("Window.open failed:", e);
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '1000px';
    iframe.style.height = '1000px';
    iframe.style.left = '-10000px';
    iframe.style.top = '-10000px';
    document.body.appendChild(iframe);
    
    iframe.srcdoc = printContent;
    
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 10000);
  };

  const applyBulkAction = (value: string) => {
    if (bulkDay === -1) return;
    setAttendance(prev => prev.map(emp => {
      if (selectedEmployees.includes(emp.id)) {
        const newDays = [...emp.days];
        newDays[bulkDay] = value;
        return { ...emp, days: newDays };
      }
      return emp;
    }));
  };

  const applyToAllForDay = (dayIndex: number, value: string) => {
    setAttendance(prev => prev.map(emp => {
      const newDays = [...emp.days];
      newDays[dayIndex] = value;
      return { ...emp, days: newDays };
    }));
  };

  const handleAllocationChange = (empId: string, dayIndex: number, code: string) => {
    setAllocations(prev => ({
      ...prev,
      [empId]: {
        ...(prev[empId] || {}),
        [dayIndex]: code
      }
    }));
  };

  const toggleDay = (empId: string, dayIndex: number) => {
    setAttendance(prev => prev.map(emp => {
      if (emp.id === empId) {
        const newDays = [...emp.days];
        const current = newDays[dayIndex];
        if (current === 'X') newDays[dayIndex] = '1/2';
        else if (current === '1/2') newDays[dayIndex] = 'A';
        else if (current === 'A') newDays[dayIndex] = '-';
        else newDays[dayIndex] = 'X';
        return { ...emp, days: newDays };
      }
      return emp;
    }));
  };

  const handleBulkApply = (actCode: string) => {
    if (selectedEmployees.length === 0 || selectedDays.length === 0) {
      alert('Please select at least one employee and one day before applying an activity.');
      return;
    }
    
    setAllocations(prev => {
      const next = { ...prev };
      selectedEmployees.forEach(empId => {
        if (!next[empId]) next[empId] = {};
        selectedDays.forEach(dayIndex => {
          next[empId][dayIndex] = actCode;
        });
      });
      return next;
    });
  };

  const applyBulkActivity = () => {
    if (bulkActivity !== '-') {
      handleBulkApply(bulkActivity);
    }
    setBulkActivity('-');
  };

  const totalGross = attendance.reduce((sum, emp) => sum + (calculateDays(emp.days) * emp.rate), 0);
  const totalEmployees = attendance.length;
  const totalDaysWorked = attendance.reduce((sum, emp) => sum + calculateDays(emp.days), 0);

  let allocatedCost = 0;
  const activityTotals: Record<string, number[]> = {};
  ACTIVITIES.forEach(act => {
    activityTotals[act.code] = [0, 0, 0, 0, 0, 0, 0];
  });

  attendance.forEach(emp => {
    emp.days.forEach((val: string, i: number) => {
      if (val !== 'A') {
        const code = allocations[emp.id]?.[i];
        if (code && code !== '-') {
          const cost = emp.rate * (val === 'X' ? 1 : val === '1/2' ? 0.5 : 0);
          if (activityTotals[code]) {
            activityTotals[code][i] += cost;
            allocatedCost += cost;
          }
        }
      }
    });
  });

  const variance = totalGross - allocatedCost;

  const handleSelectRun = (run: any) => {
    setSelectedRunId(run.id);
    if (run.attendance) {
      setAttendance(run.attendance);
    }
    setWeekStart(run.weekStart || run.period.split(' to ')[0]);
    setWeekEnd(run.weekEnd || run.period.split(' to ')[1] || run.period.split(' to ')[0]);
    setPayrollStatus(run.status);
    setActiveTab('manpower');
  };

  const handleSaveAttendance = () => {
    const runId = `PR-${new Date().getFullYear()}-${String(history.length + 1).padStart(3, '0')}`;
    const newRun = {
      id: runId,
      period: `${weekStart} to ${weekEnd}`,
      dateGenerated: new Date().toISOString().split('T')[0],
      employeesCount: totalEmployees,
      totalGross: totalGross,
      status: 'NOT GENERATED',
      weekStart,
      weekEnd,
      attendance: JSON.parse(JSON.stringify(attendance))
    };
    
    const existingIndex = history.findIndex(h => h.period === newRun.period);
    let updatedHistory = [...history];
    if (existingIndex >= 0) {
      updatedHistory[existingIndex] = { ...updatedHistory[existingIndex], ...newRun };
    } else {
      updatedHistory = [newRun, ...history];
    }
    
    setHistory(updatedHistory);
    localStorage.setItem('payroll_history', JSON.stringify(updatedHistory));
    
    setPayrollStatus('NOT_GENERATED');
    setActiveTab('history');
  };

  const handleFinalize = () => {
    let updatedHistory = [...history];
    const existingIndex = history.findIndex(h => h.id === selectedRunId);
    
    if (existingIndex >= 0) {
      updatedHistory[existingIndex] = {
        ...updatedHistory[existingIndex],
        status: 'GENERATED',
        dateGenerated: new Date().toISOString().split('T')[0],
        totalGross: totalGross,
        attendance: JSON.parse(JSON.stringify(attendance))
      };
    } else {
      const newRun = {
        id: `PR-${new Date().getFullYear()}-${String(history.length + 1).padStart(3, '0')}`,
        period: `${weekStart} to ${weekEnd}`,
        dateGenerated: new Date().toISOString().split('T')[0],
        employeesCount: totalEmployees,
        totalGross: totalGross,
        status: 'GENERATED',
        weekStart,
        weekEnd,
        attendance: JSON.parse(JSON.stringify(attendance))
      };
      updatedHistory = [newRun, ...history];
    }
    
    setHistory(updatedHistory);
    localStorage.setItem('payroll_history', JSON.stringify(updatedHistory));
    
    setWizardStep(0);
    setPayrollStatus('GENERATED');
    setActiveTab('history');
  };

  const renderHistory = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-body)' }}>
          <h3 style={{ fontWeight: 600, color: 'var(--text-main)' }}>Payroll History</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('attendance')}
              className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Calendar size={14} /> Attendance
            </button>
            <button 
              onClick={() => setActiveTab('manpower')}
              disabled={!selectedRunId}
              className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: !selectedRunId ? 0.5 : 1, cursor: !selectedRunId ? 'not-allowed' : 'pointer' }}
            >
              <Users size={14} /> Manpower
            </button>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: '0.85rem', fontFamily: "'Inter', system-ui, sans-serif" }}>
          <thead style={{ background: 'var(--bg-body)' }}>
            <tr>
              <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Payroll Period</th>
              <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Date Generated</th>
              <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Employees</th>
              <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Total Gross Pay</th>
              <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No payroll history found. Start by encoding attendance.
                </td>
              </tr>
            ) : (
              history.map(run => (
                <tr 
                  key={run.id} 
                  style={{ cursor: 'pointer', background: selectedRunId === run.id ? '#eff6ff' : 'transparent' }} 
                  onClick={() => handleSelectRun(run)}
                  onMouseOver={e => { if (selectedRunId !== run.id) e.currentTarget.style.background = 'var(--bg-body)'}} 
                  onMouseOut={e => { if (selectedRunId !== run.id) e.currentTarget.style.background = 'transparent'}}
                >
                  <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} style={{ color: 'var(--primary)' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{run.period}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{run.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>{run.dateGenerated}</td>
                  <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>{run.employeesCount}</td>
                  <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, color: 'var(--text-main)' }}>₱{run.totalGross.toLocaleString()}</td>
                  <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: run.status === 'GENERATED' ? '#dcfce7' : '#fef08a', color: run.status === 'GENERATED' ? '#166534' : '#854d0e', textTransform: 'uppercase' }}>
                        {run.status}
                      </span>
                      {run.status === 'NOT GENERATED' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleSelectRun(run); setWizardStep(1); }} 
                          className="btn btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', gap: '4px', alignItems: 'center' }}
                        >
                          Generate Payroll
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const renderAttendance = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>Weekly Attendance Encoding</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Employees are auto-loaded from Employee Master Record</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setActiveTab('history')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#e2e8f0', color: '#0f172a', border: 'none', fontWeight: 600 }}>
            ← Previous
          </button>
          <button onClick={() => setActiveTab('manpower')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#e2e8f0', color: '#0f172a', border: 'none', fontWeight: 600 }}>
            Next →
          </button>
          <button onClick={handlePrint} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#e2e8f0', color: '#0f172a', border: 'none', fontWeight: 600 }}>
            <Printer size={16} /> Print
          </button>
          <button 
            onClick={handleSaveAttendance}
            disabled={attendance.length === 0}
            className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: attendance.length === 0 ? 0.5 : 1, background: '#0f172a', color: 'white', fontWeight: 600 }}
          >
            <Save size={16} /> Save Attendance
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', color: '#0f172a' }}>Project</label>
          <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Enter project name" style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', color: '#0f172a' }}>Week Start (Sunday)</label>
          <input type="date" value={weekStart} onChange={e => setWeekStart(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', color: '#0f172a' }}>Week End (Saturday)</label>
          <input type="date" value={weekEnd} onChange={e => setWeekEnd(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', color: '#0f172a' }}>Location</label>
          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white' }}>
            <option value="All">All Locations</option>
            <option value="Local">Local</option>
            <option value="Manila">Manila</option>
          </select>
        </div>
        <div style={{ gridColumn: '1 / span 2' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', color: '#0f172a' }}>Search Employee</label>
          <input type="text" placeholder="Search by name or ID" style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Legend:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', border: '1px solid #cbd5e1', background: 'white', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
          X Whole Day
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', border: '1px solid #86efac', background: '#dcfce7', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700, color: '#166534' }}>
          ½ Half Day
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', border: '1px solid #fca5a5', background: '#fee2e2', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700, color: '#991b1b' }}>
          Absent
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexDirection: 'column' }}>
        {selectedEmployees.length > 0 && (
          <div style={{ padding: '12px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
            <span style={{ fontWeight: 600, color: '#1e3a8a', fontSize: '0.9rem' }}>{selectedEmployees.length} employees selected</span>
            <div style={{ width: '1px', height: '24px', background: '#bfdbfe' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e3a8a' }}>Apply to:</span>
              <select 
                value={bulkDay} 
                onChange={e => setBulkDay(Number(e.target.value))}
                style={{ padding: '6px 12px', border: '1px solid #bfdbfe', borderRadius: '6px', outline: 'none', fontSize: '0.85rem' }}
              >
                <option value={-1}>Select Day</option>
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => (
                  <option key={day} value={i}>{day}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => applyBulkAction('X')} disabled={bulkDay === -1} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', background: 'white', opacity: bulkDay === -1 ? 0.5 : 1 }}>Set Whole Day (X)</button>
              <button onClick={() => applyBulkAction('1/2')} disabled={bulkDay === -1} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', background: 'white', opacity: bulkDay === -1 ? 0.5 : 1 }}>Set Half Day (½)</button>
              <button onClick={() => applyBulkAction('A')} disabled={bulkDay === -1} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', background: 'white', opacity: bulkDay === -1 ? 0.5 : 1 }}>Set Absent (A)</button>
              <button onClick={() => applyBulkAction('-')} disabled={bulkDay === -1} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', background: 'white', color: '#dc2626', opacity: bulkDay === -1 ? 0.5 : 1 }}>Clear</button>
              <div style={{ width: '1px', height: '24px', background: '#bfdbfe', margin: '0 4px' }}></div>
              <button onClick={applyDeductionsToSelected} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', background: 'white', color: '#0f172a' }}>Apply Deductions</button>
              <div style={{ width: '1px', height: '24px', background: '#bfdbfe', margin: '0 4px' }}></div>
              <button 
                onClick={handlePrint}
                className="btn btn-secondary" 
                style={{ 
                  padding: '6px 12px', 
                  fontSize: '0.85rem', 
                  background: 'white', 
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Printer size={16} />
                Print Timesheet
              </button>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', width: '100%' }}>
          <div className="card" style={{ flex: 1, overflowX: 'auto', padding: 0, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'center', fontSize: '0.8rem', fontFamily: "'Inter', system-ui, sans-serif", whiteSpace: 'nowrap' }}>
              <thead style={{ color: '#0f172a', fontWeight: 800, background: 'white' }}>
                <tr>
                  <th style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedEmployees.length > 0 && selectedEmployees.length === attendance.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEmployees(attendance.map(emp => emp.id));
                        } else {
                          setSelectedEmployees([]);
                        }
                      }}
                    />
                  </th>
                  <th style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }}>No.</th>
                <th style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>Emp ID</th>
                <th style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>Nature<br/>of Work</th>
                <th style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }}>Rate</th>
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => (
                  <th key={day} style={{ padding: '16px 8px', borderBottom: '1px solid #e2e8f0', minWidth: '80px' }}>
                    <div>{day}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Apr {12 + i}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                      <button onClick={() => applyToAllForDay(i, 'X')} style={{ padding: '2px 4px', fontSize: '0.6rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>X</button>
                      <button onClick={() => applyToAllForDay(i, '1/2')} style={{ padding: '2px 4px', fontSize: '0.6rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>½</button>
                      <button onClick={() => applyToAllForDay(i, 'A')} style={{ padding: '2px 4px', fontSize: '0.6rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>A</button>
                    </div>
                  </th>
                ))}
                <th style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }}>Days</th>
                <th style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }}>OT</th>
                <th style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }}>UT</th>
                <th style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }}>Gross</th>
                <th style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }}>SSS</th>
                <th style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }}>PhilHealth</th>
                <th style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }}>Pag-IBIG</th>
                <th style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }}>Tax</th>
                <th style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }}>Total<br/>Ded.</th>
                <th style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }}>Net Pay</th>
                <th style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {attendance.filter(emp => locationFilter === 'All' || emp.location === locationFilter).length === 0 ? (
                <tr>
                  <td colSpan={24} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No employees found. Please add employees in the Employee Master Record first.
                  </td>
                </tr>
              ) : (
                attendance.filter(emp => locationFilter === 'All' || emp.location === locationFilter).map((emp, idx) => {
                  const days = calculateDays(emp.days);
                  const gross = days * emp.rate;
                  const sssVal = parseFloat(emp.sss) || 0;
                  const phVal = parseFloat(emp.philhealth) || 0;
                  const pagibigVal = parseFloat(emp.pagibig) || 0;
                  const taxVal = parseFloat(emp.tax) || 0;
                  const totalDed = sssVal + phVal + pagibigVal + taxVal;
                  const netPay = gross - totalDed;
                  return (
                    <tr key={emp.id} onClick={() => setSelectedRowId(emp.id)} style={{ background: selectedRowId === emp.id ? '#eff6ff' : 'transparent', cursor: 'pointer', transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }} onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={selectedEmployees.includes(emp.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmployees([...selectedEmployees, emp.id]);
                            } else {
                              setSelectedEmployees(selectedEmployees.filter(id => id !== emp.id));
                            }
                          }}
                        />
                      </td>
                      <td style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0', color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: 'var(--text-muted)' }}>{emp.id}</td>
                      <td style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontWeight: 600, color: '#0f172a', whiteSpace: 'normal', minWidth: '120px' }}>{emp.name}</td>
                      <td style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: 'var(--text-muted)', whiteSpace: 'normal', minWidth: '100px' }}>{emp.position}</td>
                      <td style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>₱{emp.rate}</td>
                      {emp.days.map((val: string, i: number) => (
                        <td key={i} style={{ padding: '16px 4px', borderBottom: '1px solid #e2e8f0' }}>
                          <div 
                            onClick={() => toggleDay(emp.id, i)}
                            style={{ 
                              width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: 700, margin: '0 auto', cursor: 'pointer', userSelect: 'none',
                              ...(val === 'X' ? { border: '1px solid #cbd5e1', background: 'white', color: '#0f172a' } : 
                                  val === '1/2' ? { border: '1px solid #fcd34d', background: '#fef3c7', color: '#d97706' } : 
                                  val === 'A' ? { border: '1px solid #fca5a5', background: '#fee2e2', color: '#991b1b' } :
                                  { border: '1px dashed #cbd5e1', background: '#f1f5f9', color: '#94a3b8' })
                            }}>
                            {val === '1/2' ? '½' : val}
                          </div>
                        </td>
                      ))}
                      <td style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>{days}</td>
                      <td style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }}>
                        <input type="number" value={emp.ot} onChange={e => handleAttendanceChange(emp.id, 'ot', e.target.value)} style={{ width: '50px', padding: '6px 4px', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
                      </td>
                      <td style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }}>
                        <input type="number" value={emp.ut} onChange={e => handleAttendanceChange(emp.id, 'ut', e.target.value)} style={{ width: '50px', padding: '6px 4px', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
                      </td>
                      <td style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#0f172a' }}>₱{gross.toLocaleString()}</td>
                      <td style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }}>
                        <input type="number" value={emp.sss} onChange={e => handleAttendanceChange(emp.id, 'sss', e.target.value)} style={{ width: '60px', padding: '6px 4px', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
                      </td>
                      <td style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }}>
                        <input type="number" value={emp.philhealth} onChange={e => handleAttendanceChange(emp.id, 'philhealth', e.target.value)} style={{ width: '60px', padding: '6px 4px', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
                      </td>
                      <td style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }}>
                        <input type="number" value={emp.pagibig} onChange={e => handleAttendanceChange(emp.id, 'pagibig', e.target.value)} style={{ width: '60px', padding: '6px 4px', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
                      </td>
                      <td style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }}>
                        <input type="number" value={emp.tax} onChange={e => handleAttendanceChange(emp.id, 'tax', e.target.value)} style={{ width: '60px', padding: '6px 4px', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
                      </td>
                      <td style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>₱{totalDed.toLocaleString()}</td>
                      <td style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#0f172a' }}>₱{netPay.toLocaleString()}</td>
                      <td style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }}>
                        <button onClick={() => {
                          setSelectedEmployeeId(emp.id);
                          setAdjForm(emp.adjustments || {
                            restDay: '', restDayOt: '', restDayNightShiftOt: '',
                            regularHoliday: '', regularHolidayOt: '', specialHoliday: '',
                            specialHolidayOt: '', nightShiftD: '', specialHolidayNightShiftD: ''
                          });
                        }} style={{ padding: '6px 12px', background: '#e2e8f0', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', color: '#0f172a' }}>Details</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {selectedEmployeeId && (
          <div className="card" style={{ width: '320px', flexShrink: 0, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Payroll Adjustments</h3>
              <button onClick={() => setSelectedEmployeeId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
              Adjustments for {attendance.find(e => e.id === selectedEmployeeId)?.name}
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', color: '#0f172a' }}>Rest Day</label>
                <input type="text" value={adjForm.restDay} onChange={e => setAdjForm({...adjForm, restDay: e.target.value})} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', color: '#0f172a' }}>Rest Day OT</label>
                <input type="text" value={adjForm.restDayOt} onChange={e => setAdjForm({...adjForm, restDayOt: e.target.value})} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', color: '#0f172a' }}>Rest Day Night Shift OT</label>
                <input type="text" value={adjForm.restDayNightShiftOt} onChange={e => setAdjForm({...adjForm, restDayNightShiftOt: e.target.value})} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', color: '#0f172a' }}>Regular Holiday</label>
                <input type="text" value={adjForm.regularHoliday} onChange={e => setAdjForm({...adjForm, regularHoliday: e.target.value})} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', color: '#0f172a' }}>Reg. Holiday OT</label>
                <input type="text" value={adjForm.regularHolidayOt} onChange={e => setAdjForm({...adjForm, regularHolidayOt: e.target.value})} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', color: '#0f172a' }}>Special Holiday</label>
                <input type="text" value={adjForm.specialHoliday} onChange={e => setAdjForm({...adjForm, specialHoliday: e.target.value})} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', color: '#0f172a' }}>Spec. Hol. OT</label>
                <input type="text" value={adjForm.specialHolidayOt} onChange={e => setAdjForm({...adjForm, specialHolidayOt: e.target.value})} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', color: '#0f172a' }}>Night Shift D.</label>
                <input type="text" value={adjForm.nightShiftD} onChange={e => setAdjForm({...adjForm, nightShiftD: e.target.value})} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', color: '#0f172a' }}>Spec. Hol. Night Shift D.</label>
                <input type="text" value={adjForm.specialHolidayNightShiftD} onChange={e => setAdjForm({...adjForm, specialHolidayNightShiftD: e.target.value})} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setAttendance(prev => prev.map(e => e.id === selectedEmployeeId ? { ...e, adjustments: adjForm } : e));
                  setSelectedEmployeeId(null);
                }} 
                className="btn btn-primary" 
                style={{ padding: '8px 16px', fontSize: '0.8rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                Save Adjustments
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </motion.div>
  );

  const renderManpowerTable = () => (
    <>
      <div style={{ padding: '16px 24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>Bulk Activity Assignment</span>
          <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }}></div>
          <span style={{ fontSize: '0.85rem', color: selectedEmployees.length > 0 ? '#2563eb' : 'var(--text-muted)' }}>
            {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected
          </span>
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }}></div>
          <span style={{ fontSize: '0.85rem', color: selectedDays.length > 0 ? '#2563eb' : 'var(--text-muted)' }}>
            {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''} selected
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select 
            value={bulkActivity} 
            onChange={e => {
              setBulkActivity(e.target.value);
              if (e.target.value !== '-') {
                handleBulkApply(e.target.value);
                setTimeout(() => setBulkActivity('-'), 100);
              }
            }}
            style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', fontSize: '0.85rem', background: '#f8fafc', minWidth: '220px', cursor: 'pointer', fontWeight: 600, color: '#0f172a' }}
          >
            <option value="-">Apply to selected...</option>
            {ACTIVITIES.map(act => (
              <option key={act.code} value={act.code}>{act.code} - {act.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto', padding: 0, borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'center', fontSize: '0.8rem', fontFamily: "'Inter', system-ui, sans-serif", whiteSpace: 'nowrap' }}>
          <thead style={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em', background: 'white' }}>
            <tr>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', width: '40px' }}>
                <input 
                  type="checkbox" 
                  checked={selectedEmployees.length > 0 && selectedEmployees.length === attendance.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedEmployees(attendance.map(emp => emp.id));
                    } else {
                      setSelectedEmployees([]);
                    }
                  }}
                />
              </th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>Employee</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Est. Net Pay</th>
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => (
                <th 
                  key={day} 
                  onClick={() => {
                    setSelectedDays(prev => 
                      prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i]
                    );
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedDays.includes(i)) e.currentTarget.style.background = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedDays.includes(i)) e.currentTarget.style.background = 'transparent';
                  }}
                  style={{ 
                    padding: '8px', 
                    borderBottom: '1px solid #e2e8f0', 
                    minWidth: '90px', 
                    cursor: 'pointer',
                    background: selectedDays.includes(i) ? '#eff6ff' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{ marginBottom: '6px', color: selectedDays.includes(i) ? '#2563eb' : '#94a3b8' }}>{day}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attendance.map((emp) => {
              const days = getAllocatedDaysCount(emp.id);
              const gross = days * emp.rate;
              const isSelectedRow = selectedEmployees.includes(emp.id);
              return (
                <tr key={emp.id} onClick={() => setSelectedRowId(emp.id)} style={{ background: isSelectedRow || selectedRowId === emp.id ? '#eff6ff' : 'transparent', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', borderLeft: isSelectedRow ? '4px solid #2563eb' : '4px solid transparent' }}>
                    <input 
                      type="checkbox" 
                      checked={isSelectedRow}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEmployees([...selectedEmployees, emp.id]);
                        } else {
                          setSelectedEmployees(selectedEmployees.filter(id => id !== emp.id));
                        }
                      }}
                      onClick={e => e.stopPropagation()}
                    />
                  </td>
                  <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, color: isSelectedRow ? '#1e3a8a' : '#0f172a' }}>{emp.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{emp.id}</div>
                  </td>
                  <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 800, color: '#0284c7' }}>
                    ₱{gross.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </td>
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => {
                    const isSelectedCol = selectedDays.includes(i);
                    const isIntersection = isSelectedRow && isSelectedCol;
                    const currentCode = allocations[emp.id]?.[i] || '-';
                    const val = emp.days[i]; // derived attendance value (X, 1/2, A, -)
                    
                    return (
                    <td key={i} style={{ 
                      padding: '16px 8px', 
                      borderBottom: '1px solid #e2e8f0', 
                      background: isIntersection ? '#dbeafe' : (isSelectedCol || isSelectedRow || selectedRowId === emp.id) ? '#eff6ff' : 'transparent',
                      boxShadow: isIntersection ? 'inset 0 0 0 1px #bfdbfe' : 'none',
                      transition: 'background 0.2s, box-shadow 0.2s'
                    }}>
                      {val !== 'A' && val !== '-' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                          <div 
                            onClick={() => toggleDay(emp.id, i)}
                            style={{ 
                              width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                              borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700,
                              ...(val === 'X' ? { background: '#dcfce7', color: '#166534', border: '1px solid #86efac' } : 
                                  val === '1/2' ? { background: '#fef3c7', color: '#d97706', border: '1px solid #fcd34d' } : 
                                  { background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' })
                            }}>
                            {val === '1/2' ? '½' : val}
                          </div>
                          <select 
                            value={currentCode}
                            onChange={(e) => handleAllocationChange(emp.id, i, e.target.value)}
                            title={ACTIVITIES.find(a => a.code === currentCode)?.name || 'Select Activity'}
                            style={{ width: '64px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px 4px', fontSize: '0.7rem', outline: 'none', background: 'white', color: '#0f172a', textAlign: 'center' }}
                          >
                            <option value="-">-</option>
                            {ACTIVITIES.map(act => (
                              <option key={act.code} value={act.code} title={act.name}>{act.code}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                          <div 
                            onClick={() => toggleDay(emp.id, i)}
                            style={{ 
                              width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                              borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700,
                              ...(val === 'A' ? { background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' } : 
                                  { background: '#f1f5f9', color: '#94a3b8', border: '1px dashed #cbd5e1' })
                            }}>
                            {val === 'A' ? 'A' : '-'}
                          </div>
                          <select 
                            value={currentCode}
                            onChange={(e) => handleAllocationChange(emp.id, i, e.target.value)}
                            title={ACTIVITIES.find(a => a.code === currentCode)?.name || 'Select Activity'}
                            style={{ width: '64px', border: currentCode === '-' ? '1px dashed #e2e8f0' : '1px solid #cbd5e1', borderRadius: '6px', padding: '2px 4px', fontSize: '0.7rem', outline: 'none', background: currentCode === '-' ? '#f8fafc' : 'white', color: currentCode === '-' ? '#cbd5e1' : '#0f172a', textAlign: 'center' }}
                          >
                            <option value="-">-</option>
                            {ACTIVITIES.map(act => (
                              <option key={act.code} value={act.code} title={act.name}>{act.code}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderManpower = () => {
    let allocatedCost = 0;
    const activityTotals: Record<string, number[]> = {};
    ACTIVITIES.forEach(act => {
      activityTotals[act.code] = [0, 0, 0, 0, 0, 0, 0];
    });

    attendance.forEach(emp => {
      emp.days.forEach((val: string, i: number) => {
        if (val !== 'A') {
          const code = allocations[emp.id]?.[i];
          if (code && code !== '-') {
            const cost = emp.rate * (val === 'X' ? 1 : val === '1/2' ? 0.5 : 0);
            if (activityTotals[code]) {
              activityTotals[code][i] += cost;
              allocatedCost += cost;
            }
          }
        }
      });
    });

    const variance = totalGross - allocatedCost;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>Manpower Allocation</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Assign task codes to daily attendance</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setActiveTab('attendance')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ChevronLeft size={16} /> Back
            </button>
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setPrintDropdownOpen(!printDropdownOpen)} 
                className="btn btn-secondary" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#e2e8f0', color: '#0f172a', border: 'none', fontWeight: 600 }}
              >
                <Printer size={16} /> Print <ChevronDown size={14} />
              </button>
              {printDropdownOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', zIndex: 10, minWidth: '200px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <button 
                    onClick={() => { handlePrintManpower('matrix'); setPrintDropdownOpen(false); }} 
                    style={{ width: '100%', textAlign: 'left', padding: '10px 16px', borderBottom: '1px solid #e2e8f0', background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap', border: 'none', fontSize: '0.9rem', color: '#0f172a' }} 
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Employee Manpower Matrix
                  </button>
                  <button 
                    onClick={() => { handlePrintManpower('summary'); setPrintDropdownOpen(false); }} 
                    style={{ width: '100%', textAlign: 'left', padding: '10px 16px', background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap', border: 'none', fontSize: '0.9rem', color: '#0f172a' }} 
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Allocation Summary
                  </button>
                </div>
              )}
            </div>
            <button 
              onClick={() => setWizardStep(1)}
              className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Generate Payroll <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
            <div style={{ padding: '12px', background: '#eff6ff', color: '#2563eb', borderRadius: '8px' }}><DollarSign size={24} /></div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payroll Cost</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>₱{totalGross.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
            <div style={{ padding: '12px', background: '#f0fdf4', color: '#16a34a', borderRadius: '8px' }}><TrendingUp size={24} /></div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Allocated Cost</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>₱{allocatedCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
            <div style={{ padding: '12px', background: '#f8fafc', color: '#64748b', borderRadius: '8px' }}><CheckCircle size={24} /></div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Variance</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>₱{variance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
            </div>
          </div>
        </div>

        {renderManpowerTable()}

        <div className="card" style={{ padding: 0, borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: 'white' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Allocation Summary per Activity</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'right', fontSize: '0.8rem', fontFamily: "'Inter', system-ui, sans-serif", whiteSpace: 'nowrap' }}>
              <thead style={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em', background: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>Activity</th>
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                    <th key={day} style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0' }}>{day}</th>
                  ))}
                  <th style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {ACTIVITIES.filter(act => activityTotals[act.code].reduce((a,b)=>a+b,0) > 0 || ACTIVITIES.indexOf(act) < 5).map(act => {
                  const totals = activityTotals[act.code];
                  const rowTotal = totals.reduce((a,b) => a+b, 0);
                  return (
                    <tr key={act.code}>
                      <td style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>{act.name} ({act.code})</td>
                      {totals.map((val, i) => (
                        <td key={i} style={{ padding: '16px 12px', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>₱{val.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                      ))}
                      <td style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', fontWeight: 800, color: '#0f172a' }}>₱{rowTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    </tr>
                  );
                })}
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 800, color: '#0f172a' }}>TOTAL</td>
                  {[0,1,2,3,4,5,6].map(i => {
                    const colTotal = ACTIVITIES.reduce((sum, act) => sum + activityTotals[act.code][i], 0);
                    return (
                      <td key={i} style={{ padding: '16px 12px', fontWeight: 800, color: '#0f172a' }}>₱{colTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    );
                  })}
                  <td style={{ padding: '16px 24px', fontWeight: 800, color: '#0f172a' }}>₱{allocatedCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderWizard = () => {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 30, 66, 0.54)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: wizardStep === 2 ? '1280px' : '896px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh', transition: 'max-width 0.3s ease' }}
        >
          {/* Wizard Header */}
          <div style={{ background: 'var(--bg-body)', borderBottom: '1px solid var(--border-color)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Generate Payroll</h2>
            <button onClick={() => setWizardStep(0)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
          </div>

          {/* Stepper */}
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: wizardStep >= 1 ? 'var(--primary)' : 'var(--text-muted)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.85rem', background: wizardStep >= 1 ? '#eff6ff' : 'var(--bg-body)' }}>1</div>
                <span style={{ fontWeight: 500 }}>Review</span>
              </div>
              <div style={{ width: '48px', height: '1px', background: 'var(--border-color)' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: wizardStep >= 2 ? 'var(--primary)' : 'var(--text-muted)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.85rem', background: wizardStep >= 2 ? '#eff6ff' : 'var(--bg-body)' }}>2</div>
                <span style={{ fontWeight: 500 }}>Earnings & Deductions + Manpower</span>
              </div>
              <div style={{ width: '48px', height: '1px', background: 'var(--border-color)' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: wizardStep >= 3 ? 'var(--primary)' : 'var(--text-muted)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.85rem', background: wizardStep >= 3 ? '#eff6ff' : 'var(--bg-body)' }}>3</div>
                <span style={{ fontWeight: 500 }}>Finalize & Request Payment</span>
              </div>
            </div>
          </div>

          {/* Wizard Content */}
          <div style={{ padding: '32px', flex: 1, overflowY: 'auto', background: 'var(--bg-body)' }}>
            {wizardStep === 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '672px', margin: '0 auto' }}>
                <div className="card">
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Payroll Period</p>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>{weekStart} to {weekEnd}</h3>
                </div>
                <div className="card">
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Total Employees</p>
                  <h3 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>{totalEmployees}</h3>
                </div>
                <div className="card">
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Total Days Worked</p>
                  <h3 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>{totalDaysWorked}</h3>
                </div>
                <div className="card">
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Estimated Total</p>
                  <h3 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--primary)' }}>₱{totalGross.toLocaleString()}</h3>
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: '0.85rem', fontFamily: "'Inter', system-ui, sans-serif" }}>
                    <thead style={{ background: 'var(--bg-body)' }}>
                      <tr>
                        <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Employee</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>Gross Pay</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--danger)', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>SSS</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--danger)', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>PhilHealth</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--danger)', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>Pag-IBIG</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>Net Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map(emp => {
                        const days = calculateDays(emp.days);
                        const gross = days * emp.rate;
                        const pagibig = gross > 0 ? 100 : 0;
                        const net = gross - pagibig;
                        return (
                          <tr key={emp.id}>
                            <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-main)' }}>{emp.name}</td>
                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>₱{gross.toLocaleString()}</td>
                            <td style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--danger)' }}>₱0.00</td>
                            <td style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--danger)' }}>₱0.00</td>
                            <td style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--danger)' }}>₱{pagibig.toLocaleString()}</td>
                            <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>₱{net.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {renderManpowerTable()}
              </div>
            )}

            {wizardStep === 3 && (
              <div style={{ textAlign: 'center', maxWidth: '448px', margin: '0 auto', padding: '48px 0' }}>
                <div style={{ width: '80px', height: '80px', background: '#dcfce7', color: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <CheckCircle size={40} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Payroll Finalized!</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>The payroll record has been created and is ready for payment requisition.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button onClick={() => window.print()} className="btn btn-primary" style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1rem' }}>
                    <FileText size={18} /> Print Cash Requisition Slip
                  </button>
                  <button onClick={() => window.print()} className="btn btn-secondary" style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1rem' }}>
                    <Printer size={18} /> Print All Payslips
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Wizard Footer */}
          <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {wizardStep < 3 ? (
              <>
                <button 
                  onClick={() => wizardStep === 1 ? setWizardStep(0) : setWizardStep(wizardStep - 1)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => wizardStep === 2 ? handleFinalize() : setWizardStep(wizardStep + 1)}
                  className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {wizardStep === 1 ? 'Review Earnings' : 'Finalize & Request Payment'} <ChevronRight size={18} />
                </button>
              </>
            ) : (
              <button 
                onClick={() => {
                  setWizardStep(0);
                  setActiveTab('history');
                }}
                className="btn btn-secondary" style={{ width: '100%' }}
              >
                Return to Payroll History
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <PayrollAuth>
      <div>
        <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>Payroll History & Processing</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage attendance, allocation, and payroll generation</div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'history' && renderHistory()}
          {activeTab === 'attendance' && renderAttendance()}
          {activeTab === 'manpower' && renderManpower()}
        </AnimatePresence>

        {wizardStep > 0 && renderWizard()}
      </div>
    </PayrollAuth>
  );
}
