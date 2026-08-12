import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Sparkles, Trophy, Users, UserCheck, ArrowRight, Zap, Shield, Globe } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="max-w-5xl mx-auto py-12 space-y-20">

      {/* Hero */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-sm font-medium">
          <Sparkles className="h-4 w-4" /> Find your hackathon dream team
        </div>
        <h1 className="text-5xl font-bold text-slate-800 leading-tight">
          Build together.<br />
          <span className="text-violet-600">Win together.</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
          HackTeam matches students with complementary skills so you spend less time finding a team and more time building something great.
        </p>
        <div className="flex items-center justify-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/match">
                <Button className="bg-violet-600 hover:bg-violet-700 gap-2 h-11 px-6">
                  <UserCheck className="h-5 w-5" /> Find Teammates
                </Button>
              </Link>
              <Link to="/hackathons">
                <Button variant="outline" className="gap-2 h-11 px-6">
                  <Trophy className="h-5 w-5" /> Browse Hackathons
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/register">
                <Button className="bg-violet-600 hover:bg-violet-700 gap-2 h-11 px-6">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/hackathons">
                <Button variant="outline" className="gap-2 h-11 px-6">
                  Browse Hackathons
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: <Trophy className="h-6 w-6 text-violet-600" />,
            title: 'Discover Hackathons',
            desc: 'Find online and offline hackathons filtered by date, mode, and tags. Never miss an opportunity.',
            link: '/hackathons',
            label: 'Browse hackathons',
          },
          {
            icon: <Users className="h-6 w-6 text-violet-600" />,
            title: 'Form Your Team',
            desc: 'Create a team, define what roles you need, and send or receive join requests instantly.',
            link: '/teams',
            label: 'Explore teams',
          },
          {
            icon: <UserCheck className="h-6 w-6 text-violet-600" />,
            title: 'Smart Matching',
            desc: 'Our algorithm scores teammates by skill overlap, complementary roles, and college proximity.',
            link: isAuthenticated ? '/match' : '/register',
            label: isAuthenticated ? 'See your matches' : 'Get matched',
          },
        ].map((f) => (
          <div key={f.title} className="p-6 rounded-2xl border bg-white shadow-sm hover:shadow-md hover:border-violet-200 transition-all space-y-3">
            <div className="h-12 w-12 rounded-xl bg-violet-50 flex items-center justify-center">
              {f.icon}
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">{f.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            <Link to={f.link} className="flex items-center gap-1 text-sm text-violet-600 font-medium hover:underline">
              {f.label} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ))}
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-6 text-center py-8 border-y">
        {[
          { value: '100%', label: 'Free to use' },
          { value: 'Skill-based', label: 'Smart matching' },
          { value: 'Open', label: 'Source & community' },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-2xl font-bold text-violet-600">{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="text-center space-y-4 py-8 px-8 rounded-2xl bg-violet-50 border border-violet-100">
          <h2 className="text-2xl font-bold text-slate-800">Ready to find your team?</h2>
          <p className="text-slate-500">Join hundreds of students already using HackTeam.</p>
          <Link to="/register">
            <Button className="bg-violet-600 hover:bg-violet-700 gap-2 h-11 px-8">
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </section>
      )}

      {/* Logged in welcome */}
      {isAuthenticated && (
        <section className="text-center space-y-4 py-8 px-8 rounded-2xl bg-violet-50 border border-violet-100">
          <h2 className="text-2xl font-bold text-slate-800">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-slate-500">Your next hackathon win is one team away.</p>
          <div className="flex justify-center gap-3">
            <Link to="/match">
              <Button className="bg-violet-600 hover:bg-violet-700 gap-2">
                <UserCheck className="h-4 w-4" /> Find Teammates
              </Button>
            </Link>
            <Link to="/profile/edit">
              <Button variant="outline" className="gap-2">
                Update Profile
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}