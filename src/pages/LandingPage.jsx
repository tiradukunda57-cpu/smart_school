import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import {
  FiUsers,
  FiCheckSquare,
  FiBookOpen,
  FiFileText,
  FiMessageSquare,
  FiArrowRight,
  FiShield,
} from "react-icons/fi";

const features = [
  {
    icon: FiUsers,
    title: "Student Management",
    desc: "Manage all student records, profiles, and information in one place.",
  },
  {
    icon: FiCheckSquare,
    title: "Attendance Tracking",
    desc: "Mark and monitor attendance, download detailed reports as PDF.",
  },
  {
    icon: FiBookOpen,
    title: "Assignments",
    desc: "Broadcast assignments to all students with due dates and descriptions.",
  },
  {
    icon: FiFileText,
    title: "Notes & Resources",
    desc: "Share study notes and materials with students, downloadable anytime.",
  },
  {
    icon: FiMessageSquare,
    title: "Messaging",
    desc: "Students can message teachers directly for support and guidance.",
  },
  {
    icon: FiShield,
    title: "Role-Based Access",
    desc: "Secure access control — teachers manage, students view their data.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.get("/health/db");
        setStats(data.tables);
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };
    loadStats();
  }, []);

 
  if (user) {
  const dashboards = {
    admin: '/admin/dashboard',
    teacher: '/teacher/dashboard',
    student: '/student/dashboard',
  }
  navigate(dashboards[user.role] || '/student/dashboard')
  return null
}
  

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "var(--white)",
          borderBottom: "1px solid var(--border)",
          padding: "1rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "var(--primary)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{ color: "white", fontWeight: 800, fontSize: "1.1rem" }}
            >
              E
            </span>
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: "1.2rem",
              color: "var(--primary)",
              letterSpacing: "-0.02em",
            }}
          >
            EduManage
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/student/login")}
            style={{
              padding: "0.55rem 1.25rem",
              background: "transparent",
              border: "1.5px solid var(--primary)",
              color: "var(--primary)",
              borderRadius: "var(--radius-md)",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "var(--transition)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--primary)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--primary)";
            }}
          >
            Student Login
          </button>
          <button
            onClick={() => navigate("/teacher/login")}
            style={{
              padding: "0.55rem 1.25rem",
              background: "var(--primary)",
              border: "1.5px solid var(--primary)",
              color: "white",
              borderRadius: "var(--radius-md)",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "var(--transition)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--primary-light)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--primary)")
            }
          >
            Teacher Login
          </button>
          <button
            onClick={() => navigate("/admin/login")}
            style={{
              padding: "0.55rem 1.25rem",
              background: "transparent",
              border: "1.5px solid var(--danger)",
              color: "var(--danger)",
              borderRadius: "var(--radius-md)",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "var(--transition)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--danger)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--danger)";
            }}
          >
            Admin
          </button>
        </div>
      </header>

      {/* Hero */}
      <section
        style={{
          background:
            "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 50%, var(--secondary) 100%)",
          padding: "6rem 2rem",
          textAlign: "center",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(46,125,114,0.3) 0%, transparent 40%)",
          }}
        />
        <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
          <span
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              padding: "0.35rem 1rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.8rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              marginBottom: "1.5rem",
              backdropFilter: "blur(8px)",
            }}
          >
            🎓 Smart School Management Platform
          </span>
          <h1
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: "1.25rem",
              letterSpacing: "-0.03em",
            }}
          >
            Manage Your School
            <br />
            <span style={{ color: "rgba(255,255,255,0.75)" }}>
              Smarter & Simpler
            </span>
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "rgba(255,255,255,0.8)",
              marginBottom: "2.5rem",
              lineHeight: 1.7,
              maxWidth: 550,
              margin: "0 auto 2.5rem",
            }}
          >
            A complete platform for teachers to manage students, track
            attendance, share assignments and notes — and for students to stay
            informed.
          </p>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => navigate("/student/register")}
              style={{
                padding: "0.85rem 2rem",
                background: "white",
                color: "var(--primary)",
                border: "none",
                borderRadius: "var(--radius-md)",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                transition: "var(--transition)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-2px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              Register as Student <FiArrowRight />
            </button>
            <button
              onClick={() => navigate("/teacher/register")}
              style={{
                padding: "0.85rem 2rem",
                background: "rgba(255,255,255,0.15)",
                color: "white",
                border: "1.5px solid rgba(255,255,255,0.4)",
                borderRadius: "var(--radius-md)",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                transition: "var(--transition)",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.25)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
              }
            >
              Register as Teacher
            </button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section
        style={{
          background: "var(--white)",
          borderBottom: "1px solid var(--border)",
          padding: "2rem",
          display: "flex",
          justifyContent: "center",
          gap: "4rem",
          flexWrap: "wrap",
        }}
      >
        {(stats
          ? [
              { number: stats.students ?? 0, label: "Students Managed" },
              { number: stats.teachers ?? 0, label: "Teachers" },
              { number: stats.assignments ?? 0, label: "Assignments Shared" },
              { number: stats.attendance ?? 0, label: "Attendance Records" },
            ]
          : [
              { number: "...", label: "Students Managed" },
              { number: "...", label: "Teachers" },
              { number: "...", label: "Assignments Shared" },
              { number: "...", label: "Attendance Records" },
            ]
        ).map((stat) => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: "var(--primary)",
                letterSpacing: "-0.02em",
              }}
            >
              {stat.number}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                marginTop: "0.2rem",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section
        style={{ padding: "5rem 2rem", maxWidth: 1200, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <h2
            style={{
              fontSize: "clamp(1.7rem, 3vw, 2.4rem)",
              fontWeight: 800,
              color: "var(--primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Everything You Need
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              marginTop: "0.75rem",
              fontSize: "1rem",
              maxWidth: 500,
              margin: "0.75rem auto 0",
            }}
          >
            A complete school management ecosystem designed for efficiency and
            simplicity.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              style={{
                background: "var(--white)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "1.75rem",
                transition: "var(--transition-slow)",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.borderColor = "var(--primary-lighter)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  background: "var(--primary-ghost)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                  color: "var(--primary)",
                }}
              >
                <Icon size={22} />
              </div>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "var(--primary)",
                  marginBottom: "0.5rem",
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-muted)",
                  lineHeight: 1.7,
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background:
            "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
          padding: "4rem 2rem",
          textAlign: "center",
          color: "white",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            fontWeight: 800,
            marginBottom: "1rem",
          }}
        >
          Ready to Get Started?
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.8)",
            marginBottom: "2rem",
            fontSize: "1rem",
          }}
        >
          Join EduManage today and transform the way your school operates.
        </p>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => navigate("/student/register")}
            style={{
              padding: "0.85rem 2rem",
              background: "white",
              color: "var(--primary)",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "var(--transition)",
            }}
          >
            Student Registration
          </button>
          <button
            onClick={() => navigate("/teacher/register")}
            style={{
              padding: "0.85rem 2rem",
              background: "rgba(255,255,255,0.15)",
              color: "white",
              border: "1.5px solid rgba(255,255,255,0.4)",
              borderRadius: "var(--radius-md)",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "var(--transition)",
            }}
          >
            Teacher Registration
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: "var(--primary-dark)",
          color: "rgba(255,255,255,0.5)",
          padding: "1.5rem 2rem",
          textAlign: "center",
          fontSize: "0.85rem",
        }}
      >
        © 2026 EduManage — Smart School Management Platform
      </footer>
    </div>
  );
}
