"use client";

import { motion } from "framer-motion";
import { useActionState } from "react";
import { sendContactEmail } from "@/app/actions/contact";

const initialState = { success: false, error: null };

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

const inputClass =
  "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-1 focus:ring-purple-500";
const inputStyle = {
  background: "var(--bg-primary)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
};

export default function Contact() {
  const [state, formAction, pending] = useActionState(
    sendContactEmail,
    initialState,
  );

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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="card max-w-xl p-10 text-center"
          >
            <p className="accent-text text-5xl font-bold">✓</p>
            <p className="mt-4 text-lg font-semibold">Message sent!</p>
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              I will get back to you soon.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="contact"
      style={{
        paddingTop: "var(--section-gap)",
        paddingBottom: "var(--section-gap)",
      }}
    >
      <div className="container">
        <motion.p {...fadeUp(0)} className="section-tag mb-3">
          03 // contact.me
        </motion.p>

        <motion.h2
          {...fadeUp(0.1)}
          className="text-4xl font-bold tracking-tight sm:text-5xl"
        >
          Get in touch
        </motion.h2>

        <motion.p
          {...fadeUp(0.2)}
          className="mt-4 max-w-lg text-base leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Open to software engineering and Data/AI roles in Toronto and remote.
          Feel free to reach out — I usually respond within 24 hours.
        </motion.p>

        <motion.div {...fadeUp(0.3)} className="card mt-10 max-w-xl p-8">
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
              <label htmlFor="name" className="section-tag">
                name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="section-tag">
                email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="section-tag">
                message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={pending}
              className="mt-2 rounded-full py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50 accent-gradient"
            >
              {pending ? "Sending..." : "Send message"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
