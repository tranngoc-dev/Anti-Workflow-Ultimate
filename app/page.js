import QAHomeClient from './components/QAHomeClient';

// Refresh page data every 5 minutes (ISR)
export const revalidate = 300;

export default function HomePage() {
  return <QAHomeClient />;
}
