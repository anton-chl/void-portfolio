import { useLocation, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { BackgroundCanvas } from './components/three/BackgroundCanvas'
import { Navigation } from './components/layout/Navigation'
import { Footer } from './components/layout/Footer'
import { PageTransition } from './components/layout/PageTransition'
import { SmoothScroll } from './components/layout/SmoothScroll'
import { Home } from './routes/Home'
import { Projects } from './routes/Projects'
import { Art } from './routes/Art'
import { About } from './routes/About'
import { useScrollVelocity } from './hooks/useScrollProgress'
import { useState, useCallback } from 'react'
import type { SectionScrollData } from './components/three/SceneManager'

function App() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isProjects = location.pathname === '/projects'
  const isAbout = location.pathname === '/about'
  const scrollVelocity = useScrollVelocity()

  // Hero dissolve: 1 = fully visible, 0 = dissolved
  const [heroProgress, setHeroProgress] = useState(1)
  // Section particle headings
  const [sectionData, setSectionData] = useState<SectionScrollData[]>([])

  const handleHeroProgress = useCallback((p: number) => {
    setHeroProgress(p)
  }, [])

  const handleSectionData = useCallback((data: SectionScrollData[]) => {
    setSectionData(data)
  }, [])

  return (
    <SmoothScroll>
      <div className="font-loader" aria-hidden="true" style={{ fontFamily: 'Raleway, Nasalization' }}>Anton Selected Work Connect</div>

      {/* Layer 1: Persistent 3D Canvas */}
      <BackgroundCanvas
        route={location.pathname}
        enablePointer={isHome && heroProgress > 0.8}
        heroProgress={isHome ? heroProgress : 0}
        scrollVelocity={scrollVelocity}
        sectionData={(isHome || isProjects || isAbout) ? sectionData : []}
      />

      {/* Layer 2: DOM content */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <Navigation />

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <Home
                    onHeroProgress={handleHeroProgress}
                    onSectionData={handleSectionData}
                  />
                </PageTransition>
              }
            />
            <Route
              path="/projects"
              element={
                <PageTransition>
                  <Projects onSectionData={handleSectionData} />
                </PageTransition>
              }
            />
            <Route
              path="/art"
              element={
                <PageTransition>
                  <Art />
                </PageTransition>
              }
            />
            <Route
              path="/about"
              element={
                <PageTransition>
                  <About onSectionData={handleSectionData} />
                </PageTransition>
              }
            />
          </Routes>
        </AnimatePresence>

        <Footer />
      </div>
    </SmoothScroll>
  )
}

export default App
