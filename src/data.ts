import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'PRO-992-BX',
    name: '工业传感器 A1',
    category: '电子产品',
    stock: 450,
    minStock: 20,
    warehouseLocation: 'A区 - 货位 1',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmHSpw2WT9c-t3D0aAccF-X4PmJNvBZ8ap4Fyc5QAW9mQe2WL9qyxclMlC8WfqppZk-vQxDcZzrM385U1FtPSKzdztuPynIp4ECAdSZPdFxg-KW_X_RfyVje0yf_AnVTeg3t3bW-PeO8btzhfFyIC5_NuqTGrQI9en9QetmzTHZdsrrYcmVziry7ZxmSm4I-C-X6Ffdv8FQczf3gf0yZuvVD_zLGMIWUBcqcmO2SEFrPaDIuNz7burmpcjUTvRL9TW1mEHaTemNiE',
    supplier: 'Global Logistics Co.'
  },
  {
    id: 'prod-2',
    sku: 'CBL-PWR-90',
    name: '屏蔽电源线',
    category: '硬件',
    stock: 24,
    minStock: 30,
    warehouseLocation: 'B区 - 货位 4',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB52AR0JHYMGP28yFAq3GeA-FbdyNJu-7aRx5HsfRAa_1pdLVAKRPFBgBmXfNT1P2O74OyoN009lDKHbzlfU3T30oWUwzk2lo_eliQQvdf1mJlIb2mingq412lvUy8T4HYHg4MOXaRz4s_TUC7Ll0cbrpq6x2VXI6WyQ_XLNZqHKePg7PvFcak2dgWR6TulZo5Ne9ADznAQUQzcnQHnLHDIAFemoVPCd9rmtnsGkkcahlDiX4boji-7I8mLbl6xy2ayY4ScvzfEbQo',
    supplier: 'Apex Manufacturing'
  },
  {
    id: 'prod-3',
    sku: 'PACK-L-01',
    name: '环保运输箱',
    category: '硬件',
    stock: 1204,
    minStock: 200,
    warehouseLocation: 'C区 - 货位 2',
    imageUrl: '', // This will render as a nice package icon fallback box
    supplier: 'TechParts Int.'
  },
  {
    id: 'prod-4',
    sku: 'RT-900X',
    name: '工业级路由器',
    category: '电子产品',
    stock: 12,
    minStock: 15,
    warehouseLocation: '仓库 A-42',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCMRrgNjynZb5mQ2dvJQLUIKpGQoPEBye_SztA1y9bK1g8tSq897eYzPHQ6Tpp2QlEUc7qfIHrR5tv0fO4t5r_w6C13bAw-V60eKH0gW6C9loMJtWFwckZJI0bLfG4AwMgvje5I3tuS8BCaHYMrcdk_i0K6760EbNQ1WY8lOr5d6cwmDkizJ9IjOmv-tUl8A9o7pUTgG50Q6nA4VusHj2IsINJhJg_2v-_3CVf369NFjsSw3kXPv-531pRJlS6M33ff1Xp2ycguOM',
    supplier: 'TechParts Int.'
  },
  {
    id: 'prod-5',
    sku: 'CH-ERGO-01',
    name: '人体工学网眼椅',
    category: '办公家具',
    stock: 84,
    minStock: 20,
    warehouseLocation: '仓库 C-12',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSrNR71x3MDfGR3LGvE8uChROIT1mZumASRYQ69OT0o2oU1NfJFaoMjL3yGeWb4Cs0FOGtX2qSVX96kEJuXC3fTrdDMwuMBxjuvbvjLUSqzKUTdC0efsZtnVDXH2uVGtojj-55Amh_GjdeGkTfJEAt_xee6tNRMzPxJuX6PwmLJmhxSmFeYzjcNk19VqhLcqp1hAtrUe0tP22avGicYyaM09ehYbN-T8rPlSvV29gLB1pWz5Deo6LDLLgJl4ULj54cA3vMoWempkA',
    supplier: 'Apex Manufacturing'
  },
  {
    id: 'prod-6',
    sku: 'MON-4K-27',
    name: '27" 4K 显示器',
    category: '电子产品',
    stock: 0,
    minStock: 5,
    warehouseLocation: '仓库 B-05',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbPe4zWggdHY1XAVj3kxmoSzIc2G93r1JZpxJP3oyJs3yRbbBMXgxfEjDF2Xx8Ol--Vi9VeGAYJXxJqM73D7moA51Lwk_gZW766X5ArPf4ed8Rfl3x1puBAJrHzNG8LzDjnCa8CDBItfy0p_55i-sK7B8uW5lG86Fi4pfRO4CE53CVivs-R8okhJaRktScVqNeB3cV7jcmydf24qYh2ofzJ94kuRHrmHNYclBLhmn9B0hEvddiqxG1RibcJbhRphsJ1xAkMLPBCXo',
    supplier: 'TechParts Int.'
  },
  {
    id: 'prod-7',
    sku: 'KB-MECH-PRO',
    name: '机械键盘',
    category: '电子产品',
    stock: 156,
    minStock: 10,
    warehouseLocation: '仓库 A-11',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3mGW_-_w4dQmjJ6nd98Ss-xGqD-vPeMMwIcqrsp4PKyP7Kj8U0fYnLHpPIMF2CY9VfKr15HQ1LEryqTz5couSuglWr-OZ8YHzZ3O-Sapv06oR2mtqqdMJgNTNPp39GMQ-YhCz7Qdi-n7L_1MGdgSb7pKo_P4jSD5lJSBVXEkd3NBXY_EVHxzZleOpUkyRPxI1dKr4GHDpBBItuYY_26PrDsHwvjDlP-dGKbyKC8Z71emyPlYAxxj-VksFKIOabMc8UxbTXfL5FdA',
    supplier: 'Apex Manufacturing'
  },
  {
    id: 'prod-8',
    sku: 'RUN-992-RED',
    name: 'Air-Max Velocity 运动鞋',
    category: '硬件',
    stock: 2,
    minStock: 15,
    warehouseLocation: '仓库 D-15',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9Kxp2qg2C70R6QrC42JBJaaCYupumOKTrsfA0c7Sj2Fkp0HDU1RXf9LdpJIK6uTtsvsXOc2CgFSgyya1j0gkOlm81K1g4bRyikkIAqwWPWHFHCMzzVblCHlk9NTb1FgHYS9AWZyCu5eNaJ8fWmGST58eJVNdiLiHD8p5-qg4iO3RqyUf2V46DSkOUOhsjJcQALqCHNCJkav5pbwumajxCX49N3Hyf5mh2SxIjzwrxA0TQQ7v49dBanHRVma99MZGkAXf7EsktO6E',
    supplier: 'Apex Manufacturing'
  },
  {
    id: 'prod-9',
    sku: 'WCH-LT-V2',
    name: 'Zenith 智能手表',
    category: '电子产品',
    stock: 5,
    minStock: 20,
    warehouseLocation: '仓库 B-10',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtkJPOYcYW6uCdKOU8x75Cb16H6_pItPJOG5Ws-4ZAwDRbJ14udO2DE4QKHTMcr2rtjyx42fwXt0D1ibSC7EYVrIcFPNPBScvksHHaGB5T1yCBTz_a8N1QO_j4-YkvF1P0UX3H47Cd-p1VHILBhT2M2JoiqvpI7pQamD0F4S6OeT_E2AF9O9_20oe7_FThXk-oMfuzyHk742awovEyAcbmwYDMEK8qETeMRE41i-HYURxt1s7xqhqrs1XcWXIqKo07pu0yT5qObbc',
    supplier: 'Global Logistics Co.'
  },
  {
    id: 'prod-10',
    sku: 'AUD-PRO-001',
    name: 'Studio Pro X1 耳机',
    category: '电子产品',
    stock: 8,
    minStock: 10,
    warehouseLocation: '仓库 A-23',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9nehuZCLIFZNS8z27YZYbTXGCw6ugqni0UN7tzbBA3ztA9ph3y91TFXf6QdnNHqJT_IgBdbBMXWu23obDQAxG8Wn9oh3tQiXNAbZKNBYWCigvn8v_MzDm_WrBF8CwxmfniuH_9o0j9JMTwmZXsZZH1LZ9WdI89N1fLXlxPHrcVhigLTqmN7azP0rTGhrSVDw0n8MLBLegHaO72o96hm6KTNftTbPXbamTv2x0cdP0OMdV300ATvfj334hAGs97xyz9o4T5pgqyCg',
    supplier: 'TechParts Int.'
  },
  {
    id: 'prod-11',
    sku: 'CPU-12938-B1',
    name: 'Intel Core i9-13900K',
    category: '电子产品',
    stock: 48,
    minStock: 10,
    warehouseLocation: '仓库 A-02',
    imageUrl: '', // Box icon
    supplier: 'Apex Manufacturing'
  }
];

export const SUPPLIERS = [
  'Global Logistics Co.',
  'Apex Manufacturing',
  'TechParts Int.',
  'SmartLink Electronics',
  'Nexus Supply Chain'
];

export const LOCATIONS = [
  'A区 - 货位 1',
  'A区 - 货位 11',
  'A区 - 货位 42',
  'B区 - 货位 4',
  'B区 - 货位 5',
  'C区 - 货位 2',
  'C区 - 货位 12',
  'D区 - 货位 15'
];
