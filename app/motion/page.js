// Internal gallery for the graphics in components/motion, each at real size so
// they can be reviewed in the running app. Not linked from anywhere, and kept
// out of the index.

import OrbitMount from "@/components/motion/OrbitMount";
import CreativeThreadMount from "@/components/motion/CreativeThreadMount";
import ThoughtsMount from "@/components/motion/ThoughtsMount";
import GearsMount from "@/components/motion/GearsMount";
import CelebrationMount from "@/components/motion/CelebrationMount";

export const metadata = {
  title: "Motion",
  robots: { index: false, follow: false },
};

export default function MotionPage() {
  return (
    <main className="home-root grow px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <p className="home-label">Motion</p>
        <h1 className="mt-3 text-4xl" style={{ fontFamily: "var(--font-instrument)" }}>
          Graphics library
        </h1>

        <section className="mt-14">
          <p className="home-label">Orbit</p>
          <div className="mt-4 rounded-[var(--home-radius)] border border-[var(--home-rule)] bg-[var(--home-surface)]">
            <OrbitMount />
          </div>
        </section>

        <section className="mt-12">
          <p className="home-label">Creative thread</p>
          <div className="mt-4 rounded-[var(--home-radius)] border border-[var(--home-rule)] bg-[var(--home-surface)]">
            <CreativeThreadMount />
          </div>
        </section>

        <section className="mt-12">
          <p className="home-label">Thoughts</p>
          <div className="mt-4 rounded-[var(--home-radius)] border border-[var(--home-rule)] bg-[var(--home-surface)]">
            <ThoughtsMount />
          </div>
        </section>

        <section className="mt-12">
          <p className="home-label">Gears</p>
          <div className="mt-4 rounded-[var(--home-radius)] border border-[var(--home-rule)] bg-[var(--home-surface)]">
            <GearsMount />
          </div>
        </section>

        <section className="mt-12">
          <p className="home-label">Celebration</p>
          <div className="mt-4 rounded-[var(--home-radius)] border border-[var(--home-rule)] bg-[var(--home-surface)]">
            <CelebrationMount />
          </div>
        </section>
      </div>
    </main>
  );
}
