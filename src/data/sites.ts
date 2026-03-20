export interface Site {
  id: string;
  name: string;
  location: string;
  period: string;
  startYear: number;
  endYear: number;
  isStartYearUnknown?: boolean;
  isEndYearUnknown?: boolean;
  description: string;
  tags: string[];
  certainty: 'Certain' | 'Probable' | 'Possible' | 'Unlikely';
  lat: number;
  lng: number;
  bibliography: string[];
}

export const sites: Site[] = [
  {
    id: 'ARC-7701',
    name: 'Maiden Castle',
    location: 'Dorset, England',
    period: '500 BCE – 100 CE',
    startYear: -500,
    endYear: 100,
    description: 'One of the largest and most complex Iron Age hillforts in Europe, featuring massive multiple ramparts and a complex entrance system.',
    tags: ['Iron Age', 'Hillfort'],
    certainty: 'Certain',
    lat: 50.704,
    lng: -2.469,
    bibliography: [
      '[1] N. Sharples, *Maiden Castle: Excavations and Field Survey 1985-6*, London, UK: English Heritage, 1991.',
      '[2] R. E. M. Wheeler, *Maiden Castle, Dorset*, Oxford, UK: Oxford University Press, 1943.'
    ]
  },
  {
    id: 'ARC-8812',
    name: 'Navan Fort (Emain Macha)',
    location: 'Armagh, Ireland',
    period: '100 BCE – 100 CE',
    startYear: -100,
    endYear: 100,
    description: 'An ancient ceremonial monument and the traditional capital of the Kings of Ulster, featuring a massive Iron Age circular structure.',
    tags: ['Iron Age', 'Ceremonial'],
    certainty: 'Probable',
    lat: 54.345,
    lng: -6.684,
    bibliography: [
      '[1] D. M. Waterman, *Excavations at Navan Fort 1961–71*, Belfast, UK: Stationery Office, 1997.',
      '[2] J. P. Mallory, *Emain Macha: The Archaeology of Navan Fort*, Armagh, UK: Navan Research Group, 1987.'
    ]
  },
  {
    id: 'ARC-1024',
    name: 'Vindolanda',
    location: 'Northumberland, England',
    period: '85 CE – 400 CE',
    startYear: 85,
    endYear: 400,
    description: 'A Roman auxiliary fort just south of Hadrian\'s Wall, famous for the Vindolanda tablets, among the most important Roman documents found in Britain.',
    tags: ['Roman', 'Military'],
    certainty: 'Certain',
    lat: 54.991,
    lng: -2.361,
    bibliography: [
      '[1] A. Birley, *Vindolanda: A Roman Frontier Post on Hadrian\'s Wall*, London, UK: Thames & Hudson, 1977.',
      '[2] R. Birley, *Vindolanda: Extraordinary Records of Daily Life on the Northern Frontier*, Hexham, UK: Roman Army Museum Publications, 2005.'
    ]
  },
  {
    id: 'ARC-3309',
    name: "Tre'r Ceiri",
    location: 'Gwynedd, Wales',
    period: '200 BCE – 400 CE',
    startYear: -200,
    endYear: 400,
    description: 'One of the most spectacular Iron Age hillforts in Britain, containing the remains of over 150 stone huts on a dramatic mountain peak.',
    tags: ['Iron Age', 'Settlement'],
    certainty: 'Probable',
    lat: 52.973,
    lng: -4.428,
    bibliography: [
      '[1] B. H. St. J. O\'Neil, "Excavations at Tre\'r Ceiri, Caernarvonshire, in 1950," *Archaeologia Cambrensis*, vol. 101, pp. 26-39, 1951.',
      '[2] R. E. M. Wheeler, "The Hill-Fort of Tre\'r Ceiri," *Archaeologia Cambrensis*, vol. 77, pp. 99-146, 1922.'
    ]
  },
  {
    id: 'ARC-5542',
    name: 'Broch of Gurness',
    location: 'Orkney, Scotland',
    period: '500 BCE – 100 CE',
    startYear: -500,
    endYear: 100,
    description: 'An Iron Age broch village, featuring a central tower surrounded by smaller dwellings and a massive defensive ditch system.',
    tags: ['Iron Age', 'Broch'],
    certainty: 'Certain',
    lat: 59.123,
    lng: -3.081,
    bibliography: [
      '[1] J. W. Hedges, *The Broch of Gurness*, Edinburgh, UK: Historic Scotland, 1987.',
      '[2] E. W. MacKie, *The Roundhouses, Brochs and Wheelhouses of Atlantic Scotland c.700 BC-AD 500*, Oxford, UK: Archaeopress, 2002.'
    ]
  },
  {
    id: 'ARC-9901',
    name: 'Hill of Tara',
    location: 'Meath, Ireland',
    period: '500 BCE – 500 CE',
    startYear: -500,
    endYear: 500,
    description: 'The inauguration site of the High Kings of Ireland, featuring a complex of ancient monuments including the Lia Fáil (Stone of Destiny).',
    tags: ['Iron Age', 'Royal Site'],
    certainty: 'Possible',
    lat: 53.578,
    lng: -6.612,
    bibliography: [
      '[1] C. Newman, *Tara: An Archaeological Survey*, Dublin, Ireland: Royal Irish Academy, 1997.',
      '[2] E. Bhreathnach, *The Kingship and Landscape of Tara*, Dublin, Ireland: Four Courts Press, 2005.'
    ]
  },
  {
    id: 'ARC-1105',
    name: 'The Wansdyke (Eastern Section)',
    location: 'Wiltshire, England',
    period: '400 CE – 600 CE',
    startYear: 400,
    endYear: 600,
    description: 'A series of early medieval defensive earthworks. While some sections may have Roman origins, its primary construction is now considered unlikely to date before the 5th century.',
    tags: ['Early Medieval', 'Earthwork', 'Defensive'],
    certainty: 'Unlikely',
    lat: 51.362,
    lng: -1.912,
    bibliography: [
      '[1] A. Fox and C. Fox, "Wansdyke Reconsidered," *Archaeological Journal*, vol. 115, pp. 1-48, 1958.',
      '[2] J. N. L. Myres, *The English Settlements*, Oxford, UK: Clarendon Press, 1986.'
    ]
  }
];
