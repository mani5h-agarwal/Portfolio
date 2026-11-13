/**
 * Each skill's official, full-colour logo (SVGs from Devicon, MIT: skill-logos/LICENSE.txt; Expo's
 * from Simple Icons, CC0). Loaded as image files when the Skills app opens, not with the page.
 */
const FILES = import.meta.glob<string>('./skill-logos/*.svg', {
  eager: true,
  query: '?no-inline',
  import: 'default',
})
const file = (name: string) => FILES[`./skill-logos/${name}.svg`]

/** skill name → its logo file */
const LOGOS: Record<string, string> = {
  C: 'c',
  'C++': 'cplusplus',
  Swift: 'swift',
  JavaScript: 'javascript',
  Python: 'python',
  MySQL: 'mysql',
  HTML: 'html5',
  CSS: 'css3',
  SwiftUI: 'swift',
  'React Native': 'react',
  React: 'react',
  Firebase: 'firebase',
  'Tailwind CSS': 'tailwindcss',
  NumPy: 'numpy',
  pandas: 'pandas',
  PyTorch: 'pytorch',
  FastAPI: 'fastapi',
  Xcode: 'xcode',
  'Android Studio': 'androidstudio',
  'VS Code': 'vscode',
  Git: 'git',
  Postman: 'postman',
  Expo: 'expo',
  Kaggle: 'kaggle',
}

export const skillLogo = (name: string): string | undefined => file(LOGOS[name] ?? '')
