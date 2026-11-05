import type { ReactNode } from 'react';
export default function RootLayout({children}:{children:ReactNode}){return <html lang="pt-BR"><body style={{fontFamily:'system-ui',margin:'3rem auto',maxWidth:680,padding:'0 1rem'}}>{children}</body></html>;}
