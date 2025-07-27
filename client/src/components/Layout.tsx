import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface LayoutProps {
  activeView: 'live-class' | 'recordings';
  setActiveView: (view: 'live-class' | 'recordings') => void;
  currentUser: {
    id: string;
    name: string;
    isAdmin: boolean;
  };
  onLogout: () => void;
}

export function Layout({ activeView, setActiveView, currentUser, onLogout }: LayoutProps) {
  return (
    <div className="w-64 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
        <div className="space-y-2">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Video Classroom
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentUser.name} {currentUser.isAdmin ? '(Admin)' : '(Student)'}
            </p>
          </div>
          
          <Button
            variant={activeView === 'live-class' ? 'default' : 'ghost'}
            className="w-full justify-start mb-2"
            onClick={() => setActiveView('live-class')}
          >
            Live Class
          </Button>
          
          <Button
            variant={activeView === 'recordings' ? 'default' : 'ghost'}
            className="w-full justify-start mb-4"
            onClick={() => setActiveView('recordings')}
          >
            Recordings
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={onLogout}
          >
            Sign Out
          </Button>
        </div>
    </div>
  );
}