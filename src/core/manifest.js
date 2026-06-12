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
        { id: 'amala-jones', name: 'Amala Jones', aliases: ['Amala'], role: 'Deviant — Abigor demi, Defiance hacker/operations', povChapters: [] },
        { id: 'steven-grant', name: 'Steven Grant', aliases: ['Steven', 'Steve'], role: 'Deviant — Surgat demi', povChapters: [] },
        { id: 'mrs-williams', name: 'Mrs Williams', aliases: [], role: 'Senior Defiance agent', povChapters: [] },
        { id: 'martin-creswell', name: 'Martin Creswell', aliases: ['Martin'], role: 'Senior Defiance leadership', povChapters: [] },
        { id: 'tryon-street', name: 'Tryon Street', aliases: ['Tryon', 'Mr. Street'], role: "Dr Andrew Reed's former colleague, defected to the Devil's Den", povChapters: [] },
        { id: 'detective-driscoll', name: 'Detective Driscoll', aliases: ['Driscoll'], role: 'Police detective, ally to Jonathan Reed', povChapters: [] },
        { id: 'chief-singh', name: 'Chief Singh', aliases: ['Singh'], role: 'Police chief, ally to Jonathan Reed', povChapters: [] },
        { id: 'jennifer', name: 'Jennifer', aliases: [], role: 'Witch, ally of Jonathan Reed', povChapters: [] },
        { id: 'ruby', name: 'Ruby', aliases: [], role: 'Witch, ally of Jonathan Reed', povChapters: [] },
        { id: 'carlos-valdez', name: 'Carlos Valdez', aliases: ['Carlos'], role: "South East Grotto member, defected to the Devil's Den", povChapters: [] },
        { id: 'ambrose', name: 'Ambrose', aliases: [], role: "South East Grotto member, defected to the Devil's Den", povChapters: [] },
        { id: 'damien-videl', name: 'Damien Videl', aliases: ['Damien'], role: "Devil's Den high priest, killer of Dr Andrew Reed", povChapters: [] },
        { id: 'alexandra-turner', name: 'Alexandra Turner', aliases: ['Alexandra', 'Alex Turner'], role: "Devil's Den — Damien Videl's second-in-command", povChapters: [] },
        { id: 'naberius', name: 'Naberius', aliases: [], role: 'Demon — Sarah May’s tormentor and former possessor', povChapters: [] },
        { id: 'belial', name: 'Belial', aliases: [], role: "Demon — Devil's Den founder, seeks to reunite the divine source", povChapters: [] },
        { id: 'ellis', name: 'Ellis', aliases: ['Pastor Ellis'], role: 'Lucifer’s vessel, megachurch pastor', povChapters: [] },
      ],

      knownLocations: [
        { id: 'suncity', name: 'SunCity', type: 'Maximum security prison' },
        { id: 'receiving-and-discharging', name: 'Receiving and Discharging', type: 'Prison processing area' },
        { id: 'general-population', name: 'General Population', type: 'Prison wing' },
      ],

      knownFactions: [
        { id: 'the-deviants', name: 'The Deviants', type: "Defiance's elite team of demon-possessed operatives (protagonists)" },
        { id: 'defiance', name: 'Defiance', type: 'Counter-organization founded by Dr Andrew Reed' },
        { id: 'devils-den', name: "Devil's Den", type: 'Malevolent demon-worshipping cult (antagonists)' },
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
