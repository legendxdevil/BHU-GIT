import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MapPinOff, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-fog flex items-center justify-center p-6">
      <Card variant="default" padding="lg" className="max-w-md text-center space-y-4 shadow-editorial">
        <div className="w-12 h-12 rounded-2xl bg-blush text-sienna flex items-center justify-center mx-auto">
          <MapPinOff className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-ink">404 — Record Not Found</h1>
        <p className="text-xs text-slate">
          The requested parcel, document, or review page does not exist or may have been updated in a previous version.
        </p>
        <Link href="/dashboard" className="block pt-2">
          <Button variant="accent" size="md" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Return to Dashboard
          </Button>
        </Link>
      </Card>
    </div>
  );
}
