import Link from "next/link";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
      <h1 className="text-4xl font-bold tracking-tight text-gfm-dark sm:text-5xl lg:text-6xl">
        Welcome to{" "}
        <span className="text-gfm-green">GoFundMe Reimagined</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        A reimagined crowdfunding platform where communities come together to
        support the causes that matter most. Discover fundraisers, donate, and
        make a difference.
      </p>
      <Link
        href="#"
        className="mt-8 inline-flex h-9 items-center justify-center rounded-lg bg-gfm-green px-4 text-sm font-medium text-white transition-colors hover:bg-gfm-green/90"
      >
        Discover fundraisers
      </Link>
    </section>
  );
}
