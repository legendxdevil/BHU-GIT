"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { USER_ROLES, UserRole } from "@/lib/constants";
import { useAuth, DEMO_USERS } from "@/lib/auth/auth-context";
import { clsx } from "clsx";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { loginWithCredentials, loginWithRole } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>(USER_ROLES.REVIEW_OFFICER);
  const [email, setEmail] = useState(DEMO_USERS[USER_ROLES.REVIEW_OFFICER].email);
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleSelectRolePersona = (roleKey: UserRole) => {
    setSelectedRole(roleKey);
    const demo = DEMO_USERS[roleKey];
    setEmail(demo.email);
    setPassword("password123");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast("error", "Credentials Required", "Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      await loginWithCredentials(email, password, selectedRole);
      toast("success", "Authentication Successful", `Signed in as ${DEMO_USERS[selectedRole].displayName} (${selectedRole.replace("_", " ")})`);
      router.push("/dashboard");
    } catch (err: any) {
      setIsLoading(false);
      toast("error", "Authentication Failed", err.message || "Unable to authenticate user credentials.");
    }
  };

  const handleQuickDemoSignIn = async (roleKey: UserRole) => {
    setIsLoading(true);
    await loginWithRole(roleKey);
    toast("success", "Demo Persona Loaded", `Logged in as ${DEMO_USERS[roleKey].displayName}`);
    router.push("/dashboard");
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    toast("info", "Password Reset Link Sent", `Instructions sent to ${resetEmail} if the account exists.`);
    setIsForgotModalOpen(false);
    setResetEmail("");
  };

  const roleDetails: Record<UserRole, { title: string; desc: string; permissions: { view: boolean; upload: boolean; review: boolean; approve: boolean; admin: boolean } }> = {
    [USER_ROLES.REVIEW_OFFICER]: {
      title: "Review Officer",
      desc: "Full evidence review, proposal modification, and atomic version approval rights.",
      permissions: { view: true, upload: true, review: true, approve: true, admin: false },
    },
    [USER_ROLES.FIELD_OFFICER]: {
      title: "Field Officer",
      desc: "Dataset ingestion, GNSS survey uploading, and legacy OCR verification.",
      permissions: { view: true, upload: true, review: true, approve: false, admin: false },
    },
    [USER_ROLES.ADMIN]: {
      title: "System Administrator",
      desc: "Full platform governance, user management, and system resets.",
      permissions: { view: true, upload: true, review: true, approve: true, admin: true },
    },
    [USER_ROLES.VIEWER]: {
      title: "Public Viewer",
      desc: "Read-only access for parcel search, version timelines, and public documentation.",
      permissions: { view: true, upload: false, review: false, approve: false, admin: false },
    },
  };

  const currentDetails = roleDetails[selectedRole] || roleDetails[USER_ROLES.REVIEW_OFFICER];

  return (
    <main className="min-h-screen bg-fog flex items-center justify-center p-4 sm:p-6 md:p-10 select-none">
      <div className="w-full max-w-4xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-ink text-paper flex items-center justify-center font-bold text-2xl mx-auto shadow-editorial">
            <Sparkles className="w-7 h-7 text-blush" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight">
            Bhu-Git Platform
          </h1>
          <p className="text-sm text-slate font-medium">
            Urban land records, with a traceable history.
          </p>
        </div>

        {/* Main Grid: Role Persona Selection & Authentication Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Quick Role Persona Selector */}
          <div className="md:col-span-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate px-1">
              Select Role Persona
            </h3>

            <div className="space-y-2">
              {(Object.values(USER_ROLES) as UserRole[]).map((roleVal) => {
                const isSelected = selectedRole === roleVal;
                const details = roleDetails[roleVal];

                return (
                  <div
                    key={roleVal}
                    onClick={() => handleSelectRolePersona(roleVal)}
                    className={clsx(
                      "p-3.5 rounded-card border transition-all duration-200 cursor-pointer flex flex-col gap-1.5",
                      isSelected
                        ? "bg-blush-light border-sienna shadow-md ring-2 ring-sienna/20"
                        : "bg-paper border-mist hover:border-slate/40 hover:bg-fog/60"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm text-ink">{details.title}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-sienna" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate leading-snug">{details.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Role Rights Summary Matrix */}
            <Card variant="subtle" padding="sm" className="space-y-2 text-xs border border-mist">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate block">
                {currentDetails.title} Rights Matrix
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div className="flex items-center justify-between p-1.5 bg-paper rounded-lg border border-mist">
                  <span className="text-slate">View Parcels:</span>
                  {currentDetails.permissions.view ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-ash" />}
                </div>
                <div className="flex items-center justify-between p-1.5 bg-paper rounded-lg border border-mist">
                  <span className="text-slate">Upload Evidence:</span>
                  {currentDetails.permissions.upload ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-ash" />}
                </div>
                <div className="flex items-center justify-between p-1.5 bg-paper rounded-lg border border-mist">
                  <span className="text-slate">Review Workspace:</span>
                  {currentDetails.permissions.review ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-ash" />}
                </div>
                <div className="flex items-center justify-between p-1.5 bg-paper rounded-lg border border-mist">
                  <span className="text-slate">Approve Versions:</span>
                  {currentDetails.permissions.approve ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-ash" />}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="md:col-span-7">
            <Card variant="default" padding="lg" className="shadow-editorial border-mist space-y-5 h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-mist pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-ink">Sign In</h2>
                    <p className="text-xs text-slate mt-0.5">
                      Authenticating persona: <strong className="text-sienna">{currentDetails.title}</strong>
                    </p>
                  </div>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => handleQuickDemoSignIn(selectedRole)}
                    className="text-xs py-1"
                  >
                    Quick Sign-In
                  </Button>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <Input
                    label="Official Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail className="w-4 h-4 text-slate" />}
                    required
                  />

                  <div className="space-y-1">
                    <Input
                      label="Security Password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      leftIcon={<Lock className="w-4 h-4 text-slate" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate hover:text-ink pointer-events-auto"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                      required
                    />
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setIsForgotModalOpen(true)}
                        className="text-xs text-sienna hover:underline font-semibold"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full mt-2"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Authenticate & Access Workspace
                  </Button>
                </form>
              </div>

              {/* Security Guardrail Footnote */}
              <div className="pt-4 border-t border-mist text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Protected by Server Authorization & Audit Tracking</span>
                </div>
                <p className="text-[10px] text-ash">
                  All land record mutations create immutable audit logs.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset Account Password"
        description="Enter your registered official email address to receive password reset instructions."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsForgotModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleForgotPassword}>
              Send Reset Link
            </Button>
          </>
        }
      >
        <form onSubmit={handleForgotPassword} className="space-y-3">
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. officer@bhugit.gov.in"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-slate" />}
            required
          />
        </form>
      </Modal>
    </main>
  );
}
