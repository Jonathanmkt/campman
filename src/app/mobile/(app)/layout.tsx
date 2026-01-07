import { MobileHeader } from '../components/MobileHeader';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MobileHeader />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
