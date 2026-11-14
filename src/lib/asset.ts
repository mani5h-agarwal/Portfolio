/**
 * A file from public/, wherever the site is hosted: at the root of a domain ('/'), or in a
 * sub-folder such as GitHub Pages' '/Portfolio/'. Pass the path as it is in public/, e.g.
 * asset('/resume.pdf').
 */
export const asset = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, '')
