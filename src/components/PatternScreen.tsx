import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Fingerprint } from 'lucide-react';

interface PatternScreenProps {
  onPatternCorrect: () => void;
}

export const PatternScreen = ({ onPatternCorrect }: PatternScreenProps) => {
  const [pattern, setPattern] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [isFingerprint, setIsFingerprint] = useState(false);
  const correctPattern = [1, 2, 3, 5, 8, 9]; // Z pattern: 1-2-3-5-8-9

  // Check if WebAuthn is supported and if we're on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isWebAuthnSupported = typeof window !== 'undefined' && 
    'navigator' in window && 
    'credentials' in navigator && 
    'create' in navigator.credentials;

  const handleDotClick = (dotNumber: number) => {
    if (pattern.length < 6 && !pattern.includes(dotNumber)) {
      const newPattern = [...pattern, dotNumber];
      setPattern(newPattern);
      setError('');
      
      if (newPattern.length === 6) {
        if (JSON.stringify(newPattern) === JSON.stringify(correctPattern)) {
          onPatternCorrect();
        } else {
          setError('Incorrect pattern');
          setTimeout(() => {
            setPattern([]);
            setError('');
          }, 1000);
        }
      }
    }
  };

  const handleClear = () => {
    setPattern([]);
    setError('');
  };

  const isDotActive = (dotNumber: number) => {
    return pattern.includes(dotNumber);
  };

  const isDotConnected = (dotNumber: number) => {
    const index = pattern.indexOf(dotNumber);
    return index > 0 && pattern[index - 1] !== undefined;
  };

  const handleFingerprintAuth = async () => {
    if (!isWebAuthnSupported) {
      setError('Fingerprint authentication not supported');
      return;
    }

    try {
      setIsFingerprint(true);
      setError('');

      // Check if there's an existing credential
      const existingCredential = localStorage.getItem('webauthn-credential-id');
      
      if (!existingCredential) {
        // Create a new credential
        const publicKeyCredentialCreationOptions = {
          challenge: new Uint8Array(32),
          rp: {
            name: "NKBook",
            id: window.location.hostname,
          },
          user: {
            id: new Uint8Array(16),
            name: "user@nkbook.app",
            displayName: "NKBook User",
          },
          pubKeyCredParams: [{alg: -7, type: "public-key" as const}],
          authenticatorSelection: {
            authenticatorAttachment: "platform" as const,
            userVerification: "required" as const,
          },
          timeout: 60000,
          attestation: "direct" as const
        };

        const credential = await navigator.credentials.create({
          publicKey: publicKeyCredentialCreationOptions
        });

        if (credential) {
          localStorage.setItem('webauthn-credential-id', credential.id);
          onPatternCorrect();
        }
      } else {
        // Authenticate with existing credential
        const publicKeyCredentialRequestOptions = {
          challenge: new Uint8Array(32),
          allowCredentials: [{
            id: Uint8Array.from(atob(existingCredential), c => c.charCodeAt(0)),
            type: 'public-key' as const,
          }],
          userVerification: "required" as const,
          timeout: 60000,
        };

        const assertion = await navigator.credentials.get({
          publicKey: publicKeyCredentialRequestOptions
        });

        if (assertion) {
          onPatternCorrect();
        }
      }
    } catch (err) {
      console.error('Fingerprint authentication failed:', err);
      setError('Fingerprint authentication failed');
    } finally {
      setIsFingerprint(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="text-center pb-4 sm:pb-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">Enter Pattern</CardTitle>
          <p className="text-sm sm:text-base text-muted-foreground">Please draw the correct pattern to unlock</p>
        </CardHeader>
        
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          {/* Pattern Grid */}
          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-3 sm:gap-4 p-2 sm:p-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((dotNumber) => (
                <button
                  key={dotNumber}
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 transition-all duration-200 ${
                    isDotActive(dotNumber)
                      ? 'bg-primary border-primary scale-110'
                      : 'border-muted hover:border-primary'
                  }`}
                  onClick={() => handleDotClick(dotNumber)}
                >
                  <div className={`w-full h-full rounded-full ${
                    isDotActive(dotNumber) ? 'bg-primary' : 'bg-transparent'
                  }`} />
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-center text-destructive text-sm font-medium">
              {error}
            </div>
          )}

          {/* Clear Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={pattern.length === 0}
            >
              Clear Pattern
            </Button>
          </div>

          <div className="text-center text-xs sm:text-sm text-muted-foreground">
            Draw the Z pattern to unlock
          </div>

          {/* Fingerprint Authentication for Mobile */}
          {isMobile && isWebAuthnSupported && (
            <div className="flex justify-center pt-3 sm:pt-4 border-t">
              <Button
                variant="ghost"
                size="lg"
                className="flex flex-col items-center gap-1.5 sm:gap-2 h-auto py-3 sm:py-4"
                onClick={handleFingerprintAuth}
                disabled={isFingerprint}
              >
                <Fingerprint className={`h-6 w-6 sm:h-8 sm:w-8 ${isFingerprint ? 'animate-pulse text-primary' : 'text-muted-foreground'}`} />
                <span className="text-xs sm:text-sm">
                  {isFingerprint ? 'Authenticating...' : 'Use Fingerprint'}
                </span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
