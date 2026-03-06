"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function ResumePage() {
  const params = useParams();
  const id = params.id;
  const [resume, setResume] = useState(null);
  const router = useRouter();

  const [showEmailBox, setShowEmailBox] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchResume();
  }, []);

  async function fetchResume() {
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.log(error);
      return;
    }
    setResume(data);
  }

  const downloadPDF = async () => {
    const html2canvas = (await import("html2canvas")).default;
    const { default: jsPDF } = await import("jspdf");

    const element = document.getElementById("resume");

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      logging: false,
      useCORS: true,
      width: 794,
      height: 1123,
      windowWidth: 794,
    });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);

    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });

    pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
    pdf.save("resume.pdf");
  };

  const sendEmail = async () => {
  if (!emailInput) return alert("Please enter an email address");

  setSendingEmail(true);

  try {
    // Step 1 — render resume to canvas
    const html2canvas = (await import("html2canvas")).default;
    const { default: jsPDF } = await import("jspdf");

    const element = document.getElementById("resume");

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      logging: false,
      useCORS: true,
      width: 794,
      height: 1123,
      windowWidth: 794,
    });

    // Step 2 — convert to PDF and get base64 string
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);

    // output("datauristring") gives base64 PDF
    const pdfBase64 = pdf.output("datauristring").split(",")[1];

    // Step 3 — send to API
    const res = await fetch("/api/send-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: emailInput,
        name: resume.name,
        email: resume.email,
        phone: resume.phone,
        pdfBase64,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Resume sent successfully!");
      setShowEmailBox(false);
      setEmailInput("");
    } else {
      alert("Failed to send: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong. Please try again.");
  }

  setSendingEmail(false);
};
  if (!resume) return <p>Loading...</p>;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#f3f4f6",
        minHeight: "100vh",
        paddingTop: "32px",
        paddingBottom: "32px",
      }}
    >
      {/* ACTION BUTTONS */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
          width: "794px",
        }}
      >
        {/* TOP ROW — Edit + Download */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => router.push(`/resume/edit/${id}`)}
            style={{
              backgroundColor: "#16a34a",
              color: "#ffffff",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Edit Resume
          </button>

          <button
            onClick={downloadPDF}
            style={{
              backgroundColor: "#2563eb",
              color: "#ffffff",
              padding: "10px 24px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Download PDF
          </button>

          <button
            onClick={() => setShowEmailBox(!showEmailBox)}
            style={{
              backgroundColor: "#7c3aed",
              color: "#ffffff",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Send via Email
          </button>
        </div>

        {/* EMAIL INPUT ROW */}
        {showEmailBox && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "12px 16px",
              width: "100%",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <input
              type="email"
              placeholder="Enter recipient email address"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendEmail()}
              style={{
                flex: 1,
                padding: "9px 14px",
                border: "1px solid #d1d5db",
                borderRadius: "7px",
                fontSize: "14px",
                outline: "none",
                color: "#111827",
              }}
            />

            <button
              onClick={sendEmail}
              disabled={sendingEmail}
              style={{
                backgroundColor: sendingEmail ? "#a78bfa" : "#7c3aed",
                color: "#fff",
                padding: "9px 20px",
                border: "none",
                borderRadius: "7px",
                cursor: sendingEmail ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "600",
                whiteSpace: "nowrap",
              }}
            >
              {sendingEmail ? "Sending..." : "Send"}
            </button>

            <button
              onClick={() => { setShowEmailBox(false); setEmailInput(""); }}
              style={{
                backgroundColor: "#f3f4f6",
                color: "#6b7280",
                padding: "9px 14px",
                border: "1px solid #e5e7eb",
                borderRadius: "7px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* A4 RESUME */}
      <div
        id="resume"
        style={{
          backgroundColor: "#ffffff",
          color: "#000000",
          width: "794px",
          height: "1123px",
          padding: "48px 56px",
          fontFamily: "Arial, sans-serif",
          boxSizing: "border-box",
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "20px",
            marginBottom: "24px",
          }}
        >
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "700",
              letterSpacing: "0.02em",
              margin: "0 0 8px 0",
              color: "#000000",
            }}
          >
            {resume.name}
          </h1>
          <p style={{ color: "#4b5563", margin: "0 0 4px 0", fontSize: "14px" }}>
            {resume.email}
          </p>
          <p style={{ color: "#4b5563", margin: 0, fontSize: "14px" }}>
            {resume.phone}
          </p>
        </div>

        {/* MAIN GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "40px",
          }}
        >
          {/* LEFT COLUMN */}
          <div>
            <section style={{ marginBottom: "28px" }}>
              <h2
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "0.12em",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  margin: "0 0 10px 0",
                }}
              >
                EDUCATION
              </h2>
              <p
                style={{
                  fontSize: "13px",
                  whiteSpace: "pre-line",
                  margin: 0,
                  color: "#111827",
                  lineHeight: "1.6",
                }}
              >
                {resume.education}
              </p>
            </section>

            <section>
              <h2
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "0.12em",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  margin: "0 0 10px 0",
                }}
              >
                SKILLS
              </h2>
              <p
                style={{
                  fontSize: "13px",
                  whiteSpace: "pre-line",
                  margin: 0,
                  color: "#111827",
                  lineHeight: "1.6",
                }}
              >
                {resume.skills}
              </p>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            <section style={{ marginBottom: "28px" }}>
              <h2
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "0.12em",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  margin: "0 0 10px 0",
                }}
              >
                PROFESSIONAL PROFILE
              </h2>
              <p
                style={{
                  fontSize: "13px",
                  lineHeight: "1.7",
                  whiteSpace: "pre-line",
                  margin: 0,
                  color: "#111827",
                }}
              >
                {resume.summary}
              </p>
            </section>

            <section>
              <h2
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "0.12em",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  margin: "0 0 10px 0",
                }}
              >
                WORK EXPERIENCE
              </h2>
              <p
                style={{
                  fontSize: "13px",
                  lineHeight: "1.7",
                  whiteSpace: "pre-line",
                  margin: 0,
                  color: "#111827",
                }}
              >
                {resume.experience}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}