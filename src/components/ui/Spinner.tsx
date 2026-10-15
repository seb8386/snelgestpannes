"use client";

export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div
      className={`${sizes[size]} border-4 border-gray-200 border-t-blue-900 rounded-full animate-spin`}
    />
  );
}

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#003087] flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
        <div className="text-center">
          <div className="text-yellow-400 font-bold text-2xl">SNEL</div>
          <div className="text-white/70 text-sm mt-1">CVS Kitambo</div>
        </div>
      </div>
    </div>
  );
}
