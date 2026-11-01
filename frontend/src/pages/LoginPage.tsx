import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Shield, Sparkles, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Validation Error', 'Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back!', 'Authentication successful.');
      navigate('/');
    } catch (err: any) {
      toast.error('Login Failed', err.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface rounded-2xl border border-border shadow-dropdown p-8">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary text-white font-bold text-lg flex items-center justify-center mx-auto shadow-subtle mb-3">
            BF
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            BizFlow <span className="text-primary">360</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Intelligent Business Operations & Analytics Platform
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Work Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@bizflow360.com"
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            size="lg"
            isLoading={isLoading}
          >
            Sign In to Platform
          </Button>
        </form>

        {/* Demo Credentials Quick-Fill (Placement Examiner Convenience) */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center gap-1.5 justify-center text-xs font-semibold text-text-secondary mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Placement Portfolio Demo Roles</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('admin@bizflow360.com', 'Admin@12345')}
              className="px-2.5 py-2 rounded-lg bg-surface-subtle hover:bg-border text-left transition-all border border-border/80 text-xs"
            >
              <div className="font-semibold text-text-primary">Admin</div>
              <div className="text-[10px] text-text-muted">Full Control</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('manager@bizflow360.com', 'Manager@12345')}
              className="px-2.5 py-2 rounded-lg bg-surface-subtle hover:bg-border text-left transition-all border border-border/80 text-xs"
            >
              <div className="font-semibold text-text-primary">Manager</div>
              <div className="text-[10px] text-text-muted">Operations</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('analyst@bizflow360.com', 'Analyst@12345')}
              className="px-2.5 py-2 rounded-lg bg-surface-subtle hover:bg-border text-left transition-all border border-border/80 text-xs"
            >
              <div className="font-semibold text-text-primary">Analyst</div>
              <div className="text-[10px] text-text-muted">BI & Specs</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
