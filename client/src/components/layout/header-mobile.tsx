import { Search } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile/mobile-nav";

export default function MobileHeader() {
  return (
    <header className="bg-white/80 dark:bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 shadow-lg shadow-black/5 md:hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <div className="text-white font-bold text-sm">WM</div>
            </div>
            <span className="ml-2 font-bold text-lg bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              WorkMongolia
            </span>
          </Link>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
              <Search className="h-5 w-5" />
            </Button>
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}