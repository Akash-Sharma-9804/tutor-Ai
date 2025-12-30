import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  FaCalendarAlt,
  FaPlus,
  FaFilter,
  FaList,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendar,
  FaUsers,
  FaChalkboardTeacher,
  FaSchool,
  FaEdit,
  FaTrash,
  FaBell,
} from "react-icons/fa";
import AdminFooter from "../../layout/AdminFooter";

const CalendarPage = () => {
  const [view, setView] = useState("dayGridMonth");
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Staff Meeting",
      start: new Date(new Date().setHours(10, 0, 0, 0)),
      end: new Date(new Date().setHours(11, 30, 0, 0)),
      color: "#3B82F6",
      type: "meeting",
      location: "Conference Room A",
      description: "Weekly staff meeting to discuss updates",
    },
    {
      id: 2,
      title: "Parent-Teacher Conference",
      start: new Date(new Date().setDate(new Date().getDate() + 1)),
      end: new Date(new Date().setDate(new Date().getDate() + 1)),
      color: "#10B981",
      type: "conference",
      location: "School Hall",
      description: "Parent-teacher conferences for Class 10",
    },
    {
      id: 3,
      title: "Science Fair",
      start: new Date(new Date().setDate(new Date().getDate() + 3)),
      end: new Date(new Date().setDate(new Date().getDate() + 4)),
      color: "#8B5CF6",
      type: "event",
      location: "Science Lab",
      description: "Annual science fair competition",
    },
    {
      id: 4,
      title: "Training Session",
      start: new Date(new Date().setDate(new Date().getDate() - 2)),
      end: new Date(new Date().setDate(new Date().getDate() - 2)),
      color: "#F59E0B",
      type: "training",
      location: "Computer Lab",
      description: "Teacher training on new software",
    },
  ]);

  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
    type: "meeting",
    location: "",
    description: "",
    color: "#3B82F6",
  });

  const eventTypes = [
    { value: "meeting", label: "Meeting", color: "#3B82F6", icon: FaUsers },
    {
      value: "conference",
      label: "Conference",
      color: "#10B981",
      icon: FaChalkboardTeacher,
    },
    { value: "event", label: "Event", color: "#8B5CF6", icon: FaSchool },
    { value: "training", label: "Training", color: "#F59E0B", icon: FaBell },
    { value: "holiday", label: "Holiday", color: "#EF4444", icon: FaCalendar },
  ];

  const handleDateClick = (arg) => {
    setNewEvent({
      ...newEvent,
      start: arg.dateStr,
      end: arg.dateStr,
    });
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEventClick = (info) => {
    const event = events.find((e) => e.id === parseInt(info.event.id));
    setSelectedEvent(event);
    setNewEvent({
      title: event.title,
      start: event.start.toISOString().split("T")[0],
      end:
        event.end?.toISOString().split("T")[0] ||
        event.start.toISOString().split("T")[0],
      type: event.type,
      location: event.location || "",
      description: event.description || "",
      color: event.color,
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = () => {
    if (!newEvent.title.trim()) {
      alert("Please enter a title for the event");
      return;
    }

    if (selectedEvent) {
      // Update existing event
      setEvents(
        events.map((event) =>
          event.id === selectedEvent.id
            ? { ...selectedEvent, ...newEvent }
            : event
        )
      );
    } else {
      // Add new event
      const newEventObj = {
        id: events.length + 1,
        ...newEvent,
        start: new Date(newEvent.start),
        end: newEvent.end ? new Date(newEvent.end) : new Date(newEvent.start),
      };
      setEvents([...events, newEventObj]);
    }

    setShowEventModal(false);
    setNewEvent({
      title: "",
      start: "",
      end: "",
      type: "meeting",
      location: "",
      description: "",
      color: "#3B82F6",
    });
    setSelectedEvent(null);
  };

  const handleDeleteEvent = () => {
    if (
      selectedEvent &&
      window.confirm("Are you sure you want to delete this event?")
    ) {
      setEvents(events.filter((event) => event.id !== selectedEvent.id));
      setShowEventModal(false);
      setSelectedEvent(null);
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const getEventTypeIcon = (type) => {
    const eventType = eventTypes.find((t) => t.value === type);
    const Icon = eventType?.icon || FaCalendarAlt;
    return <Icon />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4 md:px-6 lg:px-8 pt-8 pb-0 transition-colors duration-200">
      <div className=" mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Calendar
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage events, meetings, and school activities
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={() => {
                setNewEvent({
                  title: "",
                  start: new Date().toISOString().split("T")[0],
                  end: new Date().toISOString().split("T")[0],
                  type: "meeting",
                  location: "",
                  description: "",
                  color: "#3B82F6",
                });
                setSelectedEvent(null);
                setShowEventModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center"
            >
              <FaPlus className="mr-2" />
              New Event
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 md:p-6">
              {/* Calendar Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-2">
                  {[
                    "dayGridMonth",
                    "timeGridWeek",
                    "timeGridDay",
                    "listMonth",
                  ].map((viewType, index) => {
                    const icons = [
                      FaCalendar,
                      FaCalendarWeek,
                      FaCalendarDay,
                      FaList,
                    ];
                    const Icon = icons[index];
                    const labels = ["Month", "Week", "Day", "List"];
                    return (
                      <button
                        key={viewType}
                        onClick={() => handleViewChange(viewType)}
                        className={`p-3 rounded-lg transition-colors flex items-center ${
                          view === viewType
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <Icon className="mr-2" />
                        <span className="hidden sm:inline">
                          {labels[index]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FullCalendar */}
              <div className="calendar-container">
                <FullCalendar
                  plugins={[
                    dayGridPlugin,
                    timeGridPlugin,
                    interactionPlugin,
                    listPlugin,
                  ]}
                  initialView={view}
                  headerToolbar={false}
                  events={events}
                  dateClick={handleDateClick}
                  eventClick={handleEventClick}
                  eventContent={(eventInfo) => (
                    <div className="fc-event-content p-1">
                      <div className="flex items-center">
                        <div
                          className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
                          style={{
                            backgroundColor: eventInfo.event.backgroundColor,
                          }}
                        />
                        <span className="text-xs truncate">
                          {eventInfo.event.title}
                        </span>
                      </div>
                    </div>
                  )}
                  height="auto"
                  eventDisplay="block"
                  eventTimeFormat={{
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Event Types */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                  <FaFilter className="mr-2 text-blue-500" />
                  Event Types
                </h3>
                <div className="space-y-3">
                  {eventTypes.map((type) => (
                    <div
                      key={type.value}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: type.color }}
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          {type.label}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {events.filter((e) => e.type === type.value).length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                  Upcoming Events
                </h3>
                <div className="space-y-4">
                  {events
                    .filter((event) => new Date(event.start) >= new Date())
                    .sort((a, b) => new Date(a.start) - new Date(b.start))
                    .slice(0, 5)
                    .map((event) => (
                      <div
                        key={event.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventModal(true);
                        }}
                      >
                        <div className="flex items-start">
                          <div
                            className="w-3 h-3 rounded-full mt-1 mr-3 flex-shrink-0"
                            style={{ backgroundColor: event.color }}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 dark:text-white mb-1">
                              {event.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {event.location}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <FaCalendarAlt className="mr-1" />
                              {new Date(event.start).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-2xl border border-blue-200 dark:border-blue-800/30 p-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                  Calendar Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">
                      {events.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Events
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">
                      {
                        events.filter((e) => new Date(e.start) >= new Date())
                          .length
                      }
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Upcoming
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {selectedEvent ? "Edit Event" : "New Event"}
                </h2>
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    placeholder="Enter event title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={newEvent.start}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, start: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={newEvent.end}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, end: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Type
                  </label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => {
                      const selectedType = eventTypes.find(
                        (t) => t.value === e.target.value
                      );
                      setNewEvent({
                        ...newEvent,
                        type: e.target.value,
                        color: selectedType?.color || "#3B82F6",
                      });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  >
                    {eventTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, location: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    placeholder="Enter location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    placeholder="Enter event description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="flex gap-2">
                    {eventTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() =>
                          setNewEvent({
                            ...newEvent,
                            color: type.color,
                            type: type.value,
                          })
                        }
                        className={`w-8 h-8 rounded-full border-2 ${
                          newEvent.color === type.color
                            ? "border-gray-800 dark:border-white"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: type.color }}
                        title={type.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleSaveEvent}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                >
                  {selectedEvent ? "Update Event" : "Create Event"}
                </button>

                {selectedEvent && (
                  <button
                    onClick={handleDeleteEvent}
                    className="px-6 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className=" md:-mx-8 -mx-4">
        <AdminFooter />
      </div>
    </div>
  );
};

export default CalendarPage;
