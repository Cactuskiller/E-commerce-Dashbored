import React from "react";

const InputField = ({
  type = "text",
  placeholder,
  icon,
  value,
  onChange,
  ...props
}) => {
  const [show, setShow] = React.useState(false);
  const isPassword = type === "password"; //is used to design password field

  return (
    <div className="flex items-center bg-gray-100 border border-gray-300 rounded-xl px-4 py-2 mb-6">
      <span className="text-2xl text-gray-500 mr-3">{icon}</span>
      <input
        className="bg-transparent flex-1 outline-none text-gray-700 text-lg"
        type={isPassword && !show ? "password": "text"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
      {isPassword && (
        <button
        type="button"
        className="text-2xl text-gray-500 ml-3 focus:outline-none"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        >
         {show ? (
            // Eye open SVG
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#555" strokeWidth="2"/>
              <circle cx="12" cy="12" r="3" stroke="#555" strokeWidth="2"/>
            </svg>
          ) : (
            // Eye closed SVG
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#555" strokeWidth="2"/>
              <path d="M4 4l16 16" stroke="#555" strokeWidth="2"/>
            </svg>
          )}

        </button>
      )}

    </div>
  );
};

export default InputField;
