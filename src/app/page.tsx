"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 text-center">
        <motion.h1
          className="text-5xl font-bold tracking-tight sm:text-7xl"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
        >
          Rob Courson
        </motion.h1>
        <motion.p
          className="mt-4 text-lg text-neutral-400 sm:text-xl"
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
        >
          Developer &middot; Creator &middot; Builder
        </motion.p>
        <motion.div
          className="mt-8 flex gap-4"
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
        >
          <a
            href="#about"
            className="rounded-full border border-neutral-700 px-6 py-2 text-sm transition-colors hover:bg-white hover:text-black"
          >
            About
          </a>
          <a
            href="#projects"
            className="rounded-full bg-white px-6 py-2 text-sm text-black transition-colors hover:bg-neutral-300"
          >
            Projects
          </a>
        </motion.div>
      </section>

      {/* About */}
      <section
        id="about"
        className="w-full max-w-4xl px-6 py-24"
      >
        <motion.h2
          className="text-3xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          About
        </motion.h2>
        <motion.p
          className="mt-4 leading-relaxed text-neutral-400"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          A short bio goes here. Replace this with a few sentences about
          yourself, your background, and what you&apos;re passionate about.
        </motion.p>
      </section>

      {/* Projects */}
      <section
        id="projects"
        className="w-full max-w-4xl px-6 py-24"
      >
        <motion.h2
          className="text-3xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Projects
        </motion.h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <motion.div
              key={n}
              className="rounded-2xl border border-neutral-800 p-6 transition-colors hover:border-neutral-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: n * 0.1 }}
            >
              <h3 className="text-lg font-semibold">Project {n}</h3>
              <p className="mt-2 text-sm text-neutral-400">
                Brief description of the project and what it does.
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="w-full max-w-4xl px-6 py-24"
      >
        <motion.h2
          className="text-3xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Get in Touch
        </motion.h2>
        <motion.p
          className="mt-4 text-neutral-400"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Reach out at{" "}
          <a
            href="mailto:hello@example.com"
            className="text-white underline underline-offset-4 hover:text-neutral-300"
          >
            hello@example.com
          </a>
        </motion.p>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-800 py-8 text-center text-sm text-neutral-500">
        &copy; {new Date().getFullYear()} Rob Courson
      </footer>
    </div>
  );
}
