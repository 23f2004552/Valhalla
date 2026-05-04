"use client";

import ScrollReveal from "./ScrollReveal";
import { useState } from "react";

export default function ReservationForm() {
  const [status, setStatus] = useState("idle"); // idle, submitting, success

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("submitting");

    // Simulate API call
    setTimeout(() => {
      console.log("Reservation submitted locally.");
      setStatus("success");
    }, 1500);
  };

  return (
    <section className="py-24 bg-[#E5D6C6] px-6 md:px-12 flex justify-center items-center min-h-[60vh]">
      <ScrollReveal className="w-full max-w-lg bg-[#F4EFEA] p-10 md:p-16 shadow-2xl shadow-[#3B2F2F]/5">
        <h2 className="font-serif text-3xl md:text-4xl text-[#3B2F2F] mb-2 text-center">
          Reserve a Table
        </h2>
        <p className="font-sans text-xs text-accent-olive text-center mb-10 tracking-widest uppercase">
          Join us for an evening
        </p>

        {status === "success" ? (
          <div className="text-center py-10" style={{ animation: "fadeInUp 600ms ease-out both" }}>
            <p className="font-serif text-2xl text-accent-olive italic">Reservation Requested.</p>
            <p className="font-sans text-xs mt-4 text-[#3B2F2F]">
              We will contact you shortly to confirm.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-8 text-xs underline uppercase tracking-widest"
              style={{ minHeight: 44 }}
            >
              Make another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-accent-olive mb-2">
                Name
              </label>
              <input
                type="text"
                required
                className="w-full bg-transparent border-b border-accent-gold py-2 text-[#3B2F2F] font-serif text-xl focus:outline-none focus:border-[#3B2F2F] transition-colors duration-300 placeholder:text-[#3B2F2F]/20"
                placeholder="Your Name"
                style={{ minHeight: 44 }}
              />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block font-sans text-[10px] uppercase tracking-widest text-accent-olive mb-2">
                  Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full bg-transparent border-b border-accent-gold py-2 text-[#3B2F2F] font-sans text-sm focus:outline-none focus:border-[#3B2F2F] transition-colors duration-300"
                  style={{ minHeight: 44 }}
                />
              </div>
              <div>
                <label className="block font-sans text-[10px] uppercase tracking-widest text-accent-olive mb-2">
                  Guests
                </label>
                <select
                  className="w-full bg-transparent border-b border-accent-gold py-2 text-[#3B2F2F] font-serif text-xl focus:outline-none focus:border-[#3B2F2F] transition-colors duration-300"
                  style={{ minHeight: 44 }}
                >
                  <option>2 Guests</option>
                  <option>3 Guests</option>
                  <option>4 Guests</option>
                  <option>5+ Guests</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-accent-olive mb-2">
                Phone
              </label>
              <input
                type="tel"
                required
                className="w-full bg-transparent border-b border-accent-gold py-2 text-[#3B2F2F] font-serif text-xl focus:outline-none focus:border-[#3B2F2F] transition-colors duration-300 placeholder:text-[#3B2F2F]/20"
                placeholder="+91 98000 00000"
                style={{ minHeight: 44 }}
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-[#3B2F2F] text-[#F4EFEA] py-4 font-sans text-xs uppercase tracking-[0.2em] hover:bg-accent-olive transition-colors duration-300 disabled:opacity-50"
                style={{ minHeight: 52 }}
              >
                {status === "submitting" ? "Checking Access..." : "Confirm Request"}
              </button>
            </div>
          </form>
        )}
      </ScrollReveal>
    </section>
  );
}
