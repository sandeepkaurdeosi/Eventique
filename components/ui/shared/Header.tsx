import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { Button } from "../button"
import MobileNav from "./MobileNav"
import NavItems from "./NavItems"

const Header = () => {
  return (
    <header className="w-full border-b p-4">
      <div className="wrapper flex items-center justify-between md:px-10 md:pl-24">
        {/* Logo */}
        <Link href="/" className="w-48 md:w-56">
          <Image 
            src="/assets/images/photo.png"
            width={200}
            height={38}
            alt="Eventique logo" 
          />
        </Link>

        {/* Navigation (only visible when signed in) */}
        <SignedIn>
          <nav className="hidden md:flex md:gap-6">
            <NavItems />
          </nav>
        </SignedIn>

        {/* User actions */}
        <div className="flex w-32 justify-end gap-3">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
            <MobileNav />
          </SignedIn>

          <SignedOut>
            <Button asChild className="rounded-full" size="lg">
              <Link href="/sign-in">Login</Link>
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  )
}

export default Header
