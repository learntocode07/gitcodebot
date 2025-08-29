"use client";

import { BsChatLeftDots } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Typewriter } from "react-simple-typewriter";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <Image
        src="/bot.png"
        alt="gitcodebot-logo"
        width={180}
        height={180}
        className="mb-1 object-contain dark:hidden"
      />
      <Image
        src="/bot.png"
        alt="gitcodebot-logo"
        width={180}
        height={180}
        className="mb-1 object-contain hidden dark:block"
      />
      <h1 className="text-4xl font-semibold font-mono text-center mb-4">
        <Typewriter
          words={["Talk to Any Codebase"]}
          loop={1}
          cursor
          cursorStyle="_"
          typeSpeed={50}
          delaySpeed={1000}
        />
      </h1>
      <Button variant={"outline"} size={"lg"}>
        <BsChatLeftDots />
        <a className="font-mono" href="/home">Chat Now</a>
      </Button>
    </main>
  );
}
