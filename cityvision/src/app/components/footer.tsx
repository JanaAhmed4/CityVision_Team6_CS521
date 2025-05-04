import Link from "next/link";
import Image from "next/image";
import "../globals.css";

export const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#431407] text-white pt-16 pb-6 px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Logo + Description */}
        <div>
          <Image
            src="/footer-logo-2.png"
            alt="Logo"
            width={280}
            height={280}
            className="mt-2"
          />
        </div>

        {/* Links */}
        <div className="ml-18">
          <h3 className="text-lg font-semibold mb-2">Links</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="/#Home" className="hover:underline">Home</a></li>
            <li><a href="/#About" className="hover:underline">About</a></li>
            <li><a href="/#Features" className="hover:underline">Features</a></li>
            <li><a href="/ContactUs" className="hover:underline">Contact Us</a></li>
          </ul>
        </div>

        {/* Office Info */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Contacts</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            College of Computer Science & IT, IAU<br />
            Dammam 31441, Saudi Arabia
          </p>
          <p className="mt-2 text-sm text-gray-300">CityVisionSolution@gmail.com</p>
          <p className="text-sm text-gray-300 mt-1 font-medium">013 - 244 2025</p>
        </div>

        {/* Social Icons */}
        <div>
          <div className="flex gap-4 mt-28 ml-20">
            <a href="#" className="text-black p-2 rounded-full">
              <Image src="icons8-x.svg" alt="X" width={16} height={16} />
            </a>
            <a href="#" className="text-black p-2 rounded-full">
              <Image src="icons8-instagram.svg" alt="Instagram" width={16} height={16} />
            </a>
            <a href="#" className="text-black p-2 rounded-full">
              <Image src="icons8-linkedin.svg" alt="LinkedIn" width={16} height={16} />
            </a>
            <a href="#" className="text-black p-2 rounded-full">
              <Image src="icons8-whatsapp.svg" alt="WhatsApp" width={16} height={16} />
            </a>
          </div>
        </div>
      </div>

      {/* ✅ Copyright Row */}
      <div className="mt-10 border-t border-white/20 pt-4 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} CityVision. All rights reserved.
      </div>
    </footer>
  );
};
