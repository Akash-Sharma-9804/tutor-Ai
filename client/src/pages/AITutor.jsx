import React, { useState, useEffect, useRef } from 'react'
import {
  FileText, ImageIcon, AlertCircle, Loader2, Copy, Check, Plus, Bot, Send,
  Paperclip, X, MessageSquare, History, Sparkles, BookOpen, GraduationCap,
  Brain, Zap, MoreVertical, Edit2, Trash2, Volume2, Search, PenSquare,Menu
} from "lucide-react"
import axios from 'axios'
import io from 'socket.io-client'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

/* ─────────────────────────────────────────────
   MARKDOWN RENDERER
───────────────────────────────────────────── */
const MarkdownResponse = ({ content, messageId, onPlayAudio }) => {
  const [copied, setCopied] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(typeof content === 'string' ? content : String(content || ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePlayAudio = async () => {
    if (isPlayingAudio) return
    setIsPlayingAudio(true)
    try { await onPlayAudio(content, messageId) } finally { setIsPlayingAudio(false) }
  }

  const parseContent = (text) => {
    if (!text || typeof text !== 'string') return []
    const sections = [], lines = text.split('\n')
    let cur = { type: 'text', content: [] }
    lines.forEach(line => {
      if (line.startsWith('### ')) {
        if (cur.content.length) { sections.push(cur); cur = { type: 'text', content: [] } }
        sections.push({ type: 'h3', content: line.slice(4).trim() })
      } else if (line.startsWith('## ')) {
        if (cur.content.length) { sections.push(cur); cur = { type: 'text', content: [] } }
        sections.push({ type: 'h2', content: line.slice(3).trim() })
      } else if (line.startsWith('# ')) {
        if (cur.content.length) { sections.push(cur); cur = { type: 'text', content: [] } }
        sections.push({ type: 'h1', content: line.slice(2).trim() })
      } else if (line.trim().startsWith('*   ') || line.trim().startsWith('- ')) {
        if (cur.type !== 'list') { if (cur.content.length) sections.push(cur); cur = { type: 'list', content: [] } }
        cur.content.push(line.trim().replace(/^(\*   |- )/, ''))
      } else if (line.trim() === '---') {
        if (cur.content.length) { sections.push(cur); cur = { type: 'text', content: [] } }
        sections.push({ type: 'divider' })
      } else if (line.trim()) {
        cur.content.push(line)
      } else if (cur.content.length) {
        sections.push(cur); cur = { type: 'text', content: [] }
      }
    })
    if (cur.content.length) sections.push(cur)
    return sections
  }

  const renderBold = (text) => {
    if (!text || typeof text !== 'string') return text
    return text.split(/(\*\*[^*]+\*\*)/).map((p, i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i} className="font-semibold text-violet-600 dark:text-violet-400">{p.slice(2, -2)}</strong>
        : p
    )
  }

  const cleanLatex = (l) => l ? l.trim().replace(/\\\\/g, '\\').replace(/\*\*/g, '') : l

  const renderWithLatex = (text) => {
    if (!text || typeof text !== 'string') return text
    const parts = [], regex = /\$\$([^$]+)\$\$|\$([^$\n]+)\$/g
    let last = 0, m
    while ((m = regex.exec(text)) !== null) {
      if (m.index > last) parts.push({ type: 'text', content: text.substring(last, m.index) })
      if (m[1] !== undefined) parts.push({ type: 'block', content: cleanLatex(m[1]) })
      else if (m[2] !== undefined) parts.push({ type: 'inline', content: cleanLatex(m[2]) })
      last = m.index + m[0].length
    }
    if (last < text.length) parts.push({ type: 'text', content: text.substring(last) })
    if (!parts.length) return renderBold(text)
    return <>{parts.map((p, i) => {
      if (p.type === 'block') try { return <div key={i} className="my-3 p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl overflow-x-auto border border-violet-100 dark:border-violet-800"><BlockMath math={p.content} /></div> } catch { return <span key={i} className="text-red-400 text-xs">[math error]</span> }
      if (p.type === 'inline') try { return <InlineMath key={i} math={p.content} /> } catch { return <span key={i} className="text-red-400 text-xs">[math error]</span> }
      return <span key={i}>{renderBold(p.content)}</span>
    })}</>
  }

  return (
    <div className="relative group/msg">
      <div className="absolute -top-2 right-0 flex gap-1 opacity-0 group-hover/msg:opacity-100 transition-opacity z-10">
        <button onClick={handlePlayAudio} disabled={isPlayingAudio}
          className="p-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm hover:border-violet-300 transition-colors disabled:opacity-50" title="Listen">
          {isPlayingAudio ? <Loader2 className="h-3 w-3 text-violet-500 animate-spin" /> : <Volume2 className="h-3 w-3 text-gray-400" />}
        </button>
        <button onClick={copyToClipboard}
          className="p-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm hover:border-violet-300 transition-colors" title="Copy">
          {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-gray-400" />}
        </button>
      </div>
      <div className="space-y-2.5 pr-14">
        {parseContent(content).map((s, i) => {
          switch (s.type) {
            case 'h1': return <h1 key={i} className="text-lg font-bold text-gray-900 dark:text-white mt-4 mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">{renderWithLatex(s.content)}</h1>
            case 'h2': return <h2 key={i} className="text-base font-semibold text-gray-900 dark:text-white mt-3 mb-1.5">{renderWithLatex(s.content)}</h2>
            case 'h3': return <h3 key={i} className="text-sm font-semibold text-violet-600 dark:text-violet-400 mt-2.5 mb-1">{renderWithLatex(s.content)}</h3>
            case 'divider': return <hr key={i} className="my-3 border-gray-200 dark:border-gray-700" />
            case 'list': return (
              <ul key={i} className="space-y-1.5 ml-1">
                {s.content.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    <span className="mt-2 flex-shrink-0 w-1 h-1 rounded-full bg-violet-400"></span>
                    <span>{renderWithLatex(typeof item === 'string' ? item : String(item))}</span>
                  </li>
                ))}
              </ul>
            )
            case 'text': return (
              <div key={i} className="space-y-0.5">
                {s.content.map((line, j) => (
                  <div key={j} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{renderWithLatex(line)}</div>
                ))}
              </div>
            )
            default: return null
          }
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   HISTORY ITEM
───────────────────────────────────────────── */
const HistoryItem = ({ conv, onSelect, onRename, onDelete, onDeleteRequest, onRenameRequest, isActive }) => {
  const [menu, setMenu] = useState(false)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(conv.title)
  const ref = useRef(null)

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenu(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const age = (d) => {
    const ms = Date.now() - new Date(d)
    const m = Math.floor(ms / 6e4), h = Math.floor(ms / 36e5), day = Math.floor(ms / 864e5)
    if (m < 1) return 'now'; if (m < 60) return `${m}m`; if (h < 24) return `${h}h`
    if (day < 7) return `${day}d`; return new Date(d).toLocaleDateString()
  }

  return (
    <div
      onClick={() => !editing && onSelect(conv.id)}
      className={`group relative flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${isActive
          ? 'bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800/60 border border-transparent'
        }`}
    >
      <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center ${isActive ? 'bg-violet-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }`}>
        <MessageSquare className="h-3 w-3" />
      </div>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <input value={title} onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { onRename(conv.id, title); setEditing(false) } if (e.key === 'Escape') setEditing(false) }}
              className="flex-1 px-2 py-0.5 text-xs bg-white dark:bg-gray-700 border border-violet-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-gray-900 dark:text-white"
              autoFocus />
            <button onClick={e => { e.stopPropagation(); onRename(conv.id, title); setEditing(false) }} className="text-emerald-500 p-0.5"><Check className="h-3.5 w-3.5" /></button>
            <button onClick={e => { e.stopPropagation(); setEditing(false) }} className="text-gray-400 p-0.5"><X className="h-3.5 w-3.5" /></button>
          </div>
        ) : (
          <>
            <p className={`text-xs font-medium truncate pr-5 leading-tight ${isActive ? 'text-violet-700 dark:text-violet-300' : 'text-gray-800 dark:text-gray-200'}`}>{conv.title}</p>
            <p className="text-[10px] text-gray-400 truncate mt-0.5">{conv.last_message || 'No messages yet'}</p>
            <p className="text-[9px] text-gray-300 dark:text-gray-600 mt-0.5">{age(conv.last_message_at)}</p>
          </>
        )}
      </div>

      {!editing && (
        <div className="absolute right-2 top-2" ref={ref}>
          <button onClick={e => { e.stopPropagation(); setMenu(!menu) }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
            <MoreVertical className="h-3 w-3 text-gray-500" />
          </button>
          {menu && (
            <div className="absolute right-0 mt-0.5 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50">
              <button onClick={e => { e.stopPropagation(); onRenameRequest(conv.id, conv.title); setMenu(false) }}
                className="w-full px-3 py-1.5 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                <Edit2 className="h-3 w-3" /> Rename
              </button>
              <button onClick={e => { e.stopPropagation(); onDeleteRequest(conv.id); setMenu(false) }}
                className="w-full px-3 py-1.5 text-left text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const AITutor = () => {
  const API_BASE_URL = import.meta.env?.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/api`
    : 'http://localhost:4000/api'
  const SOCKET_URL = import.meta.env?.VITE_BACKEND_URL || 'http://localhost:4000'

  const getStudentId = () => {
    const d = localStorage.getItem('student')
    if (d) { try { const p = JSON.parse(d); return p.id || p.student_id || null } catch { return d } }
    return localStorage.getItem('student_id') || localStorage.getItem('user_id') || null
  }

  /* ── State ── */
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [socket, setSocket] = useState(null)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [processingStatus, setProcessingStatus] = useState(null)
  const [historySearch, setHistorySearch] = useState('')
  const [showMobileHistory, setShowMobileHistory] = useState(false)
  const [stats, setStats] = useState({ total_scans: 0 })
  const [isDeleting, setIsDeleting] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  // Modal states (replace window.confirm / window.prompt)
  const [deleteModal, setDeleteModal] = useState(null)       // { id } | null
  const [renameModal, setRenameModal] = useState(null)       // { id, title } | null
  const [renameValue, setRenameValue] = useState('')
  // For dynamic desktop left offset (tracks sidebar width)
  const [desktopLeft, setDesktopLeft] = useState(256)
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024)

  /* ── Refs ── */
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const audioRef = useRef(null)
  const textareaRef = useRef(null)

  /* ── Socket ── */
  useEffect(() => {
    const s = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })
    s.on('connect', () => console.log('✅ WS connected'))
    setSocket(s)
    return () => s.close()
  }, [SOCKET_URL])

  /* ── Track viewport & sidebar width ──
     TopBar structure:
       mobile/tablet: h-16 main row + ~40px date row = ~104px total (lg:hidden date row)
       desktop (lg):  h-16 only = 64px

     DashboardLayout sidebar:
       lg expanded : w-64 = 256px
       lg collapsed: w-20 = 80px
       mobile/tablet: hidden (overlay, doesn't affect layout)

     DashboardLayout bottom nav: 64px, hidden at lg
  ── */
  useEffect(() => {
    const getSidebarWidth = () => {
      if (window.innerWidth < 1024) return 0
      // Prefer the reliable data attribute set by DashboardLayout
      const el = document.querySelector('[data-sidebar-width]')
      if (el) {
        const val = parseInt(el.getAttribute('data-sidebar-width'), 10)
        if (!isNaN(val)) return val
      }
      // Fallback: measure the actual rendered width of the first fixed sidebar
      const sidebar = document.querySelector('aside')
      if (sidebar) {
        const w = sidebar.getBoundingClientRect().width
        if (w > 0) return Math.round(w)
      }
      return 256
    }

    const update = () => {
      setIsDesktop(window.innerWidth >= 1024)
      setDesktopLeft(getSidebarWidth())
    }

    update()
    window.addEventListener('resize', update)

    // Poll briefly after mount to catch sidebar render
    let ticks = 0
    const poll = setInterval(() => {
      update()
      ticks++
      if (ticks >= 12) clearInterval(poll) // 12 × 250ms = 3s
    }, 250)

    // Watch for data-sidebar-width attribute changes (set by DashboardLayout on collapse/expand)
    const obs = new MutationObserver(() => {
      if (window.innerWidth >= 1024) {
        const el = document.querySelector('[data-sidebar-width]')
        if (el) {
          const val = parseInt(el.getAttribute('data-sidebar-width'), 10)
          if (!isNaN(val)) setDesktopLeft(val)
        }
      }
    })
    obs.observe(document.body, { attributes: true, attributeFilter: ['data-sidebar-width'], subtree: true })

    return () => {
      window.removeEventListener('resize', update)
      clearInterval(poll)
      obs.disconnect()
    }
  }, [])

  /* ── Audio ── */
  useEffect(() => {
    audioRef.current = new Audio()
    return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' } }
  }, [])

  /* ── Auto scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingMessage])

  /* ── Boot ── */
  useEffect(() => { loadConversations(); loadStats() }, [])
  useEffect(() => { if (currentConversationId) loadMessages(currentConversationId) }, [currentConversationId])

  /* ── Auto resize textarea ── */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [message])

  /* ── Data loading ── */
  const loadConversations = async () => {
    const id = getStudentId(); if (!id) return
    try {
      const r = await axios.get(`${API_BASE_URL}/chat/conversations/${id}`)
      if (r.data.success) {
        const convs = r.data.data.conversations
        setConversations(convs)
        if (!currentConversationId) {
          const blank = convs.find(c => c.message_count === 0)
          if (blank) setCurrentConversationId(blank.id)
        }
      }
    } catch (e) { console.error(e) }
  }

  const loadMessages = async (convId) => {
    if (!convId) { setMessages([]); return }
    try {
      const r = await axios.get(`${API_BASE_URL}/chat/conversation/${convId}/messages`)
      if (r.data.success) {
        const msgs = r.data.data.messages
        if (!msgs.length) { setMessages([]); return }
        const fmt = []
        msgs.forEach(m => {
          fmt.push({ role: 'user', content: m.user_message, file: m.file_url ? { name: m.file_name, type: m.file_type } : null })
          if (m.ai_response) fmt.push({ role: 'assistant', content: m.ai_response })
          else if (m.processing_status === 'processing') fmt.push({ role: 'assistant', content: '', isProcessing: true, chatId: m.id })
        })
        setMessages(prev => { if (prev.some(m => m.isProcessing)) return prev; return fmt })
      }
    } catch { setMessages([]) }
  }

  const loadStats = async () => {
    const id = getStudentId(); if (!id) return
    try { const r = await axios.get(`${API_BASE_URL}/scans/stats/${id}`); if (r.data.success) setStats(r.data.data) } catch { }
  }

  /* ── Conversation management ── */
  const newConversation = async () => {
    const id = getStudentId(); if (!id) return
    const blank = conversations.find(c => c.message_count === 0)
    if (blank) { setCurrentConversationId(blank.id); setMessages([]); setShowMobileHistory(false); return }
    try {
      const r = await axios.post(`${API_BASE_URL}/chat/conversation/new`, { student_id: id, title: 'New Chat' })
      if (r.data.success) {
        setCurrentConversationId(r.data.data.conversation_id)
        setMessages([])
        loadConversations()
        setShowMobileHistory(false)
      }
    } catch (e) { console.error(e) }
  }

  const deleteConv = async (id) => {
    try {
      setIsDeleting(true)
      await axios.delete(`${API_BASE_URL}/chat/conversation/${id}`, { data: { student_id: getStudentId() } })
      setConversations(p => p.filter(c => c.id !== id))
    } catch { } finally { setIsDeleting(false) }
  }

  const renameConv = async (id, title) => {
    try {
      await axios.put(`${API_BASE_URL}/chat/conversation/${id}`, { student_id: getStudentId(), title })
      setConversations(p => p.map(c => c.id === id ? { ...c, title } : c))
    } catch { }
  }

  /* ── Socket listeners ── */
  const setupListeners = (chatId) => {
    if (!socket) return
    socket.emit('join_chat', { chat_id: chatId })
    const evts = ['processing_start', 'conversion_start', 'conversion_complete', 'page_start', 'page_header',
      'page_chunk', 'page_complete', 'page_error', 'page_skip', 'stream_start', 'stream_chunk',
      'stream_complete', 'processing_complete', 'processing_error', 'stream_error']
    evts.forEach(e => socket.off(e))

    socket.on('processing_start', () => setProcessingStatus({ message: 'Processing your request…' }))
    socket.on('conversion_start', d => setProcessingStatus({ message: d.message }))
    socket.on('conversion_complete', d => setProcessingStatus({ message: d.message, totalPages: d.totalPages }))
    socket.on('page_start', d => setProcessingStatus({
      message: `Processing page ${d.pageNumber} of ${d.totalPages}…`,
      pageNumber: d.pageNumber, totalPages: d.totalPages
    }))
    socket.on('page_header', d => setStreamingMessage(p => p + d.header))
    socket.on('page_chunk', d => { setStreamingMessage(p => p + d.chunk); setIsStreaming(true) })
    socket.on('stream_start', () => { setIsStreaming(true); setStreamingMessage('') })
    socket.on('stream_chunk', d => { setStreamingMessage(p => p + d.chunk); setIsStreaming(true) })
    socket.on('stream_complete', d => {
      setIsStreaming(false); setProcessingStatus(null); setIsUploading(false)
      setMessages(prev => {
        const u = [...prev]
        for (let i = u.length - 1; i >= 0; i--) {
          if (u[i].role === 'assistant' && u[i].isProcessing) {
            u[i] = { role: 'assistant', content: d.response, isProcessing: false, chatId: u[i].chatId }
            break
          }
        }
        return u
      })
      setTimeout(() => setStreamingMessage(''), 200)
      setTimeout(() => loadConversations(), 500)
    })
    socket.on('processing_complete', d => {
      setIsStreaming(false); setStreamingMessage(''); setProcessingStatus(null); setIsUploading(false)
      setMessages(prev => prev.map(m => m.chatId === d.chatId ? { ...m, content: d.response, isProcessing: false } : m))
      loadConversations()
    })
    socket.on('processing_error', d => {
      setIsStreaming(false); setStreamingMessage(''); setProcessingStatus(null); setIsUploading(false)
      setMessages(prev => prev.map(m => m.chatId === d.chatId
        ? { ...m, content: `Error: ${d.error}`, isProcessing: false, isError: true } : m))
    })
    socket.on('stream_error', () => {
      setIsStreaming(false); setStreamingMessage(''); setProcessingStatus(null); setIsUploading(false)
    })
  }

  /* ── File handling ── */
  const handleFile = (e) => {
    const f = e.target.files[0]; if (!f) return
    setSelectedFile(f)
    if (f.type.startsWith('image/')) {
      const r = new FileReader(); r.onload = ev => setFilePreview(ev.target.result); r.readAsDataURL(f)
    } else setFilePreview(null)
  }

  const removeFile = () => {
    setSelectedFile(null); setFilePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /* ── Audio ── */
  const playAudio = async (text) => {
    try {
      const r = await axios.post(`${API_BASE_URL}/chat/tts`, { text })
      if (r.data.success) {
        const { audio, mimeType } = r.data
        const bytes = atob(audio), arr = new Uint8Array(bytes.length)
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
        const url = URL.createObjectURL(new Blob([arr], { type: mimeType }))
        if (audioRef.current) {
          audioRef.current.src = url
          await audioRef.current.play()
          audioRef.current.onended = () => URL.revokeObjectURL(url)
        }
      }
    } catch (e) { console.error(e) }
  }

  /* ── Send message ── */
  const send = async () => {
    if (!message.trim() && !selectedFile) return
    const sid = getStudentId(); if (!sid) return
    setIsUploading(true)
    const curMsg = message, curFile = selectedFile, curPreview = filePreview
    const tempId = `temp_${Date.now()}`
    setMessages(prev => [...prev,
    { role: 'user', content: curMsg || `📎 ${curFile?.name}`, file: curFile ? { name: curFile.name, type: curFile.type, preview: curPreview } : null },
    { role: 'assistant', content: '', isProcessing: true, chatId: tempId }
    ])
    setMessage(''); setSelectedFile(null); setFilePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    try {
      const fd = new FormData()
      fd.append('student_id', sid)
      if (currentConversationId) fd.append('conversation_id', currentConversationId)
      fd.append('message', curMsg || '')
      if (curFile) fd.append('file', curFile)
      const r = await axios.post(`${API_BASE_URL}/chat/message`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (r.data.success) {
        const { chat_id, conversation_id } = r.data.data
        if (conversation_id !== currentConversationId) setCurrentConversationId(conversation_id)
        setMessages(prev => prev.map(m => m.chatId === tempId ? { ...m, chatId: chat_id } : m))
        setStreamingMessage(''); setIsStreaming(true)
        setupListeners(chat_id)
        loadConversations()
      }
    } catch {
      setIsUploading(false); setIsStreaming(false)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.', isError: true }])
    }
  }

  /* ── Helpers ── */
  const fmtTime = (ts) => {
    if (!ts) return ''
    const d = new Date(ts), ms = Date.now() - d
    const m = Math.floor(ms / 6e4), h = Math.floor(ms / 36e5)
    if (m < 1) return 'now'; if (m < 60) return `${m}m ago`; if (h < 24) return `${h}h ago`
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  const filtered = conversations.filter(c =>
    !historySearch ||
    c.title?.toLowerCase().includes(historySearch.toLowerCase()) ||
    c.last_message?.toLowerCase().includes(historySearch.toLowerCase())
  )
  const currentConv = conversations.find(c => c.id === currentConversationId)

  const PROMPTS = [
    { icon: BookOpen, clr: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', label: 'Explain a concept', sub: 'Step-by-step explanations', val: "Can you explain Newton's laws of motion with examples?" },
    { icon: FileText, clr: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Solve a problem', sub: 'Work through problems together', val: 'Help me solve this math problem step by step.' },
    { icon: Brain, clr: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Study tips', sub: 'Improve how you learn', val: 'Give me the best study techniques for board exams.' },
    { icon: Zap, clr: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Quick quiz', sub: 'Test your knowledge', val: 'Quiz me on periodic table elements.' },
  ]

  /* ════════════════════════════════════════════
     SUB-COMPONENTS (defined inside to access state)
  ════════════════════════════════════════════ */

  const HistoryPanel = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 flex-shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white leading-none">Chats</h2>
          <p className="text-[10px] text-gray-400 mt-0.5">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={newConversation}
          className="w-7 h-7 flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors shadow-sm" title="New Chat">
          <PenSquare className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          <input value={historySearch} onChange={e => setHistorySearch(e.target.value)} placeholder="Search chats…"
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 placeholder-gray-400 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white dark:focus:bg-gray-700 transition-all" />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5 custom-scroll min-h-0">
        {!filtered.length ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <History className="h-5 w-5 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-xs text-gray-400">{historySearch ? 'No results found' : 'No chats yet'}</p>
          </div>
        ) : filtered.map(c => (
          <HistoryItem key={c.id} conv={c}
            onSelect={id => { setCurrentConversationId(id); setShowMobileHistory(false) }}
            onRename={renameConv} onDelete={deleteConv}
            onDeleteRequest={id => setDeleteModal({ id })}
            onRenameRequest={(id, title) => { setRenameValue(title); setRenameModal({ id }) }}
            isActive={currentConversationId === c.id}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
        <p className="text-[10px] text-gray-400 text-center">{stats.total_scans || 0} total scans</p>
      </div>
    </div>
  )

  /* ════════════════════════════════════════════
     RENDER

     Layout math — position: fixed
     ─────────────────────────────
     TopBar height:
       • Mobile/tablet (<lg): 64px (main) + ~40px (date+theme row) = 104px
       • Desktop (≥lg):        64px only (date row is lg:hidden)

     DashboardLayout <main> padding (we escape it via position:fixed):
       • mobile: pt-20 p-4
       • sm:     pt-20 sm:p-6
       • lg:     lg:p-0 lg:pt-12

     Bottom nav: 64px, lg:hidden

     Result:
       • Mobile/tablet: top=104, bottom=64, left=0, right=0
       • Desktop:       top=64,  bottom=0,  left={sidebarWidth}, right=0
  ════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        /* ── scrollbar ── */
        .custom-scroll::-webkit-scrollbar { display: none; }
        .custom-scroll { scrollbar-width: none; -ms-overflow-style: none; }

        /* ── message animation ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .msg-in { animation: fadeUp 0.18s ease-out both; }

        /* ── mobile history slide ── */
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        .slide-in { animation: slideInLeft 0.22s ease-out both; }
      `}</style>

      {/*
        FIXED SHELL
        top/bottom/left are driven by inline styles so they react to
        sidebar collapse and window resize via React state.
      */}
      <div
        style={{
          position: 'fixed',
          top: isDesktop ? '64px' : '64px',
          bottom: isDesktop ? '0px' : '0px',
          left: isDesktop ? `${desktopLeft}px` : '0px',
          right: '0px',
          zIndex: 10,
          display: 'flex',
          overflow: 'hidden',
          transition: 'left 0.3s ease, top 0.1s ease',
        }}
        className="bg-white dark:bg-gray-900"
      >

        {/* ════════ LEFT — History Sidebar (desktop only, collapsible) ════════ */}
        {/* Expanded panel */}
        <div className={`hidden lg:flex flex-col flex-shrink-0 bg-gray-50 dark:bg-[#181818] border-r border-gray-200 dark:border-gray-800 transition-all duration-300 overflow-hidden ${sidebarCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-60 opacity-100'}`}>
          <HistoryPanel />
        </div>

        {/* Collapsed icon rail — visible only when sidebar is collapsed */}
        <div className={`hidden lg:flex flex-col flex-shrink-0 bg-gray-50 dark:bg-[#181818] border-r border-gray-200 dark:border-gray-800 transition-all duration-300 overflow-hidden ${sidebarCollapsed ? 'w-[52px] opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
          <div className="flex flex-col items-center gap-1 pt-3 pb-3 h-full overflow-y-auto overflow-x-hidden custom-scroll">

            {/* Expand toggle */}
            <button onClick={() => setSidebarCollapsed(false)}
              title="Expand sidebar"
              className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-colors mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>

            {/* New chat */}
            <button onClick={newConversation}
              title="New Chat"
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-colors shadow-sm mb-2">
              <PenSquare className="h-3.5 w-3.5" />
            </button>

            {/* Divider */}
            <div className="w-5 h-px bg-gray-200 dark:bg-gray-700 mb-2" />

            {/* Conversation icon list */}
            {filtered.map(c => (
              <button
                key={c.id}
                onClick={() => setCurrentConversationId(c.id)}
                title={c.title || 'Chat'}
                className={`relative group/tip w-8 h-8 flex items-center justify-center rounded-xl transition-all flex-shrink-0 ${
                  currentConversationId === c.id
                    ? 'bg-violet-500 text-white shadow-sm'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded-lg whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity z-50 max-w-[180px] truncate shadow-lg">
                  {c.title || 'New Chat'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Collapse toggle — sits at the right edge of the history sidebar */}
        <button
          onClick={() => setSidebarCollapsed(prev => !prev)}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden lg:flex absolute z-30 items-center justify-center w-5 h-8 rounded-r-md bg-gray-200 dark:bg-gray-700 hover:bg-violet-100 dark:hover:bg-violet-900/40 text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 border border-l-0 border-gray-200 dark:border-gray-700 shadow-sm"
          style={{ top: '380px', left: sidebarCollapsed ? '52px' : '240px' }}
        >
          {sidebarCollapsed
            ? <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            : <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          }
        </button>

        {/* ════════ RIGHT — Chat Pane ════════ */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-[#121212]">

          {/* ── Pane header ── */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-5 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Mobile: open history drawer */}
              <button onClick={() => setShowMobileHistory(true)}
                className="lg:hidden flex-shrink-0 p-1.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Menu className="h-4 w-4" />
              </button>

              {/* Bot avatar + status */}
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white dark:border-gray-900 rounded-full" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none truncate">
                  {currentConv?.title || 'AI Tutor Assistant'}
                </p>
                <p className="text-[11px] text-emerald-500 leading-none mt-0.5 flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  Online · Ready to help
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {currentConversationId && (
                <>
                  <button
                    onClick={() => { setRenameValue(currentConv?.title || ''); setRenameModal({ id: currentConversationId }) }}
                    className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    title="Rename">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteModal({ id: currentConversationId })}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5" />
                </>
              )}
              <button onClick={newConversation}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-xl transition-colors shadow-sm">
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            </div>
          </div>

          {/* ── Messages area ── */}
          {messages.length === 0 ? (

            /* WELCOME SCREEN */
            <div className="flex-1  overflow-y-auto flex flex-col items-center justify-center px-5 py-8 text-center custom-scroll">
              <div className="relative mb-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                  <Sparkles className="h-2.5 w-2.5 text-white" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1.5">Welcome to AI Tutor</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mb-7">
                Your personal learning assistant. Ask questions, upload homework images or PDFs, or explore any topic.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
                {PROMPTS.map((p, i) => (
                  <button key={i} onClick={() => { setMessage(p.val); textareaRef.current?.focus() }}
                    className="group flex items-center gap-3 p-3.5 bg-white dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-700 rounded-xl text-left transition-all shadow-sm hover:shadow-md">
                    <div className={`w-9 h-9 rounded-xl ${p.bg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105`}>
                      <p.icon className={`h-[18px] w-[18px] ${p.clr}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-none">{p.label}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-none">{p.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          ) : (

            /* CHAT MESSAGES */
            <div ref={chatContainerRef} className="flex-1 w-full   lg:w-[60vw] mx-auto  overflow-y-auto px-4 sm:px-6 py-5 space-y-5 custom-scroll min-h-0">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex items-end gap-2.5 msg-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                  {/* Assistant avatar */}
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 mb-1 w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}

                  <div className="max-w-[80%] lg:max-w-[70%]">
                    {/* Bubble */}
                    <div className={`rounded-2xl px-4 py-3 shadow-sm ${msg.role === 'user'
                        ? 'bg-violet-600 text-white rounded-br-sm'
                        : 'bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-bl-sm'
                      }`}>
                      {msg.role === 'user' ? (
                        <div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                          {msg.file && (
                            <div className="mt-2 flex items-center gap-2 text-xs bg-white/20 rounded-xl p-2">
                              {msg.file.type?.includes('pdf') ? <FileText className="h-3.5 w-3.5 flex-shrink-0" /> : <ImageIcon className="h-3.5 w-3.5 flex-shrink-0" />}
                              <span className="truncate">{msg.file.name}</span>
                            </div>
                          )}
                          {msg.file?.preview && (
                            <img src={msg.file.preview} alt="preview" className="mt-2 rounded-xl max-h-32 object-cover" />
                          )}
                        </div>
                      ) : (
                        <div>
                          {msg.isProcessing ? (
                            <div>
                              {/* Processing status */}
                              {processingStatus && (
                                <div className="mb-2 p-2.5 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-800">
                                  <div className="flex items-center gap-2 text-xs text-violet-600 dark:text-violet-300">
                                    <Loader2 className="h-3 w-3 animate-spin flex-shrink-0" />
                                    <span className="truncate">{processingStatus.message}</span>
                                  </div>
                                  {processingStatus.totalPages && (
                                    <div className="mt-2 flex items-center gap-2">
                                      <div className="flex-1 h-1 bg-violet-100 dark:bg-violet-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-violet-500 rounded-full transition-all duration-300"
                                          style={{ width: `${(processingStatus.pageNumber / processingStatus.totalPages) * 100}%` }} />
                                      </div>
                                      <span className="text-[10px] text-violet-500">{processingStatus.pageNumber}/{processingStatus.totalPages}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              {/* Streaming content */}
                              {idx === messages.length - 1 && streamingMessage && (
                                <MarkdownResponse content={streamingMessage} messageId={idx} onPlayAudio={playAudio} />
                              )}
                              {msg.content && !streamingMessage && (
                                <MarkdownResponse content={msg.content} messageId={idx} onPlayAudio={playAudio} />
                              )}
                              {/* Thinking dots */}
                              {isStreaming && idx === messages.length - 1 && !streamingMessage && (
                                <div className="flex items-center gap-1 py-0.5">
                                  {[0, 150, 300].map(d => (
                                    <span key={d} className="w-2 h-2 bg-violet-300 dark:bg-violet-600 rounded-full animate-bounce"
                                      style={{ animationDelay: `${d}ms`, animationDuration: '0.9s' }} />
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : msg.isError ? (
                            <div className="flex items-center gap-2 text-red-500">
                              <AlertCircle className="h-4 w-4 flex-shrink-0" />
                              <span className="text-sm">{msg.content}</span>
                            </div>
                          ) : msg.content ? (
                            <MarkdownResponse content={msg.content} messageId={idx} onPlayAudio={playAudio} />
                          ) : (
                            <span className="text-sm text-gray-400 italic">No response</span>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Timestamp */}
                    <div className={`text-[10px] text-gray-400 mt-1 px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {fmtTime(msg.timestamp || Date.now())}
                    </div>
                  </div>

                  {/* User avatar */}
                  {msg.role === 'user' && (
                    <div className="flex-shrink-0 mb-1 w-7 h-7 rounded-full bg-gray-700 dark:bg-gray-600 flex items-center justify-center shadow-sm">
                      <GraduationCap className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* ── Input bar ── */}
          <div className="flex-shrink-0 px-4 sm:px-5 pb-4 pt-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212]">
            {/* File chip */}
            {selectedFile && (
              <div className="mb-2 flex items-center justify-between bg-violet-50 dark:bg-violet-900/20 px-3 py-2 rounded-xl border border-violet-100 dark:border-violet-800">
                <div className="flex items-center gap-2 min-w-0">
                  {selectedFile.type.includes('pdf')
                    ? <FileText className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
                    : <ImageIcon className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />}
                  <span className="text-xs text-gray-700 dark:text-gray-300 truncate font-medium">{selectedFile.name}</span>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button onClick={removeFile}
                  className="p-1 ml-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Input pill */}
            <div className="flex md:w-[85vw] lg:w-[60vw] mx-auto items-end gap-2 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:border-violet-400 dark:focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-400/20 transition-all px-3 py-2.5">
              <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={handleFile} className="hidden" />

              <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                className="flex-shrink-0 p-1.5 text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl transition-colors disabled:opacity-40 mb-0.5"
                title="Attach file (JPG, PNG, PDF)">
                <Paperclip className="h-4 w-4" />
              </button>

              <textarea
                ref={textareaRef}
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder={selectedFile ? 'Add a message about this file…' : 'Ask anything…'}
                disabled={isUploading}
                className="flex-1 resize-none bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none disabled:opacity-50 leading-relaxed py-0.5"
                rows={1}
                style={{ minHeight: '24px', maxHeight: '120px' }}
              />

              <button onClick={send} disabled={isUploading || (!message.trim() && !selectedFile)}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-white disabled:text-gray-400 rounded-xl transition-all shadow-sm disabled:cursor-not-allowed disabled:shadow-none mb-0.5">
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>

            <p className="text-center text-[10px] text-gray-400 mt-1.5">
              JPG · PNG · WebP · PDF &nbsp;·&nbsp; Max 10 MB &nbsp;·&nbsp; Shift+Enter for new line
            </p>
          </div>

        </div>{/* end right pane */}

        {/* ════════ MOBILE HISTORY OVERLAY ════════ */}
        {showMobileHistory && (
          <div className="lg:hidden fixed inset-0 z-[60] flex">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowMobileHistory(false)}
            />
            {/* Drawer */}
            <div className="relative mt-16 w-72 max-w-[85vw] bg-white dark:bg-[#181818] shadow-2xl flex flex-col h-full slide-in">
              <div className="flex items-center justify-between px-4 pt-4 pb-0 flex-shrink-0">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Chat History</span>
                <button onClick={() => setShowMobileHistory(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <HistoryPanel />
            </div>
          </div>
        )}

      </div>{/* end fixed shell */}

      {/* ════════ DELETE CONFIRMATION MODAL ════════ */}
      {deleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteModal(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-sm p-6 animate-[fadeUp_0.18s_ease-out_both]">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
              <Trash2 className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white text-center mb-1">Delete conversation?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">This action cannot be undone. All messages in this chat will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={() => { deleteConv(deleteModal.id); setDeleteModal(null) }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ RENAME MODAL ════════ */}
      {renameModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRenameModal(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-sm p-6 animate-[fadeUp_0.18s_ease-out_both]">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Rename chat</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Give this conversation a new name.</p>
            <input
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && renameValue.trim()) { renameConv(renameModal.id, renameValue.trim()); setRenameModal(null) }
                if (e.key === 'Escape') setRenameModal(null)
              }}
              placeholder="Chat name…"
              autoFocus
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-violet-400 dark:focus:border-violet-600 focus:ring-2 focus:ring-violet-400/20 rounded-xl focus:outline-none text-gray-900 dark:text-white transition-all mb-5"
            />
            <div className="flex gap-3">
              <button onClick={() => setRenameModal(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
                Cancel
              </button>
              <button
                disabled={!renameValue.trim()}
                onClick={() => { if (renameValue.trim()) { renameConv(renameModal.id, renameValue.trim()); setRenameModal(null) } }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}

export default AITutor