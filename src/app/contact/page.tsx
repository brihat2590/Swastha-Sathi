"use client";
import React from "react"

import { useState } from "react";

export default function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(form); // TODO: Replace with API call (Nodemailer, backend, etc.)
    alert("Message sent successfully!");
  };

  return (
    <section className="bg-blue-50 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left Section */}
        <div>
          <h3 className="uppercase text-sm font-semibold text-gray-600 mb-2">
            Contact Us
          </h3>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Let’s talk about your problem.
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">📍</span>
              <div>
                <h4 className="font-semibold">Our Location</h4>
                <p className="text-sm text-gray-600">
                  Near Jain global Campus  <br /> 
                  Jakkasandra, Karnataka
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">✉️</span>
              <div>
                <h4 className="font-semibold">How Can We Help?</h4>
                <p className="text-sm text-gray-600">hi@swasthasathi@gmail.com</p>
                <p className="text-sm text-gray-600">hello@swasthasathi@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="bg-white rounded-lg shadow-md p-8 w-full">
          <h3 className="text-xl font-bold mb-6">Send us a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Rajesh Gupta"
                required
                className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@yourmail.com"
                required
                className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 9860654669"
                required
                className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Type your message here"
                required
                rows={4}
                className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-800 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}