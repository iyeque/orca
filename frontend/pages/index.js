import Link from 'next/link';

export default function Home() {
  return (
    <div style={{padding: 32}}>
      <h1>Welcome to ORCA SCM MVP</h1>
      <Link href="/Dashboard">Go to Dashboard</Link>
    </div>
  );
} 