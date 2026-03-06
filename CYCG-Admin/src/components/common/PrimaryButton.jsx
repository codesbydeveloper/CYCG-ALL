function PrimaryButton({ children, type = 'button', disabled = false, onClick, className = '' }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg bg-[#2E2E2E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3A3A3A] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  )
}

export default PrimaryButton
