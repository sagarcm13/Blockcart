/* eslint-disable react/prop-types */

export default function PopUp({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto">
          <h2 className="text-lg font-semibold mb-4">You need to login to use this feature</h2>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onConfirm}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Yes
            </button>
            <button
              onClick={onClose}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              No
            </button>
          </div>
        </div>
      </div>
    );
  };