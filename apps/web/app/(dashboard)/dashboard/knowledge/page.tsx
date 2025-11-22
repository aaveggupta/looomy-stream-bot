import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@database/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/file-upload";
import { DocumentList } from "@/components/document-list";

export default async function KnowledgePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const documents = await prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Upload documents for your bot to learn from.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>
            Supported formats: PDF, TXT. Maximum size: 10MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>
            {documents.length} document{documents.length !== 1 ? "s" : ""} uploaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentList documents={documents} />
        </CardContent>
      </Card>
    </div>
  );
}
