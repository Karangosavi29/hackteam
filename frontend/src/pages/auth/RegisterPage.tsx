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
import { ROLES } from '@/lib/utils';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  college: z.string().min(2, 'College name is required'),
  role: z.enum(['frontend', 'backend', 'fullstack', 'design', 'ml', 'devops', 'other']),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'other' },
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: RegisterForm) => authApi.register(data),
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      navigate('/profile/edit');
    },
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-violet-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Join HackTeam and find your dream team</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
                {(error as any)?.response?.data?.message || 'Registration failed. Please try again.'}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Karan Shah"
                {...register('name')}
                className={errors.name ? 'border-red-400' : ''}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

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

            <div className="space-y-1.5">
              <Label htmlFor="college">College</Label>
              <Input
                id="college"
                placeholder="MIT, IIT Bombay, etc."
                {...register('college')}
                className={errors.college ? 'border-red-400' : ''}
              />
              {errors.college && <p className="text-xs text-red-500">{errors.college.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role">Your Role</Label>
              <select
                id="role"
                {...register('role')}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700"
              disabled={isPending}
            >
              {isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating account...</>
              ) : 'Create Account'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm text-slate-500">
          Already have an account?&nbsp;
          <Link to="/login" className="text-violet-600 font-medium hover:underline">
            Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}