import React, { useState } from 'react'
import { Bot, Send, Sparkles, BookOpen, Calculator, Beaker, Code } from "lucide-react"

const AITutor = () => {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI tutor. I can help you with any subject. What would you like to learn today?",
    },
  ])

  const quickTopics = [
    { label: "Math Problems", icon: Calculator, subject: "Mathematics" },
    { label: "Science Help", icon: Beaker, subject: "Science" },
    { label: "Essay Writing", icon: BookOpen, subject: "English" },
    { label: "Coding Help", icon: Code, subject: "Computer Science" },
  ]

  const recentConversations = [
    { topic: "Calculus - Derivatives", subject: "Mathematics", date: "2 hours ago" },
    { topic: "Quantum Mechanics Basics", subject: "Physics", date: "Yesterday" },
    { topic: "Chemical Bonding", subject: "Chemistry", date: "2 days ago" },
  ]

  const handleSend = () => {
    if (!message.trim()) return

    setMessages([...messages, { role: "user", content: message }])
    setMessage("")

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I understand your question. Let me help you with that...",
        },
      ])
    }, 1000)
  }

  return (
    <div className="container mx-auto p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">My AI Tutor 🤖</h1>
        <p className="text-gray-600">Get personalized help with any subject, anytime</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <div className="flex h-[calc(100vh-16rem)] flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Chat Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">AI Tutor</h2>
                  <p className="text-sm text-gray-600">Powered by advanced AI</p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  <Sparkles className="h-3 w-3" />
                  Active
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "user" 
                          ? "bg-blue-600 text-white" 
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <button
                  onClick={handleSend}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 p-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Topics */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Quick Topics</h2>
              <p className="text-sm text-gray-600">Get help with these subjects</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quickTopics.map((topic) => {
                const Icon = topic.icon
                return (
                  <button
                    key={topic.label}
                    onClick={() => setMessage(`Help me with ${topic.subject}`)}
                    className="flex flex-col items-center gap-2 rounded-lg border border-gray-300 bg-white p-4 hover:bg-gray-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <Icon className="h-5 w-5 text-blue-600" />
                    <span className="text-xs font-medium text-gray-700">{topic.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Recent Conversations */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Chats</h2>
            <div className="space-y-3">
              {recentConversations.map((conv, index) => (
                <button
                  key={index}
                  className="w-full rounded-lg border border-gray-200 bg-white p-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <h4 className="mb-1 text-sm font-medium text-gray-900">{conv.topic}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{conv.subject}</span>
                    <span className="text-xs text-gray-500">{conv.date}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">AI Capabilities</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Step-by-step solutions</h4>
                  <p className="text-xs text-gray-600">Detailed explanations</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">All subjects covered</h4>
                  <p className="text-xs text-gray-600">From math to literature</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">24/7 availability</h4>
                  <p className="text-xs text-gray-600">Always here to help</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AITutor