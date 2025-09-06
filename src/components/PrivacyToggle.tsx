import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrivacyToggleProps {
  isPrivate: boolean;
  onToggle: () => void;
}

export const PrivacyToggle = ({ isPrivate, onToggle }: PrivacyToggleProps) => {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onToggle}
      className="h-9 w-9"
      title={isPrivate ? 'Show amounts' : 'Hide amounts'}
    >
      {isPrivate ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle privacy mode</span>
    </Button>
  );
};