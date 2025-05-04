'use client';

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { ClerkLoaded, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "../globals.css";

export const Header = () => {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect to /predict when user signs in
    if (isSignedIn) {
      router.push("/predictPage");
    }
  }, [isSignedIn, router]);

  return (
    <header className="px-28 py-4 bg-transparent absolute top-0 left-0 w-full z-50">
      <nav className="max-w-screen-xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Image src="/logo-white-semibold.png" alt="Logo" width={155} height={155} />
        </div>

        {/* Center Nav Links */}
        <div className="nav-links mt-2 flex gap-6 text-white">
          <Link href="/">Home</Link>
          <Link href="/#About">About</Link>
          <Link href="/#Features">Features</Link>
          <Link href="/ContactUs">Contact us</Link>
          <Link href="/ndcgGame" >Game</Link>
          
        </div>

        {/* Auth buttons */}
        <ClerkLoaded>
          <div className="auth-buttons mt-3">
            {user ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <>
                <SignInButton mode="modal">
                  <a className="cursor-pointer">Login</a>
                </SignInButton>
                <SignUpButton mode="modal">
                  <a className="signup cursor-pointer">Sign up</a>
                </SignUpButton>
              </>
            )}
          </div>
        </ClerkLoaded>
      </nav>
    </header>
  );
};

export default Header;
