// Everything shown in the Mac's apps (About, Experience, Projects, Skills, Contact, Résumé).
// Entries marked EXAMPLE are placeholders showing the format: replace them with your own.

export interface Job {
  company: string
  role: string
  period: string
  location?: string
  points: string[]
  tech?: string[]
}

export interface Project {
  name: string
  description: string
  tech: string[]
  /** Leave empty to hide a link. */
  live?: string
  code?: string
  /** Two colours for the card's artwork. */
  colors: [string, string]
}

export const portfolio = {
  about: {
    paragraphs: [
      "I'm a mobile application developer. I build clean, efficient apps, built close to the system: native on iOS and Android with Swift and Kotlin, with a full-stack toolkit behind them.",
      'I care about reliable, scalable apps, performance and a system-level understanding of how things work, and clean UI backed by solid architecture. I learn by building things, and by breaking them.',
    ],
    facts: [
      { label: 'Role', value: 'Mobile Application Developer' },
      { label: 'Builds with', value: 'Swift · Kotlin · React · TypeScript' },
      { label: 'Based in', value: 'EXAMPLE — City, Country' },
    ],
  },

  /** What I care about: shown in About and printed by the Terminal (cat what_i_care_about.txt). */
  values: [
    'reliable, scalable mobile applications',
    'performance, optimization, system-level understanding',
    'clean UI backed by solid architecture',
    'learning by building and breaking things',
  ],

  experience: [
    {
      company: 'EXAMPLE — Company name',
      role: 'Software Engineer',
      period: '2024 — Present',
      location: 'City · Remote',
      points: [
        'Describe one thing you shipped and the impact it had — numbers help (e.g. “cut load time by 40%”).',
        'Another achievement, ownership area or technical challenge you solved.',
      ],
      tech: ['React', 'TypeScript', 'Node.js'],
    },
    {
      company: 'EXAMPLE — Previous company',
      role: 'Frontend Developer Intern',
      period: '2023 — 2024',
      location: 'City',
      points: ['What you built, learned or improved there.'],
      tech: ['JavaScript', 'CSS'],
    },
  ] satisfies Job[],

  projects: [
    {
      name: 'MacBook Portfolio',
      description:
        'This site: a realistic MacBook built from HTML and CSS 3D that opens as you scroll, with a working backlit keyboard, synthesised key sounds, a Spotlight you can type into and apps that genie out of the Dock.',
      tech: ['React', 'TypeScript', 'CSS 3D', 'Canvas', 'Web Audio'],
      colors: ['#1f3d2b', '#0a84ff'],
    },
    {
      name: 'EXAMPLE — Project name',
      description:
        'One or two lines: what it does, who it is for, and what was interesting to build.',
      tech: ['Next.js', 'PostgreSQL'],
      live: '',
      code: '',
      colors: ['#5e2ced', '#ff375f'],
    },
    {
      name: 'EXAMPLE — Another project',
      description: 'Side projects, hackathon wins or open-source work all belong here.',
      tech: ['Python', 'FastAPI'],
      colors: ['#ff9f0a', '#ff453a'],
    },
  ] satisfies Project[],

  skills: [
    {
      group: 'Languages',
      items: ['Swift', 'Kotlin', 'TypeScript', 'JavaScript', 'C', 'C++', 'Python', 'HTML', 'CSS'],
    },
    { group: 'Frameworks & libraries', items: ['React', 'Node.js', 'Express', 'PyTorch'] },
    { group: 'Data & backend', items: ['MongoDB', 'MySQL', 'Firebase'] },
    { group: 'Tools', items: ['Git', 'GitHub', 'VS Code', 'Figma'] },
  ],

  contact: {
    /** Your public email. Leave empty to hide. */
    email: '',
    linkedin: '',
  },

  /** Put your résumé at public/resume.pdf (or link elsewhere). Leave empty to show a note. */
  resumeUrl: '/resume.pdf',
}
