"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

/* --------------------------- Inline Button (shadcn-like) --------------------------- */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        hero: "bg-primary text-primary-foreground rounded-full px-6 py-3 text-base font-medium hover:bg-primary/90",
        heroSecondary:
          "liquid-glass text-foreground rounded-full px-6 py-3 text-base font-normal hover:bg-white/5",
      },
      size: {
        default: "",
        sm: "h-8 px-3 text-xs",
      },
    },
    defaultVariants: {
      variant: "hero",
      size: "default",
    },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

function Button({ className = "", variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={`${buttonVariants({ variant, size })} ${className}`}
      {...props}
    />
  );
}

/* ----------------------------------- Page ----------------------------------- */
const navItems = [
  { label: "Features", hasChevron: true },
  { label: "Solutions", hasChevron: false },
  { label: "Plans", hasChevron: false },
  { label: "Learning", hasChevron: true },
];

const logos = ["Vortex", "Nimbus", "Prysma", "Cirrus", "Kynder", "Halcyn"];
const marqueeItems = [...logos, ...logos];

export default function Page() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let stopped = false;
    const FADE_DURATION = 0.5; // seconds
    const LOOP_DELAY_MS = 100;

    const tick = () => {
      if (stopped || !video) return;

      const duration = video.duration;
      const t = video.currentTime;

      if (!Number.isFinite(duration) || duration <= 0) {
        video.style.opacity = "0";
      } else if (t < FADE_DURATION) {
        const p = Math.max(0, Math.min(1, t / FADE_DURATION));
        video.style.opacity = `${p}`;
      } else if (duration - t < FADE_DURATION) {
        const p = Math.max(0, Math.min(1, (duration - t) / FADE_DURATION));
        video.style.opacity = `${p}`;
      } else {
        video.style.opacity = "1";
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const onEnded = async () => {
      if (!video) return;
      video.style.opacity = "0";
      await new Promise((r) => setTimeout(r, LOOP_DELAY_MS));
      video.currentTime = 0;
      try {
        await video.play();
      } catch {}
    };

    video.addEventListener("ended", onEnded);

    const start = async () => {
      try {
        await video.play();
      } catch {}
      rafRef.current = requestAnimationFrame(tick);
    };

    start();

    return () => {
      stopped = true;
      video.removeEventListener("ended", onEnded);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        {/* Navbar */}
        <header className="w-full">
          <nav className="flex w-full items-center justify-between px-8 py-5">
            <div className="flex items-center">
              <Image
                src="/assets/logo.png"
                alt="Logo"
                width={128}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </div>

            <div className="flex items-center gap-6">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className="inline-flex items-center gap-1 text-base text-foreground/90 transition-opacity hover:opacity-80"
                >
                  <span>{item.label}</span>
                  {item.hasChevron && <ChevronDown className="h-4 w-4" />}
                </button>
              ))}
            </div>

            <Button
              variant="heroSecondary"
              size="sm"
              className="rounded-full px-4 py-2 text-sm"
            >
              Sign Up
            </Button>
          </nav>

          <div className="mt-[3px] h-px w-full bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
        </header>

        {/* Hero content */}
        <div className="px-4 pt-20 text-center">
          <h1
            className="mx-auto bg-clip-text text-[230px] font-normal leading-[1.02] tracking-[-0.024em] text-transparent"
            style={{
              fontFamily: "'General Sans', sans-serif",
              backgroundImage: "linear-gradient(223deg, #E8E8E9 0%, #3A7BBF 104.15%)",
            }}
          >
            Grow
          </h1>

          <p className="mx-auto mt-4 max-w-md text-center text-lg leading-8 text-hero-sub opacity-80">
            The most powerful AI ever deployed
            <br />
            in talent acquisition
          </p>

          <div className="mb-[66px] mt-8">
            <Button variant="heroSecondary" className="px-[29px] py-[24px]">
              Schedule a Consult
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof / Video Section */}
      <section className="relative w-full overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: 0 }}
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260308_114720_3dabeb9e-2c39-4907-b747-bc3544e2d5b7.mp4"
            type="video/mp4"
          />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

        <div className="relative z-10 flex flex-col items-center gap-20 px-4 pb-24 pt-16">
          <div className="h-40" />

          <div className="flex w-full max-w-5xl items-center gap-10 overflow-hidden">
            <p className="shrink-0 whitespace-nowrap text-sm text-foreground/50">
              Relied on by brands
              <br />
              across the globe
            </p>

            <div className="flex-1 overflow-hidden">
              <div className="flex w-max animate-marquee items-center gap-16">
                {marqueeItems.map((brand, idx) => (
                  <div key={`${brand}-${idx}`} className="flex items-center gap-3">
                    <div className="liquid-glass flex h-6 w-6 items-center justify-center rounded-lg text-xs font-semibold text-foreground">
                      {brand[0]}
                    </div>
                    <span className="text-base font-semibold text-foreground">{brand}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}