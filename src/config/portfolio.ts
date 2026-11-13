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

/** A screen shown in the Projects app's iPhone: a screenshot, and what it shows */
export interface Screen {
  src: string
  caption: string
  /** the shot already includes the top of the screen (no space left for the status bar) */
  full?: boolean
}

export interface Project {
  name: string
  tagline: string
  description: string
  period: string
  platforms: string[]
  tech: string[]
  /** big numbers for the Overview tab */
  stats: { value: string; label: string }[]
  /** the Highlights tab: **bold** marks what stands out */
  points: string[]
  links: { github?: string; play?: string; website?: string }
  /** the project's own colour: its buttons, bullets and diagram */
  accent: string
  /** the app icon: an image, or a gradient with a glyph drawn in ProjectIcon */
  icon: { src?: string; colors?: [string, string]; glyph?: 'mark' }
  /** what the device plays: screenshots, or 'smartgallery' for its built-in demo */
  screens: Screen[] | 'smartgallery'
  /** what it's shown on: an iPhone (the default), or a Mac's browser window for a desktop site */
  device?: 'iphone' | 'mac'
  /** the How it works tab: two flows side by side, meeting in one result */
  how: {
    lanes: { title: string; steps: { title: string; detail?: string }[] }[]
    result: { title: string; detail?: string }
  }
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
    ['Experience', 'SDE Intern @ Amazon (2026) → SDE I (2027)'],
    ['Projects', 'SwiftShareX, SmartGalleryX, Bondly'],
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
      name: 'SwiftShareX',
      tagline: 'Fast, offline file sharing between Android, macOS and Windows.',
      description:
        'Sends files of any size straight between devices on the same Wi-Fi or hotspot: no cloud, no account, no internet. The Android app is React Native on a custom C++ TCP engine; the desktop app runs the same UI in Electron.',
      period: 'Jun 2025 – Nov 2026',
      platforms: ['Android', 'macOS', 'Windows'],
      tech: ['React Native', 'C++', 'JSI', 'TCP sockets', 'UDP discovery', 'Electron'],
      stats: [
        { value: '80 MB/s', label: 'over local Wi-Fi' },
        { value: '3', label: 'platforms, one UI codebase' },
        { value: '256 KB', label: 'chunks through 8 MB buffers' },
      ],
      points: [
        'Built an offline file-sharing app across **3 platforms** (Android, macOS, Windows) using **React Native** and a native **C++ TCP engine**, sharing **one UI codebase** with Electron and reaching **80 MB/s** over local Wi-Fi.',
        'Architected a custom binary protocol (SWFT) streaming **256 KB chunks** through **8 MB socket buffers**, with receiver-confirmed delivery and atomic writes, so **multi-GB files** are never falsely marked sent or left corrupted.',
        'Integrated **JSI** to expose a multi-threaded C++ engine directly to JavaScript, polling live progress every **250 ms** without bridge overhead, and streamed files from Android file descriptors via **JNI** without intermediate copies.',
        'Implemented **UDP broadcast discovery** with a **6-message** control protocol for pairing, multi-file queues and per-file cancel, securing receivers with a peer IP allowlist and **4 MB** chunk cap.',
      ],
      links: {
        github: 'https://github.com/mani5h-agarwal/SwiftShareX',
        play: 'https://play.google.com/store/apps/details?id=com.swiftshare',
        website: 'https://mani5h-agarwal.github.io/SwiftShareX/',
      },
      accent: '#9b6bff',
      icon: { src: '/projects/swiftsharex/icon.webp' },
      how: {
        lanes: [
          {
            title: 'Finding each other',
            steps: [
              { title: 'UDP broadcast', detail: 'nearby devices appear on their own' },
              { title: 'Pair', detail: '6-message control protocol' },
              { title: 'Allowlist', detail: 'only the paired peer’s IP is accepted' },
            ],
          },
          {
            title: 'Sending a file',
            steps: [
              { title: 'Read from disk', detail: 'Android file descriptors via JNI, no copies' },
              { title: 'C++ engine, through JSI', detail: 'progress every 250 ms, no bridge' },
              { title: 'TCP stream', detail: '256 KB chunks, 8 MB socket buffers' },
              { title: 'Written to a .part file', detail: 'renamed only once complete' },
            ],
          },
        ],
        result: {
          title: 'Delivered, and confirmed',
          detail: 'marked Sent only after the receiver saves it',
        },
      },
      screens: [
        { src: '/projects/swiftsharex/1.webp', caption: 'Send, or receive' },
        { src: '/projects/swiftsharex/2.webp', caption: 'Looking for a device to send to' },
        { src: '/projects/swiftsharex/3.webp', caption: 'Waiting to receive' },
        { src: '/projects/swiftsharex/4.webp', caption: 'A device found nearby, over UDP' },
        { src: '/projects/swiftsharex/5.webp', caption: 'Connected, ready to send' },
        { src: '/projects/swiftsharex/6.webp', caption: 'The receiving side' },
        { src: '/projects/swiftsharex/7.webp', caption: 'Confirm before sending' },
        { src: '/projects/swiftsharex/8.webp', caption: 'Sent, and confirmed by the receiver' },
        { src: '/projects/swiftsharex/9.webp', caption: 'Receiving, with live progress' },
      ],
    },
    {
      name: 'SmartGalleryX',
      tagline: 'Search your phone’s photos by describing them.',
      description:
        'No tags and no albums: type “a person jumping on a mountain” and the photo turns up. A fine-tuned vision-language model understands what’s in each photo, and the search index stays on the phone.',
      period: 'Jun 2026 – Nov 2026',
      platforms: ['iOS'],
      tech: ['PyTorch', 'SigLIP 2', 'FastAPI', 'React Native', 'Expo', 'SQLite', 'Kaggle'],
      stats: [
        { value: '90.1%', label: 'top-1 retrieval on Flickr30k' },
        { value: '146K', label: 'images, 730K captions trained on' },
        { value: '4×', label: 'smaller vectors with int8' },
      ],
      points: [
        'Fine-tuned a **SigLIP 2 ViT-L/16** model on **146K images and 730K captions** with sigmoid contrastive loss and multi-GPU DDP, enabling natural-language search over phone photos.',
        'Raised top-1 retrieval from **84.3% to 90.1%** on Flickr30k and **55.0% to 64.0%** on COCO, fitting ViT-L on 16 GB GPUs with layer-wise LR decay and gradient checkpointing.',
        'Built a **stateless FastAPI** embedding server with per-GPU encoders and **int8 quantization** (**4x smaller** vectors), API-key auth and caching, embedding **30+ images/s**.',
        'Developed a React Native app with an **on-device vector index** and **min-heap top-k ranking** that syncs only new or edited photos and serves repeat searches **offline**.',
      ],
      links: { github: 'https://github.com/mani5h-agarwal/SmartGalleryX' },
      accent: '#7e90ff',
      icon: { src: '/projects/smartgallery/icon.webp' },
      screens: 'smartgallery',
      how: {
        lanes: [
          {
            title: 'Each photo',
            steps: [
              { title: '384px thumbnail', detail: 'only new or edited photos' },
              { title: 'Image encoder', detail: 'fine-tuned SigLIP 2, on the server' },
              { title: 'Vector, on the phone', detail: 'int8: 4× smaller; server keeps nothing' },
            ],
          },
          {
            title: 'Your words',
            steps: [
              { title: '“a person jumping on a mountain”' },
              { title: 'Text encoder', detail: 'same model, same space' },
              { title: 'Ranked on the phone', detail: 'min-heap top-k over the index' },
            ],
          },
        ],
        result: { title: 'Best matches', detail: 'repeat searches work offline' },
      },
    },
    {
      name: 'Bondly',
      tagline: 'A social app for real connections: bonds, moments and clans.',
      description:
        'An iOS social app where every connection is mutual: send a bond request, and once it’s accepted you can chat in real time. Share swipeable moments with photos, and join clans with their own group chats. SwiftUI on Firebase, with Cloudinary for images.',
      period: 'May 2025 – Nov 2026',
      platforms: ['iOS'],
      tech: ['SwiftUI', 'Swift', 'Firebase', 'Cloudinary', 'Core Data', 'Kingfisher'],
      stats: [
        { value: 'Live', label: 'chat on Firebase Realtime Database' },
        { value: '3', label: 'kinds of clan, with admin roles' },
        { value: 'Offline', label: 'chats and moments cached on device' },
      ],
      points: [
        'Built a **mutual bonding system**: requests, acceptance and removal are **atomic multi-path updates**, so both people’s data always agrees.',
        '**Real-time one-to-one and clan chats** on Firebase Realtime Database, cached in **Core Data** so conversations open instantly and work offline.',
        '**Swipeable moments** with photos uploaded through **Cloudinary**, tagged by topic, with likes.',
        '**Clans** that are open, invite-only or closed, with **admin roles**, join requests and a group chat.',
        'Locked down with **database security rules**: people can only write their own data, and every message must come from its sender.',
      ],
      links: { github: 'https://github.com/mani5h-agarwal/Bondly' },
      accent: '#a47aff',
      icon: { src: '/projects/bondly/icon.webp' },
      screens: [
        { src: '/projects/bondly/1.webp', caption: 'Your bonds' },
        { src: '/projects/bondly/2.webp', caption: 'Real-time chat' },
        { src: '/projects/bondly/3.webp', caption: 'Moments, as swipeable cards' },
        { src: '/projects/bondly/4.webp', caption: 'The clans you’re in' },
        { src: '/projects/bondly/5.webp', caption: 'A clan’s group chat' },
        { src: '/projects/bondly/6.webp', caption: 'The side menu' },
        { src: '/projects/bondly/7.webp', caption: 'Your profile' },
        { src: '/projects/bondly/8.webp', caption: 'Bond requests: accept or decline' },
      ],
      how: {
        lanes: [
          {
            title: 'Bonding',
            steps: [
              { title: 'Send a bond request', detail: 'written to both people at once' },
              { title: 'Accepted', detail: 'bonded both ways, counts updated together' },
              { title: 'A chat opens', detail: 'messages stream in live' },
            ],
          },
          {
            title: 'Sharing',
            steps: [
              { title: 'A moment and a photo', detail: 'tagged: Travel, Coding, Music…' },
              { title: 'Photo to Cloudinary', detail: 'compressed, served from its CDN' },
              { title: 'Saved to Firebase', detail: 'likes update in real time' },
            ],
          },
        ],
        result: {
          title: 'Everyone sees it live',
          detail: 'and it stays readable offline, from the on-device cache',
        },
      },
    },
    {
      name: 'MacBook Portfolio',
      tagline: 'This site: a MacBook that opens as you scroll.',
      description:
        'A realistic MacBook built from HTML and CSS 3D, with a working backlit keyboard, synthesised key sounds, a Spotlight you can type into and apps that genie out of the Dock. No 3D library: every part is CSS.',
      period: '2026',
      platforms: ['Web'],
      tech: ['React', 'TypeScript', 'CSS', 'HTML', 'Vite'],
      stats: [
        { value: '0', label: '3D libraries: it’s all CSS' },
        { value: '24', label: 'live previews in Skills' },
        { value: '6', label: 'apps in its Dock' },
      ],
      points: [
        'Built a **MacBook from HTML and CSS 3D** that opens as you scroll, with no 3D library and a **backlit keyboard** you can type on.',
        'Recreated macOS in the browser: a **Spotlight** you can type into, apps that **genie out of the Dock**, Finder, Quick Look, desktop widgets and an iPhone.',
        'Tuned it to run smoothly on **low-end laptops**: targeted style writes, paused animations when hidden, and a lighter rain on slow machines.',
      ],
      // the site's own address, wherever it's hosted
      links: { github: 'https://github.com/mani5h-agarwal/Portfolio', website: '/' },
      accent: '#0a84ff',
      icon: { colors: ['#2c2c2e', '#0d0d0f'], glyph: 'mark' },
      how: {
        lanes: [
          {
            title: 'Scrolling',
            steps: [
              { title: 'The page scrolls', detail: 'one scroll position drives everything' },
              { title: 'The lid opens', detail: 'HTML and CSS 3D, no 3D library' },
              { title: 'The screen wakes', detail: 'a macOS desktop and Dock' },
            ],
          },
          {
            title: 'Using it',
            steps: [
              { title: 'Type, or click the Dock', detail: 'Spotlight, or the real keyboard' },
              { title: 'The app genies out', detail: 'a shape traced, then animated' },
              { title: 'A macOS app', detail: 'Finder, Quick Look, widgets, this iPhone' },
            ],
          },
        ],
        result: { title: 'A MacBook, in the browser', detail: 'smooth on low-end laptops too' },
      },
      device: 'mac',
      screens: [
        { src: '/projects/portfolio/1.webp', caption: 'The home page' },
        { src: '/projects/portfolio/2.webp', caption: 'Scrolled: the MacBook, open' },
        { src: '/projects/portfolio/3.webp', caption: 'Skills: a Finder window' },
        { src: '/projects/portfolio/4.webp', caption: 'Experience: every role on a timeline' },
        { src: '/projects/portfolio/5.webp', caption: 'About Me: a wall of widgets' },
      ],
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
    SmartGalleryX: ['Python', 'PyTorch', 'FastAPI', 'React Native', 'Expo', 'Kaggle'],
    Bondly: ['Swift', 'SwiftUI', 'Firebase', 'Xcode', 'Git'],
    'ACM NITK website': ['React', 'JavaScript', 'HTML', 'CSS'],
    'MacBook Portfolio': ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
  } as Record<string, string[]>,

  contact: {
    /** Your public email. Leave empty to hide. */
    email: '',
  },

  /** Put your résumé at public/resume.pdf (or link elsewhere). Leave empty to show a note. */
  resumeUrl: '/resume.pdf',
}
