// All talukas/cities in Latur District, Maharashtra
// Used for SEO city landing pages and structured data

export interface LaturCity {
  name: string;
  marathiName: string;
  slug: string;
  taluka: string;
  lat: number;
  lng: number;
  population?: number;
  description: string;
  marathiDescription: string;
  nearbyAreas: string[];
}

export const LATUR_CITIES: LaturCity[] = [
  {
    name: 'Latur',
    marathiName: 'लातूर',
    slug: 'latur',
    taluka: 'Latur',
    lat: 18.4088,
    lng: 76.5604,
    population: 382754,
    description: 'Latur is the district headquarters and largest city of Latur district, Maharashtra. It is a major commercial and educational hub with growing real estate demand.',
    marathiDescription: 'लातूर हे लातूर जिल्ह्याचे मुख्यालय आहे. येथे घर, प्लॉट, फ्लॅट खरेदी-विक्रीसाठी माझी वास्तु सर्वोत्तम आहे.',
    nearbyAreas: ['Latur City', 'Latur MIDC', 'Latur Railway Station', 'Udgir Road Latur', 'Nanded Road Latur', 'Solapur Road Latur'],
  },
  {
    name: 'Udgir',
    marathiName: 'उदगीर',
    slug: 'udgir',
    taluka: 'Udgir',
    lat: 18.3946,
    lng: 77.1175,
    population: 100000,
    description: 'Udgir is the second largest city in Latur district, known for its historic fort and growing infrastructure. Excellent real estate investment opportunity.',
    marathiDescription: 'उदगीर हे लातूर जिल्ह्यातील दुसरे मोठे शहर आहे. उदगीर किल्ल्यासाठी प्रसिद्ध असलेल्या या शहरात रियल इस्टेटमध्ये गुंतवणूक फायदेशीर आहे.',
    nearbyAreas: ['Udgir Fort', 'Udgir Bus Stand', 'Udgir MIDC', 'Bidar Road Udgir', 'Latur Road Udgir'],
  },
  {
    name: 'Nilanga',
    marathiName: 'निलंगा',
    slug: 'nilanga',
    taluka: 'Nilanga',
    lat: 17.7430,
    lng: 76.8233,
    population: 35000,
    description: 'Nilanga is a growing taluka in Latur district with affordable property rates. Ideal for first-time homebuyers looking for plots and homes in Latur district.',
    marathiDescription: 'निलंगा हे लातूर जिल्ह्यातील एक महत्त्वाचे तालुका शहर आहे. येथे परवडणाऱ्या किमतीत प्लॉट आणि घरे उपलब्ध आहेत.',
    nearbyAreas: ['Nilanga Bus Stand', 'Nilanga Market', 'Gulbarga Road Nilanga', 'Bidar Road Nilanga'],
  },
  {
    name: 'Ausa',
    marathiName: 'औसा',
    slug: 'ausa',
    taluka: 'Ausa',
    lat: 18.2566,
    lng: 76.5092,
    population: 25000,
    description: 'Ausa is a historical taluka town in Latur district with the famous Ausa Fort. Growing residential and commercial property market with affordable rates.',
    marathiDescription: 'औसा हे ऐतिहासिक तालुका शहर असून येथील औसा किल्ला प्रसिद्ध आहे. येथे परवडणाऱ्या किमतीत मालमत्ता उपलब्ध आहे.',
    nearbyAreas: ['Ausa Fort', 'Ausa Market', 'Latur Road Ausa', 'Osmanabad Road Ausa'],
  },
  {
    name: 'Chakur',
    marathiName: 'चाकूर',
    slug: 'chakur',
    taluka: 'Chakur',
    lat: 17.8900,
    lng: 76.5667,
    population: 20000,
    description: 'Chakur is a developing taluka in Latur district. The region offers affordable land and plot opportunities with good connectivity to Latur city.',
    marathiDescription: 'चाकूर हे लातूर जिल्ह्यातील एक विकसनशील तालुका आहे. लातूर शहराशी चांगल्या रस्त्याने जोडलेले असल्याने येथे गुंतवणूक फायदेशीर आहे.',
    nearbyAreas: ['Chakur Market', 'Chakur-Latur Road', 'Gunj Peth Chakur'],
  },
  {
    name: 'Deoni',
    marathiName: 'देवणी',
    slug: 'deoni',
    taluka: 'Deoni',
    lat: 18.2500,
    lng: 77.1000,
    population: 15000,
    description: 'Deoni is a small but significant taluka in Latur district. Agricultural land and residential plots available at very affordable prices.',
    marathiDescription: 'देवणी हे लातूर जिल्ह्यातील एक तालुका असून येथे शेत जमीन आणि निवासी प्लॉट कमी किमतीत उपलब्ध आहेत.',
    nearbyAreas: ['Deoni Market', 'Deoni Taluka Office', 'Udgir Road Deoni'],
  },
  {
    name: 'Renapur',
    marathiName: 'रेणापूर',
    slug: 'renapur',
    taluka: 'Renapur',
    lat: 18.0928,
    lng: 76.5731,
    population: 22000,
    description: 'Renapur is a taluka town in Latur district, known for Renuka Mata temple. Residential plots and homes at competitive prices near Latur city.',
    marathiDescription: 'रेणापूर हे रेणुका माता मंदिरासाठी प्रसिद्ध असलेले लातूर जिल्ह्यातील तालुका शहर आहे. येथे किफायतशीर किमतीत घरे उपलब्ध आहेत.',
    nearbyAreas: ['Renapur Temple', 'Renapur Market', 'Latur Nanded Highway Renapur'],
  },
  {
    name: 'Ahmedpur',
    marathiName: 'अहमदपूर',
    slug: 'ahmedpur',
    taluka: 'Ahmedpur',
    lat: 18.6763,
    lng: 76.9366,
    population: 30000,
    description: 'Ahmedpur is a well-connected taluka headquarters in Latur district. Growing city with new residential developments, commercial shops, and plotted schemes.',
    marathiDescription: 'अहमदपूर हे लातूर जिल्ह्यातील एक महत्त्वाचे तालुका शहर आहे. येथे नवीन निवासी योजना आणि व्यावसायिक मालमत्ता उपलब्ध आहेत.',
    nearbyAreas: ['Ahmedpur Bus Stand', 'Ahmedpur Railway Station', 'Nanded Road Ahmedpur', 'Bidar Road Ahmedpur'],
  },
  {
    name: 'Shirur Anantpal',
    marathiName: 'शिरूर अनंतपाळ',
    slug: 'shirur-anantpal',
    taluka: 'Shirur Anantpal',
    lat: 18.0333,
    lng: 76.8833,
    population: 12000,
    description: 'Shirur Anantpal is a taluka in Latur district offering affordable rural and semi-urban properties. Good for agricultural land investment.',
    marathiDescription: 'शिरूर अनंतपाळ हे लातूर जिल्ह्यातील एक तालुका असून येथे शेती जमीन आणि निवासी मालमत्ता परवडणाऱ्या किमतीत उपलब्ध आहे.',
    nearbyAreas: ['Shirur Market', 'Anantpal Road', 'Latur Road Shirur'],
  },
  {
    name: 'Jalkot',
    marathiName: 'जळकोट',
    slug: 'jalkot',
    taluka: 'Jalkot',
    lat: 17.6333,
    lng: 77.2167,
    population: 18000,
    description: 'Jalkot is a border taluka in Latur district near Karnataka. Strategically located for cross-border trade with affordable property rates.',
    marathiDescription: 'जळकोट हे कर्नाटक सीमेवरील लातूर जिल्ह्यातील तालुका आहे. येथे स्वस्त दरात जमीन आणि मालमत्ता उपलब्ध आहे.',
    nearbyAreas: ['Jalkot Market', 'Bidar Border Road', 'Gulbarga Road Jalkot'],
  },
];

export const LATUR_DISTRICT_META = {
  name: 'Latur',
  marathiName: 'लातूर',
  state: 'Maharashtra',
  country: 'India',
  lat: 18.4088,
  lng: 76.5604,
  primaryKeywords: [
    'property in latur',
    'latur property',
    'latur real estate',
    'ghar vikne ahe latur',
    'plot for sale latur',
    'flat in latur',
    'latur mein makaan',
    'latur district property',
    'property latur maharashtra',
    'buy property latur',
    'latur madhe ghar vikayche ahe',
    'latur jilha property',
  ],
};
