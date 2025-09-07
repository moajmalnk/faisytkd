import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Delete } from 'lucide-react';

interface PinScreenProps {
  onPinCorrect: () => void;
}

export const PinScreen = ({ onPinCorrect }: PinScreenProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const correctPin = '8848';

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');
      
      if (newPin.length === 4) {
        if (newPin === correctPin) {
          onPinCorrect();
        } else {
          setError('Incorrect PIN');
          setAttempts(prev => prev + 1);
          setTimeout(() => {
            setPin('');
            setError('');
          }, 1000);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Enter PIN</CardTitle>
          <p className="text-muted-foreground">Please enter your 4-digit PIN to access the dashboard</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* PIN Display */}
          <div className="flex justify-center space-x-4">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 transition-colors ${
                  pin.length > index
                    ? 'bg-primary border-primary'
                    : 'border-muted'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="text-center text-danger text-sm font-medium">
              {error}
              {attempts >= 3 && (
                <div className="text-xs text-muted-foreground mt-1">
                  Too many attempts. Please wait.
                </div>
              )}
            </div>
          )}

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Button
                key={num}
                variant="outline"
                size="lg"
                className="h-16 text-xl font-semibold"
                onClick={() => handleNumberClick(num.toString())}
                disabled={attempts >= 3}
              >
                {num}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="lg"
              className="h-16"
              onClick={handleClear}
              disabled={attempts >= 3}
            >
              Clear
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="h-16 text-xl font-semibold"
              onClick={() => handleNumberClick('0')}
              disabled={attempts >= 3}
            >
              0
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="h-16"
              onClick={handleDelete}
              disabled={attempts >= 3}
            >
              <Delete className="h-5 w-5" />
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Attempts: {attempts}/3
          </div>
        </CardContent>
      </Card>
    </div>
  );
};