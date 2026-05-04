"use client"
import { useState } from "react";

interface Feature {
  icon: string;
  title: string;
  desc: string;
  span: string;
  variant: string;
}

interface FAQ {
  q: string;
  a: string;
}

interface SecurityPoint {
  title: string;
  desc: string;
}

const NAV_LINKS: string[] = ["Ecosystem", "Features", "Security", "Privacy"];

const FEATURES: Feature[] = [
  {
    icon: "verified_user",
    title: "Secure Health Records",
    desc: "All your medical data, encrypted at rest and in transit. Access your reports anytime, anywhere with absolute confidence in your privacy.",
    span: "md:col-span-8",
    variant: "wide",
  },
  {
    icon: "security",
    title: "Private Vault",
    desc: "Extreme isolation for your most sensitive data. Zero-knowledge encryption means only you hold the keys.",
    span: "md:col-span-4",
    variant: "dark",
  },
  {
    icon: "medical_services",
    title: "Doctor Consults",
    desc: "Connect with certified specialists instantly. Video, voice, or text consultations with integrated record sharing.",
    span: "md:col-span-5",
    variant: "muted",
  },
  {
    icon: "timeline",
    title: "Longitudinal Records",
    desc: "Track your health trends over decades. Our AI-driven insights visualize your health journey with unparalleled clarity.",
    span: "md:col-span-7",
    variant: "chart",
  },
];

const FAQS: FAQ[] = [
  {
    q: "How secure is my data?",
    a: "Your data is protected by military-grade AES-256 bit encryption. We employ a zero-knowledge architecture, meaning only you hold the decryption keys. Even Swastha Sathi cannot access your private medical records.",
  },
  {
    q: "Can I share records with my doctor?",
    a: "Yes. You can instantly share specific reports or your entire longitudinal history with certified specialists through secure, time-limited access links or direct integration during video consultations.",
  },
  {
    q: "Is Swastha Sathi free to use?",
    a: "We offer a robust free tier for individual health tracking. Professional features for doctors and enterprise-grade storage options for families are available through our premium subscription plans.",
  },
  {
    q: "What makes the Digital Vault different?",
    a: "Unlike standard cloud storage, our Digital Vault uses extreme hardware isolation and biometric-only access triggers, ensuring your most sensitive diagnostic data remains offline-secure while being cloud-accessible.",
  },
];

const SECURITY_POINTS: SecurityPoint[] = [
  {
    title: "AES-256 Bit Encryption:",
    desc: "All patient data is secured with industry-leading encryption protocols.",
  },
  {
    title: "HIPAA Compliance:",
    desc: "Full adherence to global healthcare data privacy standards.",
  },
  {
    title: "Biometric Access:",
    desc: "Multi-factor authentication including fingerprint and facial recognition.",
  },
];

const CHART_HEIGHTS: string[] = ["40%", "60%", "90%", "70%", "100%"];

interface IconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

// Icon component using Google Material Symbols
function Icon({ name, className = "", style }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontFamily: "Material Symbols Outlined", ...style }}
    >
      {name}
    </span>
  );
}

