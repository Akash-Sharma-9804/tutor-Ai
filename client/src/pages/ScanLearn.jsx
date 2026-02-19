import React, { useState, useEffect } from 'react'
import { ScanLine, Upload, FileText, ImageIcon, CheckCircle2, AlertCircle, Loader2, Eye, Trash2, Copy, Check } from "lucide-react"
import axios from 'axios'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'
// Markdown-like response renderer component
const MarkdownResponse = ({ content }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    const textContent = typeof content === 'string' ? content : String(content || '')
    navigator.clipboard.writeText(textContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const parseContent = (text) => {
    if (!text || typeof text !== 'string') return []
    
    const sections = []
    const lines = text.split('\n')
    let currentSection = { type: 'text', content: [] }
    
    lines.forEach((line, index) => {
      // Headers (###, ##, #)
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
      // Bold text with **
      else if (line.includes('**')) {
        currentSection.content.push({ type: 'bold-line', text: line })
      }
      // Bullet points
      else if (line.trim().startsWith('*   ') || line.trim().startsWith('- ')) {
        if (currentSection.type !== 'list') {
          if (currentSection.content.length > 0) {
            sections.push(currentSection)
          }
          currentSection = { type: 'list', content: [] }
        }
        currentSection.content.push(line.trim().replace(/^(\*   |- )/, ''))
      }
      // Horizontal rules
      else if (line.trim() === '---') {
        if (currentSection.content.length > 0) {
          sections.push(currentSection)
          currentSection = { type: 'text', content: [] }
        }
        sections.push({ type: 'divider' })
      }
      // Code or formula blocks (anything with special formatting)
      else if (line.trim().startsWith('Φ') || line.trim().startsWith('Q =') || line.includes('×')) {
        currentSection.content.push({ type: 'formula', text: line })
      }
      // Regular text
      else if (line.trim()) {
        currentSection.content.push({ type: 'text', text: line })
      }
      // Empty line
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
        return <strong key={i} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  // Function to render text with LaTeX support
  const renderTextWithLatex = (text) => {
    if (!text || typeof text !== 'string') return text
    
    const parts = []
    let lastIndex = 0
    
    // Match both inline ($...$) and block ($$...$$) math
    const mathRegex = /\$\$(.*?)\$\$|\$(.*?)\$/g
    let match
    
    while ((match = mathRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        const textBefore = text.substring(lastIndex, match.index)
        parts.push({ type: 'text', content: textBefore })
      }
      
      // Add the math content
      if (match[1] !== undefined) {
        // Block math ($$...$$)
        parts.push({ type: 'block', content: match[1] })
      } else if (match[2] !== undefined) {
        // Inline math ($...$)
        parts.push({ type: 'inline', content: match[2] })
      }
      
      lastIndex = match.index + match[0].length
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) })
    }
    
    // If no LaTeX found, return the original text
    if (parts.length === 0) {
      return text
    }
    
    return parts.map((part, index) => {
      if (part.type === 'block') {
        return <BlockMath key={index} math={part.content} />
      } else if (part.type === 'inline') {
        return <InlineMath key={index} math={part.content} />
      } else {
        return <span key={index}>{renderBoldText(part.content)}</span>
      }
    })
  }

  const sections = parseContent(content)

  return (
    <div className="relative">
      <button
        onClick={copyToClipboard}
        className="absolute top-0 right-0 p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
        title="Copy to clipboard"
      >
        {copied ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" /> : <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400" />}
      </button>

      <div className="space-y-3 sm:space-y-4 pr-10 sm:pr-12">
        {sections.map((section, idx) => {
          switch (section.type) {
            case 'h1':
              return (
                <h1 key={idx} className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-6 sm:mt-8 mb-3 sm:mb-4 pb-2 border-b-2 border-blue-600">
                  {section.content}
                </h1>
              )
            case 'h2':
              return (
                <h2 key={idx} className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-5 sm:mt-6 mb-2 sm:mb-3">
                  {section.content}
                </h2>
              )
            case 'h3':
              return (
                <h3 key={idx} className="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-400 mt-4 sm:mt-5 mb-2">
                  {section.content}
                </h3>
              )
            case 'divider':
              return <hr key={idx} className="my-4 sm:my-6 border-t-2 border-gray-200 dark:border-gray-700" />
            case 'list':
              return (
                <ul key={idx} className="space-y-1.5 sm:space-y-2 ml-4 sm:ml-6">
                  {section.content.map((item, i) => {
                    const itemText = typeof item === 'string' ? item : (item?.text || String(item))
                    return (
                 <li key={i} className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed flex items-start">
                        <span className="text-blue-600 dark:text-blue-400 mr-2 sm:mr-3 mt-0.5 sm:mt-1">•</span>
                        <span className="flex-1">{renderTextWithLatex(itemText)}</span>
                      </li>
                    )
                  })}
                </ul>
              )
            case 'text':
              return (
                <div key={idx} className="space-y-1.5 sm:space-y-2">
                  {section.content.map((line, i) => {
                    if (!line) return null
                    
                   if (line.type === 'bold-line') {
                      return (
                        <p key={i} className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                          {renderTextWithLatex(line.text || '')}
                        </p>
                      )
                    } else if (line.type === 'formula') {
                      return (
                        <div key={i} className="my-2 sm:my-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-600 overflow-x-auto">
                          <div className="text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                            {renderTextWithLatex(line.text || '')}
                          </div>
                        </div>
                      )
                    } else if (line.type === 'text') {
                      return (
                        <p key={i} className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                          {renderTextWithLatex(line.text || '')}
                        </p>
                      )
                    }
                    // Fallback for any unexpected format
                    const textContent = typeof line === 'string' ? line : (line?.text || String(line))
                    return (
                      <p key={i} className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                        {renderTextWithLatex(textContent)}
                      </p>
                    )
                  })}
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

const ScanLearn = () => {
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

  // Extract student_id from localStorage - handles both JSON object and direct value
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

  const studentId = getStudentId()

  const API_BASE_URL = import.meta.env?.VITE_BACKEND_URL 
    ? `${import.meta.env.VITE_BACKEND_URL}/api` 
    : 'http://localhost:4000/api'

  const features = [
    { icon: FileText, title: "Text Recognition", description: "Extract text from any document" },
    { icon: CheckCircle2, title: "Homework Help", description: "Get instant solutions to problems" },
    { icon: ScanLine, title: "Smart Analysis", description: "AI-powered content understanding" },
  ]

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const getStatusBadge = (status) => {
  const badges = {
    pending: { text: 'Pending', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
    processing: { 
      text: 'Processing...', 
      class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      animated: true
    },
    completed: { text: 'Completed', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    failed: { text: 'Failed', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  }
  
  const badge = badges[status] || badges.pending
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.class} inline-flex items-center gap-1`}>
      {badge.animated && (
        <Loader2 className="w-3 h-3 animate-spin" />
      )}
      {badge.text}
    </span>
  )
}
  useEffect(() => {
    if (studentId) {
      loadScanHistory()
      loadStats()
    }
  }, [studentId])

  const loadScanHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/scans/history/${studentId}?limit=10`)
      if (response.data.success) {
        setRecentScans(response.data.data.scans)
      }
    } catch (error) {
      console.error('Failed to load scan history:', error)
    }
  }

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/scans/stats/${studentId}`)
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleFileSelect = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload JPG, PNG, WEBP, or PDF files.')
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert('File size exceeds 10MB limit.')
      return
    }

    setSelectedFile(file)

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => setPreviewUrl(reader.result)
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) handleFileSelect(files[0])
  }

  const handleFileInputChange = (e) => {
    const files = e.target.files
    if (files.length > 0) handleFileSelect(files[0])
  }

  const uploadFile = async () => {
  if (!selectedFile) {
    alert('Please select a file first')
    return
  }

  if (!studentId) {
    alert('Student ID not found. Please log in again.')
    return
  }

  setIsUploading(true)
  setUploadProgress(0)

  const formData = new FormData()
  formData.append('file', selectedFile)
  formData.append('student_id', studentId)

  try {
    const response = await axios.post(`${API_BASE_URL}/scans/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setUploadProgress(percentCompleted)
      },
    })

    if (response.data.success) {
      const scanId = response.data.data.scan_id
      
      // Add to processing scans set
      setProcessingScans(prev => new Set(prev).add(scanId))
      
      // Show success message for upload (processing happens in background)
      alert(`✅ File uploaded successfully! Processing ${response.data.data.pages} pages in background...`)
      
      // Clear file selection
      setSelectedFile(null)
      setPreviewUrl(null)
      
      // Reload scan history immediately to show the "processing" status
      await loadScanHistory()
      await loadStats()
      
      // Start polling for this scan
      pollScanStatus(scanId)
    } else {
      alert('❌ Upload failed: ' + response.data.message)
    }
  } catch (error) {
    console.error('Upload error:', error)
    alert('❌ Upload failed: ' + (error.response?.data?.message || error.message))
  } finally {
    setIsUploading(false)
    setUploadProgress(0)
  }
}

// Add this new function to poll scan status
const pollScanStatus = async (scanId, attempts = 0) => {
  const MAX_ATTEMPTS = 60 // Poll for up to 5 minutes (60 * 5 seconds)
  
  try {
    const response = await axios.get(`${API_BASE_URL}/scans/${scanId}`)
    
    if (response.data.success) {
      const scan = response.data.data
      
      if (scan.processing_status === 'completed' || scan.processing_status === 'failed') {
        // Processing finished
        setProcessingScans(prev => {
          const newSet = new Set(prev)
          newSet.delete(scanId)
          return newSet
        })
        
        // Reload scan history to show updated status
        await loadScanHistory()
        await loadStats()
        
        // Show notification
        if (scan.processing_status === 'completed') {
          // You can add a toast notification here if you have one
          console.log(`✅ Scan ${scanId} processed successfully!`)
        } else {
          console.log(`❌ Scan ${scanId} processing failed`)
        }
        
        return
      }
      
      // Still processing, poll again if under max attempts
      if (attempts < MAX_ATTEMPTS) {
        setTimeout(() => pollScanStatus(scanId, attempts + 1), 5000) // Poll every 5 seconds
      } else {
        // Max attempts reached
        setProcessingScans(prev => {
          const newSet = new Set(prev)
          newSet.delete(scanId)
          return newSet
        })
        console.warn(`Stopped polling scan ${scanId} after ${MAX_ATTEMPTS} attempts`)
      }
    }
  } catch (error) {
    console.error(`Error polling scan ${scanId}:`, error)
    // Continue polling on error unless max attempts reached
    if (attempts < MAX_ATTEMPTS) {
      setTimeout(() => pollScanStatus(scanId, attempts + 1), 5000)
    }
  }
}

  const viewScanDetails = async (scanId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/scans/${scanId}`)
      if (response.data.success) setViewingScan(response.data.data)
    } catch (error) {
      console.error('Failed to load scan details:', error)
      alert('Failed to load scan details')
    }
  }

  const deleteScan = async (scanId) => {
    if (!window.confirm('Are you sure you want to delete this scan?')) return

    try {
      const response = await axios.delete(`${API_BASE_URL}/scans/${scanId}`, {
        data: { student_id: studentId }
      })

      if (response.data.success) {
        alert('✅ Scan deleted successfully')
        loadScanHistory()
        loadStats()
        if (viewingScan?.id === scanId) setViewingScan(null)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('❌ Failed to delete scan')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-4 sm:py-8 px-3 sm:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center justify-center gap-2 sm:gap-3 rounded-full bg-white dark:bg-gray-800 px-4 sm:px-6 py-2 sm:py-3 shadow-md mb-3 sm:mb-4">
            <ScanLine className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">ScanLearn</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">Upload your homework and get instant AI-powered help</p>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 lg:p-8 shadow-sm">
              <div 
                className={`rounded-lg border-2 border-dashed p-4 sm:p-6 lg:p-8 transition-colors ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
              >
                {previewUrl ? (
                  <div>
                    <img src={previewUrl} alt="Preview" className="mx-auto max-h-[200px] sm:max-h-[300px] rounded-lg object-contain" />
                    <p className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-all px-2">{selectedFile?.name}</p>
                  </div>
                ) : selectedFile ? (
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-blue-600 dark:text-blue-400 mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 font-medium break-all px-2">{selectedFile.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 sm:gap-4 text-center">
                    <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="mb-1 sm:mb-2 text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Drop your files here</h3>
                      <p className="mb-2 sm:mb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-4">Supports PDF, JPG, PNG up to 10MB</p>
                    </div>
                  </div>
                )}
                
                {!isUploading && (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 justify-center">
                    <label className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 sm:px-6 py-2.5 sm:py-3 font-medium text-sm sm:text-base text-white hover:bg-blue-700 cursor-pointer transition-colors">
                      <Upload className="h-4 w-4" />
                      Choose File
                      <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf,.webp" onChange={handleFileInputChange} />
                    </label>
                    {selectedFile && (
                      <button onClick={uploadFile} className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 sm:px-6 py-2.5 sm:py-3 font-medium text-sm sm:text-base text-white hover:bg-green-700 transition-colors">
                        <CheckCircle2 className="h-4 w-4" />
                        Process Homework
                      </button>
                    )}
                  </div>
                )}

                {isUploading && (
                  <div className="w-full max-w-md mt-4 sm:mt-6 mx-auto px-2">
                    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-blue-600" />
                      <span className="text-sm sm:text-base text-gray-900 dark:text-gray-100 font-medium">Processing... {uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Scans */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6  shadow-sm">
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Scans</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Your recently scanned documents</p>
                </div>
                <button onClick={loadScanHistory} className="text-xs sm:text-sm text-blue-600 hover:underline self-start sm:self-auto">Refresh</button>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                {recentScans.length === 0 ? (
                  <p className="text-center text-gray-500 py-6 sm:py-8 text-sm">No scans yet. Upload your first document!</p>
                ) : (
                  recentScans.map((scan) => (
                    <div key={scan.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors gap-3 sm:gap-0">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                          {scan.file_type === "pdf" ? <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" /> : <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">{scan.original_filename}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {scan.total_pages} {scan.total_pages === 1 ? "page" : "pages"} • {formatDate(scan.uploaded_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {getStatusBadge(scan.processing_status)}
                        {scan.processing_status === 'completed' ? (
  <button
    onClick={() => viewScanDetails(scan.id)}
    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
  >
    <Eye className="w-4 h-4" />
    View
  </button>
) : scan.processing_status === 'processing' ? (
  <button
    disabled
    className="flex items-center gap-1 px-3 py-1.5 bg-gray-400 text-white rounded-lg text-sm cursor-not-allowed opacity-60"
  >
    <Loader2 className="w-4 h-4 animate-spin" />
    Processing
  </button>
) : scan.processing_status === 'failed' ? (
  <button
    onClick={() => viewScanDetails(scan.id)}
    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
  >
    <AlertCircle className="w-4 h-4" />
    View Error
  </button>
) : null}
                        <button onClick={() => deleteScan(scan.id)} className="cursor-pointer p-1.5 sm:p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm">
              <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Scan Features</h2>
              <div className="space-y-3 sm:space-y-4">
                {features.map((feature, idx) => {
                  const Icon = feature.icon
                  return (
                    <div key={idx} className="flex items-start gap-2 sm:gap-3">
                      <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100">{feature.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm">
              <h2 className="mb-3 sm:mb-4 flex items-center gap-2 text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                Tips for Best Results
              </h2>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {['Ensure good lighting when taking photos', 'Keep text clear and in focus', 'Avoid shadows on the document', 'Use high resolution images', 'Flatten pages for better scanning'].map((tip, i) => (
                  <p key={i} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span> 
                    <span className="flex-1">{tip}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm">
              <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Scan Statistics</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2 sm:pb-3">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Total Scans</span>
                  <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">{stats.total_scans}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2 sm:pb-3">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">This Month</span>
                  <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">{stats.this_month}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Success Rate</span>
                  <span className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">{stats.success_rate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for viewing AI response */}
      {viewingScan && (
       <div className="fixed inset-0 bg-black/10 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-5xl w-full my-4 sm:my-8 shadow-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 rounded-t-xl z-10">
              <div className="flex items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate pr-2">{viewingScan.original_filename}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">AI Homework Help Response</p>
                </div>
                <button 
                  onClick={() => {
                    setViewingScan(null)
                    setShowUploadedFile(false)
                  }} 
                  className="text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Toggle button to show/hide uploaded file */}
              <button
                onClick={() => setShowUploadedFile(!showUploadedFile)}
                className="flex items-center gap-2 cursor-pointer px-3 sm:px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto justify-center sm:justify-start"
              >
                <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {showUploadedFile ? 'Hide' : 'View'} Uploaded File
              </button>

              {/* Collapsible uploaded file preview */}
              {showUploadedFile && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  {(() => {
                    // Get file URL from either property
                    const fileUrl = viewingScan.ftp_file_path || viewingScan.file_url
                    
                    if (!fileUrl) {
                      return <p className="text-center text-sm text-gray-500 dark:text-gray-400">File preview not available</p>
                    }
                    
                    if (viewingScan.file_type === 'pdf') {
                      return (
                        <div className="text-center">
                          <FileText className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-blue-600 dark:text-blue-400 mb-2 sm:mb-3" />
                          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">PDF Document</p>
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex cursor-pointer items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            Open PDF
                          </a>
                        </div>
                      )
                    }
                    
                    return (
                      <img
                        src={fileUrl}
                        alt="Uploaded document"
                        className="max-w-full max-h-64 sm:max-h-96 mx-auto rounded-lg object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.innerHTML = '<p class="text-center text-sm text-red-500">Failed to load image</p>'
                        }}
                      />
                    )
                  })()}
                </div>
              )}
            </div>
            <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto flex-1">
              <MarkdownResponse content={viewingScan.ai_response || 'No response available'} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScanLearn