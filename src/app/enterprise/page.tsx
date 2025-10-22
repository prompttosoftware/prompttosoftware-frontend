'use client';

import React, { Suspense, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, BugPlay, FileText, MessageSquare, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { GitHubLogoIcon } from '@/components/icons/GitHubLogoIcon';
import { TeamsLogoIcon } from '@/components/icons/TeamsLogoIcon';
import { JiraLogoIcon } from '@/components/icons/JiraLogoIcon';
import { SlackLogoIcon } from '@/components/icons/SlackLogoIcons';
import Header from './components/Header';
import Footer from './components/Footer';

const LoginPageFallback = (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    Loading...
  </div>
);

export default function EnterpriseLandingPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    setFeedback('');

    try {
      // Use the same API call as the contact page
      await api.contact.send(form);
      setStatus('success');
      setFeedback('Demo request sent! Our team will be in touch shortly.');
      setForm({ name: '', email: '', company: '', message: '' });
    } catch (err) {
      setStatus('error');
      setFeedback('Something went wrong. Please check your details and try again.');
    }
  };

  const blueprints = [
    {
      icon: <BugPlay className="w-8 h-8" strokeWidth={1.5} />,
      title: "Bug & Test Automation",
      problem: "Overwhelming maintenance backlog and inadequate test coverage.",
      solution: "AI autonomously fixes bugs and writes unit tests based on Jira status changes, clearing your backlog without developer intervention."
    },
    {
      icon: <FileText className="w-8 h-8" strokeWidth={1.5} />,
      title: "Documentation & Knowledge",
      problem: "Critical documentation is consistently outdated and neglected.",
      solution: "AI generates and updates onboarding guides, architecture docs (SSDs), and READMEs directly from the codebase on every merge."
    },
    {
      icon: <ShieldCheck className="w-8 h-8" strokeWidth={1.5} />,
      title: "Code Quality & Review",
      problem: "Inconsistent code standards and slow PR review cycles.",
      solution: "AI automatically reviews code against your standards, suggests fixes, updates associated Jira issues, and notifies teams on PR events."
    },
    {
      icon: <MessageSquare className="w-8 h-8" strokeWidth={1.5} />,
      title: "Communication & Triage",
      problem: "High friction when requesting AI help across multiple tools.",
      solution: "Custom Slack/MS Teams integration allows developers to trigger AI actions or query project status directly from chat commands."
    }
  ];

  return (
    <Suspense fallback={LoginPageFallback}>
          <Header textColor='dark'></Header>
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <main className="min-h-screen flex flex-col items-center justify-center text-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl">
          <header className="mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-card-foreground">
              Free Up Your Senior Engineers.
              <br/>
              Eliminate Workflow Bottlenecks.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              PTS Automation deploys a custom-engineered Autonomous Development Engine that integrates directly into your GitHub and Jira workflows, resolving backlogs and boosting team velocity.
            </p>
          </header>
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <a href="#contact-sales">
              <Button size="lg" className="px-10 py-6 text-lg">
                Request a Demo
              </Button>
            </a>
            <p className="text-sm text-muted-foreground">
              Serving the Madison, WI technology community.
            </p>
          </div>
        </div>

        <div className="absolute bottom-10 animate-bounce">
          <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </main>

      {/* Blueprints Section */}
      <section id="solutions" className="py-20 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-card-foreground sm:text-4xl">
              Our Autonomous Engine Blueprints
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
              A menu of targeted solutions for your most critical development bottlenecks. We'll build and integrate the one you need most in a 4-6 week paid pilot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {blueprints.map((blueprint) => (
              <div key={blueprint.title} className="flex flex-col items-start text-left p-6 bg-card rounded-lg border">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-5">
                  {blueprint.icon}
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">{blueprint.title}</h3>
                <p className="text-sm font-semibold text-muted-foreground mb-2">{blueprint.problem}</p>
                <p className="text-foreground/90 flex-grow">{blueprint.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-card-foreground sm:text-4xl">
              Integrates Seamlessly With Your Existing Tools
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our engine plugs directly into the software your team already uses every day.
            </p>
            <div className="mt-10 flex justify-center items-center space-x-8 md:space-x-12">
              <GitHubLogoIcon className="w-12 h-12 text-muted-foreground bg-black" />
              <JiraLogoIcon className="w-12 h-12 text-muted-foreground" />
              <TeamsLogoIcon className="w-12 h-12 text-muted-foreground" />
              <SlackLogoIcon className="w-12 h-12 text-muted-foreground" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section (CTA) */}
      <section id="contact-sales" className="py-20 bg-secondary/50">
        <div className="max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-card-foreground sm:text-4xl">
              Let's Solve Your Biggest Bottleneck
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Schedule a 15-minute discovery call. We'll identify your primary pain point and propose a fixed-scope pilot to solve it.
            </p>
        </div>

        <div className="mt-12 w-full max-w-lg mx-auto px-4">
          <div className="bg-card p-8 rounded-xl shadow-lg border">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
              <Input name="email" placeholder="Work email" type="email" value={form.email} onChange={handleChange} required />
              <Input name="company" placeholder="Company" value={form.company} onChange={handleChange} required />
              <Textarea 
                name="message" 
                placeholder="Tell us about your biggest development bottleneck or the workflow you'd like to automate..." 
                value={form.message} 
                onChange={handleChange} 
                required 
                rows={5} 
              />
              
              <Button type="submit" disabled={status === 'loading'} size="lg">
                {status === 'loading' ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Request Your Demo'}
              </Button>
            </form>

            {status !== 'idle' && status !== 'loading' && (
              <p
                className={`mt-4 text-center text-sm font-medium ${
                  status === 'success' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {feedback}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
    <Footer></Footer>
    </Suspense>
  );
}
