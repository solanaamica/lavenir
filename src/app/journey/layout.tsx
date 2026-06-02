import AppNav from "@/components/layout/AppNav";

export default function JourneyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F0F2F7]">
      <AppNav />
      <main className="pt-14">{children}</main>
    </div>
  );
}
