import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Shield, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/api';

export const TwoFactorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get('userId') || '';
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Invalid code',
        description: 'Please enter all 6 digits.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.verify2FA({ code: fullCode, userId });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate('/dashboard');
      window.location.reload();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Invalid code',
        description: 'The code you entered is incorrect. Please try again.',
      });
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Link
        to="/login"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to login
      </Link>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Two-Factor Authentication</h1>
        <p className="text-muted-foreground">
          Enter the 6-digit code from your authenticator app.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2">
          {code.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-xl font-semibold"
            />
          ))}
        </div>

        <Button type="submit" className="w-full h-12" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4 mr-2" />
              Verify Code
            </>
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Didn't receive a code?{' '}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => {
                toast({
                  title: 'Code resent',
                  description: 'A new code has been sent to your authenticator app.',
                });
              }}
            >
              Use backup code
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};
