export interface Gift {
  id: number;
  image: string;
  name: string;
  price: number;
  raised: number;
  total: number;
  category: string;
  description?: string;
}

export const MOCK_GIFTS: Gift[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
    name: 'Jogo de Panelas Premium',
    price: 890.0,
    raised: 445.0,
    total: 890.0,
    category: 'cozinha',
    description: 'Conjunto completo de panelas antiaderentes em aço inoxidável, com 12 peças incluindo tampas de vidro.',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
    name: 'Cafeteira Expresso',
    price: 1200.0,
    raised: 800.0,
    total: 1200.0,
    category: 'eletro',
    description: 'Cafeteira expresso automática com moedor integrado, permite preparar cappuccinos e lattes profissionais.',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800',
    name: 'Kit Toalhas de Banho',
    price: 320.0,
    raised: 320.0,
    total: 320.0,
    category: 'banho',
    description: 'Conjunto de 6 toalhas de banho em algodão egípcio, super macias e absorventes.',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    name: 'Liquidificador Profissional',
    price: 450.0,
    raised: 180.0,
    total: 450.0,
    category: 'eletro',
    description: 'Liquidificador de alta potência com 12 velocidades, perfeito para smoothies, sopas e receitas diversas.',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800',
    name: 'Jogo de Cama King',
    price: 580.0,
    raised: 290.0,
    total: 580.0,
    category: 'quarto',
    description: 'Jogo de lençol king 300 fios em percal, inclui lençol de elástico, lençol de cima e 4 fronhas.',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
    name: 'Aspirador Robô',
    price: 1800.0,
    raised: 600.0,
    total: 1800.0,
    category: 'eletro',
    description: 'Aspirador robô inteligente com mapeamento, programação via app e função de limpeza úmida.',
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1565183928294-7d22f5a16f79?w=800',
    name: 'Jogo de Taças',
    price: 280.0,
    raised: 0,
    total: 280.0,
    category: 'cozinha',
    description: 'Conjunto de 12 taças de cristal, sendo 6 para vinho tinto e 6 para vinho branco.',
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
    name: 'Mixer Planetário',
    price: 950.0,
    raised: 475.0,
    total: 950.0,
    category: 'eletro',
    description: 'Batedeira planetária profissional com 3 batedores, bowl de 5L e 12 velocidades.',
  },
  {
    id: 9,
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800',
    name: 'Conjunto de Facas',
    price: 420.0,
    raised: 0,
    total: 420.0,
    category: 'cozinha',
    description: 'Kit profissional com 8 facas em aço inoxidável, incluindo faca do chef, serra, desossa e cepo de madeira.',
  },
];