function Navbar() {
  const [activeLink, setActiveLink] = useState<string>("Features");

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 50,
        backgroundColor: "#fff",
        borderBottom: "1px solid #e5e7eb",
        height: "80px",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "100%",
          padding: "0 32px",
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontSize: "24px",
            fontWeight: 900,
            color: "#000",
            letterSpacing: "-0.05em",
          }}
        >
          Swastha Sathi
        </div>

        {/* Nav Links */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "32px" }}
          className="hidden-mobile"
        >
          {NAV_LINKS.map((link: string) => (
            <a
              key={link}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveLink(link);
              }}
              style={{
                fontWeight: activeLink === link ? 700 : 500,
                color: activeLink === link ? "#1e3a8a" : "#000",
                borderBottom:
                  activeLink === link ? "2px solid #1e3a8a" : "2px solid transparent",
                paddingBottom: "2px",
                textDecoration: "none",
                transition: "color 0.2s",
                fontSize: "15px",
              }}
            >
              {link}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            style={{
              padding: "8px 24px",
              fontWeight: 700,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#000",
              fontSize: "15px",
            }}
          >
            Login
          </button>
          <button
            style={{
              backgroundColor: "#1e3a8a",
              color: "#fff",
              padding: "12px 32px",
              borderRadius: "8px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontSize: "15px",
              transition: "opacity 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <header
      style={{
        paddingTop: "160px",
        paddingBottom: "80px",
        padding: "160px 32px 80px",
        maxWidth: "1280px",
        margin: "0 auto",
        textAlign: "center",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      <div style={{ maxWidth: "896px", margin: "0 auto" }}>
        <span
          style={{
            display: "inline-block",
            padding: "4px 16px",
            borderRadius: "9999px",
            backgroundColor: "#000",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "24px",
          }}
        >
          Healthcare Evolution
        </span>

        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 48px)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: "24px",
            color: "#000",
          }}
        >
          Your Health, Secured in a&nbsp;
          <br></br><span style={{ color: "#1e3a8a" }}>Digital Vault.</span>
        </h1>

        <p
          style={{
            fontSize: "18px",
            lineHeight: 1.6,
            color: "#5d5f5f",
            marginBottom: "40px",
            maxWidth: "672px",
            margin: "0 auto 40px",
          }}
        >
          A complete app ecosystem designed for the modern health-conscious
          individual. Professional reliability meets cutting-edge encryption.
        </p>

        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            marginBottom: "64px",
            flexWrap: "wrap",
          }}
        >
          <button
            style={{
              backgroundColor: "#1e3a8a",
              color: "#fff",
              padding: "16px 32px",
              borderRadius: "8px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "16px",
            }}
          >
            Launch Ecosystem
            <Icon name="arrow_forward" />
          </button>
          <button
            style={{
              border: "1px solid #e4beb1",
              color: "#000",
              padding: "16px 32px",
              borderRadius: "8px",
              fontWeight: 700,
              background: "none",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Learn More
          </button>
        </div>

        {/* Hero image placeholder */}
        <div
          style={{
            width: "100%",
            aspectRatio: "16/9",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid #e4e2e2",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            backgroundColor: "#efeded",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(30,58,138,0.08) 0%, transparent 60%)",
            }}
          />
          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <Icon
              name="monitor_heart"
              style={{ fontSize: "64px", color: "#1e3a8a", display: "block", margin: "0 auto 16px" }}
              className=""
            />
            <p style={{ color: "#5d5f5f", fontSize: "16px" }}>
              Professional Medical Dashboard
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

interface FeatureCardProps {
  feature: Feature;
}

function FeatureCard({ feature }: FeatureCardProps) {
  const [hovered, setHovered] = useState<boolean>(false);

  const base: React.CSSProperties = {
    borderRadius: "12px",
    padding: "48px",
    transition: "all 0.2s",
    fontFamily: "'Manrope', sans-serif",
  };

  if (feature.variant === "dark") {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...base,
          backgroundColor: "#000",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: hovered ? "0 25px 50px -12px rgba(0,0,0,0.25)" : "none",
        }}
      >
        <div>
          <Icon
            name={feature.icon}
            className=""
            style={{ fontSize: "36px", color: "#1e3a8a", display: "block", marginBottom: "24px" }}
          />
          <div style={{ fontSize: "36px", marginBottom: "24px" }}>🔐</div>
          <h3
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "#fff",
              marginBottom: "16px",
              lineHeight: 1.3,
            }}
          >
            {feature.title}
          </h3>
          <p style={{ fontSize: "16px", color: "rgba(228,226,226,0.7)", lineHeight: 1.5 }}>
            {feature.desc}
          </p>
        </div>
        <div
          style={{
            marginTop: "32px",
            paddingTop: "32px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Learn More <Icon name="arrow_forward" />
          </div>
        </div>
      </div>
    );
  }

  if (feature.variant === "wide") {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...base,
          backgroundColor: "#fff",
          border: hovered ? "1px solid #1e3a8a" : "1px solid #e4beb1",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "32px",
          }}
        >
          <div style={{ flex: "1 1 240px" }}>
            <div style={{ fontSize: "36px", marginBottom: "24px" }}>🛡️</div>
            <h3
              style={{ fontSize: "24px", fontWeight: 600, marginBottom: "16px", color: "#1b1c1c" }}
            >
              {feature.title}
            </h3>
            <p style={{ fontSize: "16px", color: "#5d5f5f", lineHeight: 1.5 }}>{feature.desc}</p>
          </div>
          <div
            style={{
              flex: "1 1 240px",
              backgroundColor: "#efeded",
              borderRadius: "8px",
              padding: "24px",
              overflow: "hidden",
              minHeight: "200px",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, rgba(30,58,138,0.1), transparent)",
                opacity: 0.5,
              }}
            />
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { icon: "lock", width: "96px" },
                { icon: "shield", width: "128px", offset: true },
                { icon: "fingerprint", width: "80px" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    height: "40px",
                    backgroundColor: "#fff",
                    borderRadius: "4px",
                    border: "1px solid #e4beb1",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 16px",
                    gap: "12px",
                    marginLeft: item.offset ? "16px" : "0",
                  }}
                >
                  <Icon name={item.icon} className="" style={{ fontSize: "14px", color: "#1e3a8a" }} />
                  <div
                    style={{
                      height: "8px",
                      width: item.width,
                      backgroundColor: "#e4e2e2",
                      borderRadius: "9999px",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (feature.variant === "chart") {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...base,
          backgroundColor: "#fff",
          border: hovered ? "1px solid #1e3a8a" : "1px solid #e4beb1",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "32px",
            alignItems: "center",
          }}
        >
          <div style={{ flex: "1 1 240px" }}>
            <h3
              style={{ fontSize: "24px", fontWeight: 600, marginBottom: "8px", color: "#1b1c1c" }}
            >
              {feature.title}
            </h3>
            <p style={{ fontSize: "16px", color: "#5d5f5f", lineHeight: 1.5 }}>{feature.desc}</p>
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "8px",
                height: "96px",
              }}
            >
              {CHART_HEIGHTS.map((h: string, i: number) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: h,
                    backgroundColor: hovered ? "#1e3a8a" : "#e4e2e2",
                    borderRadius: "4px 4px 0 0",
                    transition: `background-color 0.2s ${i * 75}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // muted variant
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...base,
        backgroundColor: "#efeded",
        border: hovered ? "1px solid #e4beb1" : "1px solid transparent",
      }}
    >
      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        <div
          style={{
            backgroundColor: "#fff",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            border: "1px solid #e4beb1",
            flexShrink: 0,
          }}
        >
          <Icon name={feature.icon} className="" style={{ color: "#1e3a8a", fontSize: "24px" }} />
        </div>
        <div>
          <h3
            style={{ fontSize: "24px", fontWeight: 600, marginBottom: "8px", color: "#1b1c1c" }}
          >
            {feature.title}
          </h3>
          <p style={{ fontSize: "16px", color: "#5d5f5f", lineHeight: 1.5 }}>{feature.desc}</p>
        </div>
      </div>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section
      style={{
        padding: "80px 32px",
        maxWidth: "1280px",
        margin: "0 auto",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "80px" }}>
        <h2
          style={{
            fontSize: "32px",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: "#000",
            marginBottom: "16px",
          }}
        >
          A Complete App Ecosystem
        </h2>
        <p
          style={{
            fontSize: "18px",
            color: "#5d5f5f",
            maxWidth: "672px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Experience a seamless health management workflow powered by
          military-grade security and intuitive design.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: "24px",
        }}
      >
        {/* Secure Health Records - 8 cols */}
        <div style={{ gridColumn: "span 8" }}>
          <FeatureCard feature={FEATURES[0]} />
        </div>
        {/* Private Vault - 4 cols */}
        <div style={{ gridColumn: "span 4" }}>
          <FeatureCard feature={FEATURES[1]} />
        </div>
        {/* Doctor Consults - 5 cols */}
        <div style={{ gridColumn: "span 5" }}>
          <FeatureCard feature={FEATURES[2]} />
        </div>
        {/* Longitudinal Records - 7 cols */}
        <div style={{ gridColumn: "span 7" }}>
          <FeatureCard feature={FEATURES[3]} />
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section
      style={{
        padding: "80px 32px",
        backgroundColor: "#efeded",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "64px",
        }}
      >
        <div style={{ flex: "1 1 320px" }}>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#1e3a8a",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              display: "block",
              marginBottom: "16px",
            }}
          >
            Enterprise Security
          </span>
          <h2
            style={{
              fontSize: "32px",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              marginBottom: "24px",
              color: "#000",
            }}
          >
            Military Grade Infrastructure
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {SECURITY_POINTS.map((pt: SecurityPoint, i: number) => (
              <div key={i} style={{ display: "flex", gap: "16px" }}>
                <Icon name="check_circle" className="" style={{ color: "#000", flexShrink: 0 }} />
                <p style={{ fontSize: "16px", color: "#5d5f5f", lineHeight: 1.5 }}>
                  <strong style={{ color: "#000" }}>{pt.title}</strong> {pt.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            flex: "1 1 280px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "32px",
              borderRadius: "12px",
              border: "1px solid #e4beb1",
              textAlign: "center",
            }}
          >
            <div
              style={{ fontSize: "48px", fontWeight: 700, color: "#000", marginBottom: "8px" }}
            >
              99.9%
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#5d5f5f",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Uptime
            </div>
          </div>
          <div
            style={{
              backgroundColor: "#fff",
              padding: "32px",
              borderRadius: "12px",
              border: "1px solid #e4beb1",
              textAlign: "center",
              marginTop: "32px",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                fontWeight: 700,
                color: "#1e3a8a",
                marginBottom: "8px",
              }}
            >
              ZERO
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#5d5f5f",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Breach History
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface FAQItemProps {
  faq: FAQ;
}

function FAQSection() {
  return (
    <section
      style={{
        padding: "80px 32px",
        backgroundColor: "#fbf9f9",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      <div style={{ maxWidth: "896px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#1e3a8a",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              display: "block",
              marginBottom: "16px",
            }}
          >
            Common Questions
          </span>
          <h2
            style={{ fontSize: "32px", fontWeight: 700, color: "#000", letterSpacing: "-0.01em" }}
          >
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {FAQS.map((faq: FAQ, i: number) => (
            <FAQItem key={i} faq={faq} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ faq }: FAQItemProps) {
  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "#fff",
        border: hovered ? "1px solid #1e3a8a" : "1px solid #e4beb1",
        borderRadius: "12px",
        padding: "32px",
        transition: "all 0.2s",
        boxShadow: hovered ? "0 10px 15px -3px rgba(0,0,0,0.1)" : "none",
      }}
    >
      <div style={{ display: "flex", gap: "16px" }}>
        <span
          style={{
            color: "#1e3a8a",
            fontWeight: 900,
            fontSize: "20px",
            userSelect: "none",
            flexShrink: 0,
          }}
        >
          Q.
        </span>
        <div>
          <h3
            style={{ fontSize: "20px", fontWeight: 600, color: "#000", marginBottom: "12px" }}
          >
            {faq.q}
          </h3>
          <p style={{ fontSize: "16px", color: "#5d5f5f", lineHeight: 1.625 }}>{faq.a}</p>
        </div>
      </div>
    </div>
  );
}

function CTASection() {
  return (
    <section
      style={{
        padding: "80px 32px",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          backgroundColor: "#000",
          borderRadius: "24px",
          padding: "80px",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(30,58,138,0.2), transparent)",
            opacity: 0.5,
          }}
        />
        <div style={{ position: "relative", zIndex: 1, maxWidth: "672px" }}>
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "24px",
              letterSpacing: "-0.02em",
            }}
          >
            Join the community.
          </h2>
          <p
            style={{
              fontSize: "18px",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "40px",
              lineHeight: 1.6,
            }}
          >
            Thousands of medical professionals and patients already trust
            Swastha Sathi for their healthcare journey. Experience the future
            today.
          </p>
          <div
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              style={{
                backgroundColor: "#1e3a8a",
                color: "#fff",
                padding: "16px 40px",
                borderRadius: "8px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              Download App
            </button>
            <button
              style={{
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#fff",
                padding: "16px 40px",
                borderRadius: "8px",
                fontWeight: 700,
                background: "none",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              Partner with Us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      style={{
        padding: "64px 32px",
        backgroundColor: "#f4f4f4",
        borderTop: "1px solid #e5e7eb",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "32px",
          fontSize: "14px",
          letterSpacing: "0.025em",
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 900,
              color: "#000",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Swastha Sathi
          </div>
          <p style={{ color: "#4b5563", marginBottom: "32px" }}>
            © 2024 Swastha Sathi. Advanced Health Ecosystem. Built for Privacy.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {["Privacy Policy", "Terms of Service"].map((link: string) => (
              <a
                key={link}
                href="#"
                style={{
                  color: "#4b5563",
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                  transition: "color 0.3s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#000")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#4b5563")}
              >
                {link}
              </a>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {["API Documentation", "Support"].map((link: string) => (
              <a
                key={link}
                href="#"
                style={{
                  color: "#4b5563",
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                  transition: "color 0.3s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#000")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#4b5563")}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function SwasthaSathi() {
  return (
    <>
      {/* Load Material Symbols */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          backgroundColor: "#fbf9f9",
          fontFamily: "'Manrope', sans-serif",
          color: "#1b1c1c",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <SecuritySection />
        <FAQSection />
        <CTASection />
        <Footer />
      </div>
    </>
  );
}