"use client"

interface LoadingProps {
  text?: string
  size?: "sm" | "md" | "lg"
}

export function Loading({ text = "Loading", size = "md" }: LoadingProps) {
  const sizeMap = {
    sm: 80,
    md: 120,
    lg: 160,
  }

  const containerSize = sizeMap[size]

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="relative animate-spin" style={{ width: containerSize, height: containerSize }}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i * 45 * Math.PI) / 180
          const radius = containerSize / 2 - 20
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          
          return (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 animate-pulse"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          )
        })}
      </div>
      <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
        {text}...
      </p>
    </div>
  )
}
