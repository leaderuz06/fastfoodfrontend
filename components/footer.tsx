
import Image from "next/image"
import Link from "next/link"

const footerLinks = [
  { name: "Home", href: "/" },
  { name: "News", href: "/news" },
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
  { name: "Log In", href: "/login" },
]

const Footer = () => {
  return (
    <footer className="bg-[#C2213D] text-white">

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-14 lg:py-20">

        {/* Main Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">

          {/* Logo & Description */}
          <div className="flex flex-col items-start">

            <Link href="/">
              <Image
                src="/image 2.png"
                width={120}
                height={80}
                alt="Restaurant logo"
                className="w-24 h-auto object-contain"
              />
            </Link>

            <p className="text-white/80 text-sm leading-7 mt-5 max-w-sm">
              Experience delicious food, wonderful flavors, and
              unforgettable moments with us. We are always happy
              to serve you.
            </p>

          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-xl font-bold mb-6">
              Quick Links
            </h2>

            <ul className="flex flex-col gap-4">
              {footerLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-white/80 text-sm hover:text-white
                    hover:translate-x-1 inline-block transition-all duration-300"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-xl font-bold mb-6">
              Contact Us
            </h2>

            <div className="flex flex-col gap-5 text-sm text-white/80">

              <div>
                <h3 className="text-white font-semibold mb-1">
                  Visit Us
                </h3>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  Find our location
                </Link>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-1">
                  Get in Touch
                </h3>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact our team
                </Link>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-1">
                  Working Hours
                </h3>
                <p>Visit our contact page for details.</p>
              </div>

            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-white/20 mt-14 pt-7">

          <div className="flex flex-col md:flex-row
          items-center justify-between gap-4">

            <p className="text-white/70 text-sm text-center">
              © 2026 Restaurant. All rights reserved.
            </p>

            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/"
                className="text-white/70 hover:text-white transition-colors"
              >
                Home
              </Link>

              <Link
                href="/contact"
                className="text-white/70 hover:text-white transition-colors"
              >
                Contact
              </Link>
            </div>

          </div>

        </div>

      </div>
    </footer>
  )
}

export default Footer
