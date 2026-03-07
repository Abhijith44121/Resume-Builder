"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        window.location.href = "/";
      } else {
        fetchResumes();
        setLoading(false);
      }
    });

   
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = "/";
      } else {
        fetchResumes();
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function fetchResumes() {
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setResumes(data || []);
  }

  async function deleteResume(e, id) {
    e.preventDefault();
    e.stopPropagation();

    const confirmDelete = confirm("Delete this resume?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("resumes").delete().eq("id", id);

    if (error) {
      console.log(error);
      alert("Failed to delete");
      return;
    }

    setResumes((prev) => prev.filter((resume) => resume.id !== id));
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p style={{ color: "#6b7280", fontSize: "16px" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "1100px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#111827", margin: 0 }}>
          My Resumes
        </h1>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={logout}
            style={{
              backgroundColor: "#ef4444",
              color: "#fff",
              padding: "10px 16px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Logout
          </button>

          <Link href="/resume/new">
            <button
              style={{
                backgroundColor: "#2563eb",
                color: "#fff",
                padding: "10px 20px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              + Create Resume
            </button>
          </Link>
        </div>
      </div>

      {resumes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#6b7280" }}>
          <p style={{ fontSize: "16px" }}>No resumes yet. Create new resume.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          {resumes.map((resume) => (
            <div
              key={resume.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "20px",
                backgroundColor: "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <Link href={`/resume/${resume.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ cursor: "pointer" }}>
                  <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: "0 0 6px 0" }}>
                    {resume.title || "Untitled Resume"}
                  </h2>
                  <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>
                    {new Date(resume.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </Link>

              <div style={{ display: "flex", gap: "8px" }}>
                <Link href={`/resume/edit/${resume.id}`} style={{ flex: 1 }}>
                  <button
                    style={{
                      width: "100%",
                      padding: "7px 0",
                      backgroundColor: "#f3f4f6",
                      color: "#374151",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    Edit
                  </button>
                </Link>

                <button
                  onClick={(e) => deleteResume(e, resume.id)}
                  style={{
                    flex: 1,
                    padding: "7px 0",
                    backgroundColor: "#fee2e2",
                    color: "#dc2626",
                    border: "1px solid #fecaca",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}