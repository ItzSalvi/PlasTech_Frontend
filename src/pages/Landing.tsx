import { Link } from 'react-router-dom';
import { GlobalLoading } from '../components/ui/GlobalLoading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Leaf,
  Recycle,
  Award,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Cpu,
  TrendingUp,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Users,
  Globe,
  Zap,
  Wallet,
  Smartphone
} from 'lucide-react';
import PlasTechLogo from '@/assets/PlasTech_Logo.png';
import bgLanding from '@/assets/bg-landing.png';

const CustomGiftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
  </svg>
);

export function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">

      {/* --- BACKGROUND SYSTEM - Clean White with Green Accents --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Subtle Green Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-card via-card to-green-50/30" />

        {/* Minimalist Green Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#22c55e08_1px,transparent_1px),linear-gradient(to_bottom,#22c55e08_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Soft Green Orbs */}
        <div className="absolute top-0 -right-40 w-96 h-96 bg-gradient-to-br from-green-100/40 to-emerald-100/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-gradient-to-tr from-green-100/30 to-emerald-100/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-50 dark:bg-green-900/20/20 rounded-full blur-[120px]" />
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10">
        <main>
          {/* Hero Section */}
          <section
            className="relative min-h-screen flex items-center justify-center px-4 pt-32 pb-20 lg:pt-40 lg:pb-32 bg-cover bg-center bg-no-repeat"
          >
            {/* Background Image with 40% Opacity Overlay */}
            <div className="absolute inset-0 z-0">
              <img
                src={bgLanding}
                alt="Background"
                className="w-full h-full object-cover opacity-40"
                style={{ position: 'absolute', inset: 0 }}
                draggable={false}
              />
            </div>
            {/* Modern Glass Gradient Overlay */}
            <div className="absolute inset-0 z-10 bg-white/60 dark:bg-zinc-950/70 bg-gradient-to-br from-white/90 via-white/50 to-green-500/30 dark:from-zinc-950/90 dark:via-zinc-950/70 dark:to-green-900/40 backdrop-blur-[2px] pointer-events-none"></div>

            <div className="container mx-auto max-w-7xl relative z-10">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Left Column - Content */}
                <div className="space-y-8 text-center lg:text-left">
                  {/* Logo & Badge */}
                  <div className="flex flex-col items-center lg:items-start gap-6">
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-card shadow-lg border border-border">
                      <img src={PlasTechLogo} alt="PlasTech Logo" className="h-8 w-auto" />
                      <span className="text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        PlasTech
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border">
                      <Sparkles className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">AI-Powered Recycling System</span>
                    </div>
                  </div>

                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-gray-900 dark:text-gray-50">
                    Smart Recycling for a
                    <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-3">
                      Greener Future
                    </span>
                  </h1>

                  <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                    Join the revolution in sustainable waste management. Earn rewards while saving the planet with our AI-powered smart recycling bins.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Link to="/register">
                      <Button className="group w-full sm:w-auto h-12 px-8 text-base bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300">
                        Get Started Free
                        <ArrowRight className="ml-2 h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="outline" className="w-full sm:w-auto h-12 px-8 text-base border-2 border-border hover:border-primary hover:bg-muted transition-all duration-300">
                        View Dashboard
                      </Button>
                    </Link>
                  </div>

                </div>

                {/* Right Column - Modern Illustration */}
                <div className="hidden lg:block relative">
                  <div className="relative animate-float">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-3xl blur-2xl" />

                    {/* Main Card */}
                    <div className="relative bg-card rounded-3xl shadow-2xl border border-border overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full" />
                      <div className="p-8">
                        <div className="grid grid-cols-2 gap-5">
                          {[
                            { icon: Cpu, title: "AI Detection", desc: "Plastic Bottle Detection", color: "green" },
                            { icon: Award, title: "Instant Rewards", desc: "Points in seconds", color: "green" },
                            { icon: QrCode, title: "QR Scan", desc: "Easy access", color: "green" },
                            { icon: TrendingUp, title: "Track Impact", desc: "Real-time data", color: "green" }
                          ].map((item, idx) => (
                            <div key={idx}
                              className={`p-5 rounded-2xl bg-card border border-border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group cursor-pointer`}>
                              <item.icon className={`h-8 w-8 text-${item.color}-600 mb-3 group-hover:scale-110 transition-transform`} />
                              <p className="font-semibold text-gray-900 dark:text-gray-50 mb-1">{item.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <div className="w-6 h-10 border-2 border-green-300 rounded-full flex justify-center">
                <div className="w-1.5 h-2.5 bg-green-500 rounded-full mt-2 animate-pulse" />
              </div>
            </div>
          </section>

          {/* How It Works Section - 4 Steps */}
          <section className="py-24 bg-gradient-to-b from-white to-green-50/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16 space-y-4">
                <Badge className="px-4 py-2 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-none">
                  Simple Process
                </Badge>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-gray-50">
                  How PlasTech Works
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                  Four simple steps to start your recycling journey and earn rewards
                </p>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {steps.map((step, index) => (
                  <div key={index} className="relative group">
                    {/* Step Number */}
                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg z-10">
                      {index + 1}
                    </div>

                    <Card className="pt-12 text-center transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-card border border-border">
                      <CardHeader>
                        <div className="mb-4 inline-flex p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 mx-auto group-hover:scale-110 transition-transform duration-300">
                          <step.icon className="h-8 w-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl mb-3 text-gray-900 dark:text-gray-50">{step.title}</CardTitle>
                        <CardDescription className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
                          {step.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features Section - Modern Cards */}
          <section className="py-24">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16 space-y-4">
                <Badge className="px-4 py-2 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-none">
                  Key Features
                </Badge>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-gray-50">
                  Why Choose PlasTech?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                  Innovative technology combined with user-friendly design
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {features.map((feature, index) => (
                  <Card key={index}
                    className="group transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-border bg-card">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-5">
                        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} group-hover:scale-110 transition-transform duration-300`}>
                          <feature.icon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-xl text-gray-900 dark:text-gray-50 mb-0">{feature.title}</CardTitle>
                      </div>
                      <CardDescription className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Technology Section */}
          <section className="py-24 bg-gradient-to-b from-green-50/30 to-white">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
                <div className="space-y-6">
                  <Badge className="px-4 py-2 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-none w-fit">
                    Advanced Technology
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">
                    Powered by AI & Computer Vision
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Our YOLO-based AI model ensures accurate plastic detection, preventing misuse and ensuring quality recycling.
                  </p>
                  <div className="space-y-4">
                    {techFeatures.map((tech, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-50">{tech.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{tech.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-2xl" />
                  <div className="relative bg-card rounded-3xl shadow-xl border border-border p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                        <Cpu className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-50">Real-time Detection</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Processes objects in milliseconds</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                        <ShieldCheck className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-50">99.9% Accuracy</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Advanced computer vision models</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                        <Zap className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-50">Instant Processing</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Lightning-fast verification</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-24">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16 space-y-4">
                <Badge className="px-4 py-2 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-none">
                  Environmental Impact
                </Badge>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-gray-50">
                  Benefits for Everyone
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                  Creating a sustainable ecosystem for users, communities, and the planet
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {benefits.map((benefit, index) => (
                  <div key={index} className="text-center p-6 rounded-2xl bg-card border border-border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group">
                    <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 mb-4 group-hover:scale-110 transition-transform">
                      <benefit.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="relative py-24 bg-gradient-to-r from-green-600 to-emerald-600 overflow-hidden">
            {/* Background Image at 20% opacity */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <img
                src={bgLanding}
                alt="Background"
                className="w-full h-full object-cover opacity-20"
                style={{ position: 'absolute', inset: 0 }}
                draggable={false}
              />
            </div>
            <div className="container mx-auto px-4 text-center relative z-10">
              <div className="max-w-3xl mx-auto space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold text-white">
                  Ready to Make a Difference?
                </h2>
                <p className="text-xl text-green-50">
                  Join thousands of users who are already saving the planet while earning rewards.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link to="/register">
                    <Button className="bg-card text-primary hover:bg-muted hover:text-primary h-12 px-8 text-base shadow-lg transition-all duration-300">
                      Create Free Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/learn-more">
                    <Button variant="outline" className="border-border text-primary hover:bg-muted h-12 px-8 text-base">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Trust Section */}
          <section className="py-12 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                {[
                  { icon: ShieldCheck, text: "Verified Secure" },
                  { icon: BarChart3, text: "Real-Time Analytics" },
                  { icon: Leaf, text: "Carbon Negative" },
                  { icon: Recycle, text: "100% Recyclable" },
                  { icon: Wallet, text: "Earn Rewards" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium">
                    <item.icon className="h-5 w-5 text-green-600" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Step Data
const steps = [
  {
    icon: Smartphone,
    title: "Scan QR Code",
    description: "Use your phone to scan the QR code on any PlasTech smart bin to identify yourself."
  },
  {
    icon: Recycle,
    title: "Insert Plastic",
    description: "Place your plastic bottles into the bin. Our AI instantly verifies and accepts valid items."
  },
  {
    icon: Award,
    title: "Earn Points",
    description: "Receive points instantly in your account and track your environmental impact."
  },
  {
    icon: CustomGiftIcon,
    title: "Redeem Rewards",
    description: "Exchange your points for exciting eco-friendly products and exclusive perks."
  }
];

// Feature Data
const features = [
  {
    icon: Cpu,
    title: "AI-Powered Detection",
    description: "Advanced computer vision identifies plastic bottles",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: Zap,
    title: "Instant Rewards",
    description: "Get points credited to your account immediately after each successful recycle.",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: ShieldCheck,
    title: "Secure System",
    description: "QR code authentication ensures your rewards are safe and trackable.",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    description: "Monitor your recycling impact with detailed analytics and insights.",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: Globe,
    title: "Environmental Impact",
    description: "See exactly how much plastic waste you've diverted from landfills.",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: Wallet,
    title: "Redeem Rewards",
    description: "Exchange points for eco-friendly products, vouchers, and more.",
    gradient: "from-green-500 to-emerald-500"
  }
];

// Tech Features
const techFeatures = [
  {
    title: "YOLO Computer Vision",
    description: "State-of-the-art object detection for accurate plastic identification"
  },
  {
    title: "Real-time Processing",
    description: "Instant verification and points allocation within seconds"
  },
  {
    title: "Fraud Prevention",
    description: "Advanced algorithms prevent system abuse and ensure quality"
  },
  {
    title: "Data Analytics",
    description: "Comprehensive insights into recycling patterns and environmental impact"
  }
];

// Benefits Data
const benefits = [
  {
    icon: Leaf,
    title: "Environmental Impact",
    description: "Reduce plastic pollution and promote sustainability"
  },
  {
    icon: Award,
    title: "Earn Rewards",
    description: "Get valuable points for your recycling efforts"
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Monitor your contribution to the environment"
  },
  {
    icon: Users,
    title: "Community Impact",
    description: "Join a community of eco-conscious individuals"
  }
];