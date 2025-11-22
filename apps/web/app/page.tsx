import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary" />
            <span className="text-xl font-bold">Looomy</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            AI-Powered YouTube
            <span className="text-primary"> Stream Chat Bot</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Deploy a bot that answers audience questions using your custom knowledge base.
            Upload documents, connect YouTube, and let Looomy handle your live chat.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg">Start Free</Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </section>

        <section id="features" className="border-t bg-muted/50 py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold">How It Works</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  1
                </div>
                <h3 className="text-xl font-semibold">Upload Knowledge</h3>
                <p className="mt-2 text-muted-foreground">
                  Upload PDFs or text files containing your knowledge base.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  2
                </div>
                <h3 className="text-xl font-semibold">Connect YouTube</h3>
                <p className="mt-2 text-muted-foreground">
                  Link your YouTube channel with one-click OAuth.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  3
                </div>
                <h3 className="text-xl font-semibold">Go Live</h3>
                <p className="mt-2 text-muted-foreground">
                  Toggle the bot ON and watch it answer questions in real-time.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Looomy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
