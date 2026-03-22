import type { Project, Artwork, Experience } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// SITE CONFIG
// ─────────────────────────────────────────────────────────────────────────────

export const siteConfig = {
  name: 'Anton Lee',
  initials: 'ACHL',
  title: 'Computer Engineering',
  school: 'University of Waterloo',
  location: 'Toronto, Canada',
  email: 'antonlee.inquiries@gmail.com',
  github: 'https://github.com/anton-chl',
  linkedin: 'https://www.linkedin.com/in/anton-chl',
  devpost: 'https://devpost.com/cx',
  resumeUrl: '/Resume.pdf',
  taglines: [
    'Software Engineer',
    'Computer Vision',
    'ML & Systems',
    'Designer',
    'Visual Artist',
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// ABOUT
// ─────────────────────────────────────────────────────────────────────────────

export const about = {
  bio: [
    "I'm a Computer Engineering student at the University of Waterloo with a love for mathematics and computer science. Right now, my interests lie heavily in machine learning and computer vision, and med tech.",
    "When I'm not making projects, doing hackathons, or schoolwork, I like to indulge myself in visual art, whether it's drawing, painting, or even origami.",
  ],
  photo: '/me-using-lattice.jpg',
  skillGroups: [
    { label: 'Languages', skills: ['Python', 'C/C++', 'C#', 'Java', 'HTML/CSS', 'JavaScript/TypeScript', 'Go'] },
    { label: 'Frontend', skills: ['React', 'Next.js', 'Tailwind CSS'] },
    { label: 'Backend & Infra', skills: ['Flask', 'AWS Lambda', 'MongoDB', 'PostgreSQL'] },
    { label: 'ML & CV', skills: ['PyTorch', 'TensorFlow', 'OpenCV', 'MediaPipe'] },
    { label: 'Tools', skills: ['Git', 'Docker', 'Jira', 'CMake', 'Qt', 'VTK/ITK'] },
    { label: 'Other', skills: ['Graphic Design', 'Photoshop', 'CAD Modeling'] },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPERIENCE
// ─────────────────────────────────────────────────────────────────────────────

export const experiences: Experience[] = [
  {
    title: 'Software Engineer',
    company: 'The Hospital for Sick Children (SickKids)',
    period: 'Jan 2026 — Apr 2026',
    bullets: [
      'Implemented interactive 2D/3D visualization and segmentation using C++/Qt/VTK/ITK with DICOM support via DCMTK.',
      'Reduced visualization latency on large CT volumes by up to 10x through GPU-accelerated volume rendering, multiresolution streaming, threaded processing, and caching.',
    ],
    technologies: ['C++', 'Python', 'Qt', 'VTK', 'ITK', 'DCMTK'],
  },
  {
    title: 'Software Development Tester',
    company: 'Lumeto Inc.',
    period: 'May 2025 — Aug 2025',
    bullets: [
      'Built automated performance and regression suites integrated into CI with benchmarks and dashboards to monitor throughput and latency.',
      'Triaged issues in Jira with reproducible steps and validated fixes with engineers before release to reduce regressions.',
    ],
    technologies: ['Testing', 'Jira', 'Performance Analysis', 'CI/CD', 'Benchmarking'],
  },
  {
    title: 'Startup Co-Founder & COO',
    company: 'Flair Studio Inc.',
    period: 'Jun 2024 — Sep 2025',
    bullets: [
      'Co-founded an AI shopping app and aggregator with 100K+ products; Top 5% of YC S25 applicants.',
      'Built a scalable backend that reduced feed latency from 5,000 ms to 275 ms, increasing session time by 40% via caching, async pipelines, and inference optimizations.',
      'Designed a React/Next.js frontend with dynamic filtering, infinite scroll, and personalized recommendations.',
    ],
    technologies: ['Next.js', 'React', 'Flask', 'AWS Lambda', 'MongoDB', 'Azure OpenAI'],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────────────────────────────────────

export const projects: Project[] = [
  {
    id: '1',
    slug: 'lattice',
    title: 'Lattice',
    description:
      'Distributed multi-sensor volumetric capture leveraging multi-Kinect LiDAR arrays with Procrustes and ICP-based spatial alignment, zero-copy ring buffers for lock-free inter-process communication, and 4DGS-style reconstruction to generate navigable 3D point clouds with Git-style holographic replay across desktop, web, and AR/VR',
    tags: ['C/C++', 'C#', '.NET', 'Python', 'OpenCV', 'Unity', 'Kinect SDK'],
    theme: '3D Vision / Systems',
    thumbnailColor: '#1a0a2e',
    liveUrl: 'https://devpost.com/software/tempo-l1idkw',
    videoUrl: 'https://www.youtube.com/watch?v=YqKwPFIWVN0',
    imageSrc: '/lattice-banner.png',
    plySrc: '/3dImage.lssnap',
    collaborators: [
      { name: 'Yair Korok', url: 'https://yair.ca' },
      { name: 'Ethan Kong', url: 'https://ethankong.org' },
    ],
    award: 'Finalist — Hack the North 2025',
    year: 2026,
    featured: true,
  },
  {
    id: '2',
    slug: 'hello-world',
    title: 'Hello World!',
    description:
      'Two-way ASL/English translation app using TensorFlow and Google Cloud API to recognize ASL hand gestures in real time and translate them to text (or vice versa, with animated output) and synthesized audio output, making computers more accessible for the deaf and hard-of-hearing community.',
    tags: ['JavaScript', 'TypeScript', 'TensorFlow', 'Google Cloud API'],
    theme: 'Machine Learning / Accessibility',
    thumbnailColor: '#0f0f14',
    liveUrl: 'https://devpost.com/software/hello-world-t1k74i',
    githubUrl: 'https://github.com/yair-k/Hello-World',
    imageSrc: '/hello-world.webp',
    award: '1st Place — UTS BluesHacks 2024',
    year: 2024,
    featured: true,
  },
  {
    id: '3',
    slug: 'bergster',
    title: 'Bergster',
    description:
      'Cognitive training tool that uses real-time facial recognition and emotion detection to help people with social disabilities train and improve their emotional recognition and expression. Features offline-first design, performance analysis with visual charts, and emotion testing for measurable progress tracking.',
    tags: ['React', 'Next.js', 'TensorFlow', 'face-api.js', 'TailwindCSS'],
    theme: 'Healthcare / Accessibility',
    thumbnailColor: '#16161e',
    liveUrl: 'https://devpost.com/software/the-bergster',
    githubUrl: 'https://github.com/yair-k/bergster-master',
    imageSrc: '/bergster.png',
    award: '3rd Place — Guelph GDSC Hacks 2024',
    year: 2024,
    featured: true,
  },
  {
    id: '4',
    slug: 'databot',
    title: 'DataBot',
    description:
      'Tool for analyzing slow or inefficient SQL queries; uses Google Gemini to suggest optimized rewrites, explain query plans, and surface index recommendations. Backend is built in Go for high throughput.',
    tags: ['Go', 'TypeScript', 'Next.js', 'Google Gemini'],
    theme: 'AI / Developer Tools',
    thumbnailColor: '#1a0a2e',
    liveUrl: 'https://devpost.com/software/optigen',
    videoUrl: 'https://vimeo.com/1079121387',
    imageSrc: '/databot.png',
    award: 'Finalist — LAHacks 2025',
    year: 2025,
    featured: false,
  },
  {
    id: '5',
    slug: 'safegrounds',
    title: 'SafeGrounds',
    description:
      'Platform empowering investors and developers to identify and respect Indigenous lands through transparent, actionable insights. Features interactive mapping with Leaflet, community reporting, contractor response systems, and ML-powered land assessment.',
    tags: ['TypeScript', 'Python', 'Flask', 'SQLite', 'Next.js', 'Leaflet', 'AWS'],
    theme: 'Social Impact',
    thumbnailColor: '#0f0f14',
    liveUrl: 'https://devpost.com/software/safegrounds',
    githubUrl: 'https://github.com/yair-k/SafeGrounds',
    year: 2025,
    featured: false,
  },
  {
    id: '6',
    slug: 'project-klean',
    title: 'Project Klean',
    description:
      'Enterprise solution for digital pollution via AI-powered code optimization. Analyzes and optimizes Python code to improve efficiency and sustainability using CodeBERT fine-tuning.',
    tags: ['Python', 'Pandas', 'ML', 'CodeBERT', 'CodeCarbon', 'Streamlit'],
    theme: 'Sustainability / Developer Tools',
    thumbnailColor: '#16161e',
    liveUrl: 'https://devpost.com/software/project-klean',
    videoUrl: 'https://www.youtube.com/watch?v=Nco-X2uYNeQ',
    githubUrl: 'https://github.com/yair-k/Klean',
    year: 2024,
    featured: false,
  },
  {
    id: '7',
    slug: 'echo',
    title: 'Echo',
    description:
      'AI-powered memory recall assistant using computer vision and natural language processing to record and process daily activities for users with memory loss, Alzheimer\'s, and dementia.',
    tags: ['Python', 'Next.js', 'OpenCV', 'CLIP', 'Cohere', 'OpenAI Whisper'],
    theme: 'Healthcare / AI',
    thumbnailColor: '#1a0a2e',
    liveUrl: 'https://devpost.com/software/echo-gq3oh0',
    githubUrl: 'https://github.com/yair-k/Echo',
    year: 2024,
    featured: false,
  },
  {
    id: '8',
    slug: 'verbate',
    title: 'Verbate',
    description:
      'An AI interview coach that generates role-specific questions, evaluates user responses in real time using GPT-4, and delivers audio feedback via AWS Polly.',
    tags: ['Python', 'GPT-4', 'AWS Polly', 'Next.js'],
    theme: 'Generative AI / Voice',
    thumbnailColor: '#0f0f14',
    liveUrl: 'https://devpost.com/software/verbate',
    videoUrl: 'https://www.youtube.com/watch?v=NPcaM3cgHgA',
    githubUrl: 'https://github.com/yair-k/Verbate',
    imageSrc: '/verbate.webp',
    award: 'Best Use of AI — IEEE MakeUC 2023',
    year: 2023,
    featured: false,
  },
  {
    id: '9',
    slug: 'skinsight',
    title: 'SkinSight',
    description:
      'A dermatology prototype that classifies skin lesion images across multiple diagnostic categories using a CNN trained on the HAM10000 dataset.',
    tags: ['Python', 'Flask', 'PyTorch', 'TensorFlow'],
    theme: 'Machine Learning / Healthcare',
    thumbnailColor: '#16161e',
    liveUrl: 'https://devpost.com/software/skinsight-your-virtual-dermatologist',
    videoUrl: 'https://www.youtube.com/watch?v=eT_LsjFUMk4',
    githubUrl: 'https://github.com/d-huliu/SkinSight-',
    imageSrc: '/skin-sight.webp',
    year: 2023,
    featured: false,
  },
  {
    id: '10',
    slug: 'handpilot',
    title: 'HandPilot',
    description:
      'Uses MediaPipe hand landmark detection combined with OpenCV to translate hand gestures into system-level mouse movement, clicks, and keyboard input — allowing hands-free computer control.',
    tags: ['Python', 'OpenCV', 'MediaPipe'],
    theme: 'Computer Vision / Accessibility',
    thumbnailColor: '#1a0a2e',
    liveUrl: 'https://devpost.com/software/handpilot',
    videoUrl: 'https://www.youtube.com/watch?v=MmD9vCCLqao',
    githubUrl: 'https://github.com/yair-k/HandPilot',
    imageSrc: '/hand-pilot.webp',
    award: '1st Place — YRHacks 2023',
    year: 2023,
    featured: false,
  },
]

export const featuredProjects = projects.filter(p => p.featured)

// ─────────────────────────────────────────────────────────────────────────────
// ARTWORKS
// ─────────────────────────────────────────────────────────────────────────────

export const artworks: Artwork[] = [
  { id: 'art-01', title: 'Buenos Aires', medium: 'Oil Pastel', year: '2021', imageSrc: '/art/Buenos Aires.jpg', aspectRatio: 'portrait' },
  { id: 'art-02', title: 'Cowboy', medium: 'Oil Pastel', year: '2021', imageSrc: '/art/Cowboy.jpg', aspectRatio: 'portrait' },
  { id: 'art-03', title: 'Fruits and Plates', medium: 'Oil Pastel', year: '2021', imageSrc: '/art/Fruits and Plates.jpg', aspectRatio: 'landscape' },
  { id: 'art-04', title: 'House', medium: 'Oil Pastel', year: '2022', imageSrc: '/art/House.jpg', aspectRatio: 'portrait' },
  { id: 'art-05', title: 'Lighthouse', medium: 'Oil Pastel', year: '2018', imageSrc: '/art/Lighthouse.jpg', aspectRatio: 'portrait' },
  { id: 'art-06', title: 'Park Guell', medium: 'Oil Pastel', year: '2022', imageSrc: '/art/Park Guell.jpg', aspectRatio: 'landscape' },
  { id: 'art-16', title: 'Boats on Lake', medium: 'Watercolour', year: '2022', imageSrc: '/art/Boats on Lake.jpg', aspectRatio: 'portrait' },
  { id: 'art-17', title: 'Cherries', medium: 'Watercolour', year: '2021', imageSrc: '/art/Cherries.jpg', aspectRatio: 'portrait' },
  { id: 'art-18', title: 'Lakeside', medium: 'Watercolour', year: '2021', imageSrc: '/art/Lakeside.jpg', aspectRatio: 'landscape' },
  { id: 'art-19', title: 'Wheelbarrow and Flora', medium: 'Watercolour', year: '2021', imageSrc: '/art/Wheelbarrow and Flora.jpg', aspectRatio: 'portrait' },
  { id: 'art-20', title: 'Winter House', medium: 'Watercolour', year: '2022', imageSrc: '/art/Winter House.jpg', aspectRatio: 'landscape' },
  { id: 'art-12', title: 'Horse', medium: 'Pencil', year: '2018', imageSrc: '/art/Horse.jpg', aspectRatio: 'landscape' },
  { id: 'art-13', title: 'Rocking Chair', medium: 'Pencil', year: '2022', imageSrc: '/art/Rocking Chair.jpg', aspectRatio: 'portrait' },
  { id: 'art-14', title: 'Shoes and Box', medium: 'Pencil', year: '2019', imageSrc: '/art/Shoes and Box.jpg', aspectRatio: 'landscape' },
  { id: 'art-15', title: 'Wooden Figure and Box', medium: 'Pencil', year: '2021', imageSrc: '/art/Wooden Figure and Box.jpg', aspectRatio: 'portrait' },
  { id: 'art-07', title: 'American Eagle v2 (Design by Jo Nakashima)', medium: 'Origami', year: '2020', imageSrc: '/art/American Eagle v2.jpg', aspectRatio: 'square' },
  { id: 'art-08', title: 'Devil Dragon v2 (Design by Jo Nakashima)', medium: 'Origami', year: '2019', imageSrc: '/art/Devil Dragon v2.jpg', aspectRatio: 'square' },
  { id: 'art-09', title: 'Dragon Bookmark (Design by Jo Nakashima, Modified)', medium: 'Origami', year: '2019', imageSrc: '/art/Dragon Bookmark.jpg', aspectRatio: 'portrait' },
  { id: 'art-10', title: 'Fawkes the Phoenix (Design by Jo Nakashima, Modified)', medium: 'Origami', year: '2020', imageSrc: '/art/Fawkes the Phoenix.jpg', aspectRatio: 'portrait' },
  { id: 'art-11', title: 'Scorpion (Design by Jo Nakashima)', medium: 'Origami', year: '2023', imageSrc: '/art/Scorpion.jpg', aspectRatio: 'portrait' },
]
