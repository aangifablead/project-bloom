import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'; // Added CheckCircle2 for UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import useApi from '@/hooks/apiHook'; // Import your custom hook

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { toast } = useToast();
  const { loading, execute } = useApi(); // Use the hook here

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend Validations
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same.',
      });
      return;
    }

    if (password.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Password too short',
        description: 'Password must be at least 8 characters long.',
      });
      return;
    }

    // BINDING: Execute the API call
    const result = await execute('/auth/reset-password', 'POST', { 
      token, 
      password 
    });

    if (!result.error) {
      setIsSuccess(true);
      toast({
        title: 'Password reset successful',
        description: 'You can now log in with your new password.',
      });
      // Redirect after success
      setTimeout(() => navigate('/login'), 3000);
    } else {
      toast({
        variant: 'destructive',
        title: 'Reset Failed',
        description: result.error || 'The link may have expired or is invalid.',
      });
    }
  };

  // 1. Invalid Token View
  if (!token) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Invalid Link</h1>
        <p className="text-muted-foreground mb-8">
          This password reset link is invalid or has expired.
        </p>
        <Button asChild variant="outline" className="w-full h-12">
          <Link to="/forgot-password">Request new link</Link>
        </Button>
      </div>
    );
  }

  // 2. Success View
  if (isSuccess) {
    return (
      <div className="text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Success!</h1>
        <p className="text-muted-foreground mb-8">
          Your password has been reset. Redirecting you to the login page...
        </p>
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  // 3. Main Form View
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Set new password</h1>
        <p className="text-muted-foreground">
          Create a secure password to protect your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 pr-10"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="h-12"
            disabled={loading}
          />
        </div>

        <Button type="submit" className="w-full h-12" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Resetting password...
            </>
          ) : (
            'Update Password'
          )}
        </Button>
      </form>
    </div>
  );
};