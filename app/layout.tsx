import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Pool / Play — Water Polo',description:'Control Blue Tide in a fast-paced water polo match against the CPU.'};
export default function RootLayout({children}: Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
