import { Metadata } from 'next';
import RoadmapTimeline from './components/RoadmapTimeline';

export const metadata: Metadata = {
  title: 'Roadmap - CampMan',
  description: 'Acompanhe o cronograma de implementações do CampMan',
};

export default function RoadmapPage() {
  return <RoadmapTimeline />;
}
