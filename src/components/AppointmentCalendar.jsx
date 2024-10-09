import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import axios from "axios";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  FormGroup,
  Label,
} from "reactstrap";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/AppointmentCalendar.css";

const localizer = momentLocalizer(moment);
// src/utils/colorUtils.js
export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// const EventWrapper = ({ event, onClick }) => {

//   return (
//     <div onClick={console.log} style={{ backgroundColor: event.color, padding: '5px', borderRadius: '5px', color: 'white' }}>
//       {event.title}
//     </div>
//   );
// };
const AppointmentCalendar = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    patientName: "",
    start: "",
    end: "",
    color: '#ff0000', // Custom color
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  console.log(selectedSlot)
  const [selectedEvent, setSelectedEvent] = useState(null); // Track selected event for deletion
  const DnDCalendar = withDragAndDrop(Calendar);
  const apiUrl = process.env.RAECT_APP_API_URL || "http://localhost:5000"

  useEffect(() => {
    // Fetch appointments from the backend and ensure dates are correct
    axios
      .get(`https://nirmitee-cal-app-server.onrender.com/appointments`)
      .then((res) => {
        const formattedEvents = res.data.map((event) => ({
          ...event,
          start: new Date(event.start),  // Ensure start is a Date object
          end: new Date(event.end),      // Ensure end is a Date object
        }));
        setEvents(formattedEvents);
      })
      .catch((err) => console.error("Error fetching appointments:", err));
  }, []);

  const handleEventDrop = ({ event, start, end }) => {
    const updatedEvent = { ...event, start, end };

    // Optimistically update the UI
    setEvents(events.map((evt) => (evt._id === event._id ? updatedEvent : evt)));

    // Send updated event to the backend
    axios
      .put(`https://nirmitee-cal-app-server.onrender.com/appointments/${event._id}`, updatedEvent)
      .then((res) => {
        console.log("Event updated successfully:", res.data);
      })
      .catch((err) => {
        console.error("Error updating event:", err);
        // Revert the change in case of an error
        setEvents(events);
      });
  };

  const handleSelectSlot = (slotInfo) => {
    setSelectedSlot(slotInfo);
    setNewEvent({
      title: "",
      patientName: "",
      start: slotInfo.start,
      end: slotInfo.end,
    });
    setModalOpen(true); // Open modal to fill event details
  };

  const handleEventSelect = (event) => {

    setSelectedEvent(event);
    setNewEvent({
      title: event.title,
      patientName: event.patientName,
      start: event.start,
      end: event.end,
    });
    setModalOpen(true);
  };

  const handleDelete = () => {
    if (!selectedEvent) return;

    // Optimistically update the UI
    setEvents(events.filter((event) => event._id !== selectedEvent._id));

    // Send delete request to the backend
    axios
      .delete(`https://nirmitee-cal-app-server.onrender.com/appointments/${selectedEvent._id}`)
      .then((res) => {
        console.log("Event deleted successfully:", res.data);
        setModalOpen(false);
      })
      .catch((err) => {
        console.error("Error deleting event:", err);
      });
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!newEvent.title || !newEvent.patientName) {
      alert("Please fill in all fields");
      return;
    }

    const eventToSave = {
      ...newEvent,
      start: new Date(newEvent.start),
      end: new Date(newEvent.end),
      color: getRandomColor() // Get a random color for each event

    };

    // Send the new event to the backend
    axios
      .post(`https://nirmitee-cal-app-server.onrender.com/appointments`, eventToSave)
      .then((res) => {
        setEvents([
          ...events,
          {
            ...res.data,
            start: new Date(res.data.start),
            end: new Date(res.data.end),
          },
        ]);
        handleCloseModal(); // Close modal and reset form
      })
      .catch((err) => console.error("Error creating new appointment:", err));
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setNewEvent({ title: "", patientName: "", start: "", end: "" });
    setSelectedEvent(null);
  };

  return (
    <div className="mt-5">
      <h2 className="text-center my-2">
        Welcome to self Appointment service !
      </h2>
      <DnDCalendar
        onSelectSlot={handleSelectSlot} // Enable time slot selection for new appointments
        onEventDrop={handleEventDrop} // Enable drag-and-drop for events
        onSelectEvent={handleEventSelect} // Open modal on event click
        defaultView="week" // Only show week view
        views={{ week: true }} // Disable other views
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        resizable
        style={{ height: 500 }}
      // components={{
      //   eventWrapper: (eventProps) => <EventWrapper   {...eventProps}
      //     onClick={() => handleEventSelect(eventProps.event)} // Pass event to handleEventClick
      //   />
      // }}
      />
      <Modal isOpen={modalOpen} toggle={handleCloseModal}>
        <ModalHeader toggle={handleCloseModal}>
          {selectedEvent ? "Edit Appointment" : "Add New Appointment"}
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="title">Appointment Title</Label>
            <Input
              type="text"
              name="title"
              id="title"
              placeholder="Enter appointment title"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
            />
          </FormGroup>
          <FormGroup>
            <Label for="patientName">Patient Name</Label>
            <Input
              type="text"
              name="patientName"
              id="patientName"
              placeholder="Enter patient name"
              value={newEvent.patientName}
              onChange={(e) =>
                setNewEvent({ ...newEvent, patientName: e.target.value })
              }
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          {selectedEvent && (
            <Button color="danger" onClick={handleDelete}>
              Delete Appointment
            </Button>
          )}
          <Button color="primary" onClick={handleSubmit}>
            Add Appointment
          </Button>
          <Button color="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AppointmentCalendar;
