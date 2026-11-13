// Everything shown in the Mac's apps (About, Experience, Projects, Skills, Contact, Résumé).
// Entries marked EXAMPLE are placeholders showing the format: replace them with your own.

export interface Job {
  company: string
  role: string
  /** a shorter title for the sidebar and timeline, where the full one won't fit */
  short?: string
  /** shown as written, e.g. 'May 2025 – Jul 2025' or 'Joining 2027' */
  period: string
  /** where it sits on the timeline: 'YYYY-MM'; no `end` means it's still going */
  start: string
  end?: string
  /** a role not started yet (an offer) */
  upcoming?: boolean
  location?: string
  /** **bold** marks the numbers and phrases to stand out */
  points: string[]
  tech?: string[]
  link?: string
  /** the company's logo (see features/desktop/CompanyLogo.tsx); others get their initial */
  logo?: 'amazon' | 'acm-nitk'
  /** another role this one leads to or comes from, e.g. a return offer */
  related?: { label: string; role: string }
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
      'I’m a software development engineer who loves building mobile apps: native on iOS with Swift and SwiftUI, cross-platform with React Native, and down into C++ when performance matters.',
      'I care about reliable, scalable apps, performance and a system-level understanding of how things work, and clean UI backed by solid architecture. I learn by building things, and by breaking them.',
    ],
    facts: [
      { label: 'Role', value: 'Software Development Engineer' },
      { label: 'Studying', value: 'BTech CSE · NIT Karnataka' },
      { label: 'Next', value: 'SDE I @ Amazon, 2027' },
      { label: 'Builds with', value: 'Swift · React Native · C++ · Python' },
      { label: 'Based in', value: 'Surathkal, Karnataka' },
    ],
    /** About Me's "Builds with" widget: six skills, shown with their logos */
    stack: ['Swift', 'React Native', 'C++', 'Python', 'SwiftUI', 'FastAPI'],
  },

  /** About Me's Education page (from my résumé) */
  education: {
    school: 'National Institute of Technology Karnataka',
    short: 'NIT Karnataka',
    place: 'Surathkal, Karnataka',
    degree: 'BTech in Computer Science and Engineering',
    cgpa: 8.02,
    /** 'YYYY-MM' to year; the progress bar measures the four years between */
    start: '2023-08',
    graduates: 2027,
  },

  /** About Me's Achievements page (from my résumé) */
  achievements: [
    { title: 'JEE Advanced', detail: 'All India Rank', value: 'AIR 5085', kind: 'rank' },
    { title: 'JEE Main', detail: 'All India Rank', value: 'AIR 2645', kind: 'rank' },
    {
      title: 'Silicon Maze Capture the Flag',
      detail: 'WebClub, NITK · 200+ teams',
      value: '1st place',
      kind: 'gold',
    },
    {
      title: 'Code Red Capture the Flag',
      detail: 'IEEE, NITK · 120+ teams',
      value: '2nd place',
      kind: 'silver',
    },
  ] as { title: string; detail: string; value: string; kind: 'rank' | 'gold' | 'silver' }[],

  /** The Terminal's `neofetch`: system info, about me (from my résumé). */
  neofetch: [
    ['OS', 'Manish Agarwal, 2026 build'],
    ['Host', 'NIT Karnataka, Surathkal'],
    ['Kernel', 'BTech, Computer Science · CGPA 8.02'],
    ['Role', 'Software Development Engineer'],
    ['Experience', 'SDE Intern @ Amazon (2026)'],
    ['Projects', 'SwiftShareX, SmartGalleryX'],
    ['Shell', 'React Native, C++/JSI, SwiftUI'],
    ['Languages', 'C/C++, Swift, JavaScript, Python'],
    ['Tools', 'Xcode, Android Studio, VS Code, Git'],
    ['Wins', 'CTF 1st of 200+ teams · JEE Adv AIR 5085'],
  ] as [string, string][],

  /** What I care about: shown in About and printed by the Terminal (cat what_i_care_about.txt). */
  values: [
    'reliable, scalable mobile applications',
    'performance, optimization, system-level understanding',
    'clean UI backed by solid architecture',
    'learning by building and breaking things',
  ],

  experience: [
    {
      company: 'Amazon',
      role: 'Software Development Engineer I',
      short: 'SDE I',
      period: 'Joining 2027',
      start: '2027-07',
      upcoming: true,
      points: [
        'Joining Amazon **full-time** after graduating, on a **return offer** from my 2026 internship.',
      ],
      logo: 'amazon',
      related: { label: 'Return offer from', role: 'Software Development Engineer Intern' },
    },
    {
      company: 'Amazon',
      role: 'Software Development Engineer Intern',
      short: 'SDE Intern',
      period: 'May 2026 – Jul 2026',
      start: '2026-05',
      end: '2026-07',
      location: 'Hyderabad, India',
      points: [
        'Built a **black-box regression harness** for a rewrite of a money-critical refund library, verifying output parity with production to **4 decimal places** across **76 test cases** in 3 layers, **before deployment**.',
        'Solved the blocker of logs holding only inputs and outputs: built a **propose-verify-repair generator** that reconstructs missing upstream values and keeps only test cases that **reproduce production output exactly**.',
        'Integrated an **AI agent** that re-wires tests after refactors but cannot edit expected outputs; validated with an injected currency bug that the harness caught while unit tests stayed green.',
      ],
      logo: 'amazon',
      related: { label: 'Led to', role: 'Software Development Engineer I' },
    },

    {
      company: 'ACM NITK',
      role: 'Web Head',
      period: 'Feb 2025 – Mar 2026',
      start: '2025-02',
      end: '2026-03',
      location: 'Surathkal, Karnataka',
      points: [
        'Led the frontend team behind the official **ACM NITK website**, focused on **UI/UX consistency**, **responsive design** and **accessibility**.',
        'Built and maintained the site’s core **React** components, improving how visitors interact with it and how fast it runs.',
      ],
      tech: ['React', 'JavaScript', 'HTML', 'CSS'],
      link: 'https://acm.nitk.ac.in',
      logo: 'acm-nitk',
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

  /** Skills by group (from my résumé). Each one's logo and colour are in features/desktop/skillIcons.ts. */
  skills: [
    {
      group: 'Languages',
      items: ['C', 'C++', 'Swift', 'JavaScript', 'Python', 'MySQL', 'HTML', 'CSS'],
    },
    {
      group: 'Frameworks & libraries',
      items: [
        'SwiftUI',
        'React Native',
        'React',
        'Firebase',
        'Tailwind CSS',
        'NumPy',
        'pandas',
        'PyTorch',
        'FastAPI',
      ],
    },
    {
      group: 'Tools',
      items: ['Xcode', 'Android Studio', 'VS Code', 'Git', 'Postman', 'Expo', 'Kaggle'],
    },
  ],

  /** Finder tags in the Skills app's sidebar: a colour, and the skills it groups across categories */
  skillTags: [
    {
      tag: 'Mobile',
      color: '#ff9f0a',
      items: ['Swift', 'SwiftUI', 'React Native', 'Firebase', 'Xcode', 'Android Studio', 'Expo'],
    },
    {
      tag: 'Web',
      color: '#0a84ff',
      items: ['JavaScript', 'HTML', 'CSS', 'React', 'Tailwind CSS', 'Firebase'],
    },
    {
      tag: 'Backend',
      color: '#30d158',
      items: ['Python', 'MySQL', 'Firebase', 'FastAPI', 'Postman'],
    },
    {
      tag: 'ML / Data',
      color: '#bf5af2',
      items: ['Python', 'NumPy', 'pandas', 'PyTorch', 'Kaggle'],
    },
    { tag: 'Systems', color: '#ff453a', items: ['C', 'C++'] },
  ],

  /** What each skill was used in: the Skills app's list view shows it in its "Used in" column */
  skillUse: {
    SwiftShareX: ['React Native', 'C++'],
    SmartGalleryX: ['Python', 'PyTorch', 'FastAPI', 'React Native'],
    'ACM NITK website': ['React', 'JavaScript'],
    'This portfolio': ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
  } as Record<string, string[]>,

  contact: {
    /** Your public email. Leave empty to hide. */
    email: '',
  },

  /** Put your résumé at public/resume.pdf (or link elsewhere). Leave empty to show a note. */
  resumeUrl: '/resume.pdf',
}
