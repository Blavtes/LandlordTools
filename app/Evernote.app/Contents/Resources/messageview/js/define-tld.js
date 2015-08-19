/**
 * Taken from http://data.iana.org/TLD/tlds-alpha-by-domain.txt
 * Used to better recognise shot URLs
 *
 * @const
 * */
var DEFINE_TLD = [
    'ABOGADO',
    'AC',
    'ACADEMY',
    'ACCOUNTANTS',
    'ACTIVE',
    'ACTOR',
    'AD',
    'AE',
    'AERO',
    'AF',
    'AG',
    'AGENCY',
    'AI',
    'AIRFORCE',
    'AL',
    'ALLFINANZ',
    'ALSACE',
    'AM',
    'AN',
    'AO',
    'AQ',
    'AR',
    'ARCHI',
    'ARMY',
    'ARPA',
    'AS',
    'ASIA',
    'ASSOCIATES',
    'AT',
    'ATTORNEY',
    'AU',
    'AUCTION',
    'AUDIO',
    'AUTOS',
    'AW',
    'AX',
    'AXA',
    'AZ',
    'BA',
    'BAND',
    'BAR',
    'BARGAINS',
    'BAYERN',
    'BB',
    'BD',
    'BE',
    'BEER',
    'BERLIN',
    'BEST',
    'BF',
    'BG',
    'BH',
    'BI',
    'BID',
    'BIKE',
    'BIO',
    'BIZ',
    'BJ',
    'BLACK',
    'BLACKFRIDAY',
    'BLUE',
    'BM',
    'BMW',
    'BN',
    'BNPPARIBAS',
    'BO',
    'BOO',
    'BOUTIQUE',
    'BR',
    'BRUSSELS',
    'BS',
    'BT',
    'BUDAPEST',
    'BUILD',
    'BUILDERS',
    'BUSINESS',
    'BUZZ',
    'BV',
    'BW',
    'BY',
    'BZ',
    'BZH',
    'CA',
    'CAB',
    'CAL',
    'CAMERA',
    'CAMP',
    'CANCERRESEARCH',
    'CAPETOWN',
    'CAPITAL',
    'CARAVAN',
    'CARDS',
    'CARE',
    'CAREER',
    'CAREERS',
    'CASA',
    'CASH',
    'CAT',
    'CATERING',
    'CC',
    'CD',
    'CENTER',
    'CEO',
    'CERN',
    'CF',
    'CG',
    'CH',
    'CHANNEL',
    'CHEAP',
    'CHRISTMAS',
    'CHROME',
    'CHURCH',
    'CI',
    'CITIC',
    'CITY',
    'CK',
    'CL',
    'CLAIMS',
    'CLEANING',
    'CLICK',
    'CLINIC',
    'CLOTHING',
    'CLUB',
    'CM',
    'CN',
    'CO',
    'CODES',
    'COFFEE',
    'COLLEGE',
    'COLOGNE',
    'COM',
    'COMMUNITY',
    'COMPANY',
    'COMPUTER',
    'CONDOS',
    'CONSTRUCTION',
    'CONSULTING',
    'CONTRACTORS',
    'COOKING',
    'COOL',
    'COOP',
    'COUNTRY',
    'CR',
    'CREDIT',
    'CREDITCARD',
    'CRS',
    'CRUISES',
    'CU',
    'CUISINELLA',
    'CV',
    'CW',
    'CX',
    'CY',
    'CYMRU',
    'CZ',
    'DAD',
    'DANCE',
    'DATING',
    'DAY',
    'DE',
    'DEALS',
    'DEGREE',
    'DEMOCRAT',
    'DENTAL',
    'DENTIST',
    'DESI',
    'DIAMONDS',
    'DIET',
    'DIGITAL',
    'DIRECT',
    'DIRECTORY',
    'DISCOUNT',
    'DJ',
    'DK',
    'DM',
    'DNP',
    'DO',
    'DOMAINS',
    'DURBAN',
    'DVAG',
    'DZ',
    'EAT',
    'EC',
    'EDU',
    'EDUCATION',
    'EE',
    'EG',
    'EMAIL',
    'EMERCK',
    'ENGINEER',
    'ENGINEERING',
    'ENTERPRISES',
    'EQUIPMENT',
    'ER',
    'ES',
    'ESQ',
    'ESTATE',
    'ET',
    'EU',
    'EUS',
    'EVENTS',
    'EXCHANGE',
    'EXPERT',
    'EXPOSED',
    'FAIL',
    'FARM',
    'FEEDBACK',
    'FI',
    'FINANCE',
    'FINANCIAL',
    'FISH',
    'FISHING',
    'FITNESS',
    'FJ',
    'FK',
    'FLIGHTS',
    'FLORIST',
    'FLSMIDTH',
    'FLY',
    'FM',
    'FO',
    'FOO',
    'FORSALE',
    'FOUNDATION',
    'FR',
    'FRL',
    'FROGANS',
    'FUND',
    'FURNITURE',
    'FUTBOL',
    'GA',
    'GAL',
    'GALLERY',
    'GB',
    'GBIZ',
    'GD',
    'GE',
    'GENT',
    'GF',
    'GG',
    'GH',
    'GI',
    'GIFT',
    'GIFTS',
    'GIVES',
    'GL',
    'GLASS',
    'GLE',
    'GLOBAL',
    'GLOBO',
    'GM',
    'GMAIL',
    'GMO',
    'GMX',
    'GN',
    'GOOGLE',
    'GOP',
    'GOV',
    'GP',
    'GQ',
    'GR',
    'GRAPHICS',
    'GRATIS',
    'GREEN',
    'GRIPE',
    'GS',
    'GT',
    'GU',
    'GUIDE',
    'GUITARS',
    'GURU',
    'GW',
    'GY',
    'HAMBURG',
    'HAUS',
    'HEALTHCARE',
    'HELP',
    'HERE',
    'HIPHOP',
    'HIV',
    'HK',
    'HM',
    'HN',
    'HOLDINGS',
    'HOLIDAY',
    'HOMES',
    'HORSE',
    'HOST',
    'HOSTING',
    'HOUSE',
    'HOW',
    'HR',
    'HT',
    'HU',
    'IBM',
    'ID',
    'IE',
    'IL',
    'IM',
    'IMMO',
    'IMMOBILIEN',
    'IN',
    'INDUSTRIES',
    'INFO',
    'ING',
    'INK',
    'INSTITUTE',
    'INSURE',
    'INT',
    'INTERNATIONAL',
    'INVESTMENTS',
    'IO',
    'IQ',
    'IR',
    'IS',
    'IT',
    'JE',
    'JETZT',
    'JM',
    'JO',
    'JOBS',
    'JOBURG',
    'JP',
    'JUEGOS',
    'KAUFEN',
    'KE',
    'KG',
    'KH',
    'KI',
    'KIM',
    'KITCHEN',
    'KIWI',
    'KM',
    'KN',
    'KOELN',
    'KP',
    'KR',
    'KRD',
    'KRED',
    'KW',
    'KY',
    'KZ',
    'LA',
    'LACAIXA',
    'LAND',
    'LAWYER',
    'LB',
    'LC',
    'LEASE',
    'LGBT',
    'LI',
    'LIFE',
    'LIGHTING',
    'LIMITED',
    'LIMO',
    'LINK',
    'LK',
    'LOANS',
    'LONDON',
    'LOTTO',
    'LR',
    'LS',
    'LT',
    'LTDA',
    'LU',
    'LUXE',
    'LUXURY',
    'LV',
    'LY',
    'MA',
    'MAISON',
    'MANAGEMENT',
    'MANGO',
    'MARKET',
    'MARKETING',
    'MC',
    'MD',
    'ME',
    'MEDIA',
    'MEET',
    'MELBOURNE',
    'MEME',
    'MENU',
    'MG',
    'MH',
    'MIAMI',
    'MIL',
    'MINI',
    'MK',
    'ML',
    'MM',
    'MN',
    'MO',
    'MOBI',
    'MODA',
    'MOE',
    'MONASH',
    'MORTGAGE',
    'MOSCOW',
    'MOTORCYCLES',
    'MOV',
    'MP',
    'MQ',
    'MR',
    'MS',
    'MT',
    'MU',
    'MUSEUM',
    'MV',
    'MW',
    'MX',
    'MY',
    'MZ',
    'NA',
    'NAGOYA',
    'NAME',
    'NAVY',
    'NC',
    'NE',
    'NET',
    'NETWORK',
    'NEUSTAR',
    'NEW',
    'NEXUS',
    'NF',
    'NG',
    'NGO',
    'NHK',
    'NI',
    'NINJA',
    'NL',
    'NO',
    'NP',
    'NR',
    'NRA',
    'NRW',
    'NU',
    'NYC',
    'NZ',
    'OKINAWA',
    'OM',
    'ONG',
    'ONL',
    'OOO',
    'ORG',
    'ORGANIC',
    'OTSUKA',
    'OVH',
    'PA',
    'PARIS',
    'PARTNERS',
    'PARTS',
    'PE',
    'PF',
    'PG',
    'PH',
    'PHARMACY',
    'PHOTO',
    'PHOTOGRAPHY',
    'PHOTOS',
    'PHYSIO',
    'PICS',
    'PICTURES',
    'PINK',
    'PIZZA',
    'PK',
    'PL',
    'PLACE',
    'PLUMBING',
    'PM',
    'PN',
    'POHL',
    'POKER',
    'POST',
    'PR',
    'PRAXI',
    'PRESS',
    'PRO',
    'PROD',
    'PRODUCTIONS',
    'PROF',
    'PROPERTIES',
    'PROPERTY',
    'PS',
    'PT',
    'PUB',
    'PW',
    'PY',
    'QA',
    'QPON',
    'QUEBEC',
    'RE',
    'REALTOR',
    'RECIPES',
    'RED',
    'REHAB',
    'REISE',
    'REISEN',
    'REN',
    'RENTALS',
    'REPAIR',
    'REPORT',
    'REPUBLICAN',
    'REST',
    'RESTAURANT',
    'REVIEWS',
    'RICH',
    'RIO',
    'RIP',
    'RO',
    'ROCKS',
    'RODEO',
    'RS',
    'RSVP',
    'RU',
    'RUHR',
    'RW',
    'RYUKYU',
    'SA',
    'SAARLAND',
    'SARL',
    'SB',
    'SC',
    'SCA',
    'SCB',
    'SCHMIDT',
    'SCHULE',
    'SCOT',
    'SD',
    'SE',
    'SERVICES',
    'SEXY',
    'SG',
    'SH',
    'SHIKSHA',
    'SHOES',
    'SI',
    'SINGLES',
    'SJ',
    'SK',
    'SL',
    'SM',
    'SN',
    'SO',
    'SOCIAL',
    'SOFTWARE',
    'SOHU',
    'SOLAR',
    'SOLUTIONS',
    'SOY',
    'SPACE',
    'SPIEGEL',
    'SR',
    'ST',
    'SU',
    'SUPPLIES',
    'SUPPLY',
    'SUPPORT',
    'SURF',
    'SURGERY',
    'SUZUKI',
    'SV',
    'SX',
    'SY',
    'SYSTEMS',
    'SZ',
    'TAIPEI',
    'TATAR',
    'TATTOO',
    'TAX',
    'TC',
    'TD',
    'TECHNOLOGY',
    'TEL',
    'TF',
    'TG',
    'TH',
    'TIENDA',
    'TIPS',
    'TIROL',
    'TJ',
    'TK',
    'TL',
    'TM',
    'TN',
    'TO',
    'TODAY',
    'TOKYO',
    'TOOLS',
    'TOP',
    'TOWN',
    'TOYS',
    'TP',
    'TR',
    'TRADE',
    'TRAINING',
    'TRAVEL',
    'TT',
    'TUI',
    'TV',
    'TW',
    'TZ',
    'UA',
    'UG',
    'UK',
    'UNIVERSITY',
    'UNO',
    'UOL',
    'US',
    'UY',
    'UZ',
    'VA',
    'VACATIONS',
    'VC',
    'VE',
    'VEGAS',
    'VENTURES',
    'VERSICHERUNG',
    'VET',
    'VG',
    'VI',
    'VIAJES',
    'VILLAS',
    'VISION',
    'VLAANDEREN',
    'VN',
    'VODKA',
    'VOTE',
    'VOTING',
    'VOTO',
    'VOYAGE',
    'VU',
    'WALES',
    'WANG',
    'WATCH',
    'WEBCAM',
    'WEBSITE',
    'WED',
    'WEDDING',
    'WF',
    'WHOSWHO',
    'WIEN',
    'WIKI',
    'WILLIAMHILL',
    'WME',
    'WORK',
    'WORKS',
    'WORLD',
    'WS',
    'WTC',
    'WTF',
    'XN--1QQW23A',
    'XN--3BST00M',
    'XN--3DS443G',
    'XN--3E0B707E',
    'XN--45BRJ9C',
    'XN--4GBRIM',
    'XN--55QW42G',
    'XN--55QX5D',
    'XN--6FRZ82G',
    'XN--6QQ986B3XL',
    'XN--80ADXHKS',
    'XN--80AO21A',
    'XN--80ASEHDB',
    'XN--80ASWG',
    'XN--90A3AC',
    'XN--C1AVG',
    'XN--CG4BKI',
    'XN--CLCHC0EA0B2G2A9GCD',
    'XN--CZR694B',
    'XN--CZRU2D',
    'XN--D1ACJ3B',
    'XN--FIQ228C5HS',
    'XN--FIQ64B',
    'XN--FIQS8S',
    'XN--FIQZ9S',
    'XN--FPCRJ9C3D',
    'XN--FZC2C9E2C',
    'XN--GECRJ9C',
    'XN--H2BRJ9C',
    'XN--I1B6B1A6A2E',
    'XN--IO0A7I',
    'XN--J1AMH',
    'XN--J6W193G',
    'XN--KPRW13D',
    'XN--KPRY57D',
    'XN--KPUT3I',
    'XN--L1ACC',
    'XN--LGBBAT1AD8J',
    'XN--MGB9AWBF',
    'XN--MGBA3A4F16A',
    'XN--MGBAAM7A8H',
    'XN--MGBAB2BD',
    'XN--MGBAYH7GPA',
    'XN--MGBBH1A71E',
    'XN--MGBC0A9AZCG',
    'XN--MGBERP4A5D4AR',
    'XN--MGBX4CD0AB',
    'XN--NGBC5AZD',
    'XN--NQV7F',
    'XN--NQV7FS00EMA',
    'XN--O3CW4H',
    'XN--OGBPF8FL',
    'XN--P1ACF',
    'XN--P1AI',
    'XN--PGBS0DH',
    'XN--Q9JYB4C',
    'XN--RHQV96G',
    'XN--S9BRJ9C',
    'XN--SES554G',
    'XN--UNUP4Y',
    'XN--VERMGENSBERATER-CTB',
    'XN--VERMGENSBERATUNG-PWB',
    'XN--VHQUV',
    'XN--WGBH1C',
    'XN--WGBL6A',
    'XN--XHQ521B',
    'XN--XKC2AL3HYE2A',
    'XN--XKC2DL3A5EE0H',
    'XN--YFRO4I67O',
    'XN--YGBI2AMMX',
    'XN--ZFR164B',
    'XXX',
    'XYZ',
    'YACHTS',
    'YANDEX',
    'YE',
    'YOGA',
    'YOKOHAMA',
    'YOUTUBE',
    'YT',
    'ZA',
    'ZIP',
    'ZM',
    'ZONE',
    'ZW'
];
