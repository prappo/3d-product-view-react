import React, { Suspense, useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { ContactShadows, Environment, useGLTF, OrbitControls } from "@react-three/drei"
import { HexColorPicker } from "react-colorful"
import { proxy, useSnapshot } from "valtio"

import "rsuite/dist/styles/rsuite-default.css"
import { Button, IconButton, Drawer, ButtonGroup, ButtonToolbar } from "rsuite"

// design reference : https://dribbble.com/shots/14821385-Shopping-App/attachments/6529544?mode=media

// Using a Valtio state model to bridge reactivity between
// the canvas and the dom, both can write to it and/or react to it.
const state = proxy({
  current: null,
  checkoutWindow: false,
  items: {
    laces: "#ffffff",
    mesh: "#ffffff",
    caps: "#ffffff",
    inner: "#ffffff",
    sole: "#ffffff",
    stripes: "#ffffff",
    band: "#ffffff",
    patch: "#ffffff",
  },
})

function Shoe() {
  const ref = useRef()
  const snap = useSnapshot(state)
  // Drei's useGLTF hook sets up draco automatically, that's how it differs from useLoader(GLTFLoader, url)
  // { nodes, materials } are extras that come from useLoader, these do not exist in threejs/GLTFLoader
  // nodes is a named collection of meshes, materials a named collection of materials
  const { nodes, materials } = useGLTF("shoe-draco.glb")

  // Animate model
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    ref.current.rotation.z = -0.2 - (1 + Math.sin(t / 1.5)) / 20
    ref.current.rotation.x = Math.cos(t / 4) / 8
    ref.current.rotation.y = Math.sin(t / 4) / 8
    ref.current.position.y = (1 + Math.sin(t / 1.5)) / 10
  })

  // Cursor showing current color
  const [hovered, set] = useState(null)
  useEffect(() => {
    const cursor = `<svg width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path fill="rgba(255, 255, 255, 0.5)" d="M29.5 54C43.031 54 54 43.031 54 29.5S43.031 5 29.5 5 5 15.969 5 29.5 15.969 54 29.5 54z" stroke="#000"/><g filter="url(#filter0_d)"><path d="M29.5 47C39.165 47 47 39.165 47 29.5S39.165 12 29.5 12 12 19.835 12 29.5 19.835 47 29.5 47z" fill="${snap.items[hovered]}"/></g><path d="M2 2l11 2.947L4.947 13 2 2z" fill="#000"/><text fill="#000" style="white-space:pre" font-family="Inter var, sans-serif" font-size="10" letter-spacing="-.01em"><tspan x="35" y="63">${hovered}</tspan></text></g><defs><clipPath id="clip0"><path fill="#fff" d="M0 0h64v64H0z"/></clipPath><filter id="filter0_d" x="6" y="8" width="47" height="47" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="2"/><feGaussianBlur stdDeviation="3"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter></defs></svg>`
    const auto = ``
    document.body.style.cursor = `url('data:image/svg+xml;base64,${btoa(hovered ? cursor : auto)}'), auto`
  }, [hovered])

  // Using the GLTFJSX output here to wire in app-state and hook up events
  return (
    <group
      ref={ref}
      dispose={null}
      onPointerOver={(e) => (e.stopPropagation(), set(e.object.material.name))}
      onPointerOut={(e) => e.intersections.length === 0 && set(null)}
      onPointerMissed={() => (state.current = null)}
      onPointerDown={(e) => (e.stopPropagation(), (state.current = e.object.material.name))}>
      <mesh receiveShadow castShadow geometry={nodes.shoe.geometry} material={materials.laces} material-color={snap.items.laces} />
      <mesh receiveShadow castShadow geometry={nodes.shoe_1.geometry} material={materials.mesh} material-color={snap.items.mesh} />
      <mesh receiveShadow castShadow geometry={nodes.shoe_2.geometry} material={materials.caps} material-color={snap.items.caps} />
      <mesh receiveShadow castShadow geometry={nodes.shoe_3.geometry} material={materials.inner} material-color={snap.items.inner} />
      <mesh receiveShadow castShadow geometry={nodes.shoe_4.geometry} material={materials.sole} material-color={snap.items.sole} />
      <mesh receiveShadow castShadow geometry={nodes.shoe_5.geometry} material={materials.stripes} material-color={snap.items.stripes} />
      <mesh receiveShadow castShadow geometry={nodes.shoe_6.geometry} material={materials.band} material-color={snap.items.band} />
      <mesh receiveShadow castShadow geometry={nodes.shoe_7.geometry} material={materials.patch} material-color={snap.items.patch} />
    </group>
  )
}

function ItemList() {
  var itemsList = []

  const snap = useSnapshot(state)

  Object.keys(snap.items).map(function (keyName, keyIndex) {
    itemsList.push(keyName)
  })

  console.log(itemsList)
  const hh = itemsList.map((item) => (
    <li
      className="itemsList"
      key={item}
      style={{
        display: snap.current === item ? "" : "none",
      }}>
      <div className="selectedItemName">{item.toUpperCase()}</div>
      <div
        style={{
          background: snap.current === item ? snap.items[snap.current] : "white",
          fontStyle: "bold",
        }}
        className="colorView"></div>
    </li>
  ))

  return (
    <>
      <ul>{hh}</ul>
    </>
  )
}

function Picker() {
  const snap = useSnapshot(state)
  return (
    <div className="pik" style={{ display: snap.current ? "block" : "none" }}>
      <div>
        <HexColorPicker className="picker" color={snap.items[snap.current]} onChange={(color) => (state.items[snap.current] = color)} />
      </div>
      {/* <h3>{snap.current}</h3> */}
    </div>
  )
}

function Footer() {
  const snap = useSnapshot(state)
  return (
    <div className="footer">
      <div className="leftSection">
        <h1>Product Name</h1>
        <span>lorem </span>
      </div>
      <div className="rightSection">
        <Button onClick={() => (state.checkoutWindow = true)} appearance="primary" block>
          Add to cart
        </Button>
      </div>
    </div>
  )
}

function Header() {
  return (
    <>
      <div className="header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}>
          <ItemList />
        </div>

        <div>
          <Picker />
        </div>
      </div>
    </>
  )
}

function CheckOut() {
  const snap = useSnapshot(state)

  return (
    <Drawer show={snap.checkoutWindow} onHide={() => (state.checkoutWindow = false)}>
      <Drawer.Header>
        <Drawer.Title>Check Out</Drawer.Title>
      </Drawer.Header>
      <Drawer.Body></Drawer.Body>
      <Drawer.Footer>
        <Button onClick={() => (state.checkoutWindow = false)} appearance="primary">
          Confirm
        </Button>
        <Button onClick={() => (state.checkoutWindow = false)} appearance="subtle">
          Cancel
        </Button>
      </Drawer.Footer>
    </Drawer>
  )
}

export default function App() {
  return (
    <>
      <Header />
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <spotLight intensity={0.5} angle={0.1} penumbra={1} position={[10, 15, 10]} castShadow />
        <Suspense fallback={null}>
          <Shoe />
          <Environment preset="city" />
          <ContactShadows rotation-x={Math.PI / 2} position={[0, -0.8, 0]} opacity={0.25} width={10} height={10} blur={1.5} far={0.8} />
        </Suspense>
        <OrbitControls minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} enableZoom={false} enablePan={false} />
      </Canvas>

      <Footer />

      <CheckOut />
    </>
  )
}
