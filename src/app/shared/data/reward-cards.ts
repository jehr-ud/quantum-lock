import { Reward } from '../../models/reward';
import { RewardRarity } from '../../core/enums/reward-rarity';

export const REWARD_CARDS: Reward[] = [

  // ==========================
  // COMMON (20)
  // ==========================

  {
    id: 'sp-001',
    title: 'Spider-Man',
    emoji: '🕷️',
    description: 'El amistoso héroe del vecindario.',
    rarity: RewardRarity.COMMON
  },
  {
    id: 'sp-002',
    title: 'Peter Parker',
    emoji: '📸',
    description: 'Fotógrafo, científico y héroe.',
    rarity: RewardRarity.COMMON
  },
  {
    id: 'sp-003',
    title: 'Miles Morales',
    emoji: '⚡',
    description: 'El nuevo Spider-Man de Brooklyn.',
    rarity: RewardRarity.COMMON
  },
  {
    id: 'sp-004',
    title: 'Spider-Gwen',
    emoji: '🥁',
    description: 'Heroína de otra dimensión.',
    rarity: RewardRarity.COMMON
  },
  {
    id: 'sp-005',
    title: 'May Parker',
    emoji: '❤️',
    description: 'Siempre inspira a hacer lo correcto.',
    rarity: RewardRarity.COMMON
  },
  {
    id: 'sp-006',
    title: 'Mary Jane Watson',
    emoji: '🌹',
    description: 'La gran compañera de Peter.',
    rarity: RewardRarity.COMMON
  },
  {
    id: 'sp-007',
    title: 'Daily Bugle',
    emoji: '📰',
    description: 'El periódico más famoso de Nueva York.',
    rarity: RewardRarity.COMMON
  },
  {
    id: 'sp-008',
    title: 'Spider-Sense',
    emoji: '✨',
    description: 'Detecta el peligro antes de que ocurra.',
    rarity: RewardRarity.COMMON
  },
  {
    id: 'sp-009',
    title: 'Web Shooter',
    emoji: '🧪',
    description: 'El lanzatelarañas creado por Peter.',
    rarity: RewardRarity.COMMON
  },
  {
    id: 'sp-010',
    title: 'Queens',
    emoji: '🏙️',
    description: 'El hogar del héroe arácnido.',
    rarity: RewardRarity.COMMON
  },
  {
    id: 'sp-011',
    title: 'Máscara',
    emoji: '🎭',
    description: 'Oculta la identidad del héroe.',
    rarity: RewardRarity.COMMON
  },
  {
    id: 'sp-012',
    title: 'Traje Clásico',
    emoji: '🟥',
    description: 'El traje rojo y azul más famoso.',
    rarity: RewardRarity.COMMON
  },
  {
    id: 'sp-013',
    title: 'Telaraña',
    emoji: '🕸️',
    description: 'La herramienta más característica del héroe.',
    rarity: RewardRarity.COMMON
  },
  {
    id: 'sp-014',
    title: 'Oscorp',
    emoji: '🏢',
    description: 'La empresa de Norman Osborn.',
    rarity: RewardRarity.COMMON
  },
  {
    id: 'sp-015',
    title: 'Laboratorio',
    emoji: '🔬',
    description: 'Donde nacen grandes inventos.',
    rarity: RewardRarity.COMMON
  },
  {
    id: 'sp-016',
    title: 'Universidad',
    emoji: '🎓',
    description: 'Peter siempre busca aprender.',
    rarity: RewardRarity.COMMON
  },
  {
    id: 'sp-017',
    title: 'Balanceo',
    emoji: '🏗️',
    description: 'Viajar entre edificios nunca fue tan divertido.',
    rarity: RewardRarity.COMMON
  },
  {
    id: 'sp-018',
    title: 'Responsabilidad',
    emoji: '⚖️',
    description: 'Todo poder implica responsabilidad.',
    rarity: RewardRarity.COMMON
  },
  {
    id: 'sp-019',
    title: 'Amistad',
    emoji: '🤝',
    description: 'Los héroes nunca luchan solos.',
    rarity: RewardRarity.COMMON
  },
  {
    id: 'sp-020',
    title: 'Vecindario',
    emoji: '🏘️',
    description: 'Siempre dispuesto a ayudar.',
    rarity: RewardRarity.COMMON
  },

  // ==========================
  // RARE (15)
  // ==========================

  {
    id: 'sp-021',
    title: 'Venom',
    emoji: '🖤',
    description: 'El simbionte más famoso.',
    rarity: RewardRarity.RARE
  },
  {
    id: 'sp-022',
    title: 'Carnage',
    emoji: '🩸',
    description: 'Caos y destrucción.',
    rarity: RewardRarity.RARE
  },
  {
    id: 'sp-023',
    title: 'Green Goblin',
    emoji: '🎃',
    description: 'El enemigo más icónico.',
    rarity: RewardRarity.RARE
  },
  {
    id: 'sp-024',
    title: 'Doctor Octopus',
    emoji: '🐙',
    description: 'Genio con cuatro brazos mecánicos.',
    rarity: RewardRarity.RARE
  },
  {
    id: 'sp-025',
    title: 'Electro',
    emoji: '⚡',
    description: 'Control absoluto de la electricidad.',
    rarity: RewardRarity.RARE
  },
  {
    id: 'sp-026',
    title: 'Sandman',
    emoji: '🏜️',
    description: 'Puede convertirse en arena.',
    rarity: RewardRarity.RARE
  },
  {
    id: 'sp-027',
    title: 'Lizard',
    emoji: '🦎',
    description: 'El científico convertido en reptil.',
    rarity: RewardRarity.RARE
  },
  {
    id: 'sp-028',
    title: 'Rhino',
    emoji: '🦏',
    description: 'Fuerza imparable.',
    rarity: RewardRarity.RARE
  },
  {
    id: 'sp-029',
    title: 'Mysterio',
    emoji: '🎩',
    description: 'Maestro de las ilusiones.',
    rarity: RewardRarity.RARE
  },
  {
    id: 'sp-030',
    title: 'Vulture',
    emoji: '🪽',
    description: 'Domina los cielos.',
    rarity: RewardRarity.RARE
  },
  {
    id: 'sp-031',
    title: 'Scorpion',
    emoji: '🦂',
    description: 'Un rival muy peligroso.',
    rarity: RewardRarity.RARE
  },
  {
    id: 'sp-032',
    title: 'Shocker',
    emoji: '💥',
    description: 'Guanteletes de energía devastadores.',
    rarity: RewardRarity.RARE
  },
  {
    id: 'sp-033',
    title: 'Black Cat',
    emoji: '🐈‍⬛',
    description: 'Aliada y ladrona experta.',
    rarity: RewardRarity.RARE
  },
  {
    id: 'sp-034',
    title: 'Kraven',
    emoji: '🦁',
    description: 'El cazador definitivo.',
    rarity: RewardRarity.RARE
  },
  {
    id: 'sp-035',
    title: 'Silk',
    emoji: '🕸️',
    description: 'Otra heroína con poderes arácnidos.',
    rarity: RewardRarity.RARE
  },

  // ==========================
  // EPIC (10)
  // ==========================

  {
    id: 'sp-036',
    title: 'Spider-Man 2099',
    emoji: '🔷',
    description: 'El héroe del futuro.',
    rarity: RewardRarity.EPIC
  },
  {
    id: 'sp-037',
    title: 'Spider-Man Noir',
    emoji: '🕶️',
    description: 'El vigilante del pasado.',
    rarity: RewardRarity.EPIC
  },
  {
    id: 'sp-038',
    title: 'Spider-Ham',
    emoji: '🐷',
    description: 'La versión más divertida.',
    rarity: RewardRarity.EPIC
  },
  {
    id: 'sp-039',
    title: 'Peni Parker',
    emoji: '🤖',
    description: 'Piloto del robot SP//dr.',
    rarity: RewardRarity.EPIC
  },
  {
    id: 'sp-040',
    title: 'Spider-Man India',
    emoji: '🪷',
    description: 'Protector de Mumbattan.',
    rarity: RewardRarity.EPIC
  },
  {
    id: 'sp-041',
    title: 'Spider-Woman',
    emoji: '🕷️',
    description: 'Heroína legendaria.',
    rarity: RewardRarity.EPIC
  },
  {
    id: 'sp-042',
    title: 'Scarlet Spider',
    emoji: '🧣',
    description: 'El clon más famoso.',
    rarity: RewardRarity.EPIC
  },
  {
    id: 'sp-043',
    title: 'Superior Spider-Man',
    emoji: '🧠',
    description: 'Una versión muy diferente del héroe.',
    rarity: RewardRarity.EPIC
  },
  {
    id: 'sp-044',
    title: 'Spider-Verse',
    emoji: '🌌',
    description: 'Todos los universos conectados.',
    rarity: RewardRarity.EPIC
  },
  {
    id: 'sp-045',
    title: 'The Spot',
    emoji: '⚪',
    description: 'Controla portales dimensionales.',
    rarity: RewardRarity.EPIC
  },

  // ==========================
  // LEGENDARY (5)
  // ==========================

  {
    id: 'sp-046',
    title: 'Miguel O’Hara',
    emoji: '🕸️',
    description: 'Líder de la Spider Society.',
    rarity: RewardRarity.LEGENDARY
  },
  {
    id: 'sp-047',
    title: 'Spider Society',
    emoji: '🛡️',
    description: 'Guardianes del multiverso.',
    rarity: RewardRarity.LEGENDARY
  },
  {
    id: 'sp-048',
    title: 'Madame Web',
    emoji: '🔮',
    description: 'Conecta todos los universos arácnidos.',
    rarity: RewardRarity.LEGENDARY
  },
  {
    id: 'sp-049',
    title: 'Kingpin',
    emoji: '👔',
    description: 'El cerebro criminal del multiverso.',
    rarity: RewardRarity.LEGENDARY
  },
  {
    id: 'sp-050',
    title: 'Spider-Verse Finale',
    emoji: '🌠',
    description: 'La batalla definitiva entre todos los Spider-Man.',
    rarity: RewardRarity.LEGENDARY
  }

];