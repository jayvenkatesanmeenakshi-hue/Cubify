import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Star, Trophy, Crown, Medal, Target, Zap, Flame } from 'lucide-react';

export const getRankStyle = (rankName: string) => {
  if (rankName.startsWith('WOOD')) return {
    bg: 'bg-gradient-to-b from-[#8B5A2B] to-[#5C3A21]',
    text: 'text-[#E8D3C3]',
    border: 'border-[#A06B35]',
    shadow: 'shadow-[0_4px_10px_rgba(92,58,33,0.4)]',
    icon: 'text-[#C49A6C]'
  };
  if (rankName.startsWith('BRONZE')) return {
    bg: 'bg-gradient-to-b from-[#CD7F32] to-[#8B4513]',
    text: 'text-[#FFE4C4]',
    border: 'border-[#DAA520]',
    shadow: 'shadow-[0_4px_12px_rgba(205,127,50,0.5)]',
    icon: 'text-[#FFDAB9]'
  };
  if (rankName.startsWith('SILVER')) return {
    bg: 'bg-gradient-to-b from-[#E0E0E0] to-[#9E9E9E]',
    text: 'text-white',
    border: 'border-[#FFFFFF]',
    shadow: 'shadow-[0_4px_12px_rgba(158,158,158,0.5)]',
    icon: 'text-white'
  };
  if (rankName.startsWith('GOLD')) return {
    bg: 'bg-gradient-to-b from-[#FFD700] to-[#B8860B]',
    text: 'text-[#FFF8DC]',
    border: 'border-[#FFF8DC]',
    shadow: 'shadow-[0_4px_15px_rgba(255,215,0,0.6)]',
    icon: 'text-white'
  };
  if (rankName.startsWith('PLATINUM')) return {
    bg: 'bg-gradient-to-b from-[#00CED1] to-[#008B8B]',
    text: 'text-white',
    border: 'border-[#E0FFFF]',
    shadow: 'shadow-[0_4px_15px_rgba(0,206,209,0.6)]',
    icon: 'text-[#E0FFFF]'
  };
  if (rankName.startsWith('DIAMOND')) return {
    bg: 'bg-gradient-to-b from-[#9370DB] to-[#4B0082]',
    text: 'text-white',
    border: 'border-[#E6E6FA]',
    shadow: 'shadow-[0_4px_20px_rgba(147,112,219,0.7)]',
    icon: 'text-[#E6E6FA]'
  };
  if (rankName.startsWith('EXPERT')) return {
    bg: 'bg-gradient-to-b from-[#FF4500] to-[#8B0000]',
    text: 'text-white',
    border: 'border-[#FFA07A]',
    shadow: 'shadow-[0_4px_20px_rgba(255,69,0,0.7)]',
    icon: 'text-[#FFA07A]'
  };
  if (rankName.startsWith('MASTER')) return {
    bg: 'bg-gradient-to-b from-[#DC143C] via-[#FF0000] to-[#8B0000]',
    text: 'text-[#FFD700]',
    border: 'border-[#FFD700]',
    shadow: 'shadow-[0_0_25px_rgba(220,20,60,0.8)]',
    icon: 'text-[#FFD700]'
  };
  if (rankName.startsWith('GRANDMASTER')) return {
    bg: 'bg-gradient-to-b from-[#FF1493] via-[#FF4500] to-[#FFD700]',
    text: 'text-white',
    border: 'border-[#FFFFFF]',
    shadow: 'shadow-[0_0_30px_rgba(255,20,147,0.9)]',
    icon: 'text-white'
  };
  return {
    bg: 'bg-slate-500',
    text: 'text-white',
    border: 'border-slate-400',
    shadow: 'shadow-sm',
    icon: 'text-white'
  };
};

export const getRankIcon = (rankName: string, className?: string) => {
  if (rankName.startsWith('WOOD')) return <Shield className={className} />;
  if (rankName.startsWith('BRONZE')) return <ShieldAlert className={className} />;
  if (rankName.startsWith('SILVER')) return <ShieldCheck className={className} />;
  if (rankName.startsWith('GOLD')) return <Star className={className} />;
  if (rankName.startsWith('PLATINUM')) return <Target className={className} />;
  if (rankName.startsWith('DIAMOND')) return <Zap className={className} />;
  if (rankName.startsWith('EXPERT')) return <Flame className={className} />;
  if (rankName.startsWith('MASTER')) return <Trophy className={className} />;
  if (rankName.startsWith('GRANDMASTER')) return <Crown className={className} />;
  return <Shield className={className} />;
};

export const RankBadge = ({ rankName, size = 'md' }: { rankName: string, size?: 'sm' | 'md' | 'lg' }) => {
  const style = getRankStyle(rankName);
  const Icon = getRankIcon(rankName, `${style.icon} ${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`);
  
  const sizeClasses = {
    sm: 'text-[10px] px-2.5 py-0.5 gap-1 border',
    md: 'text-xs px-3.5 py-1 gap-1.5 border-[1.5px]',
    lg: 'text-sm px-5 py-1.5 gap-2 border-2'
  };

  return (
    <div className={`relative inline-flex items-center font-black tracking-wider uppercase rounded-sm skew-x-[-10deg] ${style.bg} ${style.border} ${style.shadow}`}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
      <div className={`relative flex items-center skew-x-[10deg] ${style.text} ${sizeClasses[size]}`}>
        {Icon}
        <span style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{rankName}</span>
      </div>
    </div>
  );
};
