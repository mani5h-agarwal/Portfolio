/**
 * The "photos" in SmartGalleryX's demo: small flat illustrations in the style of its app icon
 * (no real photos), each tagged with what's in it, and each search's best matches.
 */

export type Kind = 'mountain' | 'beach' | 'dinner' | 'dog' | 'cake' | 'city' | 'lake'

export interface DemoPhoto {
  id: string
  kind: Kind
  /** two sky colours, top to bottom */
  sky: [string, string]
  variant?: number
}

export const PHOTOS: DemoPhoto[] = [
  { id: 'm1', kind: 'mountain', sky: ['#ffc58a', '#ff9a8b'] },
  { id: 'b1', kind: 'beach', sky: ['#ff8a65', '#ffcf7a'] },
  { id: 'd1', kind: 'dinner', sky: ['#5b3a29', '#3e2619'] },
  { id: 'g1', kind: 'dog', sky: ['#9ad8ff', '#d9f2ff'] },
  { id: 'm2', kind: 'mountain', sky: ['#8ec5ff', '#d7ecff'], variant: 1 },
  { id: 'c1', kind: 'cake', sky: ['#ffd6e7', '#ffc2d9'] },
  { id: 'n1', kind: 'city', sky: ['#1b1f4a', '#3b2a6b'] },
  { id: 'l1', kind: 'lake', sky: ['#a7e3d0', '#e6f7ef'] },
  { id: 'b2', kind: 'beach', sky: ['#6a5acd', '#ff7e9a'], variant: 1 },
  { id: 'm3', kind: 'mountain', sky: ['#5f4bd8', '#a68bff'], variant: 2 },
  { id: 'd2', kind: 'dinner', sky: ['#2f3b4c', '#1f2733'], variant: 1 },
  { id: 'g2', kind: 'dog', sky: ['#ffe0a3', '#fff3d6'], variant: 1 },
]

/** each search's best matches, in order (what the model ranks first for it) */
export const SEARCHES: { query: string; ids: string[] }[] = [
  { query: 'mountains and snow', ids: ['m2', 'm1', 'm3', 'l1', 'n1', 'b2', 'b1', 'g1', 'c1'] },
  { query: 'sunset at the beach', ids: ['b1', 'b2', 'm1', 'l1', 'm3', 'n1', 'm2', 'g2', 'd1'] },
  {
    query: 'friends at a dinner table',
    ids: ['d1', 'd2', 'c1', 'n1', 'g2', 'b1', 'g1', 'l1', 'm1'],
  },
  { query: 'my dog playing outside', ids: ['g1', 'g2', 'l1', 'b1', 'm2', 'd1', 'b2', 'c1', 'm3'] },
]

export const byId = (id: string) => PHOTOS.find((p) => p.id === id)!
