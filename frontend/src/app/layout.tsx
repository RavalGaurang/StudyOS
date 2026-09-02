import './globals.css';
import type { Metadata } from 'next';
import { ReduxProvider } from '../components/common/ReduxProvider';
import { AppLayout } from '../components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'StudyOS — The Academic Operating System',
  description:
    'Modern production full-stack student productivity and academic management platform.',
  icons: {
    icon: '/images/favicon.png',
    shortcut: '/images/favicon.png',
    apple: '/images/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased selection:bg-indigo-500 selection:text-white">
        <ReduxProvider>
          <AppLayout>{children}</AppLayout>
        </ReduxProvider>
      </body>
    </html>
  );
}
