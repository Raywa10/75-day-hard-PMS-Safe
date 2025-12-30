import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Target, 
  Calendar, 
  Heart, 
  BarChart3, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Star,
  Quote
} from 'lucide-react';

const features = [
  {
    icon: Target,
    title: "75-Day Challenge",
    description: "Track all 6 daily tasks with precision. Build habits that last a lifetime."
  },
  {
    icon: Heart,
    title: "PMS-Safe Mode",
    description: "Adaptive expectations during your cycle. Self-care isn't weakness—it's wisdom."
  },
  {
    icon: Calendar,
    title: "Flexible Logging",
    description: "Log mood, symptoms, and notes. Your journey, your data, your insights."
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description: "Visualize streaks, completion rates, and patterns. Celebrate every win."
  }
];

const testimonials = [
  {
    name: "Sarah M.",
    text: "The PMS-Safe feature changed everything. I finally completed a challenge without burning out.",
    rating: 5
  },
  {
    name: "Emily R.",
    text: "Clean, simple, supportive. This app understands that progress isn't always linear.",
    rating: 5
  },
  {
    name: "Jessica K.",
    text: "Day 47 and going strong. The analytics keep me motivated even on tough days.",
    rating: 5
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-lg border-b border-border z-50">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">75</span>
            </div>
            <span className="font-display text-lg font-semibold text-foreground">75 Hard PMS-Safe</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="sm" className="rounded-2xl">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pms-safe-gentle text-pms-safe text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            Now with PMS-Safe Mode
          </div>
          
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
            Transform Your Life,
            <br />
            <span className="text-primary">Respect Your Rhythm</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            The 75 Hard challenge tracker that adapts to you. 
            Track workouts, water, reading, diet, and photos—with compassion built in.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="rounded-2xl text-base px-8 shadow-elevated">
                Start Your Journey
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="rounded-2xl text-base px-8">
                I Have an Account
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            ✦ Free forever • No credit card required
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Simple tools, beautiful design, and smart features that meet you where you are.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-soft bg-card rounded-3xl">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* PMS-Safe Highlight */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-0 shadow-elevated bg-gradient-to-br from-pms-safe-gentle to-accent rounded-3xl overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-pms-safe/20 flex items-center justify-center">
                    <Heart className="w-10 h-10 text-pms-safe" />
                  </div>
                </div>
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                    PMS-Safe Mode: Challenge Meets Compassion
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    During your configured PMS window, enjoy adjusted expectations: 
                    swap intense workouts for gentle movement, reduce water goals, 
                    and add rest & recovery tasks. No shame, no failure—just smart adaptation.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-3 py-1 bg-background/50 rounded-full text-sm text-foreground">
                      Workout substitutions
                    </span>
                    <span className="px-3 py-1 bg-background/50 rounded-full text-sm text-foreground">
                      Adjusted water goals
                    </span>
                    <span className="px-3 py-1 bg-background/50 rounded-full text-sm text-foreground">
                      Rest & Recovery
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Loved by Challengers
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-soft bg-card rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-warning fill-warning" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <p className="text-sm text-muted-foreground font-medium">
                    — {testimonial.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-2xl text-center">
          <Sparkles className="w-10 h-10 text-primary mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Start?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Consistency compounds. Your future self will thank you.
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="rounded-2xl text-base px-10 shadow-elevated">
              Begin Day 1
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-[10px]">75</span>
              </div>
              <span className="text-sm text-muted-foreground">75 Hard PMS-Safe</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with care. Your data stays yours.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
