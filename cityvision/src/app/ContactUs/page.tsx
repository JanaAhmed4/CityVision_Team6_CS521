'use client';
import Image from "next/image";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect, useState } from 'react';

export default function ContactUs() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <main className="relative">
      <section className="w-full h-screen relative overflow-hidden bg-black">
        <Image
          src="/dark-background.png"
          alt="Background"
          fill
          className="object-cover z-0"
        />
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center px-4" data-aos="fade-down">
          <h1 className="text-5xl font-semibold">Contact Us</h1>
          <p className="text-xl font-light mt-4 max-w-2xl mx-auto">
            We're here to help. Whether you have a question about features, trials, or anything else—our team is ready to answer.
          </p>
        </div>
      </section>
{/* Decorative Vector */}
<div className="relative w-full h-0">
        <Image
          src="/Vector.svg"
          alt=""
          width={350}
          height={350}
          className="absolute top-[-10px] right-[-30px] z-[-10] pointer-events-none"
        />
      </div>
      <section className="py-20 px-6" data-aos="fade-up">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-6">Get in Touch</h2>
          <form className="grid grid-cols-1 gap-6 text-left">
            <div>
              <label htmlFor="name" className="block font-medium mb-1">Name</label>
              <input type="text" id="name" placeholder="Your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="email" className="block font-medium mb-1">Email</label>
              <input type="email" id="email" placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="message" className="block font-medium mb-1">Message</label>
              <textarea id="message" rows={6} placeholder="Your message"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <button
              type="submit"
              className="text-white py-2 px-6 rounded-xl transition duration-300 hover:brightness-110"
              style={{ backgroundColor: '#374151b0' }}
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Decorative Vector */}
      <div className="relative w-full h-0">
        <Image
          src="/Vector (3).svg"
          alt=""
          width={400}
          height={400}
          className="absolute top-[-150px] left-1/20 -translate-x-1/2 z-0 pointer-events-none"
        />
      </div>

      {/* Meet the Team Section */}
      <section className="py-20 px-6" data-aos="fade-up">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-10">Meet the Team</h2>
          <div className="flex justify-between flex-wrap md:flex-nowrap gap-6 items-start">
            {[
              {
                name: "Hala A. Alhazzaa",
                role: "Leader",
                image: "/avatar.png",
              },
              {
                name: "Farah I. Aljarboa",
                role: "Member",
                image: "/avatar.png",
              },
              {
                name: "Jana A. Albelaihed",
                role: "Member",
                image: "/avatar.png",
              },
              {
                name: "Joori A. Alqahtani",
                role: "Member",
                image: "/avatar.png",
              },
              {
                name: "Reem S. Alhazzani",
                role: "Member",
                image: "/avatar.png",
              }
            ].map((member, index) => (
              <div
                key={index}
                className="flex-1 min-w-[150px] bg-white p-4 rounded-2xl shadow-md"
              >
                <Image
                  src={member.image}
                  alt={member.name}
                  className="mx-auto mb-3"
                  width={80}
                  height={80}
                />
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-gray-600 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>




    </main>
  );
}
