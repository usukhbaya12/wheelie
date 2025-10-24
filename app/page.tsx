"use client";

import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full flex-col items-center py-6 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex items-end">
          <Image
            className="dark:invert"
            src="/favicon.ico"
            alt="Next.js logo"
            width={40}
            height={20}
            priority
          />
          <div className="blur-[0.75px] text-blue-700 font-black text-lg">
            Erg
          </div>
          <div className="blur-[0.75px] text-blue-600 font-black text-lg">
            uuley🌀
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          project
        </div>
      </main>
    </div>
  );
}
