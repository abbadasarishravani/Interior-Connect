import React, { useState, useEffect } from 'react'
import ProjectGallery from './ProjectGallery'
import AR3DModal from './AR3DModal'

export default function DesignerProfile({ designerId, user }) {
  const [designer, setDesigner] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showAR, setShowAR] = useState(false)
  const [likedDesigns, setLikedDesigns] = useState([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/designers/${designerId}`)
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        setDesigner(data)
      } catch (e) {
        console.warn('Designer load failed')
      } finally {
        setLoading(false)
      }
    }
    if (designerId) load()
  }, [designerId])

  // For demo, liked designs are filtered from designer designs if user has saved IDs
  useEffect(() => {
    if (!designer) return
    // In a real app, fetch user's saved designs. Here, just pick some items.
    setLikedDesigns((designer.designs || []).slice(0, 3))
  }, [designer])

  if (loading) return <div>Loading designer...</div>
  if (!designer) return <div>No designer selected</div>

  return (
    <section id="designer-profile" className="designer-profile">
      <div className="designer-hero">
        <img src={designer.image} alt={designer.displayName} className="designer-avatar" />
        <div className="designer-meta">
          <h2>{designer.displayName}</h2>
          <p>{designer.description}</p>
          <div className="designer-tags">{(designer.styles || []).join(' • ')}</div>
          <button onClick={() => setShowAR(true)}>Open AR / 3D View</button>
        </div>
      </div>

      <div className="designer-portfolio">
        <h3>Recent Projects</h3>
        <ProjectGallery designs={designer.designs || []} onOpenAR={() => setShowAR(true)} />
      </div>

      <AR3DModal open={showAR} onClose={() => setShowAR(false)} designer={designer} likedDesigns={likedDesigns} />
    </section>
  )
}
