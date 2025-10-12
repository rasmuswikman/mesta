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
      <footer className="mb-20">
        <Link className="underline" href="https://www.1hz.dev">
          Made by 1hz
        </Link>
      </footer>
    </div>
  );
}
