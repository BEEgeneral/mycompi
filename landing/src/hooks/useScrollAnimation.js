import { useRef, useState, useEffect } from 'react'

export function useScrollAnimation(options = {}) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Una vez visible, disconnect para non volver a animnar
          observer.disconnect()
        }
      },
      { threshold: options.threshold || 0.1, ...options }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [options.threshold])

  return [ref, isVisible]
}

export function useStaggeredAnimation(itemCount, delayMs = 80) {
  const ref = useRef(null)
  const [visibleItems, setVisibleItems] = useState([])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Reveal items one by one
          for (let i = 0; i < itemCount; i++) {
            setTimeout(() => {
              setVisibleItems(prev => [...prev, i])
            }, i * delayMs)
          }
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [itemCount, delayMs])

  return [ref, visibleItems]
}
