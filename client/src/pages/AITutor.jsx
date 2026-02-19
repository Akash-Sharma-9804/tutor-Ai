import React, { useState, useEffect, useRef } from 'react'
import { ScanLine, Upload, FileText, ImageIcon, CheckCircle2, AlertCircle, Loader2, Eye, Trash2, Copy, Check, Plus, Bot, Send, Paperclip, X, MessageSquare, History, Clock, Sparkles, BookOpen, GraduationCap, Brain, Zap, Menu, ChevronLeft, ChevronRight, MoreVertical, Edit2, Trash, Archive, Download, Star, TrendingUp, Calendar, BarChart3, Settings, HelpCircle, LogOut, Volume2, VolumeX } from "lucide-react"
import axios from 'axios'
import io from 'socket.io-client'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

// Enhanced Markdown-like response renderer
const MarkdownResponse = ({ content, messageId, onPlayAudio }) => {
  const [copied, setCopied] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const copyToClipboard = () => {
    const textContent = typeof content === 'string' ? content : String(content || '')
    navigator.clipboard.writeText(textContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePlayAudio = async () => {
    if (isPlayingAudio) return
    setIsPlayingAudio(true)
    try {
      await onPlayAudio(content, messageId)
    } finally {
      setIsPlayingAudio(false)
    }
  }

  const parseContent = (text) => {
    if (!text || typeof text !== 'string') return []

    const sections = []
    const lines = text.split('\n')
    let currentSection = { type: 'text', content: [] }

    lines.forEach((line, index) => {
      if (line.startsWith('### ')) {
        if (currentSection.content.length > 0) {
          sections.push(currentSection)
          currentSection = { type: 'text', content: [] }
        }
        sections.push({ type: 'h3', content: line.replace('### ', '').trim() })
      } else if (line.startsWith('## ')) {
        if (currentSection.content.length > 0) {
          sections.push(currentSection)
          currentSection = { type: 'text', content: [] }
        }
        sections.push({ type: 'h2', content: line.replace('## ', '').trim() })
      } else if (line.startsWith('# ')) {
        if (currentSection.content.length > 0) {
          sections.push(currentSection)
          currentSection = { type: 'text', content: [] }
        }
        sections.push({ type: 'h1', content: line.replace('# ', '').trim() })
      }
      else if (line.includes('**')) {
        currentSection.content.push(line)
      }
      else if (line.trim().startsWith('*   ') || line.trim().startsWith('- ')) {
        if (currentSection.type !== 'list') {
          if (currentSection.content.length > 0) {
            sections.push(currentSection)
          }
          currentSection = { type: 'list', content: [] }
        }
        currentSection.content.push(line.trim().replace(/^(\*   |- )/, ''))
      }
      else if (line.trim() === '---') {
        if (currentSection.content.length > 0) {
          sections.push(currentSection)
          currentSection = { type: 'text', content: [] }
        }
        sections.push({ type: 'divider' })
      }
      else if (line.trim().startsWith('Φ') || line.trim().startsWith('Q =') || line.includes('×')) {
        currentSection.content.push(line)
      }
      else if (line.trim()) {
        currentSection.content.push(line)
      }
      else if (line.trim() === '' && currentSection.content.length > 0) {
        sections.push(currentSection)
        currentSection = { type: 'text', content: [] }
      }
    })

    if (currentSection.content.length > 0) {
      sections.push(currentSection)
    }

    return sections
  }

  const renderBoldText = (text) => {
    if (!text || typeof text !== 'string') return text
    const parts = text.split(/(\*\*[^*]+\*\*)/)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  const cleanLatex = (latex) => {
    if (!latex) return latex
    let cleaned = latex.trim()
    // Fix escaped backslashes
    cleaned = cleaned.replace(/\\\\/g, '\\')
    // Remove markdown bold markers inside math
    cleaned = cleaned.replace(/\*\*/g, '')
    return cleaned
  }

const renderTextWithLatex = (text) => {
    if (!text || typeof text !== 'string') return text

    const parts = []
    let lastIndex = 0
    // Regex that properly captures LaTeX
    const mathRegex = /\$\$([^$]+)\$\$|\$([^$\n]+)\$/g
    let match

    while ((match = mathRegex.exec(text)) !== null) {
      // Add text before the math
      if (match.index > lastIndex) {
        const textBefore = text.substring(lastIndex, match.index)
        parts.push({ type: 'text', content: textBefore })
      }

      // Add the math content
      if (match[1] !== undefined) {
        // Block math ($$...$$)
        parts.push({ type: 'block', content: cleanLatex(match[1]) })
      } else if (match[2] !== undefined) {
        // Inline math ($...$)
        parts.push({ type: 'inline', content: cleanLatex(match[2]) })
      }

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) })
    }

    // If no math found, return with bold text processing
    if (parts.length === 0) {
      return renderBoldText(text)
    }

    // Render all parts
    return (
      <>
        {parts.map((part, index) => {
          if (part.type === 'block') {
            try {
              return (
                <div key={index} className="my-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg overflow-x-auto">
                  <BlockMath math={part.content} />
                </div>
              )
            } catch (e) {
              console.error('BlockMath render error:', e, 'Content:', part.content)
              return (
                <div key={index} className="my-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-sm">
                  Error rendering: $${part.content}$$
                </div>
              )
            }
          } else if (part.type === 'inline') {
            try {
              return <InlineMath key={index} math={part.content} />
            } catch (e) {
              console.error('InlineMath render error:', e, 'Content:', part.content)
              return <span key={index} className="text-red-600 dark:text-red-400">${part.content}$</span>
            }
          } else {
            return <span key={index}>{renderBoldText(part.content)}</span>
          }
        })}
      </>
    )
  }

  const sections = parseContent(content)

  return (
    <div className="relative group">
      <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
        <button
          onClick={handlePlayAudio}
          disabled={isPlayingAudio}
          className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Play as audio"
        >
          {isPlayingAudio ? (
            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          ) : (
            <Volume2 className="h-4 w-4 text-blue-600" />
          )}
        </button>
        <button
          onClick={copyToClipboard}
          className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
          title="Copy to clipboard"
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
        </button>
      </div>

      <div className="space-y-4 pr-24">
        {sections.map((section, idx) => {
          switch (section.type) {
            case 'h1':
              return (
                <h1 key={idx} className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-8 mb-4 pb-2 border-b-2 border-blue-200 dark:border-blue-800">
                  {renderTextWithLatex(section.content)}
                </h1>
              )

            case 'h2':
              return (
                <h2 key={idx} className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-3">
                  {renderTextWithLatex(section.content)}
                </h2>
              )
             case 'h3':
              return (
                <h3 key={idx} className="text-xl font-semibold text-blue-600 dark:text-blue-400 mt-5 mb-2">
                  {renderTextWithLatex(section.content)}
                </h3>
              )
            case 'divider':
              return <hr key={idx} className="my-6 border-t-2 border-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800" />
            case 'list':
              return (
                <ul key={idx} className="space-y-2 ml-6">
                  {section.content.map((item, i) => {
                    const itemText = typeof item === 'string' ? item : (item?.text || String(item))
                    return (
                      <li key={i} className="text-base text-gray-700 dark:text-gray-300 leading-relaxed flex items-start group">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mr-3 mt-0.5 group-hover:scale-110 transition-transform">
                          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></span>
                        </span>
                        <span className="flex-1">{renderTextWithLatex(itemText)}</span>
                      </li>
                    )
                  })}
                </ul>
              )
            case 'text':
              return (
                <div key={idx} className="space-y-2">
                  {section.content.map((line, i) => (
                    <div key={i} className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                      {renderTextWithLatex(line)}
                    </div>
                  ))}
                </div>
              )
                       
            default:
              return null
          }
        })}
      </div>
    </div>
  )
}

