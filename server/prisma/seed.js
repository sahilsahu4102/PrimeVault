import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database with realistic Crypto Assets...');

  // 1. Create a centralized test admin
  const adminPassword = await bcrypt.hash('Admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@primevault.ai' },
    update: {},
    create: {
      name: 'Operations Manager',
      email: 'admin@primevault.ai',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin account initialized: ${admin.email}`);

  // 2. Generate 10 realistic users
  const usersPromises = Array.from({ length: 10 }).map(async () => {
    return prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email({ provider: 'primevault.ai' }),
        password: await bcrypt.hash('User1234', 12),
        role: 'USER',
        createdAt: faker.date.past({ years: 1 }),
      },
    });
  });

  const createdUsers = await Promise.all(usersPromises);
  console.log(`✅ ${createdUsers.length} realistic users generated.`);

  const assetOwners = [admin, ...createdUsers];

  // 3. Generate 65 realistic Crypto Assets
  const categories = ['Layer 1', 'Layer 2', 'DeFi', 'NFTs', 'Meme Coins', 'Stablecoins'];
  const cryptoNames = {
    'Layer 1': ['Ethereum', 'Solana', 'Avalanche', 'Cardano', 'Polkadot', 'Near Protocol'],
    'Layer 2': ['Polygon', 'Arbitrum', 'Optimism', 'Base', 'Starknet'],
    'DeFi': ['Uniswap', 'Aave', 'Maker', 'Curve DAO', 'Lido DAO'],
    'NFTs': ['ApeCoin', 'Blur', 'LooksRare', 'Immutable'],
    'Meme Coins': ['Dogecoin', 'Shiba Inu', 'Pepe', 'Bonk', 'Floki'],
    'Stablecoins': ['USDT', 'USDC', 'DAI', 'FDUSD', 'TUSD']
  };

  const assetsToCreate = Array.from({ length: 65 }).map(() => {
    const category = faker.helpers.arrayElement(categories);
    const baseName = faker.helpers.arrayElement(cryptoNames[category]);
    
    // Create variations like "Wrapped X" or "X Staking Pool"
    const prefix = faker.helpers.arrayElement(['', '', 'Wrapped ', 'Staked ']);
    const suffix = faker.helpers.arrayElement(['', '', ' Liquidity Pool', ' Protocol', ' Network']);
    const name = `${prefix}${baseName}${suffix}`.trim();

    const volumeStatus = faker.number.int({ min: 1, max: 10 });
    const volume = volumeStatus > 8 ? 0 : parseFloat(faker.finance.amount({ min: 1000, max: 5000000 }));
    const isActive = volume > 0;
    const owner = faker.helpers.arrayElement(assetOwners);

    return {
      name,
      description: `Institutional grade yield optimization portfolio for ${baseName} network operations.`,
      volume,
      category,
      stock: faker.number.int({ min: 10, max: 10000 }), // Used as total token supply marker
      isActive,
      userId: owner.id,
      createdAt: faker.date.between({ from: owner.createdAt, to: new Date() }),
    };
  });

  await prisma.asset.createMany({
    data: assetsToCreate
  });
  console.log(`✅ ${assetsToCreate.length} highly realistic Crypto Portfolios generated.`);

  console.log('\n--- Web3 Production Simulation Ready ---');
  console.log('Evaluator Login Details:');
  console.log('Username: admin@primevault.ai');
  console.log('Password: Admin123\n');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
