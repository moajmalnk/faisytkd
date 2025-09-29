import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Delete, Fingerprint } from 'lucide-react';

interface PinScreenProps {
  onPinCorrect: () => void;
  attempts: number;
  onIncrementAttempts: () => void;
}

export const PinScreen = ({ onPinCorrect, attempts, onIncrementAttempts }: PinScreenProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isFingerprint, setIsFingerprint] = useState(false);
  const [isPasskeyEnrollment, setIsPasskeyEnrollment] = useState(false);
  const correctPin = '3388';

  // Check if WebAuthn is supported
  const isWebAuthnSupported = typeof window !== 'undefined' && 
    'navigator' in window && 
    'credentials' in navigator && 
    'create' in navigator.credentials;

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');
      
      if (newPin.length === 4) {
        if (newPin === correctPin) {
          const existingCredential = localStorage.getItem('webauthn-credential-id');
          if (!existingCredential) {
            // No passkey yet: prompt to set up regardless of fingerprint button state
            setIsPasskeyEnrollment(true);
            setError('Now Setup Finger');
            return;
          }
          if (isPasskeyEnrollment) {
            // Continue passkey enrollment now that PIN is verified
            handleFingerprintAuth();
            return;
          }
          onPinCorrect();
        } else {
          setError('Incorrect PIN');
          onIncrementAttempts();
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

  const handleFingerprintAuth = async () => {
    if (!isWebAuthnSupported) {
      setError('Fingerprint authentication not supported');
      return;
    }

    try {
      setIsFingerprint(true);

      // Check if there's an existing credential
      const existingCredential = localStorage.getItem('webauthn-credential-id');
      
      if (!existingCredential) {
        // Require correct PIN before allowing a new passkey to be registered
        if (pin !== correctPin) {
          setIsPasskeyEnrollment(true);
          setError('Enter your PIN first to enable passkey');
          return;
        }
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

        // Update helper text to reflect we're about to enroll
        setError('Now Setup Finger');

        const credential = await navigator.credentials.create({
          publicKey: publicKeyCredentialCreationOptions
        });

        if (credential) {
          localStorage.setItem('webauthn-credential-id', credential.id);
          setIsPasskeyEnrollment(false);
          onPinCorrect();
        }
      } else {
        // Authenticate with existing credential
        // Convert base64url to base64 for atob()
        const base64Credential = existingCredential.replace(/-/g, '+').replace(/_/g, '/');
        // Add padding if needed
        const paddedCredential = base64Credential + '='.repeat((4 - base64Credential.length % 4) % 4);
        
        const publicKeyCredentialRequestOptions = {
          challenge: new Uint8Array(32),
          allowCredentials: [{
            id: Uint8Array.from(atob(paddedCredential), c => c.charCodeAt(0)),
            type: 'public-key' as const,
          }],
          userVerification: "required" as const,
          timeout: 60000,
        };

        const assertion = await navigator.credentials.get({
          publicKey: publicKeyCredentialRequestOptions
        });

        if (assertion) {
          onPinCorrect();
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
            <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">Enter PIN</CardTitle>
          <p className="text-sm sm:text-base text-muted-foreground">Please enter your 4-digit PIN to access the dashboard</p>
        </CardHeader>
        
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          {/* PIN Display */}
          <div className="flex justify-center space-x-3 sm:space-x-4">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 transition-colors ${
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
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Button
                key={num}
                variant="outline"
                size="lg"
                className="h-12 sm:h-16 text-lg sm:text-xl font-semibold"
                onClick={() => handleNumberClick(num.toString())}
                disabled={attempts >= 3}
              >
                {num}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="lg"
              className="h-12 sm:h-16 text-sm sm:text-base"
              onClick={handleClear}
              disabled={attempts >= 3}
            >
              Clear
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="h-12 sm:h-16 text-lg sm:text-xl font-semibold"
              onClick={() => handleNumberClick('0')}
              disabled={attempts >= 3}
            >
              0
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="h-12 sm:h-16"
              onClick={handleDelete}
              disabled={attempts >= 3}
            >
              <Delete className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          <div className="text-center text-xs sm:text-sm text-muted-foreground">
            Attempts: {attempts}/3
          </div>

          {/* Fingerprint Authentication */}
          {isWebAuthnSupported && (
            <div className="flex justify-center pt-3 sm:pt-4 border-t">
              <Button
                variant="ghost"
                size="lg"
                className="flex flex-col items-center gap-1.5 sm:gap-2 h-auto py-3 sm:py-4"
                onClick={handleFingerprintAuth}
                disabled={attempts >= 3 || isFingerprint}
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