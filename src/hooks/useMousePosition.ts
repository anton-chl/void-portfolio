import { useEffect, useRef } from 'react'

/** Normalized mouse position (-1 to 1), updated globally regardless of pointer-events */
const mouseNormalized = { x: 0, y: 0 }

let listenerAttached = false

function attachListener() {
  if (listenerAttached) return
  listenerAttached = true

  window.addEventListener('mousemove', (e) => {
    mouseNormalized.x = (e.clientX / window.innerWidth) * 2 - 1
    mouseNormalized.y = -(e.clientY / window.innerHeight) * 2 + 1
  }, { passive: true })
}

/** Returns a ref to the globally-tracked normalized mouse position */
export function useMousePosition() {
  const ref = useRef(mouseNormalized)

  useEffect(() => {
    attachListener()
  }, [])

  return ref
}
