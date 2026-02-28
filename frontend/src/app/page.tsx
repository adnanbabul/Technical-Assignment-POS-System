"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="text-3xl font-bold mb-2">
          Easy <span className="text-orange-500">POS</span>
        </div>
        <p className="text-slate-500">Redirecting...</p>
      </div>
    </div>
  );
}
