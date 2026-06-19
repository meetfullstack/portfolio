"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useActionState } from "react";
import { sendContactEmail } from "@/app/actions/contact";

gsap.registerPlugin(ScrollTrigger);

const initialState = { success: false, error: null };

const inputClass =
  "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-1 focus:ring-purple-500";
const inputStyle = {
  background: "var(--bg-primary)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
};

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [state, formAction, pending] = useActionState(sendContactEmail, initialState);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true,
        },
      });

      tl.from(".contact-tag", { opacity: 0, y: 20, duration: 0.5, ease: "power3.out" })
        .from(".contact-heading", { opacity: 0, y: 30, duration: 0.6, ease: "power3.out" }, "-=0.3")
        .from(".contact-subtext", { opacity: 0, y: 20, duration: 0.5, ease: "power3.out" }, "-=0.3")
        .from(".contact-form", { opacity: 0, y: 40, duration: 0.7, ease: "power3.out" }, "-=0.2");
    },
    { scope: sectionRef }
  );

  function handleBtnEnter() {
    gsap.to(btnRef.current, { scale: 1.02, duration: 0.2, ease: "power2.out" });
  }

  function handleBtnLeave() {
    gsap.to(btnRef.current, { scale: 1, duration: 0.2, ease: "power2.out" });
  }

  function handleBtnDown() {
    gsap.to(btnRef.current, { scale: 0.97, duration: 0.1, ease: "power2.out" });
  }

  function handleBtnUp() {
    gsap.to(btnRef.current, { scale: 1.02, duration: 0.1, ease: "power2.out" });
  }

  if (state.success) {
    return (
      <section
        id="contact"
        style={{
          paddingTop: "var(--section-gap)",
          paddingBottom: "var(--section-gap)",
        }}
      >
        <div className="container">
          <div className="card max-w-xl p-10 text-center">
            <p className="accent-text text-5xl font-bold">✓</p>
            <p className="mt-4 text-lg font-semibold">Message sent!</p>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              I will get back to you soon.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="contact"
      style={{
        paddingTop: "var(--section-gap)",
        paddingBottom: "var(--section-gap)",
      }}
    >
      <div className="container">
        <div className="relative flex items-start justify-between">
          <div>
            <p className="contact-tag section-tag mb-3">03 // contact.me</p>
            <h2 className="contact-heading text-4xl font-bold tracking-tight sm:text-5xl">
              Get in touch
            </h2>
          </div>
          <span
            aria-hidden="true"
            className="contact-tag select-none font-bold leading-none"
            style={{ fontSize: "clamp(5rem,12vw,9rem)", color: "var(--border)", opacity: 0.6 }}
          >
            03
          </span>
        </div>

        <p
          className="contact-subtext mt-4 max-w-lg text-base leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Open to software engineering and Data/AI roles in Toronto and remote.
          Feel free to reach out — I usually respond within 24 hours.
        </p>

        <div className="contact-form card mt-10 max-w-xl p-8">
          <form action={formAction} className="flex flex-col gap-5">
            {state.error ? (
              <p
                className="rounded-xl px-4 py-3 text-sm"
                style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}
              >
                {state.error}
              </p>
            ) : null}

            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="section-tag">name</label>
              <input id="name" name="name" type="text" required className={inputClass} style={inputStyle} />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="section-tag">email</label>
              <input id="email" name="email" type="email" required className={inputClass} style={inputStyle} />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="section-tag">message</label>
              <textarea id="message" name="message" rows={5} required className={inputClass} style={inputStyle} />
            </div>

            <button
              ref={btnRef}
              type="submit"
              disabled={pending}
              onMouseEnter={handleBtnEnter}
              onMouseLeave={handleBtnLeave}
              onMouseDown={handleBtnDown}
              onMouseUp={handleBtnUp}
              className="mt-2 rounded-full py-3 text-sm font-semibold text-white disabled:opacity-50 accent-gradient"
              style={{ willChange: "transform" }}
            >
              {pending ? "Sending..." : "Send message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
