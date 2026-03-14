import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext";

// Fonte principal - Inter para UI clean e moderna
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

// Fonte secundária - Space Grotesk para headings impactantes
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space",
  preload: true,
  weight: ["400", "500", "600", "700"],
});

// Configuração de Viewport (separada para evitar warnings)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#030305" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  colorScheme: "dark light",
};

// Metadados principais super completos
export const metadata: Metadata = {
  // Básicos
  title: {
    default: "ClipAI - Transforme Vídeos em Cortes Virais com IA",
    template: "%s | ClipAI",
  },
  description:
    "ClipAI usa inteligência artificial para analisar vídeos do YouTube e criar automaticamente Shorts, Reels e TikToks virais. Economize horas de edição e maximize seu alcance.",

  // Keywords (ainda relevantes para alguns crawlers)
  keywords: [
    "clipai",
    "cortes virais",
    "youtube shorts",
    "tiktok",
    "instagram reels",
    "edição de vídeo com ia",
    "inteligência artificial vídeo",
    "automação conteúdo",
    "criador conteúdo",
    "viralização",
    "ai video editing",
    "video clips",
    "content creator tools",
  ],

  // Autores e criação
  authors: [{ name: "ClipAI Team", url: "https://clipai.com" }],
  creator: "ClipAI",
  publisher: "ClipAI Inc.",
  generator: "Next.js",
  applicationName: "ClipAI",
  referrer: "origin-when-cross-origin",

  // Robots e indexação
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Canonical e alternates
  alternates: {
    canonical: "https://clipai.com",
    languages: {
      "pt-BR": "https://clipai.com/pt-br",
      "en-US": "https://clipai.com/en",
      "es-ES": "https://clipai.com/es",
    },
  },

  // Open Graph (Facebook, LinkedIn, WhatsApp, etc)
  openGraph: {
    type: "website",
    locale: "pt_BR",
    alternateLocale: ["en_US", "es_ES"],
    url: "https://clipai.com",
    siteName: "ClipAI",
    title: "ClipAI - Transforme Vídeos em Cortes Virais com IA",
    description:
      "Nossa IA analisa vídeos do YouTube e encontra automaticamente os melhores momentos para Shorts, Reels e TikTok. Economize tempo, viralize mais.",
    images: [
      {
        url: "https://clipai.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ClipAI - Interface mostrando análise de vídeo com IA",
        type: "image/jpeg",
      },
      {
        url: "https://clipai.com/og-image-square.jpg",
        width: 800,
        height: 800,
        alt: "ClipAI Logo",
        type: "image/jpeg",
      },
    ],
    videos: [
      {
        url: "https://clipai.com/preview-video.mp4",
        width: 1280,
        height: 720,
        type: "video/mp4",
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    site: "@clipai",
    creator: "@clipai",
    title: "ClipAI - Transforme Vídeos em Cortes Virais com IA",
    description:
      "IA que analisa vídeos do YouTube e cria automaticamente Shorts, Reels e TikToks virais. Economize horas de edição.",
    images: {
      url: "https://clipai.com/twitter-image.jpg",
      alt: "ClipAI Dashboard Preview",
    },
  },

  // Ícones - NOMES CORRETOS baseados na sua estrutura
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#8b5cf6",
      },
    ],
  },

  // Manifesto PWA - NOME CORRETO: site.webmanifest
  manifest: "/site.webmanifest",

  // Apple Web App
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ClipAI",
  },

  // Outros metadados importantes
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },

  // Verificação de propriedade (Google, Bing, etc)
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
    yahoo: "yahoo-verification-code",
    other: {
      me: ["my-email@clipai.com", "https://clipai.com"],
    },
  },

  // Metadados para apps móveis
  appLinks: {
    ios: {
      url: "https://apps.apple.com/app/clipai/id123456789",
      app_store_id: "123456789",
      app_name: "ClipAI",
    },
    android: {
      package: "com.clipai.app",
      app_name: "ClipAI",
    },
    web: {
      url: "https://clipai.com",
      should_fallback: true,
    },
  },

  // Archive e cache
  archives: ["https://clipai.com/archive"],
  assets: ["https://cdn.clipai.com"],
  bookmarks: ["https://clipai.com/bookmarks"],

  // Categorização
  category: "technology",
  classification: "Software Application",
};

