import { seedUsers } from "./userSeeder";
import { seedListings } from "./listingSeeder";

const seeders: Array<() => Promise<void>> = [
  seedUsers,
  seedListings,
];

export async function seedDatabase() {
  for (const seed of seeders) {
    await seed();
  }
}
