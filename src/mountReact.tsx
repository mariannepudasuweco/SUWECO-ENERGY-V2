import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import PayrollDashboard from './components/PayrollDashboard';
import EmployeeManagement from './components/EmployeeManagement';
import PayrollProcessing from './components/PayrollProcessing';

let currentRoot: Root | null = null;

function mountComponent(Component: React.FC) {
  const container = document.getElementById('contentArea');
  if (!container) return;

  if (currentRoot) {
    currentRoot.unmount();
    currentRoot = null;
  }

  // Clear container just in case
  container.innerHTML = '';

  currentRoot = createRoot(container);
  currentRoot.render(<Component />);
}

export function mountPayrollDashboard() {
  mountComponent(PayrollDashboard);
}

export function mountEmployeeManagement() {
  mountComponent(EmployeeManagement);
}

export function mountPayrollProcessing() {
  mountComponent(PayrollProcessing);
}

// Expose to window for vanilla JS to call
(window as any).renderPayrollDashboard = mountPayrollDashboard;
(window as any).renderEmployeeView = mountEmployeeManagement;
(window as any).renderPayrollProcessingView = mountPayrollProcessing;
