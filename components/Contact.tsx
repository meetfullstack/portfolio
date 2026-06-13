"use client";

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
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-800">
          Message sent — I will get back to you soon.
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 py-24">
      <h2 className="text-3xl font-bold">Get in touch</h2>
      <p className="mt-2 max-w-xl text-gray-600">
        Open to software engineering and Data/AI roles in Toronto and remote.
        Feel free to reach out.
      </p>
      <form action={formAction} className="mt-8 flex max-w-xl flex-col gap-4">
        {state.error ? (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="rounded-md border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded-md border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="message" className="text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            className="rounded-md border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-500"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-md bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {pending ? "Sending..." : "Send message"}
        </button>
      </form>
    </section>
  );
}
