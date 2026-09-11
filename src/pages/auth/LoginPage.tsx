import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../../schemas/authSchema';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Building2, Lock, Mail, CheckCircle, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'eduardo@gestaoalugueis.com.br',
      password: 'password123',
      remember: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data.email, data.remember);
      toast.success('Login realizado com sucesso! Bem-vindo.');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Erro ao realizar login');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setValue('email', 'eduardo@gestaoalugueis.com.br');
    setValue('password', 'password123');
    try {
      setIsLoading(true);
      await login('eduardo@gestaoalugueis.com.br', true);
      toast.success('Entrando como Eduardo (Conta Demo)...');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Erro no login de demonstração');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        <div className="flex justify-center">
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-500/25 ring-1 ring-white/20">
            <Building2 className="w-9 h-9" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">
          Aluguel<span className="text-blue-400">SaaS</span>
        </h2>
        <p className="mt-2 text-center text-sm text-slate-300">
          Gestão inteligente de imóveis, inquilinos e cobranças PIX
        </p>
      </div>

      {/* Login Card Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-slate-800/80 sm:px-10 space-y-6">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Input
                label="E-mail profissional"
                labelClassName="text-slate-200 font-medium text-sm mb-1.5"
                type="email"
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                placeholder="seu.email@proprietario.com"
                {...register('email')}
                error={errors.email?.message}
                className="bg-slate-950/80 border-slate-700/80 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <Input
                label="Senha de acesso"
                labelClassName="text-slate-200 font-medium text-sm mb-1.5"
                type={showPassword ? 'text' : 'password'}
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                rightIcon={
                  showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-200" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400 hover:text-slate-200" />
                  )
                }
                onRightIconClick={() => setShowPassword(!showPassword)}
                placeholder="••••••••"
                {...register('password')}
                error={errors.password?.message}
                className="bg-slate-950/80 border-slate-700/80 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/30"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  {...register('remember')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-700 rounded bg-slate-950 cursor-pointer"
                />
                <label htmlFor="remember" className="ml-2 block text-xs font-medium text-slate-300 cursor-pointer hover:text-white">
                  Lembrar acesso
                </label>
              </div>

              <button
                type="button"
                onClick={() => toast.info('Link de recuperação enviado para seu e-mail (mock).')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                Esqueci minha senha
              </button>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 cursor-pointer transition-all active:scale-[0.99]"
              >
                Entrar no Sistema
              </Button>
            </div>
          </form>

          {/* Quick Demo Section */}
          <div className="pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Acesso de Demonstração
              </p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                1-Clique
              </span>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="text-xs text-slate-300 space-y-1">
                <p>
                  <span className="text-slate-500 font-mono">E-mail:</span>{' '}
                  <span className="font-mono text-slate-200">eduardo@gestaoalugueis.com.br</span>
                </p>
                <p>
                  <span className="text-slate-500 font-mono">Senha:</span>{' '}
                  <span className="font-mono text-slate-200">password123</span>
                </p>
              </div>

              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 hover:border-emerald-500/40 rounded-xl transition-all cursor-pointer shadow-xs active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Entrar com Conta de Demonstração
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

