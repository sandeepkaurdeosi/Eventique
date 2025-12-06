"use client";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import NavItems from "./NavItems";

const MobileNav = () => {
  return (
    <nav className="md:hidden">
      <Sheet>
        {/* Trigger as button */}
        <SheetTrigger asChild>
          <button className="p-1 rounded-md">
            <Image 
              src="/assets/icons/menu.svg"
              alt="menu"
              width={24}
              height={24}
            />
          </button>
        </SheetTrigger>

        <SheetContent className="flex flex-col gap-6 mt-7 bg-white md:hidden">
          <VisuallyHidden>
            <SheetTitle>Mobile Navigation Menu</SheetTitle>
            <SheetDescription>
              Use this menu to navigate between pages
            </SheetDescription>
          </VisuallyHidden>

          <Image 
            src="/assets/images/photo.png"
            alt="logo"
            width={128}
            height={38}
          />
          <Separator className="border border-gray-50" />
          <NavItems />
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default MobileNav;
