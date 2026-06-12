// DEVIANT — single source of truth for platform configuration and book registry.
// All TBC fields are explicitly null. Components must never hard-code book data.

export const DEVIANT = {
  platform: {
    name: 'DEVIANT',
    fullName: 'The Mythology Engine',
    slug: 'deviant',
    stagingUrl: 'https://deviant-one.vercel.app',
    productionUrl: null,
  },

  books: {
    'the-deviants': {
      slug: 'the-deviants',
      title: 'The Deviants',
      author: 'Riley Bishop',
      genre: 'Psychological thriller / cult crime fiction',
      setting: 'SunCity (maximum security prison)',
      synopsis:
        'A malevolent organisation and cult exists in this world. Their influence is felt at virtually every level of society. They worship an entity of great evil. Dr Andrew Reed is a criminal profiler who founded an organisation to fight this cult. He called it Defiance. Together with his agents they attempt to fight this force of evil.',
      totalPages: 269,
      totalChapters: 28,
      coverImage: null,

      knownCharacters: [
        { id: 'miles-kelly', name: 'Miles Kelly', aliases: ['Miles'], role: 'Protagonist', povChapters: [1, 5, 15, 20] },
        { id: 'jonathan-reed', name: 'Jonathan Reed', aliases: ['Jonathan', 'Jon'], role: 'Protagonist', povChapters: [2, 8, 14, 21, 24] },
        { id: 'avery-melblac', name: 'Dr Avery Melblac', aliases: ['Avery', 'Dr Melblac', 'Melblac'], role: 'Protagonist', povChapters: [3, 9, 17, 22, 25] },
        { id: 'andrew-reed', name: 'Dr Andrew Reed', aliases: ['Andrew', 'Dr Reed', 'Andrew Reed'], role: 'Protagonist', povChapters: [4, 10, 12, 16] },
        { id: 'sarah-may', name: 'Sarah May', aliases: ['Sarah'], role: 'Protagonist', povChapters: [6, 11, 18, 19, 26] },
        { id: 'atticus-finch', name: 'Atticus Finch', aliases: ['Atticus'], role: 'Protagonist', povChapters: [7, 13, 23] },
        { id: 'loki', name: 'Loki', aliases: [], role: "Miles Kelly's cellmate, SunCity", povChapters: [] },
      ],

      knownLocations: [
        { id: 'suncity', name: 'SunCity', type: 'Maximum security prison' },
        { id: 'receiving-and-discharging', name: 'Receiving and Discharging', type: 'Prison processing area' },
        { id: 'general-population', name: 'General Population', type: 'Prison wing' },
      ],

      knownFactions: [
        { id: 'the-deviants', name: 'The Deviants', type: 'Malevolent cult' },
        { id: 'defiance', name: 'Defiance', type: 'Counter-organization founded by Dr Andrew Reed' },
      ],
    },
  },

  integrations: {
    anthropic: {
      apiKey: null,
    },
    search: {
      provider: null,
      apiKey: null,
    },
  },
}
