import React, { useState } from 'react'
import { ScanLine, Upload, Camera, FileText, ImageIcon, CheckCircle2, AlertCircle } from "lucide-react"

const ScanLearn = () => {
  const [isDragging, setIsDragging] = useState(false)

  const recentScans = [
    {
      name: "Math Homework - Chapter 5.pdf",
      type: "PDF",
      date: "Today, 2:30 PM",
      status: "Completed",
      pages: 3,
    },
    {
      name: "Physics Notes - Lecture 12.jpg",
      type: "Image",
      date: "Yesterday, 4:15 PM",
      status: "Completed",
      pages: 1,
    },
    {
      name: "Chemistry Lab Report.pdf",
      type: "PDF",
      date: "2 days ago",
      status: "Completed",
      pages: 8,
    },
  ]

  const features = [
    {
      icon: FileText,
      title: "Text Recognition",
      description: "Extract text from any document",
    },
    {
      icon: CheckCircle2,
      title: "Homework Help",
      description: "Get instant solutions to problems",
    },
    {
      icon: ScanLine,
      title: "Smart Analysis",
      description: "AI-powered content understanding",
    },
  ]

  return (
    <div className="container mx-auto p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">Scan Documents 📖</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload or scan documents to extract text and get instant help
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload Area */}
        <div className="lg:col-span-2">
          {/* Upload Card */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm dark:shadow-gray-900">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Upload Document</h2>
              <p className="text-gray-600 dark:text-gray-400">Drag and drop or click to upload files</p>
            </div>
            
            {/* Drag & Drop Area */}
            <div
              className={`relative flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                isDragging 
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400" 
                  : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
              }}
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Upload className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">Drop your files here</h3>
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Supports PDF, JPG, PNG up to 10MB</p>
                </div>
                <div className="flex gap-3">
                  <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 dark:bg-blue-700 px-6 py-3 font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                    <Upload className="h-4 w-4" />
                    Choose File
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-6 py-3 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900">
                    <Camera className="h-4 w-4" />
                    Use Camera
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Scans */}
          <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm dark:shadow-gray-900">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Scans</h2>
              <p className="text-gray-600 dark:text-gray-400">Your recently scanned documents</p>
            </div>
            
            <div className="space-y-3">
              {recentScans.map((scan, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      {scan.type === "PDF" ? (
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{scan.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {scan.pages} {scan.pages === 1 ? "page" : "pages"} • {scan.date}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-xs font-medium text-green-800 dark:text-green-400">
                    <CheckCircle2 className="h-3 w-3" />
                    {scan.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Features */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm dark:shadow-gray-900">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Scan Features</h2>
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{feature.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm dark:shadow-gray-900">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Tips for Best Results
            </h2>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span> Ensure good lighting when taking photos
              </p>
              <p className="flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span> Keep text clear and in focus
              </p>
              <p className="flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span> Avoid shadows on the document
              </p>
              <p className="flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span> Use high resolution images
              </p>
              <p className="flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span> Flatten pages for better scanning
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm dark:shadow-gray-900">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Scan Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                <span className="text-gray-600 dark:text-gray-400">Total Scans</span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">127</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                <span className="text-gray-600 dark:text-gray-400">This Month</span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">98%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScanLearn