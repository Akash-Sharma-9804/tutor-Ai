import { FaSearch, FaFilter, FaTimes, FaBookOpen } from "react-icons/fa";

const BooksFilters = ({
  searchTerm,
  setSearchTerm,
  selectedSchool,
  setSelectedSchool,
  selectedClass,
  setSelectedClass,
  selectedSubject,
  setSelectedSubject,
  schools,
  classes,
  subjects,
  filteredBooks,
  totalBooks,
  clearFilters,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search books by title, author, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <select
            name="school"
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-800 dark:text-white appearance-none"
          >
            <option value="">Select School</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name} ({school.board || "No board"})
              </option>
            ))}
          </select>
          <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            name="class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={!selectedSchool}
            className={`w-full pl-4 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-800 dark:text-white appearance-none ${
              !selectedSchool
                ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
            }`}
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.class_name}
              </option>
            ))}
          </select>
          <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            name="subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={!selectedClass}
            className={`w-full pl-4 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-800 dark:text-white appearance-none ${
              !selectedClass
                ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
            }`}
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name || subject.subject_name}
              </option>
            ))}
          </select>
          <FaBookOpen className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-gray-600 dark:text-gray-300">
          Showing <span className="font-bold text-gray-800 dark:text-white">{filteredBooks.length}</span>{" "}
          of <span className="font-bold text-gray-800 dark:text-white">{totalBooks}</span> books
        </p>
        {(searchTerm || selectedSchool || selectedClass || selectedSubject) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center"
          >
            <FaTimes className="mr-2" />
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default BooksFilters;