// Add this NEW component after MarkdownResponse and before AITutor
const ChatHistoryItem = ({ conversation, onSelect, onRename, onDelete, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(conversation.title);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRename = async (e) => {
    e.stopPropagation();
    if (newTitle.trim() && newTitle !== conversation.title) {
      await onRename(conversation.id, newTitle);
    }
    setIsRenaming(false);
    setIsMenuOpen(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      await onDelete(conversation.id);
    }
    setIsMenuOpen(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative p-4 rounded-xl cursor-pointer transition-all ${
        isActive
          ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-300 dark:border-blue-700'
          : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700'
      }`}
      onClick={() => onSelect(conversation.id)}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${
          isActive
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}>
          <MessageSquare className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename(e);
                  if (e.key === 'Escape') setIsRenaming(false);
                }}
              />
              <button
                onClick={handleRename}
                className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsRenaming(false)}
                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate pr-8">
                {conversation.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                {conversation.last_message || 'No messages'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-400">
                  {conversation.message_count} messages
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-400">
                  {formatDate(conversation.last_message_at)}
                </span>
              </div>
            </>
          )}
        </div>

        {(isHovered || isMenuOpen) && !isRenaming && (
          <div className="absolute right-3 top-3" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-1.5 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRenaming(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Rename
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const AITutor = () => {
  const API_BASE_URL = import.meta.env?.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/api`
    : 'http://localhost:4000/api'

  const SOCKET_URL = import.meta.env?.VITE_BACKEND_URL || 'http://localhost:4000'

  const getStudentId = () => {
    const studentData = localStorage.getItem('student')
    if (studentData) {
      try {
        const parsed = JSON.parse(studentData)
        return parsed.id || parsed.student_id || null
      } catch (e) {
        return studentData
      }
    }
    return localStorage.getItem('student_id') || localStorage.getItem('user_id') || null
  }

  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [recentScans, setRecentScans] = useState([])
  const [stats, setStats] = useState({ total_scans: 0, this_month: 0, success_rate: 0 })
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [viewingScan, setViewingScan] = useState(null)
  const [showUploadedFile, setShowUploadedFile] = useState(false)
  const [processingScans, setProcessingScans] = useState(new Set())
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('chat') // 'chat', 'history', 'stats'
  // Add new state for delete/rename loading
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  const [message, setMessage] = useState("")
 const [messages, setMessages] = useState([]) // Start with empty messages

  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [viewMode, setViewMode] = useState('chat')

  const [filePreview, setFilePreview] = useState(null)
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const audioRef = useRef(null)

  const [socket, setSocket] = useState(null)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentChatId, setCurrentChatId] = useState(null)
  const [processingStatus, setProcessingStatus] = useState(null)

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected:', newSocket.id)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason)
    })

    newSocket.on('error', (error) => {
      console.error('WebSocket error:', error)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [SOCKET_URL])

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio()
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  useEffect(() => {
    console.log('📊 Messages updated:', {
      messageCount: messages.length,
      lastMessage: messages[messages.length - 1],
      streamingMessageLength: streamingMessage?.length
    })
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamingMessage])

  //  useEffect(() => {
  //   const STUDENT_ID = getStudentId()
  //   if (STUDENT_ID) {
  //     loadConversations().then(() => {
  //       // After loading conversations, if there are any and no current conversation is selected,
  //       // automatically select the most recent one
  //       if (conversations.length > 0 && !currentConversationId) {
  //         setCurrentConversationId(conversations[0].id);
  //       }
  //     });
  //     loadScanHistory()
  //     loadStats()
  //   }
  // }, [])


 useEffect(() => {
    loadConversations()
    loadScanHistory()
    loadStats()
  }, [])

  useEffect(() => {
    if (currentConversationId) {
      loadConversationMessages(currentConversationId)
    }
  }, [currentConversationId])

const loadConversations = async () => {
    const STUDENT_ID = getStudentId()
    if (!STUDENT_ID) return []

    try {
      const response = await axios.get(`${API_BASE_URL}/chat/conversations/${STUDENT_ID}`)
      if (response.data.success) {
        const convs = response.data.data.conversations
        setConversations(convs)
        
        // Auto-select blank conversation if none is selected
        if (!currentConversationId) {
          const blankConv = convs.find(conv => conv.message_count === 0)
          if (blankConv) {
            setCurrentConversationId(blankConv.id)
            console.log(`🔄 Auto-selected blank conversation: ${blankConv.id}`)
          }
        }
        
        return convs
      }
      return []
    } catch (error) {
      console.error('Error loading conversations:', error)
      return []
    }
  }

  const loadConversationMessages = async (conversationId) => {
    if (!conversationId) {
      // If no conversation ID, show welcome screen
      setMessages([])
      return
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/chat/conversation/${conversationId}/messages`)
      if (response.data.success) {
        const msgs = response.data.data.messages
        if (msgs.length === 0) {
          // Empty conversation - show welcome screen
          setMessages([])
        } else {
          const formattedMessages = []
          msgs.forEach(msg => {
            formattedMessages.push({
              role: "user",
              content: msg.user_message,
              file: msg.file_url ? {
                name: msg.file_name,
                type: msg.file_type,
                url: msg.file_url
              } : null
            })
            if (msg.ai_response) {
              formattedMessages.push({
                role: "assistant",
                content: msg.ai_response
              })
            } else if (msg.processing_status === 'processing') {
              // Add a processing message placeholder for messages that are still being processed
              formattedMessages.push({
                role: "assistant",
                content: "",
                isProcessing: true,
                chatId: msg.id
              })
            }
          })
          
          // Only update messages if we don't have any processing messages locally
          // This prevents overwriting the UI state during active streaming
          setMessages(prev => {
            const hasProcessing = prev.some(m => m.isProcessing)
            if (hasProcessing) {
              console.log('🚫 Skipping message reload - processing in progress')
              return prev
            }
            console.log('✅ Loading messages from backend:', formattedMessages.length)
            return formattedMessages
          })
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      setMessages([])
    }
  }

  const loadScanHistory = async () => {
    const STUDENT_ID = getStudentId()
    if (!STUDENT_ID) return

    try {
      const response = await axios.get(`${API_BASE_URL}/scans/history/${STUDENT_ID}?limit=10`)
      if (response.data.success) {
        setRecentScans(response.data.data.scans)
      }
    } catch (error) {
      console.error('Error loading scan history:', error)
    }
  }

  const loadStats = async () => {
    const STUDENT_ID = getStudentId()
    if (!STUDENT_ID) return

    try {
      const response = await axios.get(`${API_BASE_URL}/scans/stats/${STUDENT_ID}`)
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  // Auto-refresh conversations when History tab is active
  useEffect(() => {
    if (activeTab === 'history') {
      loadConversations()
    }
  }, [activeTab])

  // Periodic refresh of conversations when on history tab
  useEffect(() => {
    let intervalId
    
    if (activeTab === 'history') {
      // Refresh every 5 seconds when on history tab
      intervalId = setInterval(() => {
        loadConversations()
      }, 5000)
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [activeTab])

const createNewConversation = async () => {
    const STUDENT_ID = getStudentId()
    if (!STUDENT_ID) {
      alert('Student ID not found. Please log in again.')
      return null
    }

    // First check if there's already a blank conversation
    const blankConv = conversations.find(conv => conv.message_count === 0)
    if (blankConv) {
      // Just switch to the blank conversation instead of creating new
      setCurrentConversationId(blankConv.id)
      setMessages([])
      setActiveTab('chat')
      console.log(`♻️ Switched to existing blank conversation: ${blankConv.id}`)
      return blankConv.id
    }

    // Only create new if no blank conversation exists
    try {
      const response = await axios.post(`${API_BASE_URL}/chat/conversation/new`, {
        student_id: STUDENT_ID,
        title: 'New Chat',
      })

      if (response.data.success) {
        const newConvId = response.data.data.conversation_id
        setCurrentConversationId(newConvId)
        setMessages([])
        setActiveTab('chat')
        loadConversations()
        console.log(`✨ Created new conversation: ${newConvId}`)
        return newConvId
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      return null
    }
  }

  const setupChatListeners = (chatId) => {
    if (!socket) return

    const roomName = `chat_${chatId}`
    console.log(`🔗 Joining room: ${roomName}`)

    socket.emit('join_chat', { chat_id: chatId })

    socket.off('processing_start')
    socket.off('conversion_start')
    socket.off('conversion_complete')
    socket.off('page_start')
    socket.off('page_header')
    socket.off('page_chunk')
    socket.off('page_complete')
    socket.off('page_error')
    socket.off('page_skip')
    socket.off('stream_start')
    socket.off('stream_chunk')
    socket.off('stream_complete')
    socket.off('processing_complete')
    socket.off('processing_error')
    socket.off('stream_error')

    socket.on('processing_start', (data) => {
      console.log('🚀 Processing started:', data)
      setProcessingStatus({
        type: 'start',
        message: 'Starting to process your request...'
      })
    })

    socket.on('conversion_start', (data) => {
      console.log('📄 PDF conversion started:', data)
      setProcessingStatus({
        type: 'conversion',
        message: data.message
      })
    })

    socket.on('conversion_complete', (data) => {
      console.log('✅ PDF conversion complete:', data)
      setProcessingStatus({
        type: 'conversion_done',
        message: data.message,
        totalPages: data.totalPages
      })
    })

    socket.on('page_start', (data) => {
      console.log(`📄 Page ${data.pageNumber} started`)
      setProcessingStatus({
        type: 'page_start',
        pageNumber: data.pageNumber,
        totalPages: data.totalPages,
        message: `Processing page ${data.pageNumber} of ${data.totalPages}...`
      })
    })

    socket.on('page_header', (data) => {
      setStreamingMessage(prev => prev + data.header)
    })

    socket.on('page_chunk', (data) => {
      console.log(`📦 Chunk received for page ${data.pageNumber}`)
      setStreamingMessage(prev => prev + data.chunk)
      setIsStreaming(true)
    })

    socket.on('page_complete', (data) => {
      console.log(`✅ Page ${data.pageNumber} complete`)
      setProcessingStatus({
        type: 'page_done',
        pageNumber: data.pageNumber,
        message: `Page ${data.pageNumber} completed!`
      })
    })

    socket.on('page_error', (data) => {
      console.error(`❌ Error on page ${data.pageNumber}:`, data.error)
      setStreamingMessage(prev => prev + `\n\n❌ Error processing page ${data.pageNumber}: ${data.error}\n\n`)
    })

    socket.on('page_skip', (data) => {
      console.warn(`⚠️ Skipped page ${data.pageNumber}`)
      setStreamingMessage(prev => prev + `\n\n⚠️ Skipped page ${data.pageNumber}: ${data.error}\n\n`)
    })

    socket.on('stream_start', (data) => {
      console.log('🚀 Text streaming started')
      setIsStreaming(true)
      setStreamingMessage('')
    })

    socket.on('stream_chunk', (data) => {
      console.log('📝 Stream chunk received:', data.chunk)
      setStreamingMessage(prev => prev + data.chunk)
      setIsStreaming(true)
    })

  socket.on('stream_complete', (data) => {
      console.log('✅ Streaming complete', data)
      console.log('📦 Response data:', { 
        response: data.response?.substring(0, 100), 
        hasResponse: !!data.response,
        responseLength: data.response?.length 
      })
      
      setIsStreaming(false)
      setProcessingStatus(null)
      setIsUploading(false)

      // Update the last processing assistant message with final response
      setMessages(prev => {
        console.log('🔍 Current messages before update:', prev.length)
        const updatedMessages = [...prev]
        let found = false
        
        // Find the last assistant message that's processing
        for (let i = updatedMessages.length - 1; i >= 0; i--) {
          if (updatedMessages[i].role === 'assistant' && updatedMessages[i].isProcessing) {
            console.log(`✏️ Updating message at index ${i} with content length:`, data.response?.length)
            updatedMessages[i] = {
              role: 'assistant',
              content: data.response,
              isProcessing: false,
              chatId: updatedMessages[i].chatId
            }
            found = true
            break
          }
        }
        
        if (!found) {
          console.warn('⚠️ No processing message found to update!')
        }
        
        console.log('🔍 Messages after update:', updatedMessages.length, 'Last message:', updatedMessages[updatedMessages.length - 1])
        return updatedMessages
      })
      
      // Clear streaming message AFTER updating the main message
      setTimeout(() => {
        setStreamingMessage('')
      }, 200)
      
      // Refresh conversations to update history (delayed to ensure message state is updated first)
      setTimeout(() => {
        loadConversations()
      }, 500)
    })

    socket.on('processing_complete', (data) => {
      console.log('🎉 Processing fully complete:', data)
      setIsStreaming(false)
      setStreamingMessage('')
      setProcessingStatus(null)
      setIsUploading(false)

      setMessages(prev => prev.map(msg =>
        msg.chatId === data.chatId || msg.chatId === chatId
          ? { ...msg, role: 'assistant', content: data.response, isProcessing: false }
          : msg
      ))

      loadConversations()
      loadScanHistory()
      loadStats()
    })

    socket.on('processing_error', (data) => {
      console.error('❌ Processing error:', data.error)
      setIsStreaming(false)
      setStreamingMessage('')
      setProcessingStatus(null)
      setIsUploading(false)

      setMessages(prev => prev.map(msg =>
        msg.chatId === data.chatId
          ? { ...msg, role: 'assistant', content: `Error: ${data.error}`, isProcessing: false, isError: true }
          : msg
      ))
    })

    socket.on('stream_error', (data) => {
      console.error('❌ Stream error:', data.error)
      setIsStreaming(false)
      setStreamingMessage('')
      setProcessingStatus(null)
      setIsUploading(false)
    })
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)

      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => setFilePreview(e.target.result)
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }


  const handlePlayAudio = async (text, messageId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat/tts`, {
        text: text
      })

      if (response.data.success) {
        const { audio, mimeType } = response.data
        
        // Convert base64 to blob
        const byteCharacters = atob(audio)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: mimeType })
        const audioUrl = URL.createObjectURL(blob)

        // Play audio
        if (audioRef.current) {
          audioRef.current.src = audioUrl
          await audioRef.current.play()
          
          // Clean up URL after playing
          audioRef.current.onended = () => {
            URL.revokeObjectURL(audioUrl)
          }
        }
      }
    } catch (error) {
      console.error('Failed to play audio:', error)
      alert('Failed to generate audio. Please try again.')
    }
  }

