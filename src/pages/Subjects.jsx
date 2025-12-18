import React, { useState } from 'react'
import { BookOpen, Users, Clock, Star, TrendingUp, ChevronRight, Filter, BarChart3, Target, Calendar, ChevronDown, Award, Zap, PieChart } from "lucide-react"

const SubjectsPage = () => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [sortBy, setSortBy] = useState('progress')

  const subjects = [
    {
      id: 1,
      name: "Advanced Mathematics",
      instructor: "Dr. Sarah Johnson",
      students: 234,
      progress: 75,
      rating: 4.8,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      status: "In Progress",
      nextLesson: "Calculus - Integration Techniques",
      totalLessons: 48,
      completedLessons: 36,
      difficulty: "Advanced",
      category: "Science",
      enrollmentDate: "2024-01-15",
      upcomingDeadline: "Tomorrow",
    },
    {
      id: 2,
      name: "Quantum Physics",
      instructor: "Prof. Michael Chen",
      students: 189,
      progress: 60,
      rating: 4.9,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      status: "In Progress",
      nextLesson: "Wave-Particle Duality",
      totalLessons: 40,
      completedLessons: 24,
      difficulty: "Advanced",
      category: "Science",
      enrollmentDate: "2024-02-10",
      upcomingDeadline: "In 3 days",
    },
    {
      id: 3,
      name: "Organic Chemistry",
      instructor: "Dr. Emily Brown",
      students: 198,
      progress: 85,
      rating: 4.7,
      color: "bg-gradient-to-r from-green-500 to-emerald-600",
      status: "In Progress",
      nextLesson: "Reaction Mechanisms",
      totalLessons: 36,
      completedLessons: 30,
      difficulty: "Intermediate",
      category: "Science",
      enrollmentDate: "2024-01-20",
      upcomingDeadline: "Today",
    },
    {
      id: 4,
      name: "Computer Science",
      instructor: "Prof. David Lee",
      students: 312,
      progress: 45,
      rating: 4.9,
      color: "bg-gradient-to-r from-orange-500 to-amber-600",
      status: "In Progress",
      nextLesson: "Data Structures - Trees",
      totalLessons: 52,
      completedLessons: 23,
      difficulty: "Intermediate",
      category: "Technology",
      enrollmentDate: "2024-02-05",
      upcomingDeadline: "In 5 days",
    },
    {
      id: 5,
      name: "English Literature",
      instructor: "Dr. Amanda White",
      students: 156,
      progress: 90,
      rating: 4.6,
      color: "bg-gradient-to-r from-pink-500 to-rose-600",
      status: "Nearly Complete",
      nextLesson: "Modern Poetry Analysis",
      totalLessons: 32,
      completedLessons: 29,
      difficulty: "Beginner",
      category: "Humanities",
      enrollmentDate: "2023-12-10",
      upcomingDeadline: "Completed",
    },
    {
      id: 6,
      name: "World History",
      instructor: "Prof. Robert Taylor",
      students: 201,
      progress: 30,
      rating: 4.8,
      color: "bg-gradient-to-r from-teal-500 to-cyan-600",
      status: "In Progress",
      nextLesson: "Industrial Revolution",
      totalLessons: 44,
      completedLessons: 13,
      difficulty: "Beginner",
      category: "Humanities",
      enrollmentDate: "2024-02-15",
      upcomingDeadline: "In 7 days",
    },
  ]

  const filters = [
    { id: 'all', label: 'All Subjects' },
    { id: 'science', label: 'Science' },
    { id: 'technology', label: 'Technology' },
    { id: 'humanities', label: 'Humanities' },
    { id: 'nearly-complete', label: 'Nearly Complete' },
  ]

  const sortOptions = [
    { id: 'progress', label: 'Progress' },
    { id: 'rating', label: 'Rating' },
    { id: 'students', label: 'Popularity' },
    { id: 'deadline', label: 'Deadline' },
  ]

  // Calculate statistics for the dashboard
  const totalProgress = subjects.reduce((sum, subject) => sum + subject.progress, 0) / subjects.length
  const totalStudents = subjects.reduce((sum, subject) => sum + subject.students, 0)
  const totalLessons = subjects.reduce((sum, subject) => sum + subject.totalLessons, 0)
  const completedLessons = subjects.reduce((sum, subject) => sum + subject.completedLessons, 0)

  // Subject distribution by category
  const categoryData = [
    { name: 'Science', value: 3, color: 'bg-blue-500' },
    { name: 'Technology', value: 1, color: 'bg-orange-500' },
    { name: 'Humanities', value: 2, color: 'bg-teal-500' },
  ]

  // Performance trend data
  const performanceData = [
    { month: 'Jan', score: 78 },
    { month: 'Feb', score: 82 },
    { month: 'Mar', score: 85 },
    { month: 'Apr', score: 88 },
    { month: 'May', score: 90 },
    { month: 'Jun', score: 92 },
  ]

  const filteredSubjects = subjects.filter(subject => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'nearly-complete') return subject.progress > 75
    return subject.category.toLowerCase() === activeFilter.toLowerCase()
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating': return b.rating - a.rating
      case 'students': return b.students - a.students
      case 'deadline': 
        const deadlineOrder = { 'Today': 1, 'Tomorrow': 2, 'In 3 days': 3, 'In 5 days': 4, 'In 7 days': 5, 'Completed': 6 }
        return deadlineOrder[a.upcomingDeadline] - deadlineOrder[b.upcomingDeadline]
      default: return b.progress - a.progress
    }
  })

  return (
    <div className="container mx-auto p-6 lg:p-8">
      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">My Subjects</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and track your enrolled courses</p>
          </div>
          <div className="mt-4 lg:mt-0">
            <button className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700">
              <BookOpen className="h-4 w-4" />
              Enroll in New Course
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">Average Progress</p>
                <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-300">{Math.round(totalProgress)}%</h3>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            </div>
            <div className="mt-2 h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600 rounded-full"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 border border-purple-200 dark:border-purple-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-400 font-medium">Total Students</p>
                <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-300">{totalStudents.toLocaleString()}</h3>
              </div>
              <Users className="h-8 w-8 text-purple-600 dark:text-purple-500" />
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">Across all subjects</p>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 border border-green-200 dark:border-green-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">Lessons Completed</p>
                <h3 className="text-2xl font-bold text-green-900 dark:text-green-300">{completedLessons}/{totalLessons}</h3>
              </div>
              <Target className="h-8 w-8 text-green-600 dark:text-green-500" />
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              {Math.round((completedLessons / totalLessons) * 100)}% completion rate
            </p>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 border border-orange-200 dark:border-orange-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">Avg. Rating</p>
                <div className="flex items-center gap-1">
                  <h3 className="text-2xl font-bold text-orange-900 dark:text-orange-300">4.8</h3>
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
              <Award className="h-8 w-8 text-orange-600 dark:text-orange-500" />
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">Based on student reviews</p>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === filter.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-300"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Subjects Grid */}
        <div className="lg:col-span-2">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {filteredSubjects.map((subject) => (
              <div 
                key={subject.id} 
                className="group overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all hover:shadow-xl dark:hover:shadow-gray-900 hover:border-blue-300 dark:hover:border-blue-700"
              >
                {/* Color indicator bar with gradient */}
                <div className={`h-1 ${subject.color}`} />
                
                {/* Card Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          subject.difficulty === 'Advanced' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                          subject.difficulty === 'Intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                          'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        }`}>
                          {subject.difficulty}
                        </span>
                        <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium">
                          {subject.category}
                        </span>
                      </div>
                      <h2 className="mb-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                        {subject.name}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{subject.instructor}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        subject.status === 'Nearly Complete' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      }`}>
                        {subject.status}
                      </span>
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{subject.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{subject.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${subject.color}`}
                        style={{ width: `${subject.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {subject.completedLessons} of {subject.totalLessons} lessons completed
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <Users className="h-4 w-4 text-gray-500 dark:text-gray-400 mx-auto mb-1" />
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{subject.students}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Students</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 mx-auto mb-1" />
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{subject.totalLessons}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Lessons</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mx-auto mb-1" />
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{subject.upcomingDeadline}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Deadline</p>
                    </div>
                  </div>

                  {/* Next Lesson */}
                  <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                    <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Next Lesson</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{subject.nextLesson}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all group dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700">
                      <BookOpen className="h-4 w-4" />
                      Continue Learning
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <BarChart3 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar with Charts and Insights */}
        <div className="space-y-6">
          {/* Subject Distribution Chart */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Subject Distribution</h3>
              <PieChart className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            </div>
            <div className="space-y-4">
              {categoryData.map((category, index) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${category.color}`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{category.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{category.value} courses</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${category.color} rounded-full`}
                      style={{ width: `${(category.value / subjects.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Trend Chart */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Performance Trend</h3>
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-500" />
            </div>
            <div className="flex items-end justify-between h-40">
              {performanceData.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div 
                      className="w-8 bg-gradient-to-t from-green-400 to-green-500 dark:from-green-500 dark:to-green-600 rounded-t-lg hover:from-green-500 hover:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 transition-all duration-300 cursor-pointer group"
                      style={{ height: `${item.score * 0.4}px` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 dark:bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        Score: {item.score}%
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly average scores are improving!</p>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Upcoming Deadlines</h3>
              <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-500" />
            </div>
            <div className="space-y-3">
              {subjects
                .filter(subject => subject.upcomingDeadline !== 'Completed')
                .sort((a, b) => {
                  const order = { 'Today': 1, 'Tomorrow': 2, 'In 3 days': 3, 'In 5 days': 4, 'In 7 days': 5 }
                  return order[a.upcomingDeadline] - order[b.upcomingDeadline]
                })
                .slice(0, 3)
                .map((subject) => (
                  <div key={subject.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{subject.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{subject.nextLesson}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      subject.upcomingDeadline === 'Today' 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' 
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                    }`}>
                      {subject.upcomingDeadline}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Study Recommendations */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Study Focus</h3>
              <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            </div>
            <div className="space-y-3">
              {subjects
                .sort((a, b) => a.progress - b.progress)
                .slice(0, 2)
                .map((subject) => (
                  <div key={subject.id} className="p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${subject.color}`}>
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{subject.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Progress: {subject.progress}%</p>
                      </div>
                      <button className="px-3 py-1 rounded-lg bg-blue-600 dark:bg-blue-700 text-white text-xs font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                        Focus
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubjectsPage