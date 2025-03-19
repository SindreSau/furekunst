import FrameButton from '@/components/frame-button'

const NotFoundPage = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h1 className="mb-4 text-9xl font-bold">404</h1>
      <h2 className="mb-2 text-2xl font-semibold">Oisann!</h2>
      <p className="mb-8 max-w-md text-gray-600">
        Nå er du heilt nedsnøva. Sida du leita etter finst ikkje.
      </p>
      <FrameButton type="link" href="/" className="text-lg">
        Gå heim
      </FrameButton>
    </div>
  )
}

export default NotFoundPage
