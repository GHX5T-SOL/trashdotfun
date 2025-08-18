import './globals.css';
import type { Metadata } from 'next';
import WalletContextProvider from '@/components/WalletContextProvider';

export const metadata: Metadata = {
  title: 'trashdotfun',
  description: 'Create $GOR meme coins in the trashiest way!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-trash-green">
        <WalletContextProvider>
          <main>{children}</main>
        </WalletContextProvider>
      </body>
    </html>
  );
}