type FrameWrapperProps = {
  children: React.ReactNode
  passpartout: boolean
}

const FrameWrapper = ({ children, passpartout }: FrameWrapperProps) => {
  return (
    <article
      className={`border-6 border-slate-800 ${passpartout ? 'p-3' : ''}`}
    >
      {children}
    </article>
  )
}

export default FrameWrapper
