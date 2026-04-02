import { useEffect } from 'react'
import { useLocation, Routes, Route } from 'react-router-dom'
import { BackgroundCanvas } from './components/three/BackgroundCanvas'
import { Navigation } from './components/layout/Navigation'
import { Footer } from './components/layout/Footer'
import { PageTransition } from './components/layout/PageTransition'
import { SmoothScroll, useLenis } from './components/layout/SmoothScroll'
import { Home } from './routes/Home'
import { Projects } from './routes/Projects'
import { Art } from './routes/Art'
import { About } from './routes/About'
import { useScrollVelocity } from './hooks/useScrollProgress'
import { useState, useCallback } from 'react'
import type { SectionScrollData } from './components/three/SceneManager'

function ScrollToTop() {
  const { pathname } = useLocation()
  const lenis = useLenis()
  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, lenis])
  return null
}

const pageTitles: Record<string, string> = {
  '/': 'Anton Lee — Software Engineer & Visual Artist',
  '/about': 'About — Anton Lee',
  '/projects': 'Projects — Anton Lee',
  '/art': 'Art — Anton Lee',
}

function DocumentTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.title = pageTitles[pathname] || 'Anton Lee'
  }, [pathname])
  return null
}

function App() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isProjects = location.pathname === '/projects'
  const isAbout = location.pathname === '/about'
  const scrollVelocity = useScrollVelocity()

  const [heroProgress, setHeroProgress] = useState(1)
  const [sectionData, setSectionData] = useState<SectionScrollData[]>([])

  const handleHeroProgress = useCallback((p: number) => {
    setHeroProgress(p)
  }, [])

  const handleSectionData = useCallback((data: SectionScrollData[]) => {
    setSectionData(data)
  }, [])

  // Clear stale state immediately on route change.
  useEffect(() => {
    setSectionData([])
    if (!isHome) setHeroProgress(0)
  }, [location.pathname, isHome])

  return (
    <SmoothScroll>
      <ScrollToTop />
      <DocumentTitle />
      <div className="font-loader" aria-hidden="true" style={{ fontFamily: 'Raleway, Nasalization' }}>Anton Selected Work Connect</div>

      <BackgroundCanvas
        route={location.pathname}
        enablePointer={isHome && heroProgress > 0.8}
        heroProgress={isHome ? heroProgress : 0}
        scrollVelocity={scrollVelocity}
        sectionData={(isHome || isProjects || isAbout) ? sectionData : []}
      />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <Navigation />

        {/* location.key forces a full unmount/remount on every navigation,
            including revisiting the same route. No stale state possible. */}
        <Routes location={location} key={location.key}>
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

        <Footer />
      </div>
    </SmoothScroll>
  )
}

export default App
