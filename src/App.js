// src/App.js
import React from "react";
import { Route, Routes } from "react-router-dom";
import AppointmentCalendar from "./components/AppointmentCalendar";
import SummaryPage from "./components/SummaryPage";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Routes>
    
      <Route path="/" element={<AppointmentCalendar />} />
      <Route path="/summary" element={<SummaryPage />} />
    </Routes>
  );
}

export default App;
