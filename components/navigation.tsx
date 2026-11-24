
'use client'

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { isStaff } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

const navigation = [
  { name: "Menu", href: "/" },
  { name: "News", href: "/news" },
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
]

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, status, logout } = useAuth()

  // Admin panelning o'z sidebar'i bor — sayt navigatsiyasi u yerda kerak emas.
  if (pathname.startsWith("/admin")) return null

  const accountHref = user && isStaff(user.role) ? "/admin" : "/profile"
  const accountLabel = user && isStaff(user.role) ? "Admin Panel" : "Profile"

  const handleLogout = async () => {
    setIsOpen(false)
    await logout()
    router.push("/login")
  }

  return (
    <div className="w-full px-6 md:px-12 lg:px-20 py-5 relative z-50">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link href="/" onClick={() => setIsOpen(false)} className="shrink-0">
          <Image
            src="/image 2.png"
            width={100}
            height={70}
            alt="Restaurant logo"
            priority
            className="w-20 md:w-24 h-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-8 lg:gap-10">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="text-white text-sm font-medium hover:text-white/70 transition-colors duration-300"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Login / Account */}
        <div className="hidden md:flex items-center gap-3">
          {status === "authenticated" && user ? (
            <>
              <Link
                href={accountHref}
                className="border border-white rounded-full px-7 py-2.5
                text-white text-sm font-medium hover:bg-white
                hover:text-[#C2213D] transition-all duration-300"
              >
                {accountLabel}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-white text-sm font-medium hover:text-white/70 transition-colors duration-300"
              >
                Log Out
              </button>
            </>
          ) : status === "unauthenticated" ? (
            <Link
              href="/login"
              className="border border-white rounded-full px-7 py-2.5
              text-white text-sm font-medium hover:bg-white
              hover:text-[#C2213D] transition-all duration-300"
            >
              Log In
            </Link>
          ) : null}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white text-3xl focus:outline-none"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          {isOpen ? "✕" : "☰"}
        </button>

      </nav>

      {/* Mobile Dropdown */}
      <div
        id="mobile-navigation"
        className={`
          md:hidden absolute top-full left-0 w-full
          bg-[#C2213D] shadow-xl
          transition-all duration-300 ease-in-out
          ${isOpen
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-3 pointer-events-none"
          }
        `}
      >
        <ul className="flex flex-col items-center py-5 gap-5">

          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-white font-medium text-base hover:text-white/70 transition-colors"
              >
                {item.name}
              </Link>
            </li>
          ))}

          {status === "authenticated" && user ? (
            <>
              <li>
                <Link
                  href={accountHref}
                  onClick={() => setIsOpen(false)}
                  className="inline-block border border-white rounded-full px-8 py-2
                  text-white font-medium hover:bg-white
                  hover:text-[#C2213D] transition-all"
                >
                  {accountLabel}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-white font-medium text-base hover:text-white/70 transition-colors"
                >
                  Log Out
                </button>
              </li>
            </>
          ) : status === "unauthenticated" ? (
            <li>
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="inline-block border border-white rounded-full px-8 py-2
                text-white font-medium hover:bg-white
                hover:text-[#C2213D] transition-all"
              >
                Log In
              </Link>
            </li>
          ) : null}

        </ul>
      </div>

    </div>
  )
}

export default Navigation
