"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Step = "login" | "mfa" | "enroll";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: signError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signError) {
      setError(signError.message);
      setLoading(false);
      return;
    }

    // Check MFA status
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totpFactor = factors?.totp?.[0];

    if (totpFactor && totpFactor.status === "verified") {
      // MFA already enrolled → challenge
      setFactorId(totpFactor.id);
      setStep("mfa");
      setLoading(false);
      return;
    }

    // No MFA yet → enroll
    const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Denop Admin",
    });

    if (enrollError) {
      setError(enrollError.message);
      setLoading(false);
      return;
    }

    setFactorId(enrollData.id);
    setQrCode(enrollData.totp.qr_code);
    setStep("enroll");
    setLoading(false);
  }

  async function handleVerifyMfa(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (challengeError) {
      setError(challengeError.message);
      setLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  async function handleEnrollVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (challengeError) {
      setError(challengeError.message);
      setLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-sky-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            D
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Denop Admin</h1>
          <p className="text-slate-500 text-sm mt-1">
            {step === "login" && "Sign in to continue"}
            {step === "mfa" && "Enter authenticator code"}
            {step === "enroll" && "Set up two-factor authentication"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {step === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 disabled:opacity-60 transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        {step === "mfa" && (
          <form onSubmit={handleVerifyMfa} className="space-y-4">
            <p className="text-sm text-slate-600 text-center">
              Open your authenticator app and enter the 6-digit code.
            </p>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              maxLength={6}
              className="w-full rounded-lg border border-slate-300 px-3 py-3 text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="000000"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-2.5 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 disabled:opacity-60 transition"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        )}

        {step === "enroll" && (
          <form onSubmit={handleEnrollVerify} className="space-y-4">
            <p className="text-sm text-slate-600 text-center">
              Scan this QR code with Google Authenticator or Authy, then enter the code.
            </p>
            {qrCode && (
              <div className="flex justify-center my-4">
                <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
              </div>
            )}
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              maxLength={6}
              className="w-full rounded-lg border border-slate-300 px-3 py-3 text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="000000"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-2.5 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 disabled:opacity-60 transition"
            >
              {loading ? "Verifying..." : "Enable MFA & Continue"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}