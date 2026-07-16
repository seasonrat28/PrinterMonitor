import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Printers from './pages/Printers';
import PrinterDetail from './pages/PrinterDetail';
import Scanner from './pages/Scanner';
import Reports from './pages/Reports';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="printers" element={<Printers />} />
          <Route path="printers/:id" element={<PrinterDetail />} />
          <Route path="scanner" element={<Scanner />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