// Schema.org JSON-LD estruturado
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    // Organização
    {
      "@type": "Organization",
      "@id": "https://clipai.com/#organization",
      name: "ClipAI",
      url: "https://clipai.com",
      logo: {
        "@type": "ImageObject",
        url: "https://clipai.com/android-chrome-512x512.png",
        width: 512,
        height: 512,
      },
      sameAs: [
        "https://twitter.com/clipai",
        "https://www.instagram.com/clipai",
        "https://www.linkedin.com/company/clipai",
        "https://www.youtube.com/@clipai",
        "https://github.com/clipai",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+55-11-99999-9999",
        contactType: "customer support",
        availableLanguage: ["Portuguese", "English", "Spanish"],
        areaServed: "BR, US, ES, PT, MX, AR",
      },
      founder: {
        "@type": "Person",
        name: "ClipAI Team",
      },
      foundingDate: "2024",
      description:
        "ClipAI é uma plataforma de inteligência artificial que transforma vídeos longos em conteúdo curto viral para redes sociais.",
    },

    // Website
    {
      "@type": "WebSite",
      "@id": "https://clipai.com/#website",
      url: "https://clipai.com",
      name: "ClipAI",
      description: "Transforme vídeos em cortes virais com IA",
      publisher: {
        "@id": "https://clipai.com/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://clipai.com/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },

    // WebPage atual
    {
      "@type": "WebPage",
      "@id": "https://clipai.com/#webpage",
      url: "https://clipai.com",
      name: "ClipAI - Transforme Vídeos em Cortes Virais com IA",
      isPartOf: {
        "@id": "https://clipai.com/#website",
      },
      about: {
        "@id": "https://clipai.com/#organization",
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: "https://clipai.com/og-image.jpg",
      },
      description:
        "IA que analisa vídeos do YouTube e cria automaticamente Shorts, Reels e TikToks virais.",
      breadcrumb: {
        "@id": "https://clipai.com/#breadcrumb",
      },
      inLanguage: "pt-BR",
    },

    // Breadcrumb
    {
      "@type": "BreadcrumbList",
      "@id": "https://clipai.com/#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://clipai.com",
        },
      ],
    },

    // Software Application (App)
    {
      "@type": "SoftwareApplication",
      name: "ClipAI",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web, iOS, Android",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "BRL",
        description: "Plano gratuito disponível",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "1250",
        bestRating: "5",
        worstRating: "1",
      },
      featureList: [
        "Análise automática de vídeos com IA",
        "Corte automático para Shorts, Reels e TikTok",
        "Score de viralização",
        "Exportação em múltiplos formatos",
        "Integração com YouTube, Instagram e TikTok",
      ],
      screenshot: {
        "@type": "ImageObject",
        url: "https://clipai.com/screenshot-wide.jpg",
      },
      softwareVersion: "2.0",
      downloadUrl: "https://clipai.com/download",
      requirements: "Navegador moderno com suporte a JavaScript",
    },

    // Produto/Serviço
    {
      "@type": "Product",
      name: "ClipAI Pro",
      description:
        "Plano premium com análises ilimitadas, exportação 4K e recursos avançados de IA.",
      brand: {
        "@id": "https://clipai.com/#organization",
      },
      offers: {
        "@type": "Offer",
        url: "https://clipai.com/pricing",
        price: "49.90",
        priceCurrency: "BRL",
        priceValidUntil: "2025-12-31",
        availability: "https://schema.org/InStock",
        itemOffered: {
          "@type": "Service",
          name: "ClipAI Pro Subscription",
        },
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "856",
      },
    },

    // FAQ Page
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "O que é o ClipAI?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ClipAI é uma plataforma de inteligência artificial que analisa vídeos do YouTube e identifica automaticamente os melhores momentos para criar Shorts, Reels e vídeos para TikTok.",
          },
        },
        {
          "@type": "Question",
          name: "Como funciona a análise de vídeo?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Nossa IA utiliza processamento de linguagem natural e visão computacional para analisar o conteúdo do vídeo, detectar momentos de pico de engajamento, transcrições de fala e elementos visuais marcantes.",
          },
        },
        {
          "@type": "Question",
          name: "É gratuito usar o ClipAI?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sim! Oferecemos um plano gratuito que permite analisar até 3 vídeos por mês. Para uso ilimitado e recursos avançados, temos planos Pro a partir de R$ 49,90/mês.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({

  children,

}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      dir="ltr"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect para performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.clipai.com" />
        <link rel="dns-prefetch" href="https://cdn.clipai.com" />

        {/* Preload recursos críticos */}
        <link
          rel="preload"
          href="/android-chrome-192x192.png"
          as="image"
          type="image/png"
        />

        {/* Meta tags adicionais de segurança e performance */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ClipAI" />
        <meta name="application-name" content="ClipAI" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="theme-color" content="#030305" />

        {/* Segurança */}
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://analytics.clipai.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' https: blob:; connect-src 'self' https://api.clipai.com https://analytics.clipai.com; frame-src 'self' https://www.youtube.com https://youtube.com;" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />

        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* Analytics (exemplo com Google Analytics 4) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX', {
                page_title: document.title,
                page_location: window.location.href,
                send_page_view: true,
                cookie_flags: 'SameSite=None;Secure',
                custom_map: {'custom_parameter_1': 'user_type'}
              });
            `,
          }}
        />
      </head>

      <body
        className={`
          ${inter.className}
          antialiased
          bg-[#030305]
          text-white
          min-h-screen
          overflow-x-hidden
          selection:bg-purple-500/30
          selection:text-purple-200
        `}
      >
        {/* Skip Link para acessibilidade */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg"
        >
          Pular para conteúdo principal
        </a>

        {/* Container principal */}
        <AuthProvider>
          <div id="main-content" className="relative">
            {children}
          </div>
        </AuthProvider>

        {/* Service Worker registration (PWA) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}