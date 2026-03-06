import logo from '../../assets/logo.svg'

function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="w-full rounded-[24px] border border-[#2E2E2E] bg-[#141414]/95 p-8 shadow-[0_40px_56px_0_#00000052] backdrop-blur-sm">
      <div className="mb-6 flex items-center gap-3">
        <img
          src={logo}
          alt="CYCG Logo"
          className="h-8 w-auto max-w-[132px] shrink-0 object-contain sm:h-9"
        />
        <div>
          <h1 className="font-kiona text-[28px] font-normal uppercase leading-[90%] text-white">
            {title}
          </h1>
          <p className="text-sm text-[#BEBEBE]">{subtitle}</p>
        </div>
      </div>
      {children}
      {footer ? <div className="mt-5 text-sm text-[#BEBEBE]">{footer}</div> : null}
    </div>
  )
}

export default AuthCard
