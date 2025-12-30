import { useState, useEffect } from "react";
import {
  FaEnvelope,
  FaUser,
  FaPaperPlane,
  FaSearch,
  FaFilter,
  FaReply,
  FaTrash,
  FaArchive,
  FaStar,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaEllipsisV,
  FaPaperclip,
  FaImage,
  FaSmile,
} from "react-icons/fa";
import AdminFooter from "../../layout/AdminFooter";

const MessagesPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "John Doe",
      senderEmail: "john@example.com",
      senderAvatar: "JD",
      subject: "Regarding Student Progress",
      content:
        "Hello, I wanted to discuss the progress of student Sarah Johnson in mathematics...",
      timestamp: "2024-01-15T10:30:00",
      read: true,
      starred: false,
      attachments: 2,
      tags: ["important", "student"],
    },
    {
      id: 2,
      sender: "Sarah Wilson",
      senderEmail: "sarah@example.com",
      senderAvatar: "SW",
      subject: "New Student Enrollment",
      content:
        "We have a new student who just enrolled. Please review their documents...",
      timestamp: "2024-01-14T14:20:00",
      read: false,
      starred: true,
      attachments: 1,
      tags: ["enrollment"],
    },
    {
      id: 3,
      sender: "Michael Chen",
      senderEmail: "michael@example.com",
      senderAvatar: "MC",
      subject: "Meeting Request",
      content:
        "Could we schedule a meeting to discuss the upcoming parent-teacher conference?",
      timestamp: "2024-01-13T09:15:00",
      read: true,
      starred: true,
      attachments: 0,
      tags: ["meeting"],
    },
    {
      id: 4,
      sender: "Lisa Park",
      senderEmail: "lisa@example.com",
      senderAvatar: "LP",
      subject: "System Issue Report",
      content: "There seems to be an issue with the grade submission system...",
      timestamp: "2024-01-12T16:45:00",
      read: true,
      starred: false,
      attachments: 3,
      tags: ["technical", "urgent"],
    },
    {
      id: 5,
      sender: "Robert Brown",
      senderEmail: "robert@example.com",
      senderAvatar: "RB",
      subject: "Training Session Feedback",
      content: "Thank you for the excellent training session yesterday...",
      timestamp: "2024-01-11T11:10:00",
      read: true,
      starred: false,
      attachments: 0,
      tags: ["feedback"],
    },
  ]);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("inbox");
  const [newMessage, setNewMessage] = useState({
    to: "",
    subject: "",
    content: "",
    attachments: [],
  });
  const [replyingTo, setReplyingTo] = useState(null);
  const [showCompose, setShowCompose] = useState(false);

  const unreadCount = messages.filter((msg) => !msg.read).length;
  const starredCount = messages.filter((msg) => msg.starred).length;

  const tabs = [
    { id: "inbox", label: "Inbox", count: messages.length, icon: FaEnvelope },
    { id: "unread", label: "Unread", count: unreadCount, icon: FaClock },
    { id: "starred", label: "Starred", count: starredCount, icon: FaStar },
    { id: "sent", label: "Sent", count: 0, icon: FaPaperPlane },
    { id: "archived", label: "Archived", count: 0, icon: FaArchive },
  ];

  const filteredMessages = messages
    .filter((msg) => {
      if (activeTab === "unread") return !msg.read;
      if (activeTab === "starred") return msg.starred;
      if (activeTab === "sent") return false; // In a real app, filter sent messages
      if (activeTab === "archived") return false; // In a real app, filter archived messages
      return true; // Inbox
    })
    .filter(
      (msg) =>
        msg.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    // Mark as read
    if (!message.read) {
      setMessages(
        messages.map((msg) =>
          msg.id === message.id ? { ...msg, read: true } : msg
        )
      );
    }
  };

  const handleStarMessage = (messageId) => {
    setMessages(
      messages.map((msg) =>
        msg.id === messageId ? { ...msg, starred: !msg.starred } : msg
      )
    );
    if (selectedMessage?.id === messageId) {
      setSelectedMessage({
        ...selectedMessage,
        starred: !selectedMessage.starred,
      });
    }
  };

  const handleDeleteMessage = (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      setMessages(messages.filter((msg) => msg.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    }
  };

  const handleReply = () => {
    if (selectedMessage) {
      setReplyingTo(selectedMessage);
      setNewMessage({
        to: selectedMessage.senderEmail,
        subject: `Re: ${selectedMessage.subject}`,
        content: `\n\n---\nOn ${formatDate(selectedMessage.timestamp)}, ${
          selectedMessage.sender
        } wrote:\n> ${selectedMessage.content.substring(0, 200)}...`,
        attachments: [],
      });
      setShowCompose(true);
    }
  };

  const handleSendMessage = () => {
    if (
      !newMessage.to.trim() ||
      !newMessage.subject.trim() ||
      !newMessage.content.trim()
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // In a real app, send the message via API
    console.log("Sending message:", newMessage);

    setNewMessage({
      to: "",
      subject: "",
      content: "",
      attachments: [],
    });
    setShowCompose(false);
    setReplyingTo(null);
    alert("Message sent successfully!");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4 md:px-6 lg:px-8 pt-8 pb-0 transition-colors duration-200">
      <div className=" mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Messages
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Communicate with teachers, parents, and students
            </p>
          </div>

          <button
            onClick={() => {
              setNewMessage({
                to: "",
                subject: "",
                content: "",
                attachments: [],
              });
              setReplyingTo(null);
              setShowCompose(true);
            }}
            className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center"
          >
            <FaPaperPlane className="mr-2" />
            Compose New
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Message List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              {/* Search */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex overflow-x-auto">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === tab.id
                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                        }`}
                      >
                        <Icon className="mr-2" />
                        {tab.label}
                        {tab.count > 0 && (
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message List */}
              <div className="max-h-[600px] overflow-y-auto">
                {filteredMessages.length === 0 ? (
                  <div className="p-8 text-center">
                    <FaEnvelope className="text-4xl text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No messages found
                    </p>
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => handleSelectMessage(message)}
                      className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        selectedMessage?.id === message.id
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      } ${
                        !message.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                      }`}
                    >
                      <div className="flex items-start">
                        {/* Avatar */}
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {message.senderAvatar}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <span
                                className={`font-medium truncate ${
                                  !message.read
                                    ? "text-gray-900 dark:text-white"
                                    : "text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {message.sender}
                              </span>
                              {message.attachments > 0 && (
                                <FaPaperclip className="ml-2 text-gray-400 text-xs" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(message.timestamp)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStarMessage(message.id);
                                }}
                                className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                  message.starred
                                    ? "text-yellow-500"
                                    : "text-gray-400"
                                }`}
                              >
                                <FaStar className="text-sm" />
                              </button>
                            </div>
                          </div>

                          <h4
                            className={`font-medium truncate mb-1 ${
                              !message.read
                                ? "text-gray-800 dark:text-white"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {message.subject}
                          </h4>

                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {message.content}
                          </p>

                          {message.tags && message.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {message.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Message View/Compose */}
          <div className="lg:col-span-2">
            {showCompose ? (
              /* Compose Message */
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 h-full">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      {replyingTo ? "Reply to Message" : "New Message"}
                    </h2>
                    <button
                      onClick={() => setShowCompose(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        To *
                      </label>
                      <input
                        type="email"
                        value={newMessage.to}
                        onChange={(e) =>
                          setNewMessage({ ...newMessage, to: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        placeholder="recipient@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        value={newMessage.subject}
                        onChange={(e) =>
                          setNewMessage({
                            ...newMessage,
                            subject: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        placeholder="Enter subject"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message *
                      </label>
                      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                        <div className="border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 flex items-center gap-2">
                          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300">
                            <FaImage />
                          </button>
                          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300">
                            <FaPaperclip />
                          </button>
                          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300">
                            <FaSmile />
                          </button>
                        </div>
                        <textarea
                          value={newMessage.content}
                          onChange={(e) =>
                            setNewMessage({
                              ...newMessage,
                              content: e.target.value,
                            })
                          }
                          rows="12"
                          className="w-full px-4 py-3 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          placeholder="Type your message here..."
                        />
                      </div>
                    </div>

                    {newMessage.attachments.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Attachments
                        </label>
                        <div className="space-y-2">
                          {newMessage.attachments.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {file.name}
                              </span>
                              <button
                                onClick={() => {
                                  const newAttachments = [
                                    ...newMessage.attachments,
                                  ];
                                  newAttachments.splice(index, 1);
                                  setNewMessage({
                                    ...newMessage,
                                    attachments: newAttachments,
                                  });
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={handleSendMessage}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center"
                    >
                      <FaPaperPlane className="mr-2" />
                      Send Message
                    </button>

                    <button
                      onClick={() => {
                        setNewMessage({
                          to: "",
                          subject: "",
                          content: "",
                          attachments: [],
                        });
                        setShowCompose(false);
                        setReplyingTo(null);
                      }}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedMessage ? (
              /* View Message */
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 h-full flex flex-col">
                {/* Message Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {selectedMessage.senderAvatar}
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                          {selectedMessage.subject}
                        </h2>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <FaUser className="mr-2" />
                          <span>{selectedMessage.sender}</span>
                          <span className="mx-2">•</span>
                          <span>{selectedMessage.senderEmail}</span>
                          <span className="mx-2">•</span>
                          <span>
                            {formatFullDate(selectedMessage.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStarMessage(selectedMessage.id)}
                        className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          selectedMessage.starred
                            ? "text-yellow-500"
                            : "text-gray-400"
                        }`}
                      >
                        <FaStar />
                      </button>
                      <button
                        onClick={() => setReplyingTo(selectedMessage)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FaReply />
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(selectedMessage.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {selectedMessage.tags && selectedMessage.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedMessage.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            tag === "urgent"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              : tag === "important"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message Body */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedMessage.content}
                    </p>
                  </div>

                  {selectedMessage.attachments > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                        <FaPaperclip className="mr-2" />
                        Attachments ({selectedMessage.attachments})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[...Array(selectedMessage.attachments)].map(
                          (_, index) => (
                            <div
                              key={index}
                              className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                            >
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                                <FaPaperclip className="text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800 dark:text-white">
                                  Document_{index + 1}.pdf
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {(Math.random() * 2 + 1).toFixed(1)} MB
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Actions */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        setReplyingTo(selectedMessage);
                        setShowCompose(true);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center"
                    >
                      <FaReply className="mr-2" />
                      Reply
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(selectedMessage);
                        setNewMessage({
                          to: "",
                          subject: `Fwd: ${selectedMessage.subject}`,
                          content: `Forwarded message:\n\nFrom: ${
                            selectedMessage.sender
                          }\nDate: ${formatFullDate(
                            selectedMessage.timestamp
                          )}\n\n${selectedMessage.content}`,
                          attachments: [],
                        });
                        setShowCompose(true);
                      }}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Forward
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(selectedMessage.id)}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 h-full flex flex-col items-center justify-center p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-6">
                  <FaEnvelope className="text-4xl text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  Select a Message
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
                  Choose a message from the list to view its contents or compose
                  a new message to get started.
                </p>
                <button
                  onClick={() => setShowCompose(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center"
                >
                  <FaPaperPlane className="mr-2" />
                  Compose New Message
                </button>
              </div>
            )}
          </div>
        </div>
        <div className=" md:-mx-8 -mx-4">
          <AdminFooter />
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
