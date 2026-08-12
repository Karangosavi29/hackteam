import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: LoginForm) => authApi.login(data),
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      navigate('/');
    },
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-violet-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Login to find your perfect hackathon team</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4">
            {/* Server error */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
                {(error as any)?.response?.data?.message || 'Login failed. Please try again.'}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="karan@example.com"
                {...register('email')}
                className={errors.email ? 'border-red-400' : ''}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className={errors.password ? 'border-red-400' : ''}
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700"
              disabled={isPending}
            >
              {isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Logging in...</>
              ) : 'Login'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm text-slate-500">
          Don't have an account?&nbsp;
          <Link to="/register" className="text-violet-600 font-medium hover:underline">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}