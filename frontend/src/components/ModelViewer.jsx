import React, { useEffect, useRef } from 'react'

export default function ModelViewer({ src, alt = '3D Model', iosSrc, className = '' }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!containerRef.current) return

    // Check if model-viewer is already loaded
    if (window.customElements && window.customElements.get && window.customElements.get('model-viewer')) {
      console.log('model-viewer already loaded')
      return
    }

    console.log('Loading model-viewer script...')
    const script = document.createElement('script')
    script.type = 'module'
    script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js'
    script.async = true
    script.onload = () => {
      console.log('model-viewer script loaded successfully')
    }
    script.onerror = () => {
      console.error('Failed to load model-viewer script')
    }
    document.head.appendChild(script)
  }, [])

  if (!src) return <div className={className}>No model provided</div>

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <model-viewer
        src={src}
        ios-src={iosSrc || src}
        alt={alt}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        interaction-prompt="auto"
        auto-rotate
        style={{ 
          width: '100%', 
          height: '100%',
          display: 'block'
        }}
      ></model-viewer>
    </div>
  )
}
