import Link from 'next/link';
import { ArrowRight, HelpCircle, Sparkles, ShieldCheck, Heart, Zap, Star } from 'lucide-react';

export default function HowToWhatIsPage() {
  const faqs = [
    {
      question: "What exactly is Happy Lokam?",
      answer: "Imagine a world where your most important family moments are planned with the click of a button. Happy Lokam is that world. We are a premium bridge that connects families with the most trusted, elite celebration experts. Whether it's a grand wedding or an intimate birthday, we ensure the 'struggle' of planning is replaced by the 'joy' of celebrating."
    },
    {
      question: "How do I start my celebration journey?",
      answer: "It's as simple as breathing. You explore our Masterpiece Gallery, find a service that speaks to your heart, and book it instantly. No more long phone calls, no more waiting for quotes, and absolutely no more stress. Your personal dashboard keeps everything organized, so you can focus on the smiles, not the schedules."
    },
    {
      question: "Why should I trust the partners here?",
      answer: "Every single partner on our platform is hand-picked and verified. We don't just 'list' businesses; we 'curate' excellence. From legal registration checks to quality audits, we do the hard work so you can have total peace of mind. When you book on Happy Lokam, you are booking a promise of perfection."
    },
    {
      question: "What makes Happy Lokam different from others?",
      answer: "Most platforms give you a list. We give you a life-changing experience. We use smart technology to ensure your bookings are confirmed instantly. We focus on 'Connection', not just 'Collection'. We believe celebration is a human right, and it should be beautiful, fast, and completely secure."
    },
    {
      question: "Is there a cost to join the family?",
      answer: "Joining the Happy Lokam family is a gift we give to every user. Browsing, exploring, and planning is free. You only pay for the premium services you choose to bring your celebration to life. We believe in transparency, so every price you see is fair, honest, and filled with value."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fffcfd]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 py-24 text-white lg:py-40">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-rose-600 blur-[120px]" />
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-amber-600 blur-[120px]" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-rose-400 backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
            Everything you need to know
          </span>
          <h1 className="mt-8 font-display text-5xl font-bold tracking-tight md:text-8xl">
            The Art of <span className="text-rose-600">Celebration.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-white/70">
            You have questions. We have the answers that lead to joy. Discover how Happy Lokam is redefining the way the world celebrates life's most beautiful milestones.
          </p>
        </div>
      </section>

      {/* Guide Section */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="grid gap-20 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="pill">The Philosophy</span>
            <h2 className="mt-6 font-display text-4xl tracking-tight text-slate-950 md:text-5xl">
              How it <span className="text-rose-600">Works.</span>
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              We've stripped away the complexity to leave only the magic. Our platform is designed to be your silent partner in perfection.
            </p>

            <div className="mt-12 space-y-8">
              {[
                {
                  title: "Discover Excellence",
                  desc: "Browse our hand-picked collection of verified service partners. From grand venues to exquisite catering, find what fits your vision.",
                  icon: Star
                },
                {
                  title: "Instant Connection",
                  desc: "Forget the back-and-forth. Secure your date and service with our lightning-fast booking engine. It's celebration, simplified.",
                  icon: Zap
                },
                {
                  title: "Celebrate with Joy",
                  desc: "With the planning handled, your only job is to be present. We ensure our partners deliver exactly what was promised, every single time.",
                  icon: Heart
                }
              ].map((step, i) => (
                <div key={i} className="flex gap-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-display text-xl text-slate-950">{step.title}</h4>
                    <p className="mt-2 text-slate-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="panel bg-rose-50 border-rose-100 p-8 md:p-12">
               <HelpCircle className="h-10 w-10 text-rose-600" />
               <h3 className="mt-6 font-display text-3xl text-slate-950">Why Happy Lokam?</h3>
               <p className="mt-4 text-slate-600 leading-8">
                 Because your family's happiness is too precious to leave to chance. We believe that festivals and functions are the soul of our culture. By providing a safe, verified, and premium platform, we protect that soul. 
                 <br/><br/>
                 We aren't just a website; we are a movement towards a more joyful, stress-free future for everyone.
               </p>
               <Link href="/signup?role=USER" className="mt-10 inline-flex items-center gap-2 rounded-full bg-rose-600 px-8 py-3 text-sm font-bold text-white transition hover:bg-rose-500">
                 Join the movement
                 <ArrowRight className="h-4 w-4" />
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-slate-50 py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-16">
            <span className="pill">The Big Questions</span>
            <h2 className="mt-6 font-display text-4xl tracking-tight text-slate-950 md:text-5xl">
              Common <span className="text-rose-600">Curiosities.</span>
            </h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="panel bg-white border-slate-200 p-8 transition-all hover:border-rose-200 hover:shadow-xl">
                 <h4 className="font-display text-xl text-slate-950">{faq.question}</h4>
                 <p className="mt-4 text-slate-600 leading-8">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <div className="inline-flex flex-col items-center gap-6 rounded-[40px] border border-rose-100 bg-white p-12 shadow-2xl">
               <ShieldCheck className="h-16 w-16 text-rose-600" />
               <div>
                  <h3 className="font-display text-3xl text-slate-950">Still Have Questions?</h3>
                  <p className="mt-3 text-slate-600">Our concierge team is always here to guide you through your celebration journey.</p>
               </div>
               <Link href="/#about" className="rounded-full bg-slate-950 px-10 py-4 text-sm font-bold text-white transition hover:bg-slate-800">
                  Contact Support Heritage
               </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
