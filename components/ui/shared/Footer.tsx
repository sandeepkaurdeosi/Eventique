import Image from "next/image"
import Link from "next/link"
import { FaHeart } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="wrapper flex flex-col items-center justify-between gap-3 p-5 text-center sm:flex-row">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 md:pl-24">
          <Image 
            src="/assets/images/photo.png"
            alt="logo"
            width={150}
            height={38}
            className="object-contain"
          />
        </Link>

        {/* Text Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-center w-full md:relative">
          <p className="text-sm md:mx-auto">
            © 2026 Eventique. All rights reserved.
          </p>
          <p className="flex items-center justify-center md:absolute md:right-10 mt-1 md:mt-0 text-sm">
            Made by <span className="ml-1 mr-2 font-bold">Sandeep Deosi</span> 
            with <FaHeart className="ml-1 text-red-500" />
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

