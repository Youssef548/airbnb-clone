import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

// Load server .env
dotenv.config({ path: path.resolve(__dirname, "../../server/.env") });

const DATABASE_URL =
  process.env.DATABASE_URL || "mongodb://localhost:27017/airbnb";

// Inline schemas to avoid importing from server (keeps e2e self-contained)
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["guest", "host"], default: "guest" },
  favoriteListingsIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
  listings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  googleId: String,
  githubId: String,
  facebookId: String,
});

const listingSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageSrc: String,
  category: String,
  roomCount: Number,
  bathRoomCount: Number,
  guestCount: Number,
  price: Number,
  location: {
    flag: String,
    label: String,
    latlng: [Number],
    region: String,
    value: String,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
});

const bookingSchema = new mongoose.Schema({
  startDate: Date,
  endDate: Date,
  guest: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  totalPrice: Number,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Listing =
  mongoose.models.Listing || mongoose.model("Listing", listingSchema);
const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

const SEED_USERS = [
  {
    username: "e2ehost",
    email: "e2ehost@test.com",
    password: "E2eHost123!",
    role: "host",
  },
  {
    username: "e2eguest",
    email: "e2eguest@test.com",
    password: "E2eGuest123!",
    role: "guest",
  },
  {
    username: "e2eguest2",
    email: "e2eguest2@test.com",
    password: "E2eGuest2123!",
    role: "guest",
  },
];

const SEED_LISTINGS = [
  {
    title: "E2E Beach House",
    description: "A beautiful beach house for testing",
    imageSrc:
      "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    category: "Beach",
    roomCount: 3,
    bathRoomCount: 2,
    guestCount: 6,
    price: 150,
    location: {
      flag: "🇺🇸",
      label: "United States",
      latlng: [37.0902, -95.7129],
      region: "Americas",
      value: "US",
    },
  },
  {
    title: "E2E Mountain Cabin",
    description: "A cozy mountain cabin for testing",
    imageSrc:
      "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    category: "Countryside",
    roomCount: 2,
    bathRoomCount: 1,
    guestCount: 4,
    price: 100,
    location: {
      flag: "🇨🇦",
      label: "Canada",
      latlng: [56.1304, -106.3468],
      region: "Americas",
      value: "CA",
    },
  },
  {
    title: "E2E City Apartment",
    description: "A modern city apartment for testing",
    imageSrc:
      "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    category: "Modern",
    roomCount: 1,
    bathRoomCount: 1,
    guestCount: 2,
    price: 200,
    location: {
      flag: "🇬🇧",
      label: "United Kingdom",
      latlng: [55.3781, -3.436],
      region: "Europe",
      value: "GB",
    },
  },
];

async function seed() {
  console.log(`Connecting to ${DATABASE_URL}...`);
  await mongoose.connect(DATABASE_URL);
  console.log("Connected to MongoDB");

  // Clean up E2E test data (only remove e2e-prefixed data)
  await User.deleteMany({ email: { $regex: /^e2e/ } });
  await Listing.deleteMany({ title: { $regex: /^E2E/ } });
  await Booking.deleteMany({}); // Clean all bookings to avoid orphaned references

  // Create users
  const createdUsers: Record<string, any> = {};
  for (const userData of SEED_USERS) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await User.create({
      ...userData,
      password: hashedPassword,
    });
    createdUsers[userData.role] = user;
    console.log(`Created ${userData.role} user: ${userData.email}`);
  }

  // Create listings owned by host
  const hostUser = createdUsers["host"];
  const createdListings = [];
  for (const listingData of SEED_LISTINGS) {
    const listing = await Listing.create({
      ...listingData,
      user: hostUser._id,
    });
    createdListings.push(listing);
    console.log(`Created listing: ${listingData.title}`);
  }

  // Update host's listings array
  await User.findByIdAndUpdate(hostUser._id, {
    $set: { listings: createdListings.map((l) => l._id) },
  });

  console.log("\nSeed complete!");
  console.log(`  Users: ${SEED_USERS.length}`);
  console.log(`  Listings: ${SEED_LISTINGS.length}`);

  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
