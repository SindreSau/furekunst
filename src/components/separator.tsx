import { cn } from '@/lib/utils'

interface SeparatorProps {
  className?: string
}

const Separator = ({ className }: SeparatorProps) => {
  return <div className={cn('h-px w-full bg-gray-300', className)}></div>
}

export default Separator
