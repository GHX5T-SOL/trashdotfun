import './globals.css';
import type { Metadata } from 'next';
import Image from 'next/image';
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
          <header className="p-4 flex justify-center">
            <Image
              src="/oscar.png"
              alt="Oscar the Grouch"
              width={100}
              height={100}
              style={{ width: 'auto', height: 'auto' }} // Fix aspect ratio warning
            />
          </header>
          <main>{children}</main>
        </WalletContextProvider>
      </body>
    </html>
  );
}