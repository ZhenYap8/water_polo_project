import type { Metadata, Viewport } from 'next';
import './globals.css';
export const viewport: Viewport = {width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#081f2b'};
export const metadata: Metadata = {title:'Pool / Play — Water Polo',description:'Control Blue Tide in a fast-paced water polo match against the CPU.'};
export default function RootLayout({children}: Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
