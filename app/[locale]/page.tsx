import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { StatsSection } from '@/components/home/StatsSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { getMessages } from '@/utils/translations';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const messages = await getMessages(locale);

  return (
    <div className="min-h-screen">
      <HeroSection locale={locale} messages={messages} />
      <FeaturesSection locale={locale} messages={messages} />
      <StatsSection locale={locale} messages={messages} />
      <TestimonialsSection locale={locale} messages={messages} />
    </div>
  );
}
