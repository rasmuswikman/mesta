import Link from 'next/link';
import Chat from '@/components/Chat';
import MestaLogo from '@/icons/MestaLogo';

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <main className="flex grow flex-col items-center justify-center">
        <MestaLogo className="w-60" />
        <div className="mt-10 w-full md:min-w-2xl">
          <Chat />
        </div>
      </main>
      <footer className="mb-20 flex flex-row gap-4">
        <Link href="https://www.lunchpaus.fi">Data by Lunchpaus.fi</Link>
      </footer>
    </div>
  );
}
