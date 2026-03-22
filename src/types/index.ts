export interface Collaborator {
  name: string
  url: string
}

export interface Project {
  id: string
  slug: string
  title: string
  description: string
  longDescription?: string
  tags: string[]
  theme?: string
  thumbnailColor: string
  liveUrl?: string
  videoUrl?: string
  githubUrl?: string
  imageSrc?: string
  plySrc?: string
  collaborators?: Collaborator[]
  award?: string
  year: number
  featured: boolean
}

export interface Artwork {
  id: string
  title: string
  medium: string
  year: string
  imageSrc: string
  aspectRatio: 'portrait' | 'landscape' | 'square'
}

export interface Experience {
  title: string
  company: string
  period: string
  bullets: string[]
  technologies: string[]
}
