import About from "@/components/About";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <section className="mx-auto flex min-h-[80vh] max-w-5xl flex-col justify-center px-6">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-gray-500">
          Full-stack developer
        </p>
        <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
          Hi, I&apos;m Meet — I build fast, modern web applications.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-600">
          Full-stack developer specializing in React, Next.js, and agentic
          development workflows. Currently open to software engineering and
          Data/AI roles.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="#projects"
            className="rounded-md bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            View my work
          </a>
          <a
            href="#contact"
            className="rounded-md border border-gray-300 px-5 py-3 text-sm font-medium hover:border-gray-500"
          >
            Get in touch
          </a>
        </div>
      </section>

      <About />
      <Projects />
      <Contact />
    </>
  );
}
