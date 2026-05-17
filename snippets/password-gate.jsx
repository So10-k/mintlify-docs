// Client-side password gate component. Hides children until the
// visitor types the correct password. Password is checked via SHA-256
// so the plaintext doesn't ship in the bundle.
//
// Usage in any .mdx page:
//   import { PasswordGate } from "/snippets/password-gate.jsx";
//   <PasswordGate hash="abc..." hint="optional hint">
//     secret content
//   </PasswordGate>

import { useEffect, useState } from "react";

export const PasswordGate = ({ hash, children, hint }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [value, setValue] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const cached = window.localStorage.getItem("pw-gate:" + hash);
      if (cached === "1") setUnlocked(true);
    } catch (_) {}
  }, [hash]);

  async function sha256(s) {
    const enc = new TextEncoder().encode(s);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    const normalized = value.trim().toUpperCase();
    const got = await sha256(normalized);
    if (got === hash) {
      setUnlocked(true);
      try {
        window.localStorage.setItem("pw-gate:" + hash, "1");
      } catch (_) {}
    } else {
      setError(
        "Not it — try again. (" + normalized.length + " chars submitted)"
      );
    }
  }

  if (unlocked) {
    return children;
  }

  return (
    <div
      style={{
        margin: "32px auto",
        maxWidth: 520,
        padding: "32px 28px",
        background: "#FFF6E0",
        border: "3px solid #1B2A4E",
        borderRadius: 20,
        boxShadow: "6px 6px 0 #1B2A4E",
        textAlign: "center",
        fontFamily: "Fredoka, Quicksand, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "#C9296A",
          fontWeight: 700,
        }}
      >
        Author-only · password protected
      </div>
      <h2
        style={{
          margin: "10px 0 14px",
          fontSize: 26,
          color: "#1B2A4E",
          textShadow: "3px 3px 0 #FFD93D",
        }}
      >
        🔒 Walkthrough · locked
      </h2>
      {hint ? (
        <p
          style={{
            fontFamily: "Quicksand, system-ui, sans-serif",
            margin: "0 0 18px",
            fontSize: 14,
            color: "#3B4A7E",
            lineHeight: 1.55,
          }}
        >
          {hint}
        </p>
      ) : null}
      <form onSubmit={submit}>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="enter the author password"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          style={{
            width: "100%",
            padding: "12px 14px",
            fontFamily: "'Courier New', monospace",
            fontSize: 18,
            letterSpacing: "0.14em",
            border: "3px solid #1B2A4E",
            borderRadius: 12,
            background: "#FFFFFF",
            color: "#1B2A4E",
            textTransform: "uppercase",
            textAlign: "center",
            outline: "none",
            boxShadow: "3px 3px 0 #1B2A4E",
            boxSizing: "border-box",
          }}
        />
        <button
          type="submit"
          style={{
            marginTop: 16,
            padding: "10px 24px",
            fontFamily: "Fredoka, sans-serif",
            fontSize: 16,
            fontWeight: 700,
            color: "#FFFFFF",
            background: "#E94B7E",
            border: "3px solid #1B2A4E",
            borderRadius: 12,
            boxShadow: "4px 4px 0 #1B2A4E",
            cursor: "pointer",
          }}
        >
          unlock
        </button>
      </form>
      {error ? (
        <p
          style={{
            fontFamily: "Quicksand, system-ui, sans-serif",
            margin: "14px 0 0",
            fontSize: 13,
            color: "#C9296A",
          }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
};
