import { FaTrash, FaSchool, FaTimes } from "react-icons/fa";

const DeleteSchoolModal = ({ school, onDelete, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTrash className="text-2xl text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Delete School</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete{" "}
            <span className="font-bold text-gray-800 dark:text-white">{school?.name}</span>?
            This action cannot be undone.
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3">
              <FaSchool className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-bold text-gray-800 dark:text-white">{school?.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {school?.board} • {school?.country}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onDelete}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-500 dark:to-pink-500 text-white font-bold rounded-xl hover:from-red-700 hover:to-pink-700 dark:hover:from-red-600 dark:hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
          >
            Delete School
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSchoolModal;