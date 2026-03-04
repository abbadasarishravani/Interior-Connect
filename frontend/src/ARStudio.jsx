import React, { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, TransformControls, useGLTF, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

function Room({ dims, wallTexture, floorTexture, wallColor = '#f0f0f0', floorColor = '#ddd5ca' }) {
  const { length, width, height } = dims
  const halfL = length / 2
  const halfW = width / 2

  const wallMatRef = useRef(new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.6, metalness: 0.1 }))
  const floorMatRef = useRef(new THREE.MeshStandardMaterial({ color: floorColor, roughness: 0.7, metalness: 0 }))

  // Update material colors
  useEffect(() => {
    wallMatRef.current.color.set(wallColor)
    wallMatRef.current.needsUpdate = true
  }, [wallColor])

  useEffect(() => {
    floorMatRef.current.color.set(floorColor)
    floorMatRef.current.needsUpdate = true
  }, [floorColor])

  // Load wall texture
  useEffect(() => {
    const material = wallMatRef.current
    if (wallTexture && wallTexture.trim()) {
      const loader = new THREE.TextureLoader()
      loader.load(
        wallTexture,
        (tex) => {
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping
          tex.repeat.set(Math.max(2, length / 2), Math.max(2, height / 2))
          tex.magFilter = THREE.LinearFilter
          tex.minFilter = THREE.LinearMipmapLinearFilter
          material.map = tex
          material.needsUpdate = true
          console.log('Wall texture loaded:', wallTexture)
        },
        undefined,
        (err) => console.warn('Wall texture load error:', wallTexture, err),
      )
    } else {
      material.map = null
      material.needsUpdate = true
    }
  }, [wallTexture, length, height])

  // Load floor texture
  useEffect(() => {
    const material = floorMatRef.current
    if (floorTexture && floorTexture.trim()) {
      const loader = new THREE.TextureLoader()
      loader.load(
        floorTexture,
        (tex) => {
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping
          tex.repeat.set(Math.max(2, length / 2), Math.max(2, width / 2))
          tex.magFilter = THREE.LinearFilter
          tex.minFilter = THREE.LinearMipmapLinearFilter
          material.map = tex
          material.needsUpdate = true
          console.log('Floor texture loaded:', floorTexture)
        },
        undefined,
        (err) => console.warn('Floor texture load error:', floorTexture, err),
      )
    } else {
      material.map = null
      material.needsUpdate = true
    }
  }, [floorTexture, length, width])

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[length, width]} />
        <primitive object={floorMatRef.current} attach="material" />
      </mesh>

      {/* Walls */}
      <mesh position={[halfL, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <primitive object={wallMatRef.current} attach="material" />
      </mesh>
      <mesh position={[-halfL, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <primitive object={wallMatRef.current} attach="material" />
      </mesh>
      <mesh position={[0, height / 2, halfW]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[length, height]} />
        <primitive object={wallMatRef.current} attach="material" />
      </mesh>
      <mesh position={[0, height / 2, -halfW]} rotation={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[length, height]} />
        <primitive object={wallMatRef.current} attach="material" />
      </mesh>
    </group>
  )
}


function ModelWrapper({ url, item, selected, onSelect, onTransform }) {
  const gltf = useGLTF(url)
  const meshRef = useRef()
  const controlRef = useRef()

  useEffect(() => {
    const ctrl = controlRef.current
    if (!ctrl) return
    const handler = () => {
      const o = meshRef.current
      if (!o) return
      onTransform({
        position: { x: o.position.x, y: o.position.y, z: o.position.z },
        rotation: { x: o.rotation.x, y: o.rotation.y, z: o.rotation.z },
        scale: { x: o.scale.x, y: o.scale.y, z: o.scale.z },
      })
    }
    ctrl.addEventListener('change', handler)
    return () => ctrl.removeEventListener('change', handler)
  }, [onTransform])

  return (
    <TransformControls ref={controlRef} mode="translate" enabled={selected}>
      <primitive
        ref={meshRef}
        object={gltf.scene.clone(true)}
        position={[item.position.x, item.position.y, item.position.z]}
        rotation={[item.rotation.x, item.rotation.y, item.rotation.z]}
        scale={[item.scale.x, item.scale.y, item.scale.z]}
        castShadow
        receiveShadow
        onPointerDown={(e) => { e.stopPropagation(); onSelect(item.id) }}
      />
    </TransformControls>
  )
}

export default function ARStudio({ user }) {
  const [dims, setDims] = useState({ length: 5, width: 4, height: 2.8 })
  const [roomType, setRoomType] = useState('Living room')
  const [style, setStyle] = useState('Modern')
  const [furniture, setFurniture] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [wallTexture, setWallTexture] = useState('')
  const [floorTexture, setFloorTexture] = useState('')
  const [wallColor, setWallColor] = useState('#f0f0f0')
  const [floorColor, setFloorColor] = useState('#ddd5ca')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [estimatedCost, setEstimatedCost] = useState(15000)

  const SAMPLE_MODELS = {
    table: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/Box/glTF-Binary/Box.glb',
    sofa: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/BoomBox/glTF-Binary/BoomBox.glb',
    bed: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/Avocado/glTF-Binary/Avocado.glb',
  }

  const SAMPLE_TEXTURES = {
    wood: 'https://threejs.org/examples/textures/uv_grid_opengl.jpg',
    marble: 'https://threejs.org/examples/textures/brick_bump.jpg',
    tiles: 'https://threejs.org/examples/textures/hardwood2_diffuse.jpg',
  }

  const addFurniture = (type) => {
    const id = Date.now().toString()
    const costs = { sofa: 25000, bed: 35000, table: 8000 }
    const item = {
      id,
      type,
      modelUrl: SAMPLE_MODELS[type] || SAMPLE_MODELS.table,
      position: { x: 0, y: 0.1, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      cost: costs[type] || 5000,
    }
    setFurniture((f) => [...f, item])
    setEstimatedCost((c) => c + item.cost)
    setSelectedId(id)
  }

  const persistTransform = (id, transform) => {
    setFurniture((f) => f.map((it) => (it.id === id ? { ...it, ...transform } : it)))
  }

  const removeSelected = () => {
    const item = furniture.find((f) => f.id === selectedId)
    if (item) setEstimatedCost((c) => c - item.cost)
    setFurniture((f) => f.filter((it) => it.id !== selectedId))
    setSelectedId(null)
  }

  const handlePayment = () => {
    if (!user) {
      alert('Please log in to proceed with payment')
      return
    }

    // Load Razorpay SDK dynamically
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      const options = {
        key: 'rzp_test_1DP5mmOlF5G0ab', // Demo test key
        amount: Math.round(estimatedCost * 100), // Amount in paise
        currency: 'INR',
        name: 'InteriorConnect AR Design',
        description: `Design: ${style} style ${roomType}`,
        image: 'https://your-logo-url.png',
        prefill: {
          name: user.name || '',
          email: user.email || '',
        },
        theme: {
          color: '#2a9d8f',
        },
        handler: function (response) {
          alert(`✅ Payment successful!\nPayment ID: ${response.razorpay_payment_id}\n\nYour design has been saved. You can now proceed with your interior designer.`)
          setShowPaymentModal(false)
          // In production, send payment details to backend to create booking
        },
        modal: {
          ondismiss: function () {
            console.log('Payment cancelled')
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    }
    document.head.appendChild(script)
  }

  return (
    <section id="ar-studio" className="ic-section ic-ar-studio-section">
      <div className="ic-ar-container">
        {/* Left Panel */}
        <div className="ic-ar-panel ic-ar-left-panel">
          <div className="ic-ar-header">
            <h2>🎨 AR Studio</h2>
            <p>Design your perfect space in real time</p>
          </div>

          <div className="ic-ar-group">
            <h3>📐 Room Dimensions</h3>
            <div className="ic-ar-grid-2">
              <div className="ic-ar-input-group">
                <label>Length (m)</label>
                <input type="number" step="0.1" value={dims.length} onChange={(e) => setDims({ ...dims, length: Number(e.target.value) })} />
              </div>
              <div className="ic-ar-input-group">
                <label>Width (m)</label>
                <input type="number" step="0.1" value={dims.width} onChange={(e) => setDims({ ...dims, width: Number(e.target.value) })} />
              </div>
              <div className="ic-ar-input-group">
                <label>Height (m)</label>
                <input type="number" step="0.05" value={dims.height} onChange={(e) => setDims({ ...dims, height: Number(e.target.value) })} />
              </div>
              <div className="ic-ar-input-group">
                <label>Room Type</label>
                <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                  <option>Living room</option>
                  <option>Bedroom</option>
                  <option>Kitchen</option>
                  <option>Balcony</option>
                  <option>Home office</option>
                  <option>Dining</option>
                  <option>Studio</option>
                </select>
              </div>
            </div>
          </div>

          <div className="ic-ar-group">
            <h3>🎨 Materials & Colors</h3>
            <div className="ic-ar-grid-2">
              <div className="ic-ar-color-group">
                <label>Wall Color</label>
                <div className="ic-ar-color-picker">
                  <input type="color" value={wallColor} onChange={(e) => setWallColor(e.target.value)} />
                  <span>{wallColor}</span>
                </div>
              </div>
              <div className="ic-ar-color-group">
                <label>Floor Color</label>
                <div className="ic-ar-color-picker">
                  <input type="color" value={floorColor} onChange={(e) => setFloorColor(e.target.value)} />
                  <span>{floorColor}</span>
                </div>
              </div>
            </div>
            <div className="ic-ar-texture-buttons">
              <button className="ic-ar-texture-btn" onClick={() => setWallTexture(SAMPLE_TEXTURES.wood)}>🪵 Wood Walls</button>
              <button className="ic-ar-texture-btn" onClick={() => setWallTexture(SAMPLE_TEXTURES.marble)}>💎 Marble Walls</button>
              <button className="ic-ar-texture-btn" onClick={() => setFloorTexture(SAMPLE_TEXTURES.wood)}>🪵 Wood Floor</button>
              <button className="ic-ar-texture-btn" onClick={() => setFloorTexture(SAMPLE_TEXTURES.tiles)}>🟫 Tile Floor</button>
            </div>
          </div>

          <div className="ic-ar-group">
            <h3>✨ Design Styles</h3>
            <div className="ic-ar-style-buttons">
              {['Modern', 'Minimal', 'Traditional', 'Scandinavian', 'Industrial', 'Luxury'].map((s) => (
                <button
                  key={s}
                  className={`ic-ar-style-btn ${style === s ? 'active' : ''}`}
                  onClick={() => setStyle(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="ic-ar-group">
            <h3>🛋️ Furniture Library</h3>
            <div className="ic-ar-furniture-buttons">
              <button className="ic-ar-add-btn" onClick={() => addFurniture('sofa')}>➕ Sofa</button>
              <button className="ic-ar-add-btn" onClick={() => addFurniture('bed')}>➕ Bed</button>
              <button className="ic-ar-add-btn" onClick={() => addFurniture('table')}>➕ Table</button>
              <button className="ic-ar-delete-btn" onClick={removeSelected} disabled={!selectedId}>🗑️ Delete</button>
            </div>
          </div>

          <div className="ic-ar-group">
            <h3>💰 Cost Estimate</h3>
            <div className="ic-ar-cost-display">
              <span className="ic-ar-cost-label">Total Design Cost:</span>
              <span className="ic-ar-cost-value">₹{estimatedCost.toLocaleString('en-IN')}</span>
            </div>
            <button className="ic-ar-payment-btn" onClick={() => setShowPaymentModal(true)}>
              💳 Proceed to Payment
            </button>
          </div>
        </div>

        {/* Center - 3D Canvas */}
        <div className="ic-ar-canvas-wrapper">
          <Canvas camera={{ position: [4, 3, 5], fov: 50 }} style={{ width: '100%', height: '100%' }} shadows>
            <PerspectiveCamera makeDefault position={[4, 3, 5]} fov={50} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
            <pointLight position={[0, 2.5, 0]} intensity={0.5} />
            <OrbitControls makeDefault />
            <group position={[0, 0, 0]}>
              <Room dims={dims} wallTexture={wallTexture} floorTexture={floorTexture} wallColor={wallColor} floorColor={floorColor} />
              {furniture.map((it) => (
                <ModelWrapper
                  key={it.id}
                  url={it.modelUrl}
                  item={it}
                  selected={selectedId === it.id}
                  onSelect={(id) => setSelectedId(id)}
                  onTransform={(t) => persistTransform(it.id, t)}
                />
              ))}
            </group>
          </Canvas>
        </div>

        {/* Right Panel */}
        <div className="ic-ar-panel ic-ar-right-panel">
          <div className="ic-ar-info-card">
            <h3>📋 Design Summary</h3>
            <div className="ic-ar-summary">
              <div className="ic-ar-summary-item">
                <span className="label">Style:</span>
                <span className="value">{style}</span>
              </div>
              <div className="ic-ar-summary-item">
                <span className="label">Room Type:</span>
                <span className="value">{roomType}</span>
              </div>
              <div className="ic-ar-summary-item">
                <span className="label">Room Size:</span>
                <span className="value">{dims.length}m × {dims.width}m × {dims.height}m</span>
              </div>
              <div className="ic-ar-summary-item">
                <span className="label">Items:</span>
                <span className="value">{furniture.length}</span>
              </div>
            </div>
          </div>

          <div className="ic-ar-info-card">
            <h3>✅ Tips</h3>
            <ul className="ic-ar-tips">
              <li>Click items to select and drag to move</li>
              <li>Use mouse wheel to zoom</li>
              <li>Right-click to rotate view</li>
              <li>Select a style first to set the mood</li>
            </ul>
          </div>

          <div className="ic-ar-info-card">
            <h3>🎬 Actions</h3>
            <button className="ic-ar-action-btn" onClick={() => alert('Screenshot saved! (Feature in dev)')}>📸 Screenshot</button>
            <button className="ic-ar-action-btn" onClick={() => alert('Design saved to favorites! (Feature in dev)')}>❤️ Save Design</button>
            <button className="ic-ar-action-btn" onClick={() => alert('Share link copied! (Feature in dev)')}>🔗 Share</button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="ic-ar-modal-backdrop" onClick={() => setShowPaymentModal(false)}>
          <div className="ic-ar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ic-ar-modal-header">
              <h3>💳 Secure Payment</h3>
              <button className="ic-ar-modal-close" onClick={() => setShowPaymentModal(false)}>✕</button>
            </div>
            <div className="ic-ar-modal-content">
              <div className="ic-ar-payment-summary">
                <h4>Payment Summary</h4>
                <div className="ic-ar-payment-item">
                  <span>Design Service ({style} {roomType}):</span>
                  <span>₹{estimatedCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="ic-ar-payment-item">
                  <span>Furniture & Materials ({furniture.length} items):</span>
                  <span>Included</span>
                </div>
                <hr />
                <div className="ic-ar-payment-total">
                  <span>Total Amount:</span>
                  <span>₹{estimatedCost.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <p className="ic-ar-payment-note">🔒 Powered by Razorpay - Secure payment gateway</p>
              <button className="ic-ar-payment-proceed-btn" onClick={handlePayment}>
                Proceed to Razorpay Payment
              </button>
              <button className="ic-ar-payment-cancel-btn" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
