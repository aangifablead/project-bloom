import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import useApi from '@/hooks/apiHook';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Use the custom hook we built
  const { execute, loading } = useApi();
  // const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { login, setAuth } = useAuth(); // 1. Pull setAuth from context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 2. Make the API call via useApi hook
    const { data, error } = await execute('/auth/login', 'POST', { email, password });

    if (data && data.token) {
      // 3. DO NOT call login(). Call setAuth() directly with user and token data!
      setAuth(data.user, data.token);

      toast({
        title: 'Welcome back!',
        description: data.message || 'You have successfully logged in.',
      });

      navigate('/dashboard');
    } else {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error || 'Please check your credentials and try again.',
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
        <p className="text-muted-foreground">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 bg-background"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 pr-12 bg-background"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
};