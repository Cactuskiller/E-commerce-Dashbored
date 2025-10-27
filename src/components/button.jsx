const Button = ({ children, onClick, className = "", ...props }) => (
  <button
    className={`w-full py-3 rounded-xl bg-[#F83758] text-white text-base font-semibold hover:bg-[#e02f4f] transition ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);
export default Button;