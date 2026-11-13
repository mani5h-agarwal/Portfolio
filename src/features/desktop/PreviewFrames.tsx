import type { ReactNode } from 'react'

/** The little frames Quick Look shows results in: a phone, a browser, an IDE's build bar */
export const Phone = ({ children }: { children: ReactNode }) => (
  <div className="ql-phone">
    <div className="ql-phone-island" />
    <div className="ql-phone-screen">{children}</div>
  </div>
)
export const Browser = ({ url, children }: { url: string; children: ReactNode }) => (
  <div className="ql-browser">
    <div className="ql-browser-bar">
      <i />
      <i />
      <i />
      <span>{url}</span>
    </div>
    <div className="ql-browser-page">{children}</div>
  </div>
)
export const Build = ({ ok, children }: { ok: string; children: ReactNode }) => (
  <div className="ql-build">
    <span className="ql-build-ok">{ok}</span>
    {children}
  </div>
)
