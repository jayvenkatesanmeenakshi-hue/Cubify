export const RANKS = [
  { name: 'WOOD I', minPoints: 0 },
  { name: 'WOOD II', minPoints: 10 },
  { name: 'BRONZE I', minPoints: 40 },
  { name: 'BRONZE II', minPoints: 90 },
  { name: 'BRONZE III', minPoints: 150 },
  { name: 'SILVER I', minPoints: 220 },
  { name: 'SILVER II', minPoints: 300 },
  { name: 'SILVER III', minPoints: 390 },
  { name: 'GOLD I', minPoints: 490 },
  { name: 'GOLD II', minPoints: 600 },
  { name: 'GOLD III', minPoints: 720 },
  { name: 'PLATINUM I', minPoints: 850 },
  { name: 'PLATINUM II', minPoints: 990 },
  { name: 'PLATINUM III', minPoints: 1140 },
  { name: 'DIAMOND I', minPoints: 1300 },
  { name: 'DIAMOND II', minPoints: 1470 },
  { name: 'DIAMOND III', minPoints: 1650 },
  { name: 'DIAMOND IV', minPoints: 1840 },
  { name: 'EXPERT I', minPoints: 2040 },
  { name: 'EXPERT II', minPoints: 2250 },
  { name: 'EXPERT III', minPoints: 2470 },
  { name: 'EXPERT IV', minPoints: 2700 },
  { name: 'MASTER I', minPoints: 2940 },
  { name: 'MASTER II', minPoints: 3190 },
  { name: 'MASTER III', minPoints: 3450 },
  { name: 'MASTER IV', minPoints: 3720 },
  { name: 'MASTER V', minPoints: 4000 },
  { name: 'GRANDMASTER', minPoints: 4300 }
];

export const getRankFromPoints = (points: number) => {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (points >= RANKS[i].minPoints) {
      return RANKS[i];
    }
  }
  return RANKS[0];
};

export const getNextRank = (points: number) => {
  for (let i = 0; i < RANKS.length; i++) {
    if (points < RANKS[i].minPoints) {
      return RANKS[i];
    }
  }
  return null;
};
