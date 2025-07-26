import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface LayoutProps {
  activeView: string;
  setActiveView: (view: string) => void;
  children: React.ReactNode;
}

export function Layout({ activeView, setActiveView, children }: LayoutProps) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Navigation
          </h2>
          
          <Button
            variant={activeView === 'live' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveView('live')}
          >
            Live Class
          </Button>
          
          <Button
            variant={activeView === 'recordings' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveView('recordings')}
          >
            Recordings
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-auto">
        <Card className="h-full p-6">
          {children}
        </Card>
      </div>
    </div>
  );
}