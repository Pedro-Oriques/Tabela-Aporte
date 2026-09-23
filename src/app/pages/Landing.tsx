import { motion } from 'motion/react';
import { Link } from 'react-router';
import { TrendingUp, Shield, Zap, BarChart3, LineChart, Target, ArrowRight, Check } from 'lucide-react';

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
      title: 'Análise Graham & Bazin',
      description: 'Avaliação automatizada usando metodologias consagradas de investimento em valor.',
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: 'Margem de Segurança',
      description: 'Identifique oportunidades com base em cálculos precisos de margem de segurança.',
    },
    {
      icon: <Zap className="w-8 h-8 text-purple-600" />,
      title: 'Tempo Real',
      description: 'Dados atualizados e métricas calculadas instantaneamente para suas decisões.',
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-600" />,
      title: 'Gráficos Interativos',
      description: 'Visualize tendências e compare ações com gráficos elegantes e intuitivos.',
    },
  ];

  const benefits = [
    'Análise profissional de 25+ ações brasileiras',
    'Classificação automática: Compra, Espera ou Venda',
    'Filtros por setor e busca inteligente',
    'Gerenciamento de watchlist personalizada',
    'Interface moderna com design Neumorphism',
    'Métricas financeiras detalhadas',
  ];

  return (
    <div className="min-h-screen bg-[#E0E5EC]">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="px-6 py-4 bg-[#E0E5EC]"
        style={{
          boxShadow: '0 4px 12px rgba(163, 177, 198, 0.3)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
                boxShadow: '4px 4px 8px #A3B1C6, -4px -4px 8px #FFFFFF',
              }}
            >
              <LineChart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Investche</span>
          </div>
          <div className="flex gap-4">
            <Link to="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl text-gray-700 font-medium transition-all"
                style={{
                  background: '#E0E5EC',
                  boxShadow: '4px 4px 8px #A3B1C6, -4px -4px 8px #FFFFFF',
                }}
              >
                Dashboard
              </motion.button>
            </Link>
            <Link to="/stocks">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl text-white font-medium transition-all"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
                  boxShadow: '4px 4px 8px #A3B1C6, -4px -4px 8px #FFFFFF',
                }}
              >
                Gerenciar Ações
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="inline-block mb-8"
            >
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
                  boxShadow: '8px 8px 16px #A3B1C6, -8px -8px 16px #FFFFFF',
                }}
              >
                <Target className="w-12 h-12 text-white" />
              </div>
            </motion.div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-6xl font-bold mb-6"
            style={{ color: '#2D3748' }}
          >
            Avaliação Inteligente de{' '}
            <span className="gradient-text">Ações Brasileiras</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto"
          >
            Utilize metodologias comprovadas de Graham e Bazin para identificar as melhores
            oportunidades de investimento no mercado brasileiro com análise automatizada e
            interface profissional.
          </motion.p>

          <motion.div variants={itemVariants} className="flex gap-6 justify-center">
            <Link to="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl text-white text-lg font-semibold flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
                  boxShadow: '6px 6px 12px #A3B1C6, -6px -6px 12px #FFFFFF',
                }}
              >
                Começar Agora
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link to="/stocks">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl text-gray-700 text-lg font-semibold"
                style={{
                  background: '#E0E5EC',
                  boxShadow: '6px 6px 12px #A3B1C6, -6px -6px 12px #FFFFFF',
                }}
              >
                Ver Ações
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4" style={{ color: '#2D3748' }}>
            Recursos <span className="gradient-text">Poderosos</span>
          </h2>
          <p className="text-xl text-gray-600">
            Tudo que você precisa para analisar e investir com inteligência
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="p-8 rounded-2xl transition-all"
              style={{
                background: '#E0E5EC',
                boxShadow: '8px 8px 16px #A3B1C6, -8px -8px 16px #FFFFFF',
              }}
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="mb-4"
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#2D3748' }}>
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6" style={{ color: '#2D3748' }}>
              Por que escolher o <span className="gradient-text">Investche?</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Nossa plataforma combina análise fundamentalista rigorosa com interface moderna
              e intuitiva.
            </p>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
                      boxShadow: '4px 4px 8px #A3B1C6, -4px -4px 8px #FFFFFF',
                    }}
                  >
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg text-gray-700">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="p-8 rounded-3xl"
              style={{
                background: '#E0E5EC',
                boxShadow: '12px 12px 24px #A3B1C6, -12px -12px 24px #FFFFFF',
              }}
            >
              <div className="space-y-6">
                <div
                  className="h-4 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%)',
                    width: '80%',
                  }}
                />
                <div
                  className="h-4 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #3B82F6 0%, #7C3AED 100%)',
                    width: '60%',
                  }}
                />
                <div
                  className="h-4 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%)',
                    width: '90%',
                  }}
                />
                <div className="pt-4">
                  <div
                    className="h-32 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED20 0%, #3B82F620 100%)',
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-16 rounded-3xl text-center"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
            boxShadow: '12px 12px 24px #A3B1C6, -12px -12px 24px #FFFFFF',
          }}
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para investir com inteligência?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Junte-se aos investidores que utilizam análise fundamentalista para tomar decisões
            mais seguras e lucrativas.
          </p>
          <Link to="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 rounded-xl text-purple-600 text-lg font-bold flex items-center gap-3 mx-auto"
              style={{
                background: '#FFFFFF',
                boxShadow: '4px 4px 8px rgba(0,0,0,0.1)',
              }}
            >
              Acessar Dashboard
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t" style={{ borderColor: '#CBD5E0' }}>
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p className="mb-2">© 2026 Investche. Análise inteligente de ações brasileiras.</p>
          <p className="text-sm">
            Metodologias Graham & Bazin | Design Neumorphism | Dados em Tempo Real
          </p>
        </div>
      </footer>
    </div>
  );
}