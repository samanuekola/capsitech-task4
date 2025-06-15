import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
