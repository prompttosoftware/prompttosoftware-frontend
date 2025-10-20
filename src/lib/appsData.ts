export interface AppFeature {
  title: string;
  description: string;
  imageUrl: string;
}

export interface AppData {
  slug: string; // This will be the URL, e.g., /apps/foodie-finder
  name: string;
  logoUrl: string;
  tagline: string;
  ageRange: string;
  targetLocation: string; // We'll use this to dynamically insert the city name
  description: string;
  themeColor: {
    primary: string; // e.g., hsl(142.1 76.2% 36.3%) for a green button
    background: string; // e.g., /img/foodie-bg.jpg
  };
  features: AppFeature[];
}

// Add data for each of your apps here
export const apps: AppData[] = [
  {
    slug: 'lily',
    name: 'Lily',
    logoUrl: '/logos/lily-logo.svg',
    tagline: 'Introductions made easy. Friends. Networking. Dating.',
    ageRange: '18+',
    targetLocation: 'Madison',
    description:
      'Get notified when near someone looking for the same thing as you. Whether that be an activity, dinner, a new client, or even a business partner, Lily help\'s you connect in person as you pass on the street.',
    themeColor: {
      primary: 'hsl(139 59% 55%)',
      background: '/backgrounds/greeting.jpg',
    },
    features: [
      {
        title: 'Never Miss a Connection',
        description:
          "Every day we pass hundreds of people. Anyone of those people could become your best friend, love of your life or first client. Lily catches those possible connections and finally makes them possible.",
        imageUrl: '/screenshots/man-walking.jpg',
      },
      {
        title: 'Safety First Design',
        description:
          'Your location is never visible to people you match with until both of you accept the connection. To know what your getting yourself into, you can see their photo and age before choosing to connect.',
        imageUrl: '/screenshots/coffee-phone.jpg',
      },
    ],
  },
//   {
//     slug: 'city-chat',
//     name: 'City Chat',
//     logoUrl: '/logos/citychat-logo.svg',
//     tagline: 'One Massive Group Chat in Each City',
//     ageRange: '16+',
//     targetLocation: 'Madison',
//     description:
//       'Wake up to 1000 good mornings and end your day to 1000 good nights. Ask questions, connect, organize, share and enjoy the crazy fun community you live in.',
//     themeColor: {
//       primary: 'hsl(17 91% 57%)', // An earthy green
//       background: '/backgrounds/citychaos.jpg', // Path to your blurred background image
//     },
//     features: [
//       {
//         title: 'Emotes & Chat Effects',
//         description:
//           "Collect emotes, effects, walpapers and color schemes to fully customize your chat experience. Emotes and effects are visible to everyone in the chat.",
//         imageUrl: '/screenshots/chaos-chat.jpg',
//       },
//       {
//         title: 'Safety & Moderation',
//         description:
//           "Images and videos are scanned for dangerous content automatically before being sent. Report user's to quickly time them out. Spamming automatically times out user's. We check each reported user's chat history to determine if they should be permanently banned.",
//         imageUrl: '/screenshots/phone-laughing.jpg',
//       },
//     ],
//   },
  {
    slug: 'frog-chat',
    name: 'Frog Chat',
    logoUrl: '/logos/frogchat-logo.svg',
    tagline: 'RIBBIT RIBBIT RISE UP',
    ageRange: '18+',
    targetLocation: 'Chicago',
    description:
      'Chat with everyone in your vicinity. Send invites to activities, alert what’s happening, or just have a good time. Pass along the most important messages.',
    themeColor: {
      primary: 'hsl(135 100% 63%)',
      background: '/backgrounds/frogrevolution.jpg',
    },
    features: [
      {
        title: 'Proximity Chat & Bounces',
        description:
          "Your chat feed contains the messages that were sent by anyone in your vicinity. When you send a message, it will be sent to everyone currently in your vicinity. Pass messages along by pressing the Bounce button on the notification. Your message could be Bounced across the country!",
        imageUrl: '/screenshots/frog-chat.png',
      },
      {
        title: 'End To End Encryption',
        description:
          "Each message is encrypted on device and is only decrypted on the recievers device. Messages are never stored on the server and the server does not have the encryption keys.",
        imageUrl: '/screenshots/frog-engineer.jpg',
      },
    ],
  },
//   {
//     slug: 'village',
//     name: 'Village',
//     logoUrl: '/logos/village-logo.svg',
//     tagline: 'Community Management for Self Sufficiency',
//     ageRange: '18+',
//     targetLocation: 'Monona',
//     description:
//       'Village makes it easier to achieve self sufficiency by dividing the work and letting individuals grow an abundance of a few crops. Village also enables people without land to grow or simply deliver and become self-sufficient.',
//     themeColor: {
//       primary: 'hsl(103 52% 29%)',
//       background: '/backgrounds/vegetables.jpg',
//     },
//     features: [
//       {
//         title: 'Roles & Distribution',
//         description:
//           "Users join a community in their area and sign up for roles (producer, delivery, land owner, storage). Everyone that contributes gets a portion of the community's production each week. The roles are diverse to accommodate everyone's situation. Producers grow food either on their own land or a land owner’s land. A land owner simply offers space for growing. The delivery role is responsible for taking produce to storage and to users for consumption. The storage role offers short and long term storage during times of surplus production.",
//         imageUrl: '/screenshots/Producer-Submit-Items.png',
//       },
//       {
//         title: 'How it Works',
//         description:
//           "A producer submits some items. Village determines whether they should go to short term storage, long term storage, or delivered for consumption. A task is created for a delivery member to pick the items up and deliver them to their destination. If fresh production is not enough to fulfill all the weekly deliveries, items from long term storage are added.",
//         imageUrl: '/screenshots/Role-Details.png',
//       },
//     ],
//   },
//   {
//     slug: 'bartr',
//     name: 'Bartr',
//     logoUrl: '/logos/bartr-logo.svg',
//     tagline: 'Hands Free Automated Bartering',
//     ageRange: '18+',
//     targetLocation: 'Milwaukee',
//     description:
//       'Easily get everything you need by trading the things you don’t. Whether it be items you no longer use, natural resources, produce, services, or even artwork and handiwork. Bartr automatically finds people who want what each other is offering. And Bartr can chain trades similar to the paperclip challenge to enable greater flexibility and trading up to items and services of greater value.',
//     themeColor: {
//       primary: 'hsl(103 52% 29%)',
//       background: '/backgrounds/westerntown.jpg',
//     },
//     features: [
//       {
//         title: 'Trading Goods & Services',
//         description:
//           "Users simply enter what they need and what they’re willing to trade. Bartr takes care of the rest. When a trade is found the user is notified. Users can ask for anything from goods to services and describe exactly what they want. Bartr will search for people nearby that are offering that thing and want something the user has.",
//         imageUrl: '/screenshots/bartr-home.png',
//       },
//       {
//         title: 'Pro - Maximize productivity. Automate everything. Create anything.',
//         description:
//           "Instead of finding a single trade, Bartr finds the shortest chain of trades from any of a user's offers to any of the user's needs. This enables trading up to something of far greater value. Bartr will automatically respond to messages, make offers, and complete trades. Ask Bartr to create anything and it will determine what is needed and create a graph of chains that go from a user's offers to that thing.",
//         imageUrl: '/screenshots/bartr-project.png',
//       },
//     ],
//   },
];
