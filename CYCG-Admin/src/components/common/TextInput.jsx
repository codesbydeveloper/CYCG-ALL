function TextInput({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[#D5D5D5]">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#2E2E2E] bg-[#121212] px-3 py-2.5 text-sm text-white outline-none ring-[#4B5563] placeholder:text-[#808080] focus:ring"
      />
    </label>
  )
}

export default TextInput
