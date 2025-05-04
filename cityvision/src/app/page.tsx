'use client';
import Image from "next/image";
import ParticlesBackground from "./components/ParticlesBackground";
import Link from "next/link";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect, useState } from 'react';

export default function Home() {
  const [backendMessage, setBackendMessage] = useState("");

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <main className="relative">
      {/* Hero Section */}
      <section id = "Home">
      <div className="w-fill h-screen relative overflow-hidden">
        <Image
          src="/dark-background.png"
          alt=""
          fill
          className="object-cover z-0"
        />
        <ParticlesBackground />
        <div className="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center pt-12">
          <p className="text-5xl font-semibold">
            Success Has an Address, Let's Find Yours!
          </p>
          <p className="text-xl font-extralight mt-8">
            Smarter site selection starts with data.
            Our AI-powered platform helps you discover high-potential locations to thrive your business
          </p>
          <div className="auth-buttons mt-8 flex justify-center">
            <Link href="/predictPage" className="signup mt-6">
              Discover our Solution
            </Link>
          </div>
        </div>
      </div>
      </section>

      {/* 🔁 Backend Connection Test */}
      {backendMessage && (
        <div className="w-full text-center py-8 bg-blue-100 text-blue-800 font-medium">
          🔗 Connected to Flask API: {backendMessage}
        </div>
      )}

      {/* Section: What is CityVision? */}
      <section className="w-full py-20 px-30" id="About">
        <div className="flex flex-col items-center text-center" data-aos="fade-down">
          <h2 className="text-3xl font-semibold">
            CityVision .. Where Data Meets Opportunity
          </h2>
          <p className="mt-4 text-gray-700 max-w-2xl">
            Unlock the power of location intelligence to drive better decisions, experiences, and results.
          </p>
          <Image src="/two_dots_2.png" alt="" height={70} width={70} className="mt-4" />
        </div>

        <div className="flex items-center gap-8 mt-12" data-aos="fade-down">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4">What is CityVision?</h1>
            <p className="text-gray-700 text-left max-w-xl">
              CityVision is an AI-powered tool that predicts the optimal locations for opening a new business in the Eastern region of Saudi Arabia, specifically in Dammam, Dhahran, and Khobar.
              The model analyzes various factors such as demographics and spatial features to
              provide data-driven insights for businesses looking to establish themselves in the
              most promising locations. It also features a Large Language Model (LLM) that interprets
              the results, offering clear, human-readable explanations of the predictions
              and factors behind the recommendations.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Image src="/cityvision-logo-without-text.png" alt="CityVision Logo" width={380} height={380} />
          </div>
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

      {/* Product Features Section */}
      <section className="relative w-full py-10 px-6 overflow-hidden" id ='Features'>
  <h1 className="text-3xl font-bold text-center" data-aos="fade-down">Product's Features</h1>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 mt-16 max-w-5xl mx-auto" data-aos="fade-down">
    {[
      {
        title: "Real-Time Analysis",
        desc: "Real-time data to drive real-world impact.",
        icon: "/real-time.png",
      },
      {
        title: "Comprehensive Factors",
        desc: "Incorporates key variables from multiple sources.",
        icon: "/question.png",
      },
      {
        title: "Large-Language Model",
        desc: "Harness AI to interpret data patterns and predict success.",
        icon: "/chatbot.png",
      },
      {
        title: "User-Friendly Design",
        desc: "Strategic insights, delivered with simplicity.",
        icon: "/design.png",
      },
    ].map((item, idx) => (
      <div key={idx} className="flex flex-col items-center text-center">
        <Image src={item.icon} alt={item.title} width={50} height={50} />
        <p className="font-bold text-xl mt-4">{item.title}</p>
        <p>{item.desc}</p>
      </div>
    ))}
  </div>
</section>


      {/* Decorative Vector */}
      <div className="relative w-full h-0">
        <Image
          src="/Vector.svg"
          alt=""
          width={350}
          height={350}
          className="absolute top-[-100px] right-[-30px] z-[-10] pointer-events-none"
        />
      </div>

      {/* Data Sources */}
      <section className="relative w-full mb-30 py-20 px-30 overflow-hidden" data-aos="fade-down">
        <h1 className="text-4xl font-bold my-12 text-left">Our Data Sources</h1>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-10">
          {[
            { src: "/datasources/google-places-api.png", alt: "Google Places", w: 250, h: 250 },
            { src: "/datasources/gastat.png", alt: "GaStat", w: 200, h: 200 },
            { src: "/datasources/Ejar.svg.png", alt: "Ejar", w: 200, h: 200 },
            { src: "/datasources/Foursquare-Symbol.png", alt: "Foursquare", w: 200, h: 200 },
          ].map((img, idx) => (
            <Image
              key={idx}
              src={img.src}
              alt={img.alt}
              width={img.w}
              height={img.h}
              className="transition-transform duration-300 hover:scale-110"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
