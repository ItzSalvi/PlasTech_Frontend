import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Recycle, Award, BarChart3, ArrowRight, ShieldCheck } from 'lucide-react';

export function Landing() {
  return (
    <div className="relative flex min-h-screen flex-col font-sans text-foreground selection:bg-primary/30">

      {/* --- BACKGROUND SYSTEM (z-0) --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* 1. Base Image - Updated to your ocean plastic pollution image */}
        <img
          src="https://media.istockphoto.com/id/1193095410/photo/plastic-ocean-pollution-and-microplastics.jpg?s=612x612&w=0&k=20&c=UxzAAlzE8l5U_0kcRT0nr8GWXfkImrsiRW3nLVKtj9w="
          alt="Plastic Ocean Pollution"
          className="h-full w-full object-cover opacity-40 dark:opacity-20"
        />

        {/* 2. Frosted Glass Overlay - Ensures text is readable over the image */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]"></div>

        {/* 3. The Grid & Glowing Orb Layer */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-[-10%] m-auto h-[500px] w-[500px] rounded-full bg-primary/30 blur-[120px]"></div>
      </div>
      {/* ------------------------------- */}

      {/* --- MAIN CONTENT (z-10) --- */}
      <div className="relative z-10 flex flex-col flex-1">
        <main className="flex-1">
          {/* Hero Section */}
          <section className="flex flex-col items-center justify-center text-center px-4 pt-32 pb-24 lg:pt-48 lg:pb-32">

            <div className="flex flex-col items-center">
              <Badge variant="secondary" className="mb-8 px-4 py-1.5 text-sm font-medium border-primary/20 bg-primary/10 backdrop-blur-md">
                <Leaf className="mr-2 h-4 w-4 text-primary" />
                Join the ecosystem today
              </Badge>

              <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 leading-[1.1]">
                Smart Recycling for a <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600 drop-shadow-sm">
                  Greener Future
                </span>
              </h1>

              <p className="max-w-2xl text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed font-medium">
                PlasTech connects intelligent smart bins to a modern reward ecosystem. Recycle plastic bottles, earn points instantly, and redeem them for exclusive eco-friendly items.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center sm:w-auto">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-12 px-8 text-base shadow-lg shadow-primary/20 transition-all hover:scale-105">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full h-12 px-8 text-base bg-background/50 backdrop-blur-md transition-all hover:scale-105 border-primary/30">
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Features Showcase using shadcn Cards */}
          <section className="py-24 container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                How PlasTech Works
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                A seamless, sustainable loop designed to incentivize environmental responsibility.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Card className="group transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 bg-background/60 backdrop-blur-xl border-border/50">
                <CardHeader>
                  <div className="mb-4 inline-flex p-3 rounded-xl bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                    <Recycle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Scan & Insert</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Find a PlasTech bin, scan its QR code with your phone, and drop in bottles. Precision IR sensors count every item.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="group transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 bg-background/60 backdrop-blur-xl border-border/50">
                <CardHeader>
                  <div className="mb-4 inline-flex p-3 rounded-xl bg-yellow-500/10 w-fit group-hover:bg-yellow-500/20 transition-colors">
                    <Award className="h-6 w-6 text-yellow-500" />
                  </div>
                  <CardTitle className="text-xl">Earn Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Receive points instantly for your contribution. Follow your progress on a beautiful, real-time dashboard.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="group transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 bg-background/60 backdrop-blur-xl border-border/50">
                <CardHeader>
                  <div className="mb-4 inline-flex p-3 rounded-xl bg-blue-500/10 w-fit group-hover:bg-blue-500/20 transition-colors">
                    <GiftIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle className="text-xl">Redeem Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Exchange your points for exclusive eco-friendly merchandise, vouchers, and secure digital PDF receipts.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Trust Section */}
          <section className="py-12 border-t border-border/40 bg-background/40 backdrop-blur-lg mt-auto">
            <div className="container mx-auto px-4 flex justify-center items-center gap-8 md:gap-16 flex-wrap opacity-80">
              <div className="flex items-center gap-2 text-foreground/70 font-medium">
                <ShieldCheck className="h-5 w-5" />
                Verified Secure
              </div>
              <div className="flex items-center gap-2 text-foreground/70 font-medium">
                <BarChart3 className="h-5 w-5" />
                Real-Time Analytics
              </div>
              <div className="flex items-center gap-2 text-foreground/70 font-medium">
                <Leaf className="h-5 w-5" />
                Carbon Negative
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

// Minimal icon to replace standard lucide one for variety
function GiftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  );
}