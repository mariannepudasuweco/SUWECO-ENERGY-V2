import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, MapPin, Mail, Phone, Building2, X, Users } from 'lucide-react';
import PayrollAuth from './PayrollAuth';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  
  const defaultEmpState = {
    surname: '',
    firstName: '',
    middleName: '',
    gender: 'Male',
    birthdate: '',
    civilStatus: 'Single',
    email: '',
    educationalAttainment: '',
    position: '',
    department: '',
    location: 'Select Location',
    dailyRate: '0',
    level: 'EXEC',
    employeeType: 'Direct',
    taxStatus: 'MWE',
    mealAllowance: 'No',
    mealAllowanceRate: '0',
    loadAllowance: 'No',
    loadAllowanceRate: '0',
    travelAllowance: 'No',
    travelAllowanceRate: '0',
    relocationAllowance: 'No',
    relocationAllowanceRate: '0',
    hireDate: '',
    employmentStatus: 'Regular',
    phone: '',
    status: 'Active',
    sssNumber: '',
    philHealthNumber: '',
    pagIbigNumber: '',
    tinNumber: '',
    statutory: {
      sss: '0',
      philhealth: '0',
      pagibig: '0',
      tax: '0'
    }
  };

  const [newEmp, setNewEmp] = useState(defaultEmpState);

  useEffect(() => {
    const stored = localStorage.getItem('payroll_employees');
    if (stored) {
      try {
        setEmployees(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse employees', e);
      }
    }
  }, []);

  const saveEmployees = (updated: any[]) => {
    setEmployees(updated);
    localStorage.setItem('payroll_employees', JSON.stringify(updated));
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const updatedEmployees = employees.map(emp => 
        emp.id === editingId 
          ? { 
              ...newEmp, 
              id: editingId, 
              name: `${newEmp.firstName} ${newEmp.surname}`.trim(),
              dailyRate: parseFloat(newEmp.dailyRate as string) || 0,
              status: newEmp.status.toUpperCase()
            } 
          : emp
      );
      saveEmployees(updatedEmployees);
    } else {
      const emp = {
        id: `EMP${String(employees.length + 1).padStart(3, '0')}`,
        ...newEmp,
        name: `${newEmp.firstName} ${newEmp.surname}`.trim(),
        dailyRate: parseFloat(newEmp.dailyRate as string) || 0,
        status: newEmp.status.toUpperCase()
      };
      saveEmployees([...employees, emp]);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setNewEmp(defaultEmpState);
  };

  const handleEdit = (emp: any) => {
    setNewEmp({
      ...defaultEmpState,
      ...emp,
      statutory: {
        ...defaultEmpState.statutory,
        ...(emp.statutory || {})
      },
      dailyRate: emp.dailyRate.toString()
    });
    setEditingId(emp.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      saveEmployees(employees.filter(e => e.id !== id));
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.position.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = locationFilter === 'All Locations' || emp.location === locationFilter;
    return matchesSearch && matchesLocation;
  });

  return (
    <PayrollAuth>
      <div>
        <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>Employee Master Record</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage employee information and records</div>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditingId(null); setNewEmp(defaultEmpState); setIsModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Add Employee
          </button>
        </div>

        {/* Search and Filter */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center', background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, position, or ID..." 
              style={{ width: '100%', padding: '8px 16px 8px 36px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-body)', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
          <select 
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
            style={{ padding: '8px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-body)', color: 'var(--text-main)', outline: 'none' }}
          >
            <option>All Locations</option>
            <option>Manila</option>
            <option>Local</option>
          </select>
        </div>

        {/* Employee Grid */}
        {filteredEmployees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>No employees found.</p>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(true)} style={{ marginTop: '16px' }}>Add your first employee</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {filteredEmployees.map(emp => (
              <div key={emp.id} style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', background: '#eff6ff', color: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.25rem', flexShrink: 0 }}>
                      {emp.name.charAt(0)}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <h3 style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.position}</p>
                      <span style={{ display: 'inline-block', marginTop: '4px', padding: '2px 6px', background: '#eff6ff', color: '#2563eb', fontSize: '0.75rem', fontWeight: 500, borderRadius: '4px' }}>
                        {emp.id}
                      </span>
                    </div>
                  </div>
                  <span style={{ padding: '2px 8px', background: '#dcfce7', color: '#166534', fontSize: '0.7rem', fontWeight: 700, borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {emp.status}
                  </span>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> 
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.department}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> 
                    <span>{emp.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> 
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> 
                    <span>{emp.phone}</span>
                  </div>
                </div>

                <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Rate</p>
                    <p style={{ fontWeight: 700, color: 'var(--text-main)' }}>₱{emp.dailyRate.toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEdit(emp)} style={{ background: 'none', border: 'none', padding: '8px', color: 'var(--text-main)', cursor: 'pointer', borderRadius: 'var(--radius-md)' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-body)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(emp.id)} style={{ background: 'none', border: 'none', padding: '8px', color: 'var(--danger)', cursor: 'pointer', borderRadius: 'var(--radius-md)' }} onMouseOver={e => e.currentTarget.style.background = '#fee2e2'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Employee Modal */}
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 30, 66, 0.54)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', overflowY: 'auto' }}>
            <div className="card" style={{ width: '100%', maxWidth: '1000px', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>{editingId ? 'Edit Employee' : 'New Employee'}</h2>
                  <span style={{ padding: '4px 12px', background: '#dcfce7', color: '#166534', fontSize: '0.85rem', fontWeight: 600, borderRadius: '9999px' }}>
                    {newEmp.status}
                  </span>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                <form id="add-employee-form" onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  {/* Personal Information */}
                  <section>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px' }}>Personal Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Surname</label>
                        <input required type="text" placeholder="Enter surname" value={newEmp.surname} onChange={e => setNewEmp({...newEmp, surname: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>First Name</label>
                        <input required type="text" placeholder="Enter first name" value={newEmp.firstName} onChange={e => setNewEmp({...newEmp, firstName: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Middle Name</label>
                        <input type="text" placeholder="Enter middle name" value={newEmp.middleName} onChange={e => setNewEmp({...newEmp, middleName: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Gender</label>
                        <select value={newEmp.gender} onChange={e => setNewEmp({...newEmp, gender: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
                          <option>Male</option>
                          <option>Female</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Birthdate</label>
                        <input required type="date" value={newEmp.birthdate} onChange={e => setNewEmp({...newEmp, birthdate: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Civil Status</label>
                        <select value={newEmp.civilStatus} onChange={e => setNewEmp({...newEmp, civilStatus: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
                          <option>Single</option>
                          <option>Married</option>
                          <option>Widowed</option>
                          <option>Divorced</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Email Address</label>
                        <input required type="email" placeholder="employee@company.com" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Educational Attainment</label>
                        <input type="text" placeholder="Enter educational attainment" value={newEmp.educationalAttainment} onChange={e => setNewEmp({...newEmp, educationalAttainment: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
                      </div>
                    </div>
                  </section>

                  {/* Employment Details */}
                  <section>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px' }}>Employment Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Position</label>
                        <input required type="text" placeholder="Job title" value={newEmp.position} onChange={e => setNewEmp({...newEmp, position: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Department</label>
                        <input required type="text" placeholder="Department" value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Location</label>
                        <select value={newEmp.location} onChange={e => setNewEmp({...newEmp, location: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
                          <option>Select Location</option>
                          <option>Manila</option>
                          <option>Local</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Daily Rate</label>
                        <input required type="number" step="0.01" value={newEmp.dailyRate} onChange={e => setNewEmp({...newEmp, dailyRate: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Level</label>
                        <select value={newEmp.level} onChange={e => setNewEmp({...newEmp, level: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
                          <option>EXEC</option>
                          <option>MGR</option>
                          <option>STAFF</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Hire Date</label>
                        <input required type="date" value={newEmp.hireDate} onChange={e => setNewEmp({...newEmp, hireDate: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Employee Type</label>
                        <select value={newEmp.employeeType} onChange={e => setNewEmp({...newEmp, employeeType: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
                          <option>Direct</option>
                          <option>Indirect</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Tax Status</label>
                        <select value={newEmp.taxStatus} onChange={e => setNewEmp({...newEmp, taxStatus: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
                          <option>MWE</option>
                          <option>NMWE</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Employment Status</label>
                        <select value={newEmp.employmentStatus} onChange={e => setNewEmp({...newEmp, employmentStatus: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
                          <option>Regular</option>
                          <option>Probationary</option>
                          <option>Contractual</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Phone</label>
                        <input required type="text" placeholder="+63 912 345 6789" value={newEmp.phone} onChange={e => setNewEmp({...newEmp, phone: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Status</label>
                        <select value={newEmp.status} onChange={e => setNewEmp({...newEmp, status: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
                          <option>Active</option>
                          <option>Inactive</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* Government IDs */}
                  <section>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px' }}>Government IDs</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>SSS Number</label>
                        <input type="text" placeholder="XX-XXXXXXX-X" value={newEmp.sssNumber} onChange={e => setNewEmp({...newEmp, sssNumber: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>PhilHealth Number</label>
                        <input type="text" placeholder="XX-XXXXXXXXX-X" value={newEmp.philHealthNumber} onChange={e => setNewEmp({...newEmp, philHealthNumber: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Pag-IBIG Number</label>
                        <input type="text" placeholder="XXXX-XXXX-XXXX" value={newEmp.pagIbigNumber} onChange={e => setNewEmp({...newEmp, pagIbigNumber: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>TIN Number</label>
                        <input type="text" placeholder="XXX-XXX-XXX-XXX" value={newEmp.tinNumber} onChange={e => setNewEmp({...newEmp, tinNumber: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
                      </div>
                    </div>
                  </section>

                  {/* Statutory Deductions */}
                  <section>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px' }}>Statutory Deductions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>SSS Contribution</label>
                        <input type="number" step="0.01" placeholder="0" value={newEmp.statutory?.sss || '0'} onChange={e => setNewEmp({...newEmp, statutory: { ...newEmp.statutory, sss: e.target.value }})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>PhilHealth Contribution</label>
                        <input type="number" step="0.01" placeholder="0" value={newEmp.statutory?.philhealth || '0'} onChange={e => setNewEmp({...newEmp, statutory: { ...newEmp.statutory, philhealth: e.target.value }})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Pag-IBIG Contribution</label>
                        <input type="number" step="0.01" placeholder="0" value={newEmp.statutory?.pagibig || '0'} onChange={e => setNewEmp({...newEmp, statutory: { ...newEmp.statutory, pagibig: e.target.value }})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Tax Contribution</label>
                        <input type="number" step="0.01" placeholder="0" value={newEmp.statutory?.tax || '0'} onChange={e => setNewEmp({...newEmp, statutory: { ...newEmp.statutory, tax: e.target.value }})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
                      </div>
                    </div>
                  </section>

                </form>
              </div>

              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--bg-surface)', flexShrink: 0 }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setIsModalOpen(false); setEditingId(null); setNewEmp(defaultEmpState); }} style={{ padding: '10px 24px', fontWeight: 600 }}>Cancel</button>
                <button type="submit" form="add-employee-form" className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: 600, background: '#0f172a', color: 'white' }}>{editingId ? 'Update Employee' : 'Save Employee'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PayrollAuth>
  );
}
