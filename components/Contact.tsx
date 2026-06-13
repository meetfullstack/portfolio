"use client";

import { motion } from "framer-motion";
import { useActionState } from "react";
import { sendContactEmail } from "@/app/actions/contact";

const initialState = { success: false, error: null };

export default function Contact() {
  const [state, formAction, pending] = useActionState(
    sendContactEmail,
    initialState,
  );

  if (state.success) {
    return (
      <section id="contact" className="mx-auto max-w-5xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="glass rounded-2xl p-8 text-center"
        >
          <p className="accent-text text-4xl font-bold">✓</p>
          <p className="mt-4 text-lg font-medium">Message sent!</p>
          <p className="mt-2 text-sm text-gray-500">
            I will get back to you soon.
          </p>
        </motion.div>
      </section>
    );
  }

  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 py-24">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="section-number mb-2"
      >
        03 // contact.me
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-3xl font-bold sm:text-4xl"
      >
        Get in touch
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-3 max-w-xl text-sm text-gray-500"
      >
        Open to software engineering and Data/AI roles in Toronto and remote.
        Feel free to reach out.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass mt-8 max-w-xl rounded-2xl p-8"
      >
        <form action={formAction} className="flex flex-col gap-4">
          {state.error ? (
            <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {state.error}
            </p>
          ) : null}

          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="section-number">
              name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="glass rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="section-number">
              email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="glass rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="message" className="section-number">
              message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="glass rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={pending}
            style={{ background: "var(--accent-gradient)" }}
            className="mt-2 rounded-full py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
          >
            {pending ? "Sending..." : "Send message"}
          </motion.button>
        </form>
      </motion.div>
    </section>
  );
}
