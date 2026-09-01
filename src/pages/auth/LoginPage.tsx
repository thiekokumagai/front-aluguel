import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../../schemas/authSchema';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Building2, Lock, Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
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

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <div className="p-3.5 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20">
            <Building2 className="w-10 h-10" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">
          Aluguel<span className="text-blue-400">SaaS</span>
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 max-w">
          Gestão inteligente de imóveis, inquilinos e cobranças PIX
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-slate-800/90 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-slate-700 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Input
                label="E-mail profissional"
                type="email"
                leftIcon={<Mail className="w-4 h-4" />}
                placeholder="seu.email@proprietario.com"
                {...register('email')}
                error={errors.email?.message}
                className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <Input
                label="Senha de acesso"
                type="password"
                leftIcon={<Lock className="w-4 h-4" />}
                placeholder="••••••••"
                {...register('password')}
                error={errors.password?.message}
                className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  {...register('remember')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-700 rounded bg-slate-900"
                />
                <label htmlFor="remember" className="ml-2 block text-xs text-slate-300">
                  Lembrar acesso
                </label>
              </div>

              <button
                type="button"
                onClick={() => toast.info('Link de recuperação enviado para seu e-mail (mock).')}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
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
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                Entrar no Sistema
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700/80">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Acesso de Demonstração
            </p>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/60 text-xs text-slate-300 space-y-1">
              <p>
                <span className="text-slate-400 font-mono">E-mail:</span> eduardo@gestaoalugueis.com.br
              </p>
              <p>
                <span className="text-slate-400 font-mono">Senha:</span> password123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
