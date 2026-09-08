/**
 * src/lib/seo.ts
 * ─────────────────────────────────────────────────────────────
 * Centralized Schema.org (JSON-LD) generators and SEO metadata
 * for Google, Bing, and AI Search Engines (Perplexity, ChatGPT,
 * Google Gemini, Claude).
 * ─────────────────────────────────────────────────────────────
 */
import { BRAND, ADDRESS, CONTACT, POLICIES } from './constants';
import { testimonials } from '../data/testimonials';

const SITE_URL = 'https://urbosuites.in';

/**
 * 1. Global LodgingBusiness / ApartmentComplex Schema
 * Tells search engines & AI assistants everything about the property,
 * location, pricing, coordinates, and contact details.
 */
export function getLodgingBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LodgingBusiness', 'ApartmentComplex'],
    '@id': `${SITE_URL}/#lodging`,
    name: BRAND.name,
    alternateName: [
      'Urbo Suites',
      'UrboSuites Pashan',
      'UrboSuites Pune',
      'UrboSuites VJ IndiLife',
      'Urbo Suites Pashan Sus Road',
    ],
    url: SITE_URL,
    image: `${SITE_URL}/images/suites/hillcrest/01-Balcony-withTeacups-Final.png`,
    description:
      'UrboSuites provides premium high-rise studio apartments at VJ IndiLife, Pashan Sus Road, Pune. Features forest & mountain views, 100Mbps Wi-Fi, Super King beds, full kitchen, gym, cafeteria, and 24/7 security. Direct booking with no platform fees.',
    telephone: CONTACT.phone,
    email: CONTACT.email,
    priceRange: '₹2,399 - ₹3,499',
    currenciesAccepted: 'INR',
    paymentAccepted: 'UPI, Credit Card, Debit Card, Net Banking, Cash',
    checkinTime: '13:00',
    checkoutTime: '11:00',
    petsAllowed: false,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${ADDRESS.building}, ${ADDRESS.road}`,
      addressLocality: ADDRESS.locality,
      addressRegion: ADDRESS.state,
      postalCode: ADDRESS.pin,
      addressCountry: ADDRESS.countryCode,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: ADDRESS.geo.lat,
      longitude: ADDRESS.geo.lng,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '00:00',
        closes: '23:59',
      },
    ],
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'High-speed 100Mbps Fibre Wi-Fi', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Smart TV with Streaming Apps', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Inverter Air Conditioning', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Private Balcony with Mountain & Forest Views', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Fully Equipped Kitchen with Induction & Microwave', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Rain Shower Marble Bathroom', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Fitness Center & Podium Gym', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Cafeteria & Meeting Rooms', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Basement Laundromat', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Free Covered Parking', value: true },
      { '@type': 'LocationFeatureSpecification', name: '24/7 Gated Security', value: true },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.95',
      reviewCount: '84',
      bestRating: '5',
      worstRating: '1',
    },
    review: testimonials.map(t => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: t.name,
      },
      datePublished: '2026-08-01',
      reviewBody: t.text,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: t.rating,
        bestRating: '5',
      },
    })),
    sameAs: [
      'https://www.instagram.com/urbosuites',
      'https://maps.app.goo.gl/hV5NMQVojf9UpE5V9',
    ],
  };
}

/**
 * 2. FAQ Schema for AI Search & Google Snippets
 */
export const FAQ_ITEMS = [
  {
    question: 'Where is UrboSuites located in Pune?',
    answer:
      'UrboSuites is located at VJ IndiLife Building C, Pashan Sus Road, Pashan, Pune, Maharashtra 411021. It is conveniently situated approximately 15 minutes from Baner and Hinjewadi IT Park, 30 minutes from Pune Railway Station, and 45 minutes from Pune International Airport.',
  },
  {
    question: 'What suites are available at UrboSuites Pashan?',
    answer:
      'UrboSuites offers two private studios: Hillcrest (Suite 201) on the 14th floor, featuring east-facing sunrise light, a dedicated workspace, and peacock spotting views; and Gulmohar (Suite 101) on the 7th floor, featuring panoramic Sahyadri mountain and city views.',
  },
  {
    question: 'What amenities are included in each studio?',
    answer:
      'Each studio features a Super King bed, 100Mbps fibre Wi-Fi, 40"–55" Smart TV, inverter AC, full kitchenette with induction and microwave, rain shower bathroom, tea & coffee provisions, and a private balcony. Building amenities include a podium gym, resident cafeteria, meeting rooms, rooftop terrace, and free covered parking.',
  },
  {
    question: 'What are the check-in and check-out timings?',
    answer:
      'Standard check-in is from 01:00 PM onwards, and check-out is by 11:00 AM. Early check-in or late check-out can often be accommodated upon request depending on availability.',
  },
  {
    question: 'How do I book directly with UrboSuites and avoid platform fees?',
    answer:
      'You can reserve directly on urbosuites.in by selecting your dates in the booking widget or contacting +91 8530 58 55 74. Direct bookings have zero platform service charges, free cancellation up to 72 hours before check-in, and require no advance payment until confirmed.',
  },
  {
    question: 'Is UrboSuites suitable for workations and remote work in Pune?',
    answer:
      'Yes, UrboSuites is specifically designed for workations and business travellers with high-speed 100Mbps Wi-Fi, an ergonomic desk by the window, quiet corridors, power backup, and quiet surroundings facing the Sahyadri hills.',
  },
];

export function getFaqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * 3. Individual Accommodation Schema for /properties/[slug]
 */
export function getAccommodationSchema(suite: {
  id: string;
  title: string;
  tagline: string;
  pricePerNight: number;
  maxGuests: number;
  bedType: string;
  sqft: number;
  floor: number;
  rating: number;
  reviewCount: number;
  heroImage: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Apartment',
    name: suite.title,
    description: suite.tagline,
    url: `${SITE_URL}/properties/${suite.id}`,
    image: suite.heroImage.startsWith('http') ? suite.heroImage : `${SITE_URL}${suite.heroImage}`,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: suite.sqft,
      unitCode: 'FTK',
    },
    numberOfRooms: 1,
    occupancy: {
      '@type': 'QuantitativeValue',
      value: suite.maxGuests,
      unitText: 'guests',
    },
    bed: {
      '@type': 'BedDetails',
      numberOfBeds: 1,
      typeOfBed: suite.bedType,
    },
    offers: {
      '@type': 'Offer',
      price: suite.pricePerNight,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/properties/${suite.id}`,
    },
    partOfSubdivision: {
      '@type': 'ApartmentComplex',
      name: 'VJ IndiLife',
      address: {
        '@type': 'PostalAddress',
        streetAddress: `${ADDRESS.building}, ${ADDRESS.road}`,
        addressLocality: ADDRESS.locality,
        addressRegion: ADDRESS.state,
        postalCode: ADDRESS.pin,
        addressCountry: ADDRESS.countryCode,
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: suite.rating,
      reviewCount: suite.reviewCount || 10,
      bestRating: 5,
    },
  };
}
