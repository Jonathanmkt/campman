import { Metadata } from 'next';
import RoadmapTimeline from './components/RoadmapTimeline';

export const metadata: Metadata = {
  title: 'Roadmap - Idealis Core',
  description: 'Acompanhe o cronograma de implementações do Idealis Core',
};

export default function RoadmapPage() {
  return <RoadmapTimeline />;
}
