import { seedUsers } from "./userSeeder";

const seeders: Array<() => Promise<void>> = [
  seedUsers,
  // TODO: Add the rest of the seeders here on future.
  // seedListings,
];

export async function seedDatabase() {
  for (const seed of seeders) {
    await seed();
  }
}
