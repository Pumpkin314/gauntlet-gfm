import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

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
        className={buttonVariants({
          size: "lg",
          className: "mt-8 bg-gfm-green text-white hover:bg-gfm-green/90",
        })}
      >
        Discover fundraisers
      </Link>
    </section>
  );
}
