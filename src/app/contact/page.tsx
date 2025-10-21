'use client';

import { Suspense, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import LandingPageHeader from '../apps/components/LandingPageHeader';
import LandingPageFooter from '../apps/components/LandingPageFooter';

const AppPageFallback = (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    Loading...
  </div>
);

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setFeedback('');

    try {
      await api.contact.send(form);
      setStatus('success');
      setFeedback('Message sent! We’ll be in touch soon.');
      setForm({ name: '', email: '', company: '', message: '' });
    } catch (err) {
      setStatus('error');
      setFeedback('Something went wrong. Please try again.');
    }
  };

  return (
    <Suspense fallback={AppPageFallback}>
    <main>
    <LandingPageHeader textColor='dark' />
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg bg-card p-8 rounded-xl shadow-lg border">
        <h1 className="text-3xl font-bold mb-4 text-center">Contact Us</h1>
        <p className="text-muted-foreground mb-6 text-center">
          Send us a message — we’ll get back to you as soon as possible.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
          <Input name="email" placeholder="Your email" type="email" value={form.email} onChange={handleChange} required />
          <Input name="company" placeholder="Company (optional)" value={form.company} onChange={handleChange} />
          <Textarea name="message" placeholder="Your message" value={form.message} onChange={handleChange} required rows={5} />
          
          <Button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Send Message'}
          </Button>
        </form>

        {status !== 'idle' && (
          <p
            className={`mt-4 text-center ${
              status === 'success' ? 'text-green-500' : status === 'error' ? 'text-red-500' : ''
            }`}
          >
            {feedback}
          </p>
        )}
      </div>
    </div>
    <LandingPageFooter></LandingPageFooter>
    </main>
    </Suspense>
  );
}
