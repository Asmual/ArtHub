import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-full flex flex-col">{children}</main>
      <Footer />
    </>
  );
}