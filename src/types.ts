export type Language = 'en' | 'bn';

export type PlanetId = 'moon' | 'mars';

export interface RelicComponent {
  id: string;
  name: string;
  nameBn: string;
  category: 'sensor' | 'power' | 'mobility' | 'comm' | 'brain';
  description: string;
  descriptionBn: string;
  kidMetaphor: string;
  kidMetaphorBn: string;
  position3D: [number, number, number];
  color: string;
}

export interface RelicData {
  id: string;
  name: string;
  nameBn: string;
  codeName: string;
  planet: PlanetId;
  landingDate: string;
  landingDateBn: string;
  status: string;
  statusBn: string;
  activeDuration: string;
  activeDurationBn: string;
  coordinates: string;
  locationName: string;
  locationNameBn: string;
  tagline: string;
  taglineBn: string;
  fairyTaleIntro: string;
  fairyTaleIntroBn: string;
  heroicStory: string;
  heroicStoryBn: string;
  finalMessage: string;
  finalMessageBn: string;
  badgeTitle: string;
  badgeTitleBn: string;
  badgeIcon: string;
  audioTrackId: string;
  audioTrackName: string;
  audioTrackDescription: string;
  audioTrackDescriptionBn: string;
  galleryImages: {
    title: string;
    titleBn: string;
    description: string;
    descriptionBn: string;
    credit: string;
    category: string;
  }[];
  components: RelicComponent[];
  suggestedQuestions: {
    en: string;
    bn: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'relic' | 'system';
  text: string;
  timestamp: number;
}
