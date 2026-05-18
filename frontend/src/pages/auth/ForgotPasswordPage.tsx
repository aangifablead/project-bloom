import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import useApi from '@/hooks/apiHook';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword } = useAuth();
  const { toast } = useToast();
  const { execute, loading } = useApi()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await execute('/auth/forgot-password', 'POST', { email });

    if (data && data.status === 'success') {
      setIsSubmitted(true);
      toast({
        title: 'Success',
        description: data.message,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error || data?.message || 'An error occurred.',
      });
    }
  };
  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-success" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Check your email</h1>
        <p className="text-muted-foreground mb-8">
          We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
        </p>
        <Button asChild variant="outline" className="w-full h-12">
          <Link to="/login">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Link>
        </Button>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-foreground mb-2">Forgot password?</h1>
        <p className="text-muted-foreground">
          No worries, we'll send you reset instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12"
          />
        </div>

        <Button type="submit" className="w-full h-12" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            'Reset password'
          )}
        </Button>
      </form>
    </div>
  );
};
