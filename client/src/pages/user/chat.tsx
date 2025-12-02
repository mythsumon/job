import ChatInterface from "@/components/chat/ChatInterface";
import { AuthGuard } from "@/components/common/AuthGuard";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function UserChat() {
  return (
    <AuthGuard allowedUserTypes={['candidate', 'employer']}>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-1">
          <ChatInterface />
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}