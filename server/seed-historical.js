// Seed major historical Wikimedia events (Wikimania, global campaigns, hackathons, summits)
// into the database so the "Past Events" archive is immediately populated and useful.

import prisma from './db.js';
import { createHash } from 'crypto';

function getEventHash(rawIdOrLink) {
  return createHash('sha256').update(String(rawIdOrLink)).digest('hex');
}

function slugify(name, href = '') {
  let base = (name || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
  if (!base) base = 'event';
  let hash = 0;
  for (let i = 0; i < href.length; i++) {
    hash = ((hash << 5) - hash) + href.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(36).slice(0, 4);
  return `${base}-${hex}`;
}

export const HISTORICAL_EVENTS = [
  // --- Wikimania Editions ---
  {
    name: 'Wikimania 2026',
    link: 'https://wikimania.wikimedia.org/wiki/2026',
    time: '2026-08-05T09:00:00Z',
    endTime: '2026-08-09T18:00:00Z',
    region: 'Europe',
    country: 'France',
    timeZone: 'UTC+02:00',
    type: 'event',
    organizers: 'Wikimedia France & Core Organizing Team',
    topics: 'Wikimania, Community, Strategy'
  },
  {
    name: 'Wikimania 2025',
    link: 'https://wikimania.wikimedia.org/wiki/2025',
    time: '2025-08-06T09:00:00Z',
    endTime: '2025-08-09T18:00:00Z',
    region: 'Europe',
    country: 'Poland',
    timeZone: 'UTC+02:00',
    type: 'event',
    organizers: 'Wikimedia Poland & COT',
    topics: 'Wikimania, Community'
  },
  {
    name: 'Wikimania 2024 (Katowice)',
    link: 'https://wikimania.wikimedia.org/wiki/2024',
    time: '2024-08-07T08:00:00Z',
    endTime: '2024-08-10T18:00:00Z',
    region: 'Europe',
    country: 'Poland',
    timeZone: 'UTC+02:00',
    type: 'event',
    organizers: 'Wikimedia CEE & WMF',
    topics: 'Wikimania, Collaboration'
  },
  {
    name: 'Wikimania 2023 (Singapore)',
    link: 'https://wikimania.wikimedia.org/wiki/2023',
    time: '2023-08-16T08:00:00Z',
    endTime: '2023-08-19T18:00:00Z',
    region: 'Asia',
    country: 'Singapore',
    timeZone: 'UTC+08:00',
    type: 'event',
    organizers: 'ESEAP Community & WMF',
    topics: 'Wikimania, Diversity, Collaboration'
  },
  {
    name: 'Wikimania 2022 (Virtual)',
    link: 'https://wikimania.wikimedia.org/wiki/2022',
    time: '2022-08-11T11:00:00Z',
    endTime: '2022-08-14T22:00:00Z',
    region: 'Global',
    country: 'Online',
    timeZone: 'UTC+00:00',
    type: 'event',
    organizers: 'Core Organizing Team',
    topics: 'Wikimania, Virtual Edition'
  },

  // --- Hackathons & Tech Conferences ---
  {
    name: 'Wikimedia Hackathon 2026',
    link: 'https://www.mediawiki.org/wiki/Wikimedia_Hackathon_2026',
    time: '2026-05-08T09:00:00Z',
    endTime: '2026-05-10T18:00:00Z',
    region: 'Global',
    country: 'Hybrid / Online',
    timeZone: 'UTC+02:00',
    type: 'event',
    organizers: 'Wikimedia Technology & Community',
    topics: 'Technology, MediaWiki, Toolforge'
  },
  {
    name: 'Wikimedia Hackathon 2025',
    link: 'https://www.mediawiki.org/wiki/Wikimedia_Hackathon_2025',
    time: '2025-05-02T09:00:00Z',
    endTime: '2025-05-04T18:00:00Z',
    region: 'Europe',
    country: 'Turkey',
    timeZone: 'UTC+03:00',
    type: 'event',
    organizers: 'Wikimedia Turkey & WMF',
    topics: 'Technology, Developers, MediaWiki'
  },
  {
    name: 'Wikimedia Hackathon 2024 (Tallinn)',
    link: 'https://www.mediawiki.org/wiki/Wikimedia_Hackathon_2024',
    time: '2024-05-03T09:00:00Z',
    endTime: '2024-05-05T18:00:00Z',
    region: 'Europe',
    country: 'Estonia',
    timeZone: 'UTC+03:00',
    type: 'event',
    organizers: 'Wikimedia Eesti & WMF Tech',
    topics: 'Technology, Code, API'
  },

  // --- Summits & Governance ---
  {
    name: 'Wikimedia Summit 2024',
    link: 'https://meta.wikimedia.org/wiki/Wikimedia_Summit_2024',
    time: '2024-04-19T09:00:00Z',
    endTime: '2024-04-21T18:00:00Z',
    region: 'Europe',
    country: 'Germany',
    timeZone: 'UTC+02:00',
    type: 'event',
    organizers: 'Wikimedia Deutschland & WMF',
    topics: 'Movement Strategy, Governance'
  },
  {
    name: 'Wikimedia Summit 2022',
    link: 'https://meta.wikimedia.org/wiki/Wikimedia_Summit_2022',
    time: '2022-09-09T09:00:00Z',
    endTime: '2022-09-11T18:00:00Z',
    region: 'Europe',
    country: 'Germany',
    timeZone: 'UTC+02:00',
    type: 'event',
    organizers: 'Wikimedia Deutschland',
    topics: 'Strategy 2030, Affiliates'
  },

  // --- Major Global Photo & Content Campaigns ---
  {
    name: 'Wiki Loves Monuments 2025',
    link: 'https://meta.wikimedia.org/wiki/Wiki_Loves_Monuments_2025',
    time: '2025-09-01T00:00:00Z',
    endTime: '2025-10-31T23:59:59Z',
    region: 'Global',
    country: 'Worldwide',
    timeZone: 'UTC+00:00',
    type: 'event',
    organizers: 'International WLM Team',
    topics: 'Photography, Heritage, Cultural Monuments'
  },
  {
    name: 'Wiki Loves Earth 2025',
    link: 'https://commons.wikimedia.org/wiki/Commons:Wiki_Loves_Earth_2025',
    time: '2025-05-01T00:00:00Z',
    endTime: '2025-07-31T23:59:59Z',
    region: 'Global',
    country: 'Worldwide',
    timeZone: 'UTC+00:00',
    type: 'event',
    organizers: 'International WLE Team',
    topics: 'Nature, Protected Areas, Photography'
  },
  {
    name: 'Wiki Loves Africa 2025',
    link: 'https://commons.wikimedia.org/wiki/Commons:Wiki_Loves_Africa_2025',
    time: '2025-03-01T00:00:00Z',
    endTime: '2025-04-30T23:59:59Z',
    region: 'Africa',
    country: 'Africa',
    timeZone: 'UTC+00:00',
    type: 'event',
    organizers: 'Wiki In Africa',
    topics: 'Africa, Culture, Photography'
  },
  {
    name: 'Art+Feminism 2025 Campaign',
    link: 'https://meta.wikimedia.org/wiki/Art%2BFeminism/2025',
    time: '2025-03-01T00:00:00Z',
    endTime: '2025-03-31T23:59:59Z',
    region: 'Global',
    country: 'Worldwide',
    timeZone: 'UTC+00:00',
    type: 'event',
    organizers: 'Art+Feminism Leadership Collective',
    topics: 'Gender Gap, Art, Feminism'
  },
  {
    name: '1Lib1Ref January 2025',
    link: 'https://meta.wikimedia.org/wiki/1Lib1Ref/2025',
    time: '2025-01-15T00:00:00Z',
    endTime: '2025-02-05T23:59:59Z',
    region: 'Global',
    country: 'Online',
    timeZone: 'UTC+00:00',
    type: 'event',
    organizers: 'The Wikipedia Library Team',
    topics: 'Citations, Libraries, Verification'
  },

  // --- Regional Conferences ---
  {
    name: 'GLAM Wiki Conference 2023 (Montevideo)',
    link: 'https://meta.wikimedia.org/wiki/GLAM_Wiki_Conference_2023',
    time: '2023-11-16T09:00:00Z',
    endTime: '2023-11-18T18:00:00Z',
    region: 'Latin America',
    country: 'Uruguay',
    timeZone: 'UTC-03:00',
    type: 'event',
    organizers: 'Wikimedia Uruguay & WMF',
    topics: 'GLAM, Cultural Heritage, Open Access'
  },
  {
    name: 'WikiWomen Camp 2023 (New Delhi)',
    link: 'https://meta.wikimedia.org/wiki/WikiWomen_Camp_2023',
    time: '2023-10-20T09:00:00Z',
    endTime: '2023-10-22T18:00:00Z',
    region: 'Asia',
    country: 'India',
    timeZone: 'UTC+05:30',
    type: 'event',
    organizers: 'WikiWomen Community & WMF',
    topics: 'Gender Diversity, Leadership'
  },
  {
    name: 'Celtic Knot Conference 2024 (Waterford)',
    link: 'https://meta.wikimedia.org/wiki/Celtic_Knot_Conference_2024',
    time: '2024-09-25T09:00:00Z',
    endTime: '2024-09-27T18:00:00Z',
    region: 'Europe',
    country: 'Ireland',
    timeZone: 'UTC+01:00',
    type: 'event',
    organizers: 'Wikimedia Community Ireland',
    topics: 'Indigenous & Minority Languages'
  },
  {
    name: 'Wiki Indaba 2024 (Dakar)',
    link: 'https://meta.wikimedia.org/wiki/Wiki_Indaba_2024',
    time: '2024-10-04T09:00:00Z',
    endTime: '2024-10-06T18:00:00Z',
    region: 'Africa',
    country: 'Senegal',
    timeZone: 'UTC+00:00',
    type: 'event',
    organizers: 'Wikimedians of Senegal & Africa Region',
    topics: 'African Community, Collaboration'
  }
];

export async function seedHistoricalEvents() {
  console.log(`Seeding ${HISTORICAL_EVENTS.length} historical Wikimedia events...`);
  for (const event of HISTORICAL_EVENTS) {
    const rawId = event.link.replace(/^https?:\/\//, '');
    const metaHash = getEventHash(rawId);
    const slug = slugify(event.name, event.link);

    await prisma.timer.upsert({
      where: { metaId: metaHash },
      update: {
        name: event.name,
        link: event.link,
        time: new Date(event.time),
        endTime: event.endTime ? new Date(event.endTime) : null,
        region: event.region || 'Global',
        country: event.country || 'Online',
        timeZone: event.timeZone || 'UTC',
        organizers: event.organizers || null,
        topics: event.topics || null,
        slug,
        isCancelled: false
      },
      create: {
        type: event.type || 'event',
        name: event.name,
        link: event.link,
        time: new Date(event.time),
        endTime: event.endTime ? new Date(event.endTime) : null,
        region: event.region || 'Global',
        country: event.country || 'Online',
        timeZone: event.timeZone || 'UTC',
        organizers: event.organizers || null,
        topics: event.topics || null,
        slug,
        isMeta: true,
        metaId: metaHash,
        isCancelled: false
      }
    });
  }
  console.log('Historical events seeding complete!');
}

if (process.argv[1] && process.argv[1].endsWith('seed-historical.js')) {
  seedHistoricalEvents()
    .then(() => prisma.$disconnect())
    .catch((err) => {
      console.error(err);
      prisma.$disconnect();
      process.exit(1);
    });
}
