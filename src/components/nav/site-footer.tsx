import Link from "next/link";

const footerSections = [
  {
    title: "Fundraise for",
    links: [
      { label: "Medical", href: "#" },
      { label: "Education", href: "#" },
      { label: "Emergency", href: "#" },
      { label: "Memorial", href: "#" },
      { label: "Nonprofit", href: "#" },
    ],
  },
  {
    title: "Learn more",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Common questions", href: "#" },
      { label: "Success stories", href: "#" },
      { label: "Supported countries", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help center", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "GoFundMe for teams", href: "#" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About us", href: "#" },
      { label: "Press", href: "#" },
      { label: "Partnerships", href: "#" },
      { label: "Contact us", href: "#" },
    ],
  },
] as const;

const legalLinks = [
  { label: "Terms", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Legal", href: "#" },
  { label: "Accessibility", href: "#" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-[#f8f8f8]">
      {/* Top section: link columns */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gfm-dark">
                {section.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-gfm-green"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom section: copyright + legal links */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-6 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">
            &copy; 2026 GoFundMe Reimagined
          </p>
          <nav className="flex flex-wrap gap-4">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-gfm-green"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
