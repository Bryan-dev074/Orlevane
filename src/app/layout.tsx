import type { Metadata, Viewport } from 'next';
import { Bodoni_Moda, Jost } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';

import { LOCALE_META } from '@/lib/i18n';
import { PrefsProvider } from '@/lib/prefs';
import {
  CURRENCY_COOKIE,
  LOCALE_COOKIE,
  currencyForLocale,
  parseCurrency,
  parseLocale,
} from '@/lib/prefs-shared';

import { IntroProvider } from '@/lib/intro';
import SmoothScroll from '@/components/chrome/smooth-scroll';
import Curtain from '@/components/chrome/curtain';
import Cursor from '@/components/chrome/cursor';
import Header from '@/components/chrome/header';
import Footer from '@/components/chrome/footer';
import SkipLink from '@/components/chrome/skip-link';
import Overlays from '@/components/chrome/overlays';

/**
 * Sólo los cortes que la página usa de verdad.
 *
 * `latin` alcanza: ñ, á, é, í, ó, ú, ç, ã y õ están todos ahí; `latin-ext` sólo
 * agrega alfabetos que esta tienda no escribe y duplicaba los archivos.
 * Del display se usa el 400 normal y el 400 itálico; del aparato, 400 y 500.
 */
const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni',
  display: 'swap',
  weight: ['400'],
  style: ['normal', 'italic'],
});

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
  display: 'swap',
  weight: ['400', '500'],
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://orlevane.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'ORLÉVANE · Elegancia en cada paso',
    template: '%s · ORLÉVANE',
  },
  description:
    'Casa de calzado con atelier en Asunción. Hormas propias, cuero del Chaco curtido al quebracho y series numeradas. Tienda de demostración.',
  applicationName: 'ORLÉVANE',
  authors: [{ name: 'ORLÉVANE' }],
  keywords: ['calzado', 'cuero', 'Paraguay', 'Asunción', 'ñandutí', 'zapatos artesanales', 'ORLÉVANE'],
  openGraph: {
    type: 'website',
    siteName: 'ORLÉVANE',
    title: 'ORLÉVANE · Elegancia en cada paso',
    description: 'Casa de calzado con atelier en Asunción. Hormas propias y series numeradas.',
    url: SITE,
    locale: 'es_PY',
    alternateLocale: ['pt_BR'],
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'ORLÉVANE' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ORLÉVANE · Elegancia en cada paso',
    description: 'Casa de calzado con atelier en Asunción.',
    images: ['/og.jpg'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F4EFE6' },
    { media: '(prefers-color-scheme: dark)', color: '#171411' },
  ],
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const locale = parseLocale(jar.get(LOCALE_COOKIE)?.value);
  const currency = jar.has(CURRENCY_COOKIE)
    ? parseCurrency(jar.get(CURRENCY_COOKIE)?.value)
    : currencyForLocale(locale);

  return (
    <html
      lang={LOCALE_META[locale].htmlLang}
      className={`${bodoni.variable} ${jost.variable}`}
      /* El guion de abajo marca `data-intro` antes de hidratar; el servidor no
         puede saberlo, así que React tiene que dejar pasar esa diferencia. */
      suppressHydrationWarning
    >
      <body className="antialiased">
        {/* La cortina sale en cada recarga; lo único que se decide antes de
            pintar es saltarla cuando el visitante pide movimiento reducido. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.dataset.intro='skip'}}catch(e){}`,
          }}
        />
        <PrefsProvider initialLocale={locale} initialCurrency={currency}>
          <IntroProvider>
            <SmoothScroll />
            <Curtain />
            <Cursor />
            <SkipLink />
            <Header />
            <main id="contenido">{children}</main>
            <Footer />
            <Overlays />
          </IntroProvider>
        </PrefsProvider>
      </body>
    </html>
  );
}
