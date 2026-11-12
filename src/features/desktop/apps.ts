import type { ComponentType } from 'react'
import { portfolio } from '@/config/portfolio'
import { profile } from '@/config/profile'
import type { IconId } from './AppIcon'
import { About, Contact, Experience, Projects, Resume, Skills, Terminal } from './AppContent'

export interface AppDef {
  id: string
  name: string
  icon: IconId
  /** Opens a window with this content (rendered as a component)… */
  render?: ComponentType
  /** …or opens this link in a new tab. */
  href?: string
  /** Preferred window size in px (shrinks to fit small screens). */
  size?: [number, number]
}

/* ───────────── Registry ───────────── */

export const APPS: AppDef[] = [
  { id: 'about', name: 'About Me', icon: 'about', render: About, size: [620, 520] },
  {
    id: 'experience',
    name: 'Experience',
    icon: 'experience',
    render: Experience,
    size: [680, 560],
  },
  { id: 'projects', name: 'Projects', icon: 'projects', render: Projects, size: [820, 600] },
  { id: 'skills', name: 'Skills', icon: 'skills', render: Skills, size: [560, 460] },
  { id: 'terminal', name: 'Terminal', icon: 'terminal', render: Terminal, size: [640, 420] },
  { id: 'contact', name: 'Contact', icon: 'contact', render: Contact, size: [520, 440] },
  { id: 'resume', name: 'Résumé', icon: 'resume', render: Resume, size: [480, 440] },
]

/** Shortcuts after the divider: open in a new tab. Hidden when the link is empty. */
export const LINKS: AppDef[] = [
  { id: 'github', name: 'GitHub', icon: 'github' as const, href: profile.links.github },
  { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin' as const, href: portfolio.contact.linkedin },
].filter((l) => l.href)
