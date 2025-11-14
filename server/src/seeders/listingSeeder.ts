import { Listing } from "../models/listing.model";
import { User } from "../models/User.model";

export async function seedListings() {
  // Find a host user to associate with listings
  let hostUser = await User.findOne({ role: "host" });

  // If no host exists, update the first user to be a host
  if (!hostUser) {
    const anyUser = await User.findOne();
    if (anyUser) {
      anyUser.role = "host";
      await anyUser.save();
      hostUser = anyUser;
      console.log(`Updated user ${anyUser.email} to host role for seeding.`);
    } else {
      console.log("No users found in database. Please seed users first.");
      return;
    }
  }

  const mockListings = [
    // Homes Category
    {
      title: "Luxury Beachfront Villa in Bali",
      description:
        "Wake up to stunning ocean views in this beautiful beachfront villa. Perfect for families and groups looking for a peaceful retreat.",
      imageSrc:
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&auto=format&fit=crop",
      category: "Homes",
      roomCount: 4,
      bathRoomCount: 3,
      guestCount: 8,
      price: 250,
      location: {
        flag: "🇮🇩",
        label: "Bali, Indonesia",
        latlng: [-8.3405, 115.092],
        region: "Asia",
        value: "ID",
      },
      user: hostUser._id,
    },
    {
      title: "Modern Apartment in Tokyo",
      description:
        "Experience the vibrant city life in this sleek modern apartment located in the heart of Tokyo. Walking distance to subway stations.",
      imageSrc:
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop",
      category: "Homes",
      roomCount: 2,
      bathRoomCount: 1,
      guestCount: 4,
      price: 120,
      location: {
        flag: "🇯🇵",
        label: "Tokyo, Japan",
        latlng: [35.6762, 139.6503],
        region: "Asia",
        value: "JP",
      },
      user: hostUser._id,
    },
    {
      title: "Cozy Mountain Cabin in Switzerland",
      description:
        "Escape to the Swiss Alps in this charming wooden cabin. Perfect for skiing in winter and hiking in summer.",
      imageSrc:
        "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&auto=format&fit=crop",
      category: "Homes",
      roomCount: 3,
      bathRoomCount: 2,
      guestCount: 6,
      price: 180,
      location: {
        flag: "🇨🇭",
        label: "Zermatt, Switzerland",
        latlng: [46.0207, 7.7491],
        region: "Europe",
        value: "CH",
      },
      user: hostUser._id,
    },
    {
      title: "Penthouse in New York City",
      description:
        "Luxurious penthouse with panoramic views of Manhattan skyline. Features modern amenities and designer furnishings.",
      imageSrc:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      category: "Homes",
      roomCount: 3,
      bathRoomCount: 2,
      guestCount: 6,
      price: 350,
      location: {
        flag: "🇺🇸",
        label: "New York, USA",
        latlng: [40.7128, -74.006],
        region: "North America",
        value: "US",
      },
      user: hostUser._id,
    },
    {
      title: "Beachside Bungalow in Maldives",
      description:
        "Private overwater bungalow with direct access to crystal clear waters. Includes snorkeling equipment and kayaks.",
      imageSrc:
        "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&auto=format&fit=crop",
      category: "Experiences",
      roomCount: 1,
      bathRoomCount: 1,
      guestCount: 2,
      price: 400,
      location: {
        flag: "🇲🇻",
        label: "Malé, Maldives",
        latlng: [4.1755, 73.5093],
        region: "Asia",
        value: "MV",
      },
      user: hostUser._id,
    },
    {
      title: "Historic Loft in Paris",
      description:
        "Beautifully restored loft in Le Marais district. High ceilings, exposed brick, and walking distance to major attractions.",
      imageSrc:
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop",
      category: "Homes",
      roomCount: 2,
      bathRoomCount: 1,
      guestCount: 4,
      price: 200,
      location: {
        flag: "🇫🇷",
        label: "Paris, France",
        latlng: [48.8566, 2.3522],
        region: "Europe",
        value: "FR",
      },
      user: hostUser._id,
    },
    {
      title: "Desert Oasis in Dubai",
      description:
        "Luxury villa in exclusive Dubai community. Private pool, home cinema, and stunning desert views.",
      imageSrc:
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop",
      category: "Experiences",
      roomCount: 5,
      bathRoomCount: 4,
      guestCount: 10,
      price: 500,
      location: {
        flag: "🇦🇪",
        label: "Dubai, UAE",
        latlng: [25.2048, 55.2708],
        region: "Middle East",
        value: "AE",
      },
      user: hostUser._id,
    },
    {
      title: "Countryside Cottage in Tuscany",
      description:
        "Traditional Italian farmhouse surrounded by vineyards and olive groves. Includes wine tasting experience.",
      imageSrc:
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop",
      category: "Experiences",
      roomCount: 3,
      bathRoomCount: 2,
      guestCount: 6,
      price: 220,
      location: {
        flag: "🇮🇹",
        label: "Florence, Italy",
        latlng: [43.7696, 11.2558],
        region: "Europe",
        value: "IT",
      },
      user: hostUser._id,
    },
    {
      title: "Tropical Paradise in Costa Rica",
      description:
        "Eco-friendly treehouse in the rainforest. Wake up to howler monkeys and exotic birds. Adventure tours available.",
      imageSrc:
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop",
      category: "Music",
      roomCount: 2,
      bathRoomCount: 1,
      guestCount: 4,
      price: 150,
      location: {
        flag: "🇨🇷",
        label: "San José, Costa Rica",
        latlng: [9.9281, -84.0907],
        region: "Central America",
        value: "CR",
      },
      user: hostUser._id,
    },
    {
      title: "Seaside Retreat in Santorini",
      description:
        "White-washed cave house with infinity pool overlooking the caldera. Witness world-famous sunsets from your terrace.",
      imageSrc:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop",
      category: "Experiences",
      roomCount: 2,
      bathRoomCount: 2,
      guestCount: 4,
      price: 280,
      location: {
        flag: "🇬🇷",
        label: "Santorini, Greece",
        latlng: [36.3932, 25.4615],
        region: "Europe",
        value: "GR",
      },
      user: hostUser._id,
    },
    {
      title: "Urban Loft in London",
      description:
        "Industrial-chic loft in trendy Shoreditch. Close to markets, galleries, and nightlife.",
      imageSrc:
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop",
      category: "Fashion",
      roomCount: 2,
      bathRoomCount: 1,
      guestCount: 4,
      price: 190,
      location: {
        flag: "🇬🇧",
        label: "London, UK",
        latlng: [51.5074, -0.1278],
        region: "Europe",
        value: "GB",
      },
      user: hostUser._id,
    },
    {
      title: "Designer Penthouse in Milan",
      description:
        "Ultra-modern loft in the fashion capital. Located in the Quadrilatero della Moda district. Walking distance to fashion shows and boutiques.",
      imageSrc:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop",
      category: "Fashion",
      roomCount: 3,
      bathRoomCount: 2,
      guestCount: 5,
      price: 320,
      location: {
        flag: "🇮🇹",
        label: "Milan, Italy",
        latlng: [45.4642, 9.1900],
        region: "Europe",
        value: "IT",
      },
      user: hostUser._id,
    },
    {
      title: "Chic Studio in Paris Fashion District",
      description:
        "Stylish apartment in the heart of Le Marais. Near fashion boutiques, art galleries, and haute couture ateliers.",
      imageSrc:
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop",
      category: "Fashion",
      roomCount: 1,
      bathRoomCount: 1,
      guestCount: 2,
      price: 210,
      location: {
        flag: "🇫🇷",
        label: "Paris, France",
        latlng: [48.8566, 2.3522],
        region: "Europe",
        value: "FR",
      },
      user: hostUser._id,
    },
    {
      title: "SoHo Fashion Loft in New York",
      description:
        "Industrial loft in the heart of NYC's fashion district. Close to designer showrooms and Fashion Week venues.",
      imageSrc:
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&auto=format&fit=crop",
      category: "Fashion",
      roomCount: 2,
      bathRoomCount: 2,
      guestCount: 4,
      price: 280,
      location: {
        flag: "🇺🇸",
        label: "New York, USA",
        latlng: [40.7234, -74.0018],
        region: "North America",
        value: "US",
      },
      user: hostUser._id,
    },
    {
      title: "Trendy Apartment in Tokyo Harajuku",
      description:
        "Modern apartment in the epicenter of Japanese street fashion. Surrounded by vintage shops and emerging designer boutiques.",
      imageSrc:
        "https://images.unsplash.com/photo-1560448075-bb485b067938?w=800&auto=format&fit=crop",
      category: "Fashion",
      roomCount: 1,
      bathRoomCount: 1,
      guestCount: 2,
      price: 165,
      location: {
        flag: "🇯🇵",
        label: "Tokyo, Japan",
        latlng: [35.6702, 139.7025],
        region: "Asia",
        value: "JP",
      },
      user: hostUser._id,
    },
    {
      title: "Safari Lodge in Kenya",
      description:
        "Luxury tented camp in the Maasai Mara. Daily game drives and guided bush walks included.",
      imageSrc:
        "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&auto=format&fit=crop",
      category: "Experiences",
      roomCount: 1,
      bathRoomCount: 1,
      guestCount: 2,
      price: 450,
      location: {
        flag: "🇰🇪",
        label: "Nairobi, Kenya",
        latlng: [-1.2921, 36.8219],
        region: "Africa",
        value: "KE",
      },
      user: hostUser._id,
    },
    {
      title: "Wine Tasting Estate in Napa Valley",
      description:
        "Exclusive vineyard estate with private wine cellar. Includes daily wine tasting sessions and gourmet meals prepared by personal chef.",
      imageSrc:
        "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop",
      category: "Experiences",
      roomCount: 4,
      bathRoomCount: 3,
      guestCount: 8,
      price: 380,
      location: {
        flag: "🇺🇸",
        label: "Napa Valley, USA",
        latlng: [38.5025, -122.2654],
        region: "North America",
        value: "US",
      },
      user: hostUser._id,
    },
    {
      title: "Underwater Hotel in Fiji",
      description:
        "Sleep beneath the ocean in this unique underwater suite. Watch tropical fish and coral reefs from your bedroom. Includes diving sessions.",
      imageSrc:
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop",
      category: "Experiences",
      roomCount: 1,
      bathRoomCount: 1,
      guestCount: 2,
      price: 550,
      location: {
        flag: "🇫🇯",
        label: "Fiji Islands, Fiji",
        latlng: [-17.7134, 178.065],
        region: "Oceania",
        value: "FJ",
      },
      user: hostUser._id,
    },
    {
      title: "Northern Lights Glass Igloo in Finland",
      description:
        "Transparent igloo with heated glass roof. Watch the Aurora Borealis from your bed. Includes husky sledding and reindeer safari.",
      imageSrc:
        "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=800&auto=format&fit=crop",
      category: "Experiences",
      roomCount: 1,
      bathRoomCount: 1,
      guestCount: 2,
      price: 320,
      location: {
        flag: "🇫🇮",
        label: "Rovaniemi, Finland",
        latlng: [66.5039, 25.7294],
        region: "Europe",
        value: "FI",
      },
      user: hostUser._id,
    },
    {
      title: "Hot Air Balloon Villa in Cappadocia",
      description:
        "Cave hotel carved into ancient rock formations. Private hot air balloon ride at sunrise included. Stunning valley views.",
      imageSrc:
        "https://images.unsplash.com/photo-1501959915551-4e8d30928317?w=800&auto=format&fit=crop",      category: "Experiences",
      roomCount: 2,
      bathRoomCount: 2,
      guestCount: 4,
      price: 290,
      location: {
        flag: "🇹🇷",
        label: "Cappadocia, Turkey",
        latlng: [38.6431, 34.8289],
        region: "Europe",
        value: "TR",
      },
      user: hostUser._id,
    },
    // cupStrawIcon Category (Cafe/Drinks themed)
    {
      title: "Cozy Cafe Apartment in Seattle",
      description:
        "Live above a trendy coffee shop in downtown Seattle. Enjoy complimentary coffee every morning and vibrant cafe culture.",
      imageSrc:
        "https://images.unsplash.com/photo-1501959915551-4e8d30928317?w=800&auto=format&fit=crop",
      category: "cupStrawIcon",
      roomCount: 1,
      bathRoomCount: 1,
      guestCount: 2,
      price: 130,
      location: {
        flag: "🇺🇸",
        label: "Seattle, USA",
        latlng: [47.6062, -122.3321],
        region: "North America",
        value: "US",
      },
      user: hostUser._id,
    },
    {
      title: "Barista Studio in Melbourne",
      description:
        "Studio apartment in the coffee capital of Australia. Walking distance to the best cafes and roasteries in the city.",
      imageSrc:
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop",
      category: "cupStrawIcon",
      roomCount: 1,
      bathRoomCount: 1,
      guestCount: 2,
      price: 110,
      location: {
        flag: "🇦🇺",
        label: "Melbourne, Australia",
        latlng: [-37.8136, 144.9631],
        region: "Oceania",
        value: "AU",
      },
      user: hostUser._id,
    },
    {
      title: "Espresso Bar Loft in Rome",
      description:
        "Authentic Italian coffee experience. Located above a historic espresso bar. Learn to make perfect cappuccino from barista masters.",
      imageSrc:
        "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&auto=format&fit=crop",
      category: "cupStrawIcon",
      roomCount: 1,
      bathRoomCount: 1,
      guestCount: 2,
      price: 125,
      location: {
        flag: "🇮🇹",
        label: "Rome, Italy",
        latlng: [41.9028, 12.4964],
        region: "Europe",
        value: "IT",
      },
      user: hostUser._id,
    },
    {
      title: "Tea House Apartment in Kyoto",
      description:
        "Traditional Japanese tea house converted into modern apartment. Daily tea ceremony experiences and matcha tasting included.",
      imageSrc:
        "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=800&auto=format&fit=crop",
      category: "cupStrawIcon",
      roomCount: 1,
      bathRoomCount: 1,
      guestCount: 2,
      price: 140,
      location: {
        flag: "🇯🇵",
        label: "Kyoto, Japan",
        latlng: [35.0116, 135.7681],
        region: "Asia",
        value: "JP",
      },
      user: hostUser._id,
    },
    {
      title: "Brunch Bistro Suite in Amsterdam",
      description:
        "Charming canal-side apartment above artisan coffee roastery. Enjoy Dutch pancakes and specialty coffee every morning.",
      imageSrc:
        "https://images.unsplash.com/photo-1559305616-3555abb9b1e6?w=800&auto=format&fit=crop",
      category: "cupStrawIcon",
      roomCount: 1,
      bathRoomCount: 1,
      guestCount: 3,
      price: 135,
      location: {
        flag: "🇳🇱",
        label: "Amsterdam, Netherlands",
        latlng: [52.3676, 4.9041],
        region: "Europe",
        value: "NL",
      },
      user: hostUser._id,
    },
    // airPlane Category (Travel/Airport themed)
    {
      title: "Airport Hotel Suite in Singapore",
      description:
        "Modern suite connected to Changi Airport. Perfect for layovers and early flights. 24-hour concierge service.",
      imageSrc:
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop",
      category: "airPlane",
      roomCount: 1,
      bathRoomCount: 1,
      guestCount: 2,
      price: 160,
      location: {
        flag: "🇸🇬",
        label: "Singapore, Singapore",
        latlng: [1.3521, 103.8198],
        region: "Asia",
        value: "SG",
      },
      user: hostUser._id,
    },
    {
      title: "Sky Lounge Apartment in Dubai",
      description:
        "Luxury apartment with views of Emirates Airport runways. Watch planes take off and land from your balcony.",
      imageSrc:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop",
      category: "airPlane",
      roomCount: 2,
      bathRoomCount: 2,
      guestCount: 4,
      price: 200,
      location: {
        flag: "🇦🇪",
        label: "Dubai, UAE",
        latlng: [25.2048, 55.2708],
        region: "Middle East",
        value: "AE",
      },
      user: hostUser._id,
    },
    {
      title: "Rooftop Lounge near JFK Airport",
      description:
        "Modern apartment with rooftop terrace overlooking flight paths. Perfect for aviation enthusiasts and travelers with early departures.",
      imageSrc:
        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop",
      category: "airPlane",
      roomCount: 2,
      bathRoomCount: 1,
      guestCount: 4,
      price: 145,
      location: {
        flag: "🇺🇸",
        label: "New York, USA",
        latlng: [40.6413, -73.7781],
        region: "North America",
        value: "US",
      },
      user: hostUser._id,
    },
    {
      title: "Aviation Museum Suite in Seattle",
      description:
        "Stay in converted hangar next to Boeing Museum of Flight. Includes private tour of historic aircraft collection.",
      imageSrc:
        "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800&auto=format&fit=crop",
      category: "airPlane",
      roomCount: 1,
      bathRoomCount: 1,
      guestCount: 2,
      price: 170,
      location: {
        flag: "🇺🇸",
        label: "Seattle, USA",
        latlng: [47.6062, -122.3321],
        region: "North America",
        value: "US",
      },
      user: hostUser._id,
    },
    {
      title: "Transit Hotel at Heathrow",
      description:
        "Convenient pod-style hotel inside Terminal 5. Perfect for long layovers. Modern amenities and quick access to all terminals.",
      imageSrc:
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop",
      category: "airPlane",
      roomCount: 1,
      bathRoomCount: 1,
      guestCount: 2,
      price: 120,
      location: {
        flag: "🇬🇧",
        label: "London, UK",
        latlng: [51.4700, -0.4543],
        region: "Europe",
        value: "GB",
      },
      user: hostUser._id,
    },
    // Football Category
    {
      title: "Stadium View Loft in Madrid",
      description:
        "Watch Real Madrid matches from your balcony! Located next to Santiago Bernabéu Stadium. Includes match day tickets.",
      imageSrc:
        "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop",
      category: "Football",
      roomCount: 2,
      bathRoomCount: 1,
      guestCount: 4,
      price: 240,
      location: {
        flag: "🇪🇸",
        label: "Madrid, Spain",
        latlng: [40.4168, -3.7038],
        region: "Europe",
        value: "ES",
      },
      user: hostUser._id,
    },
    {
      title: "Football Fan House in Manchester",
      description:
        "The ultimate home for football fans! Walking distance to Old Trafford. Decorated with memorabilia and sports bar.",
      imageSrc:
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop",
      category: "Football",
      roomCount: 3,
      bathRoomCount: 2,
      guestCount: 6,
      price: 180,
      location: {
        flag: "🇬🇧",
        label: "Manchester, UK",
        latlng: [53.4808, -2.2426],
        region: "Europe",
        value: "GB",
      },
      user: hostUser._id,
    },
    {
      title: "Champions League Suite in Barcelona",
      description:
        "Luxury apartment overlooking Camp Nou. Experience matchday atmosphere and explore FC Barcelona museum. Season tickets available.",
      imageSrc:
        "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop",
      category: "Football",
      roomCount: 3,
      bathRoomCount: 2,
      guestCount: 6,
      price: 260,
      location: {
        flag: "🇪🇸",
        label: "Barcelona, Spain",
        latlng: [41.3809, 2.1228],
        region: "Europe",
        value: "ES",
      },
      user: hostUser._id,
    },
    {
      title: "Bundesliga Fan Apartment in Munich",
      description:
        "Modern apartment near Allianz Arena. Perfect for Bayern Munich fans. Walking distance to stadium and beer gardens.",
      imageSrc:
        "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&auto=format&fit=crop",
      category: "Football",
      roomCount: 2,
      bathRoomCount: 1,
      guestCount: 4,
      price: 195,
      location: {
        flag: "🇩🇪",
        label: "Munich, Germany",
        latlng: [48.1351, 11.5820],
        region: "Europe",
        value: "DE",
      },
      user: hostUser._id,
    },
    {
      title: "Premier League House in Liverpool",
      description:
        "Authentic football fan experience near Anfield Stadium. Decorated with Liverpool FC memorabilia. Pub crawl tours available.",
      imageSrc:
        "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&auto=format&fit=crop",
      category: "Football",
      roomCount: 3,
      bathRoomCount: 2,
      guestCount: 5,
      price: 170,
      location: {
        flag: "🇬🇧",
        label: "Liverpool, UK",
        latlng: [53.4084, -2.9916],
        region: "Europe",
        value: "GB",
      },
      user: hostUser._id,
    },
    // bookIcon Category (Library/Reading themed)
    {
      title: "Library Loft in Edinburgh",
      description:
        "Book lover's paradise with floor-to-ceiling bookshelves. Located near historic libraries and literary landmarks.",
      imageSrc:
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&auto=format&fit=crop",
      category: "bookIcon",
      roomCount: 2,
      bathRoomCount: 1,
      guestCount: 3,
      price: 140,
      location: {
        flag: "🇬🇧",
        label: "Edinburgh, UK",
        latlng: [55.9533, -3.1883],
        region: "Europe",
        value: "GB",
      },
      user: hostUser._id,
    },
    {
      title: "Writer's Retreat in Oxford",
      description:
        "Quiet cottage perfect for reading and writing. Features a personal library and study overlooking English gardens.",
      imageSrc:
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop",
      category: "bookIcon",
      roomCount: 2,
      bathRoomCount: 1,
      guestCount: 2,
      price: 155,
      location: {
        flag: "🇬🇧",
        label: "Oxford, UK",
        latlng: [51.7520, -1.2577],
        region: "Europe",
        value: "GB",
      },
      user: hostUser._id,
    },
    {
      title: "Bookshop Apartment in Dublin",
      description:
        "Cozy flat above a historic Irish bookshop. Includes unlimited access to bookstore collection and author reading events.",
      imageSrc:
        "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&auto=format&fit=crop",
      category: "bookIcon",
      roomCount: 1,
      bathRoomCount: 1,
      guestCount: 2,
      price: 130,
      location: {
        flag: "🇮🇪",
        label: "Dublin, Ireland",
        latlng: [53.3498, -6.2603],
        region: "Europe",
        value: "IE",
      },
      user: hostUser._id,
    },
    {
      title: "Literary Cottage in Stratford-upon-Avon",
      description:
        "Shakespeare-themed cottage near the Bard's birthplace. Features extensive collection of classic literature and poetry.",
      imageSrc:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&auto=format&fit=crop",
      category: "bookIcon",
      roomCount: 2,
      bathRoomCount: 1,
      guestCount: 3,
      price: 145,
      location: {
        flag: "🇬🇧",
        label: "Stratford-upon-Avon, UK",
        latlng: [52.1917, -1.7082],
        region: "Europe",
        value: "GB",
      },
      user: hostUser._id,
    },
    {
      title: "Scholar's Studio in Cambridge",
      description:
        "Academic retreat near Cambridge University libraries. Quiet study space with extensive reference library and reading nook.",
      imageSrc:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&auto=format&fit=crop",
      category: "bookIcon",
      roomCount: 1,
      bathRoomCount: 1,
      guestCount: 2,
      price: 150,
      location: {
        flag: "🇬🇧",
        label: "Cambridge, UK",
        latlng: [52.2053, 0.1218],
        region: "Europe",
        value: "GB",
      },
      user: hostUser._id,
    },
    // Heart Category (Romantic/Couples)
    {
      title: "Romantic Honeymoon Suite in Venice",
      description:
        "Charming canal-side suite perfect for couples. Includes gondola ride, champagne, and breakfast in bed service.",
      imageSrc:
        "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&auto=format&fit=crop",
      category: "Heart",
      roomCount: 1,
      bathRoomCount: 1,
      guestCount: 2,
      price: 280,
      location: {
        flag: "🇮🇹",
        label: "Venice, Italy",
        latlng: [45.4408, 12.3155],
        region: "Europe",
        value: "IT",
      },
      user: hostUser._id,
    },
    {
      title: "Couples' Retreat in Maldives",
      description:
        "Private island bungalow for two. Includes spa treatments, private beach dinners, and sunset cruises.",
      imageSrc:
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop",
      category: "Heart",
      roomCount: 1,
      bathRoomCount: 1,
      guestCount: 2,
      price: 450,
      location: {
        flag: "🇲🇻",
        label: "Malé, Maldives",
        latlng: [4.1755, 73.5093],
        region: "Asia",
        value: "MV",
      },
      user: hostUser._id,
    },
    {
      title: "Love Nest in Santorini",
      description:
        "Intimate cave suite with private plunge pool. Stunning caldera views, couples massage, and romantic sunset dinner on terrace.",
      imageSrc:
        "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&auto=format&fit=crop",
      category: "Heart",
      roomCount: 1,
      bathRoomCount: 1,
      guestCount: 2,
      price: 380,
      location: {
        flag: "🇬🇷",
        label: "Santorini, Greece",
        latlng: [36.3932, 25.4615],
        region: "Europe",
        value: "GR",
      },
      user: hostUser._id,
    },
    {
      title: "Secluded Mountain Retreat in Banff",
      description:
        "Romantic log cabin in Canadian Rockies. Private hot tub under the stars, fireplace, and breakfast basket delivered daily.",
      imageSrc:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop",
      category: "Heart",
      roomCount: 1,
      bathRoomCount: 1,
      guestCount: 2,
      price: 310,
      location: {
        flag: "🇨🇦",
        label: "Banff, Canada",
        latlng: [51.1784, -115.5708],
        region: "North America",
        value: "CA",
      },
      user: hostUser._id,
    },
    {
      title: "Château Suite in Loire Valley",
      description:
        "Fairytale castle suite in French countryside. Includes wine tasting, couples cooking class, and romantic garden picnics.",
      imageSrc:
        "https://images.unsplash.com/photo-1549638441-b787d2e11f14?w=800&auto=format&fit=crop",
      category: "Heart",
      roomCount: 1,
      bathRoomCount: 1,
      guestCount: 2,
      price: 420,
      location: {
        flag: "🇫🇷",
        label: "Loire Valley, France",
        latlng: [47.3900, 0.6900],
        region: "Europe",
        value: "FR",
      },
      user: hostUser._id,
    },
    {
      title: "Cliffside Villa in Amalfi Coast",
      description:
        "Spectacular views of Mediterranean Sea. Private infinity pool, in-villa spa treatments, and romantic candlelit dinners on terrace.",
      imageSrc:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
      category: "Heart",
      roomCount: 2,
      bathRoomCount: 2,
      guestCount: 2,
      price: 480,
      location: {
        flag: "🇮🇹",
        label: "Amalfi Coast, Italy",
        latlng: [40.6333, 14.6029],
        region: "Europe",
        value: "IT",
      },
      user: hostUser._id,
    },
  ];

  // Check which listings already exist by title
  const existingTitles = await Listing.find({}).distinct("title");
  const existingCount = existingTitles.length;

  // Filter out listings that already exist
  const newListings = mockListings.filter(
    (listing) => !existingTitles.includes(listing.title)
  );

  if (newListings.length === 0) {
    console.log(
      `All ${mockListings.length} listings already exist in database (${existingCount} total). No new listings to seed.`
    );
    return;
  }

  // Insert only new listings
  const createdListings = await Listing.insertMany(newListings);
  console.log(
    `✓ Successfully seeded ${createdListings.length} new listings! (Database now has ${existingCount + createdListings.length} total listings)`
  );

  // Update the user's listings array with new listings only
  await User.findByIdAndUpdate(hostUser._id, {
    $push: { listings: { $each: createdListings.map((l) => l._id) } },
  });
}
