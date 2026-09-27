"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AlertOctagon, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-fog flex items-center justify-center p-6">
      <Card variant="default" padding="lg" className="max-w-md text-center space-y-4 shadow-editorial">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-ink">System Error Encountered</h1>
        <p className="text-xs text-slate">
          The application encountered an unexpected runtime exception. Internal state is preserved.
        </p>
        <Button
          variant="accent"
          size="md"
          onClick={() => reset()}
          className="w-full mt-2"
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Re-initialize Workspace View
        </Button>
      </Card>
    </div>
  );
}
