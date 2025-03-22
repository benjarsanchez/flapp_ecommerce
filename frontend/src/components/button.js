// components/button.js
export default function Button({ label, onClick, disabled, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 m-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ${className}`}
    >
      {label}
    </button>
  );
}