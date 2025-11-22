import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-[120px] opacity-50" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-landing/20 rounded-full blur-[100px] opacity-40" />

      <SignIn
        afterSignInUrl="/dashboard"
        appearance={{
          baseTheme: dark,
          elements: {
            formButtonPrimary: "bg-brand hover:bg-brand/90 shadow-lg shadow-brand/25",
            card: "bg-white/[0.03] border border-white/10 backdrop-blur-sm shadow-2xl",
            headerTitle: "text-white",
            headerSubtitle: "text-slate-400",
            socialButtonsBlockButton: "bg-white/5 border border-white/10 hover:bg-white/10",
            formFieldLabel: "text-slate-300",
            formFieldInput: "bg-white/5 border-white/10 text-white",
            footerActionLink: "text-brand hover:text-brand-glow",
            identityPreviewText: "text-slate-300",
            identityPreviewEditButton: "text-brand",
          },
          variables: {
            colorPrimary: "#2563eb",
            colorBackground: "#020617",
            colorText: "#f8fafc",
            colorTextSecondary: "#94a3b8",
            colorInputBackground: "rgba(255, 255, 255, 0.05)",
            colorInputText: "#f8fafc",
            borderRadius: "0.75rem",
          },
        }}
      />
    </div>
  );
}
