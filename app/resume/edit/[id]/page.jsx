"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function EditResume() {
  const params = useParams();
  const router = useRouter();
 const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [formData, setFormData] = useState({
    title: "",
    name: "",
    email: "",
    phone: "",
    summary: "",
    skills: "",
    education: "",
    experience: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) fetchResume();
  }, [id]);

  async function fetchResume() {
    setLoading(true);
    const { data, error } = await supabase
      .from("resumes")
      .select("title, name, email, phone, summary, skills, education, experience")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Fetch error:", error);
      setLoading(false);
      return;
    }

    if (data) {
      setFormData({
        title: data.title || "",
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        summary: data.summary || "",
        skills: data.skills || "",
        education: data.education || "",
        experience: data.experience || "",
      });
    }
    setLoading(false);
  }

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function updateResume() {
    setSaving(true);
  console.log("Updating ID:", id, "Type:", typeof id);

    console.log("Saving data:", formData); // debug log

    const { data, error } = await supabase
      .from("resumes")
      .update({
        title: formData.title,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        summary: formData.summary,
        skills: formData.skills,
        education: formData.education,
        experience: formData.experience,
      })
      .eq("id", id)
      .select(); // <-- THIS IS THE KEY FIX: forces Supabase to actually run the update

    console.log("Update result:", data, error); // debug log

    setSaving(false);

    if (error) {
      console.error("Update error:", error);
      alert("Update failed: " + error.message);
      return;
    }

    router.push(`/resume/${id}`);
  }

  const fields = [
    { key: "title", label: "Resume Title", type: "input", placeholder: "e.g. Software Engineer Resume" },
    { key: "name", label: "Full Name", type: "input", placeholder: "e.g. John Smith" },
    { key: "email", label: "Email Address", type: "input", placeholder: "e.g. john@email.com" },
    { key: "phone", label: "Phone Number", type: "input", placeholder: "e.g. +1 234 567 8900" },
    { key: "summary", label: "Professional Summary", type: "textarea", placeholder: "Write a short summary about yourself..." },
    { key: "education", label: "Education", type: "textarea", placeholder: "e.g. BSc Computer Science, MIT, 2020" },
    { key: "skills", label: "Skills", type: "textarea", placeholder: "e.g. JavaScript, React, Node.js..." },
    { key: "experience", label: "Work Experience", type: "textarea", placeholder: "e.g. Software Engineer at Google, 2021–Present..." },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p style={{ color: "#6b7280", fontSize: "16px" }}>Loading resume...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f9fafb", minHeight: "100vh", padding: "40px 16px" }}>
      <div
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
          padding: "40px",
        }}
      >
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#111827", margin: "0 0 6px 0" }}>
            Edit Resume
          </h1>
          <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
            Update your resume details below
          </p>
        </div>

        <div style={{ borderTop: "1px solid #e5e7eb", marginBottom: "28px" }} />

        {fields.map(({ key, label, type, placeholder }) => (
          <div key={key} style={{ marginBottom: "22px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {label}
            </label>

            {type === "textarea" ? (
              <textarea
                name={key}
                value={formData[key]}
                onChange={handleChange}
                placeholder={placeholder}
                rows={4}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#111827",
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "inherit",
                  lineHeight: "1.6",
                  boxSizing: "border-box",
                  backgroundColor: "#fafafa",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            ) : (
              <input
                name={key}
                value={formData[key]}
                onChange={handleChange}
                placeholder={placeholder}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#111827",
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  backgroundColor: "#fafafa",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            )}
          </div>
        ))}

        <div style={{ borderTop: "1px solid #e5e7eb", margin: "28px 0" }} />

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={() => router.push(`/resume/${id}`)}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              color: "#374151",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={updateResume}
            disabled={saving}
            style={{
              padding: "10px 24px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: saving ? "#93c5fd" : "#2563eb",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "600",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}