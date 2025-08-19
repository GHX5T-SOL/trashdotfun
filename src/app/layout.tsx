import './globals.css';
import type { Metadata } from 'next';
import WalletContextProvider from '@/components/WalletContextProvider';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'TrashdotFun - Garbage Token Launchpad',
  description: 'Create $GOR meme coins in the trashiest way on Gorbagana Chain!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-trash-green via-green-900 to-black min-h-screen">
        <WalletContextProvider>
          <Header />
          <main className="pt-4">{children}</main>
        </WalletContextProvider>
      </body>
    </html>
  );
}