const handleSend = async () => {
    if (!message.trim() && !selectedFile) return

    const STUDENT_ID = getStudentId()
    if (!STUDENT_ID) {
      alert('Student ID not found. Please log in again.')
      return
    }

    setIsUploading(true)

    try {
      // Store values before clearing
      const currentMessage = message
      const currentFile = selectedFile
      const currentFilePreview = filePreview
      
      // Add user message to UI IMMEDIATELY for instant feedback
      const tempChatId = `temp_${Date.now()}`
      setMessages(prev => [
        ...prev,
        {
          role: "user",
          content: currentMessage || (currentFile ? `📎 ${currentFile.name}` : ''),
          file: currentFile ? {
            name: currentFile.name,
            type: currentFile.type,
            preview: currentFilePreview
          } : null
        },
        {
          role: "assistant",
          content: "",
          isProcessing: true,
          chatId: tempChatId
        }
      ])
      
      // Clear input immediately after adding to messages
      setMessage("")
      setSelectedFile(null)
      setFilePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Prepare form data - backend will handle conversation creation/reuse
      const formData = new FormData()
      formData.append('student_id', STUDENT_ID)
      
      // Only include conversation_id if we have one
      if (currentConversationId) {
        formData.append('conversation_id', currentConversationId)
      }
      
      formData.append('message', currentMessage || '')

      if (currentFile) {
        formData.append('file', currentFile)
      }

      // Send to backend
      const response = await axios.post(`${API_BASE_URL}/chat/message`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.success) {
        const { chat_id, conversation_id } = response.data.data
        
        // Update conversation ID if backend created/found one
        if (conversation_id !== currentConversationId) {
          setCurrentConversationId(conversation_id)
          console.log(`✅ Using conversation: ${conversation_id}`)
        }

        // Update the assistant message with the real chat_id
        setMessages(prev => prev.map(msg => 
          msg.chatId === tempChatId ? { ...msg, chatId: chat_id } : msg
        ))

        setCurrentChatId(chat_id)
        setStreamingMessage('')
        setIsStreaming(true)

        setupChatListeners(chat_id)
        
        // Refresh conversations
        loadConversations()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setIsUploading(false)
      setIsStreaming(false)

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          isError: true
        }
      ])
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
 



  // Add delete conversation function
  const deleteConversation = async (conversationId) => {
    try {
      setIsDeleting(true);
      const response = await axios.delete(`${API_BASE_URL}/chat/conversation/${conversationId}`, {
        data: { student_id: getStudentId() }
      });
      
      if (response.data.success) {
        // Remove from conversations list
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        
        // If current conversation is deleted, clear it
        // if (currentConversationId === conversationId) {
        //   setCurrentConversationId(null);
        //   setMessages([
        //     {
        //       role: "assistant",
        //       content: "🌟 Hello! I'm your AI tutor. I can help you with any subject. Ask me questions or upload your homework for detailed explanations!",
        //     },
        //   ]);
        // }
        
        // Show success message (optional)
        console.log('Conversation deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Add rename conversation function
  const renameConversation = async (conversationId, newTitle) => {
    try {
      setIsRenaming(true);
      const response = await axios.put(`${API_BASE_URL}/chat/conversation/${conversationId}`, {
        student_id: getStudentId(),
        title: newTitle
      });
      
      if (response.data.success) {
        // Update conversations list
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, title: newTitle }
            : conv
        ));
        
        console.log('Conversation renamed successfully');
      }
    } catch (error) {
      console.error('Error renaming conversation:', error);
      alert('Failed to rename conversation. Please try again.');
    } finally {
      setIsRenaming(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour ago`
    if (diffDays < 7) return `${diffDays} day ago`
    return date.toLocaleDateString()
  }

  return (
  <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 min-h-screen">
    {/* Modern Header with proper styling */}
    <header className="sticky top-8 sm:top-4 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo and Brand - Responsive */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
              <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                AI Tutor
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden xs:block truncate">
                Your personal learning assistant
              </p>
            </div>
          </div>

          {/* Header Actions - Responsive */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* New Chat Button - Hidden on smallest screens */}
            <button
              onClick={createNewConversation}
              className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-md group"
            >
              <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
              <span className="text-xs sm:text-sm font-medium">New Chat</span>
            </button>

            {/* Tab Navigation - Responsive */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1 sm:gap-2 ${
                  activeTab === 'chat'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Chat</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1 sm:gap-2 ${
                  activeTab === 'history'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">History</span>
              </button>
            </div>

            {/* Settings Button */}
            <button className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-6">
      <div className="flex gap-4 sm:gap-6">
        {/* Main Content Area */}
        <main className="flex-1 w-full ">
          {activeTab === 'chat' && (
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden" 
                 style={{ height: 'calc(100dvh - 180px)' }}>
              
              {/* Enhanced Chat Header - Responsive */}
              <div className="px-3 sm:px-6 mt-5 sm:mt-0 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-lg shadow-md flex-shrink-0">
                      <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                        AI Tutor Assistant  
                      </h2>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-green-500"></span>
                        </span>
                        <span className="hidden xs:inline">Online</span>
                        <span className="hidden xs:inline mx-1">•</span>
                        <span className="hidden sm:inline">Ready to help</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 sm:gap-2">
                    {/* Current Chat Actions - Responsive */}
                    {currentConversationId && (
                      <>
                        <button
                          onClick={() => {
                            const conv = conversations.find(c => c.id === currentConversationId);
                            if (conv) {
                              const newTitle = prompt('Enter new chat name:', conv.title);
                              if (newTitle && newTitle.trim()) {
                                renameConversation(currentConversationId, newTitle.trim());
                              }
                            }
                          }}
                          className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Rename chat"
                        >
                          <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this conversation?')) {
                              deleteConversation(currentConversationId);
                            }
                          }}
                          className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                          title="Delete chat"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                        <div className="w-px h-4 sm:h-6 bg-gray-300 dark:bg-gray-700 mx-0.5 sm:mx-1"></div>
                      </>
                    )}
                    
                    {/* New Chat Button - Mobile */}
                    <button
                      onClick={createNewConversation}
                      className="sm:hidden p-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                      title="New Chat"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Area - Responsive */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 custom-scrollbar"
              >
                {messages.length === 0 ? (
                  <div className="text-center py-0 sm:py-2 md:py-12">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                      <Bot className="h-16 w-16 sm:h-20 sm:w-20 mx-auto text-gray-400 mb-4 relative z-10" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 px-4">
                      Welcome to AI Tutor! 👋
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto px-4">
                      I'm here to help you learn. Ask me questions, upload your homework, or get explanations for any topic!
                    </p>
                    <div className="grid grid-cols-1 xs:grid-cols-2 hidden sm:grid gap-2 sm:gap-3 max-w-lg mx-auto px-4">
                      <button className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-xl hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 text-left group">
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                        <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Upload Homework</h4>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">Get step-by-step solutions</p>
                      </button>
                      <button className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-xl hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 text-left group">
                        <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                        <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Ask Questions</h4>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">Get detailed explanations</p>
                      </button>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn gap-2 sm:gap-3`}>
                      {msg.role === 'assistant' && (
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                            <Bot className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-white" />
                          </div>
                        </div>
                      )}

                      <div className={`max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                        <div className={`rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-sm'
                            : 'bg-gray-100 dark:bg-gray-800 rounded-tl-sm border border-gray-200 dark:border-gray-700'
                        }`}>
                          {msg.role === 'user' ? (
                            <div>
                              <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                              {msg.file && (
                                <div className="mt-2 flex items-center gap-2 text-[10px] sm:text-xs bg-white/20 rounded-lg p-1.5 sm:p-2">
                                  {msg.file.type?.includes('pdf') ? <FileText className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" /> : <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />}
                                  <span className="truncate">{msg.file.name}</span>
                                </div>
                              )}
                              {msg.file?.preview && (
                                <img src={msg.file.preview} alt="Preview" className="mt-2 max-w-full rounded-lg max-h-24 sm:max-h-32" />
                              )}
                            </div>
                          ) : (
                            <div>
                              {msg.isProcessing ? (
                                <div>
                                  {processingStatus && (
                                    <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 rounded-lg border border-blue-200 dark:border-gray-600">
                                      <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                        <span className="truncate">{processingStatus.message}</span>
                                      </div>
                                      {processingStatus.totalPages && (
                                        <div className="mt-2">
                                          <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                              <div
                                                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-300"
                                                style={{ width: `${(processingStatus.pageNumber / processingStatus.totalPages) * 100}%` }}
                                              ></div>
                                            </div>
                                            <span className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400">
                                              {processingStatus.pageNumber}/{processingStatus.totalPages}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {(idx === messages.length - 1 && streamingMessage) && (
                                    <div className="text-sm sm:text-base text-gray-900 dark:text-gray-100">
                                      <MarkdownResponse 
                                        content={streamingMessage} 
                                        messageId={msg.id || idx}
                                        onPlayAudio={handlePlayAudio}
                                      />
                                    </div>
                                  )}
                                  {msg.content && !streamingMessage && (
                                    <div className="text-sm sm:text-base text-gray-900 dark:text-gray-100">
                                      <MarkdownResponse 
                                        content={msg.content} 
                                        messageId={msg.id || idx}
                                        onPlayAudio={handlePlayAudio}
                                      />
                                    </div>
                                  )}
                                  {isStreaming && idx === messages.length - 1 && !streamingMessage && (
                                    <div className="flex items-center gap-2 mt-2 sm:mt-3 text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                      <span>AI is thinking...</span>
                                    </div>
                                  )}
                                </div>
                              ) : msg.isError ? (
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                  <span className="text-xs sm:text-sm">{msg.content}</span>
                                </div>
                              ) : msg.content ? (
                                <div className="text-sm sm:text-base text-gray-900 dark:text-gray-100">
                                  <MarkdownResponse 
                                    content={msg.content} 
                                    messageId={msg.id || idx}
                                    onPlayAudio={handlePlayAudio}
                                  />
                                </div>
                              ) : (
                                <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm italic">
                                  No response
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className={`text-[10px] sm:text-xs text-gray-500 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                          {formatTime(Date.now())}
                        </div>
                      </div>

                      {msg.role === 'user' && (
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center">
                            <GraduationCap className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area - Responsive */}
              <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                {selectedFile && (
                  <div className="mb-2 sm:mb-3 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-blue-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 min-w-0">
                      {selectedFile.type.includes('pdf') ?
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" /> :
                        <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                      }
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">{selectedFile.name}</span>
                      <span className="text-[10px] sm:text-xs text-gray-500 flex-shrink-0">
                        ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="text-gray-500 hover:text-red-600 transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-1.5 sm:gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className='flex items-center w-full gap-2 '>
                  <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 group"
                      title="Attach file"
                    >
                      <Paperclip className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-45 transition-transform" />
                    </button>
                    <span className="text-[8px] text-gray-400 dark:text-gray-500 whitespace-nowrap">15p · 10MB</span>
                  </div>

                  <div className="flex-1 relative min-w-0">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={selectedFile ? "Add a message..." : "Ask a question..."}
                      disabled={isUploading}
                      className="w-full resize-none px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg sm:rounded-xl border-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 max-h-32 pr-10 sm:pr-12 text-xs sm:text-sm"
                      rows={1}
                      style={{ minHeight: '36px', maxHeight: '120px' }}
                    />
                    {message.trim() && (
                      <div className="absolute right-2 sm:right-3 bottom-1.5 sm:bottom-3 text-[8px] sm:text-xs text-gray-400">
                        {message.length}/500
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={isUploading || (!message.trim() && !selectedFile)}
                    className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md group flex-shrink-0"
                    title="Send message"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    )}
                  </button>
                  </div>
                </div>

                                                         
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Chat History
                </h2>
                <button
                  onClick={createNewConversation}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-md text-sm sm:text-base"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Chat</span>
                </button>
              </div>
              
              <div className="space-y-2 sm:space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar pr-1 sm:pr-2">
                {conversations.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-3xl opacity-20"></div>
                      <History className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-4 relative z-10" />
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">No chat history yet</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">Start a conversation to see it here!</p>
                    <button
                      onClick={createNewConversation}
                      className="mt-4 px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all text-sm sm:text-base"
                    >
                      Start New Chat
                    </button>
                  </div>
                ) : (
                  conversations.map(conv => (
                    <ChatHistoryItem
                      key={conv.id}
                      conversation={conv}
                      onSelect={(id) => {
                        setCurrentConversationId(id);
                        setActiveTab('chat');
                      }}
                      onRename={renameConversation}
                      onDelete={deleteConversation}
                      isActive={currentConversationId === conv.id}
                    />
                  ))
                )}
              </div>

              {conversations.length > 0 && (
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center">
                    {conversations.length} total conversations
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>

    <style jsx>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      @media (min-width: 640px) {
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e0;
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #a0aec0;
      }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #4a5568;
      }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #718096;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
      }

      /* Custom breakpoint for extra small devices */
      @media (min-width: 480px) {
        .xs\\:inline {
          display: inline;
        }
        .xs\\:block {
          display: block;
        }
        .xs\\:flex {
          display: flex;
        }
        .xs\\:grid-cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .xs\\:flex-row {
          flex-direction: row;
        }
        .xs\\:items-center {
          align-items: center;
        }
      }

      /* Prevent text overflow */
      .truncate {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .break-words {
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
    `}</style>
  </div>
)
}

export default AITutor