import type { Metadata } from 'next';
import { Inter, Noto_Sans_Lao } from 'next/font/google';
import { AppProviders } from '@/components/providers';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const notoSansLao = Noto_Sans_Lao({
  variable: '--font-noto-lao',
  subsets: ['lao', 'latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Org Live — Real-time messaging',
    template: '%s · Org Live',
  },
  description:
    'Org Live is a friends-first messenger with real-time chat, read receipts, and secure sessions.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoSansLao.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-ink">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
