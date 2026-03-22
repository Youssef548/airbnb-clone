export const BASE_URL = {
  client: process.env.CLIENT_URL || "http://localhost:5173",
  server: process.env.SERVER_URL || "http://localhost:3000",
  api: process.env.SERVER_URL
    ? `${process.env.SERVER_URL}/api`
    : "http://localhost:3000/api",
};

export const TEST_USERS = {
  host: {
    username: "e2ehost",
    email: "e2ehost@test.com",
    password: "E2eHost123!",
    role: "host" as const,
  },
  guest: {
    username: "e2eguest",
    email: "e2eguest@test.com",
    password: "E2eGuest123!",
    role: "guest" as const,
  },
  guest2: {
    username: "e2eguest2",
    email: "e2eguest2@test.com",
    password: "E2eGuest2123!",
    role: "guest" as const,
  },
  newUser: {
    username: "e2enewuser",
    email: "e2enewuser@test.com",
    password: "E2eNew123!",
  },
};

export const TEST_LISTING = {
  title: "E2E Test Beach House",
  description: "A beautiful beach house for E2E testing",
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
};
