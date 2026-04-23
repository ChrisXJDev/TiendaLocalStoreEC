'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  label?: string;
  href?: string;
}

export default function BackButton({ label = 'Volver', href }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) router.push(href);
    else router.back();
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-white transition-colors group"
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      <span className="w-7 h-7 rounded-lg flex items-center justify-center transition-all group-hover:bg-[var(--bg-elevated)]"
        style={{ border: '1px solid var(--border)' }}>
        <ArrowLeft size={14} />
      </span>
      {label}
    </button>
  );
}
