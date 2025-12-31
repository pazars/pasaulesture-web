import Image from 'next/image';

export default function Home() {
  return (
    <div className="h-screen w-screen p-4 flex items-center justify-center">
      <div className="relative h-full w-full">
        <Image
          src="/pt_rezekne.png"
          alt="Pasaules Tūre 2026"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}