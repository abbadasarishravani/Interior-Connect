import React, { useState } from 'react'
import ModelViewer from './ModelViewer'

export default function DesignCard({ design, onOpenAR }) {
  const [liked, setLiked] = useState(false)

  const toggleLike = async () => {
    setLiked((s) => !s)
    try {
      await fetch(`/api/designs/${design._id || design.id}/like`, { method: 'POST' })
    } catch (e) {
      console.warn('Like failed', e.message)
    }
  }

  return (
    <div className="design-card">
      <div className="design-thumb">
        {design.assets && design.assets[0] ? (
          <img src={design.assets[0].url} alt={design.title || 'design'} />
        ) : (
          <div className="design-placeholder">No image</div>
        )}
      </div>
      <div className="design-body">
        <h4>{design.title || 'Untitled'}</h4>
        <p className="design-cats">{(design.categories || []).join(', ')}</p>
        <div className="design-actions">
          <button onClick={toggleLike}>{liked ? '♥ Liked' : '♡ Like'}</button>
          <button onClick={() => onOpenAR && onOpenAR(design)}>AR / 3D View</button>
        </div>
      </div>
    </div>
  )
}
