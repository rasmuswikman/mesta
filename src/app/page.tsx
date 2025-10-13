import Image from 'next/image';
import Link from 'next/link';
import Chat from '@/components/Chat';

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <main className="flex grow-1 flex-col items-center justify-center">
        <Image
          alt="Mesta logo"
          className="w-60"
          height={114}
          priority
          src="/mesta-logo.svg"
          width={300}
        />
        <div className="mt-10 w-full md:min-w-2xl">
          <Chat />
        </div>
      </main>
      <footer className="mb-20 flex flex-row gap-4">
        <Link href="https://www.lunchpaus.fi">Data by Lunchpaus.fi</Link>
        <Link href="https://www.1hz.dev">Developed by 1hz</Link>
      </footer>
    </div>
  );
}
