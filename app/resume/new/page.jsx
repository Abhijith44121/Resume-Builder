"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function NewResume() {

  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    name: "",
    email: "",
    phone: "",
    summary: "",
    skills: "",
    education: "",
    experience: ""
  });

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  async function saveResume() {

    const { data: userData, error: userError } = await supabase.auth.getUser();

    console.log("User:", userData);
    console.log("User Error:", userError);

    if (!userData?.user) {
      alert("User not logged in");
      return;
    }

    const user = userData.user;

    const { data, error } = await supabase
      .from("resumes")
      .insert([
        {
          user_id: user.id,
          ...formData
        }
      ]);

    console.log("Insert data:", data);
    console.log("Insert error:", error);

    if (error) {
      alert("Error saving resume");
      return;
    }

    alert("Resume saved successfully!");

    router.push("/dashboard");
  }

  return (
    <div className="p-10 max-w-xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        Create Resume
      </h1>

      <input
        name="title"
        placeholder="Resume Title"
        onChange={handleChange}
        className="border p-2 w-full mb-4"
      />

      <input
        name="name"
        placeholder="Name"
        onChange={handleChange}
        className="border p-2 w-full mb-4"
      />

      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
        className="border p-2 w-full mb-4"
      />

      <input
        name="phone"
        placeholder="Phone"
        onChange={handleChange}
        className="border p-2 w-full mb-4"
      />

      <textarea
        name="summary"
        placeholder="Summary"
        onChange={handleChange}
        className="border p-2 w-full mb-4"
      />

      <textarea
        name="skills"
        placeholder="Skills"
        onChange={handleChange}
        className="border p-2 w-full mb-4"
      />

      <textarea
        name="education"
        placeholder="Education"
        onChange={handleChange}
        className="border p-2 w-full mb-4"
      />

      <textarea
        name="experience"
        placeholder="Experience"
        onChange={handleChange}
        className="border p-2 w-full mb-4"
      />

      <button
        onClick={saveResume}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Save Resume
      </button>

    </div>
  );
}