import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1440px]">{children}</main>
      <Footer />
    </>
  );
}
