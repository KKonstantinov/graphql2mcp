import './globals.css';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const siteUrl = 'https://graphql2mcp.vercel.app/';
const title = 'graphql2mcp';
const description = 'Convert GraphQL schemas and endpoints into MCP servers';

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: title,
        template: `%s | ${title}`
    },
    description,
    openGraph: {
        type: 'website',
        title,
        description,
        url: siteUrl
    },
    twitter: {
        card: 'summary_large_image',
        title,
        description
    },
    icons: { icon: '/favicon.svg' }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="flex min-h-screen flex-col">
                <RootProvider>{children}</RootProvider>
            </body>
        </html>
    );
}
