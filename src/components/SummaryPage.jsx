// src/components/SummaryPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table } from 'reactstrap';
import "../styles/SummaryPage.css"
const SummaryPage = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // Fetch appointments
    axios.get('https://nirmitee-cal-app-server.onrender.com/appointments')
      .then((res) => setAppointments(res.data));
  }, []);

  return (
    <div>
      <h3>Upcoming Appointments</h3>
      <Table striped>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Title</th>
            <th>Start Date</th>
            <th>End Date</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment._id}>
              <td>{appointment.patientName}</td>
              <td>{appointment.title}</td>
              <td>{new Date(appointment.start).toLocaleString()}</td>
              <td>{new Date(appointment.end).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default SummaryPage;
