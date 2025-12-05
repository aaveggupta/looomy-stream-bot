"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function AccessPage() {
  const [accessKey, setAccessKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/validate-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessKey }),
      });

      if (res.ok) {
        // Access granted, redirect to sign-in
        router.push("/sign-in");
      } else {
        const data = await res.json();
        setError(data.error || "Invalid access key");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-display font-bold">
            Private Beta Access
          </CardTitle>
          <CardDescription>
            Enter your access key to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessKey">Access Key</Label>
              <Input
                id="accessKey"
                type="text"
                placeholder="Enter your key"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                required
                className="text-center tracking-wider font-mono text-lg"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                This key was provided to you via email
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !accessKey}
              className="w-full"
              size="lg"
            >
              {loading ? (
                "Verifying..."
              ) : (
                <>
                  Continue to Sign In <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              Don't have an access key?{" "}
              <a
                href="https://tally.so/r/obE9ae"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Join the waitlist
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
