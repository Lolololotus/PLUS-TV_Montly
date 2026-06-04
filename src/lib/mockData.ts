export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: string; // "MM:SS" or "HH:MM:SS" format
  durationSeconds: number;
  publishedAt: string; // ISO String
  description: string;
  type: 'video' | 'shorts';
  videoUrl: string;
}

export interface ChannelInfo {
  id: string;
  name: string;
  handle: string;
  logo: string;
  subscribers: number;
  subscribersText: string;
  isCompany: boolean; // KODEX: true, others: false
  videos: VideoItem[];
}

// 오늘 기준 상대 날짜(Days ago) 계산용 헬퍼 함수
// 이를 통해 대시보드를 로드할 때마다 가데이터의 날짜가 항상 "이번 주"와 "지난주" 범위 안에 최신화되어 안착합니다.
export function getPastDateString(daysAgo: number, timeStr: string = "10:00:00Z"): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const datePart = d.toISOString().split('T')[0];
  return `${datePart}T${timeStr}`;
}

export const MOCK_CHANNELS: ChannelInfo[] = [
  {
    id: "UCplus_tv_official", 
    name: "한화자산운용 PLUS TV",
    handle: "@plus_tv_official",
    logo: "https://yt3.ggpht.com/ytc/AIdro5kZl0V9nQy_2lYnUq8pZ6kF_jV-m9eB_Zg9oQ=s176-c-k-c0x00ffffff-no-rj",
    subscribers: 48500,
    subscribersText: "4.85만명",
    isCompany: true,
    videos: [
      {
        id: "plus-v1",
        title: "한화 PLUS ETF로 연금 자산 200% 불리기 핵심 전략 & 포트폴리오 제안",
        thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=640&q=80",
        duration: "12:30",
        durationSeconds: 750,
        publishedAt: getPastDateString(2, "10:00:00Z"), // 오늘 기준 2일 전 (이번 달 - 6월)
        description: "안정적인 노후 자산 관리의 지름길! 한화 PLUS ETF 시리즈를 활용하여 연금 계좌의 수익률과 세제 혜택을 극대화하는 투자 패러다임을 제안합니다. 지금 당장 시작할 수 있는 최적의 배당 투자 꿀팁과 리밸런싱 전략까지 한 번에 알려드립니다.",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      },
      {
        id: "plus-s1",
        title: "[Shorts] 연금저축 vs IRP 차이점 딱 60초 요약 💡",
        thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=640&q=80",
        duration: "00:59",
        durationSeconds: 59,
        publishedAt: getPastDateString(3, "15:30:00Z"), // 오늘 기준 3일 전 (이번 달 - 6월)
        description: "연금저축과 퇴직연금(IRP) 중 무엇을 먼저 가입해야 할까요? 핵심적인 세액공제 혜택 차이와 중도 인출 조건 등을 단 60초 만에 완벽 정리해 드립니다! #shorts #연금저축 #IRP #한화자산운용 #PLUS",
        type: "shorts",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      },
      {
        id: "plus-v2",
        title: "미국 테크 10대 대장주에 압축 투자하는 한화 PLUS ETF 대공개! 혁신 성장주 트렌드 분석",
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=640&q=80",
        duration: "08:45",
        durationSeconds: 525,
        publishedAt: getPastDateString(12, "09:30:00Z"), // 오늘 기준 12일 전 (지난달 - 5월)
        description: "인공지능(AI)과 빅테크 시장을 선도하는 미국 대표 기술주 10종에 포커스하는 PLUS 미국테크10 ETF를 심층 소개합니다. 강력한 현금 흐름을 창출하는 독점적 리더들에 안전하고 쉽게 분산 투자해 보세요.",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      },
      {
        id: "plus-s2",
        title: "[Shorts] 해외 주식 양도소득세 절세 꿀팁! ISA 통장이 정답인 이유",
        thumbnail: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=640&q=80",
        duration: "00:45",
        durationSeconds: 45,
        publishedAt: getPastDateString(18, "09:00:00Z"), // 오늘 기준 18일 전 (지난달 - 5월)
        description: "국내 상장 해외 ETF에 투자할 때 ISA 계좌를 활용해야 하는 이유! 비과세 혜택과 분리과세 한도 팁을 초압축 45초 만에 확인해 보세요. #shorts #ISA #절세 #재테크 #한화PLUS",
        type: "shorts",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      },
      {
        id: "plus-v3",
        title: "2026년 꼭 주목해야 할 글로벌 투자 테마 3선 - 인구 고령화, 로봇 공학, 에너지 리쇼어링",
        thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=640&q=80",
        duration: "15:20",
        durationSeconds: 920,
        publishedAt: getPastDateString(40, "11:00:00Z"), // 오늘 기준 40일 전 (2달 전 - 4월)
        description: "단기 소음에서 벗어나 메가트렌드에 장기 투자하라! 향후 10년의 성장을 견인할 주요 글로벌 비즈니스 테마 3가지를 분석하고 한화 PLUS ETF를 통한 맞춤형 대응 솔루션을 제공합니다.",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      },
      {
        id: "plus-s3",
        title: "[Shorts] 월배당 ETF 고르는 3가지 기준 💡",
        thumbnail: "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&w=640&q=80",
        duration: "00:52",
        durationSeconds: 52,
        publishedAt: getPastDateString(42, "14:00:00Z"), // 오늘 기준 42일 전 (2달 전 - 4월)
        description: "최근 붐을 일으키고 있는 매월 월배당(분배금) ETF! 분배율에만 속지 않고 재원의 안정성, 원금 유지력 등을 깐깐하게 비교 분석하는 안목을 기르세요! #shorts #월배당 #ETF투자 #절세통장",
        type: "shorts",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      }
    ]
  },
  {
    id: "UCsamsungsecurities",
    name: "삼성증권",
    handle: "@samsungsecurities",
    logo: "https://yt3.ggpht.com/ytc/AIdro5kl2-9jOpxe0gW1V_X7R8G8Z-lV_y4T9A=s176-c-k-c0x00ffffff-no-rj",
    subscribers: 1120000,
    subscribersText: "112만명",
    isCompany: false,
    videos: [
      {
        id: "samsung-v1",
        title: "[삼성증권 리서치] 글로벌 반도체 전쟁, 엔비디아의 아성을 흔들 온디바이스 AI 기업은?",
        thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=640&q=80",
        duration: "18:15",
        durationSeconds: 1095,
        publishedAt: getPastDateString(1, "14:00:00Z"), // 오늘 기준 1일 전 (이번 달 - 6월)
        description: "글로벌 테크 리포트 라이브! AI 연산의 패러다임이 클라우드에서 온디바이스로 이동하는 현재, 가장 큰 도약이 기대되는 아시아와 미국의 AI 설계 및 파운드리 관련 핵심 밸류체인을 삼성증권 전문 애널리스트가 전격 브리핑합니다.",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      },
      {
        id: "samsung-s1",
        title: "[Shorts] 채권 금리와 가격의 관계? 30초 만에 완벽 이해하기 📉",
        thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=640&q=80",
        duration: "00:30",
        durationSeconds: 30,
        publishedAt: getPastDateString(2, "11:00:00Z"), // 오늘 기준 2일 전 (이번 달 - 6월)
        description: "금리가 오르면 채권 가격은 떨어집니다. 왜 그럴까요? 기초 금융 원리를 비유를 통해 딱 30초 만에 명쾌하게 마스터하세요! #shorts #삼성증권 #채권투자 #재테크초보",
        type: "shorts",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      },
      {
        id: "samsung-v2",
        title: "연금저축계좌에서 연 6% 기대 분배금 받는 매력적인 월배당 채권 포트폴리오 구성 가이드",
        thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=640&q=80",
        duration: "11:20",
        durationSeconds: 680,
        publishedAt: getPastDateString(8, "10:30:00Z"), // 오늘 기준 8일 전 (지난달 - 5월)
        description: "변동성이 큰 주식형 월배당 상품 대신 견조한 이자 수익을 추구하는 미국 국채 및 글로벌 신용 회사채 ETF의 매력! 세액공제를 받으면서 동시에 정기 소득을 안착시키는 현실적인 매매 시나리오를 공유합니다.",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      },
      {
        id: "samsung-s2",
        title: "[Shorts] 주택청약종합저축 2026 연말정산 공제 혜택 총정리 🏠",
        thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=640&q=80",
        duration: "00:55",
        durationSeconds: 55,
        publishedAt: getPastDateString(15, "13:00:00Z"), // 오늘 기준 15일 전 (지난달 - 5월)
        description: "무주택 세대주라면 필수! 주택청약 연간 납입액의 최대 40%까지 소득공제 받는 기준과 주의사항을 한눈에 알아보세요. #shorts #연말정산 #소득공제 #삼성증권",
        type: "shorts",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      },
      {
        id: "samsung-v3",
        title: "미국 대선과 글로벌 금융시장 긴급 진단: 양대 후보의 정책 차이가 주식 시장에 미칠 나비효과는?",
        thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=640&q=80",
        duration: "22:40",
        durationSeconds: 1360,
        publishedAt: getPastDateString(36, "09:00:00Z"), // 오늘 기준 36일 전 (2달 전 - 4월)
        description: "글로벌 매크로 긴급 진단! 공화당과 민주당의 조세제도, 친환경 에너지 및 반도체 산업 규제 방향성에 따른 최대 수혜주와 피해 업종을 계량적으로 분석합니다. 성공적인 하반기 자산 배분의 나침반이 될 것입니다.",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      },
      {
        id: "samsung-s3",
        title: "[Shorts] 커피 한 잔 값으로 테슬라 주주 되기! 해외 주식 소수점 투자 핵심 팁",
        thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=640&q=80",
        duration: "00:40",
        durationSeconds: 40,
        publishedAt: getPastDateString(48, "17:00:00Z"), // 오늘 기준 48일 전 (2달 전 - 4월)
        description: "비싼 주가 때문에 매수를 망설였던 해외 빅테크 주식들! 삼성증권 앱에서 단돈 1천 원 단위로 쪼개어 실시간 적립식 투자를 설정하는 절차를 정리해 드립니다. #shorts #해외주식 #테슬라 #엔비디아",
        type: "shorts",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      }
    ]
  },
  {
    id: "UCSmartMoney0",
    name: "미래에셋 스마트머니",
    handle: "@SmartMoney0",
    logo: "https://yt3.ggpht.com/ytc/AIdro5nS5Xn-9p8aY-V8B_bU8Z5n-Y=s176-c-k-c0x00ffffff-no-rj",
    subscribers: 254000,
    subscribersText: "25.4만명",
    isCompany: false,
    videos: [
      {
        id: "mirae-v1",
        title: "[스마트머니] 2026 글로벌 테마 분석: 미국 빅테크 실적발표 집중 분석 & 하반기 원픽 공개",
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=640&q=80",
        duration: "14:10",
        durationSeconds: 850,
        publishedAt: getPastDateString(2, "08:00:00Z"), // 오늘 기준 2일 전 (이번 달 - 6월)
        description: "어닝 시즌 개막! M7 기업들의 인프라 투자 지속 여부와 클라우드/AI 매출 성장률 팩트 체크. 미래에셋 리서치 센터의 냉철한 시각과 모델링을 기반으로 한 향후 시장 조정기에서의 분할 매수 밴드 가이드라인을 제시합니다.",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      },
      {
        id: "mirae-v2",
        title: "거치식 목돈 펀드 투자 vs 매월 분할 매수 ETF 전략, 내 투자 성향에 최적인 포맷은?",
        thumbnail: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=640&q=80",
        duration: "09:50",
        durationSeconds: 590,
        publishedAt: getPastDateString(14, "09:00:00Z"), // 오늘 기준 14일 전 (지난달 - 5월)
        description: "적립식 투자의 복리 효과를 실제 시뮬레이션 데이터를 통해 명확하게 파악해 봅니다. 평균 단가 인하 효과(Cost Averaging)가 하락장 및 횡보장에서 빛을 발하는 기전과, 바쁜 투자자들을 위한 주식형 ETF 연동 적립 셋팅 방법을 상세 분석합니다.",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      },
      {
        id: "mirae-s1",
        title: "[Shorts] 퇴직연금 디폴트옵션, 아직 신청 안 하셨다면 주목하세요! 💸",
        thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=640&q=80",
        duration: "00:58",
        durationSeconds: 58,
        publishedAt: getPastDateString(5, "11:00:00Z"), // 오늘 기준 5일 전 (지난달 - 5월)
        description: "DC형 퇴직연금이나 개인형 IRP를 가입해 두고 그대로 방치해서 연 1%대 금리만 받고 계신가요? 정부에서 지정한 자동 자산 운용 상품(디폴트옵션) 설정으로 수익률을 끌어올릴 수 있는 지름길을 단 50초 안에 확인하세요! #shorts #디폴트옵션 #퇴직연금 #IRP",
        type: "shorts",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      },
      {
        id: "mirae-v3",
        title: "인도 증시 폭발적 성장 모멘텀 진단! 타타그룹 등 대표 제조 대기업 및 신성장 밸류체인 투자 실전 가이드",
        thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=640&q=80",
        duration: "16:30",
        durationSeconds: 990,
        publishedAt: getPastDateString(50, "17:00:00Z"), // 오늘 기준 50일 전 (2달 전 - 4월)
        description: "넥스트 차이나로 확실히 공고화된 인도 시장! 거대한 내수 시장과 정부의 적극적인 인프라 확충 수혜를 한몸에 받는 초일류 인도 인프라 대기업 리스트와 이를 가장 간편하게 분산 매수할 수 있는 실무 테크닉을 공유합니다.",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      }
    ]
  },
  {
    id: "UCnhinvest_login",
    name: "NH투자증권 login",
    handle: "@nhinvest_login",
    logo: "https://yt3.ggpht.com/ytc/AIdro5nS5Xn-9p8aY-V8B_bU8Z5n-Y=s176-c-k-c0x00ffffff-no-rj",
    subscribers: 185000,
    subscribersText: "18.5만명",
    isCompany: false,
    videos: [
      {
        id: "nh-v1",
        title: "[QV 월간전망] 글로벌 인플레이션 둔화 기조 속 고금리 후반부 자산 배분 방어 전략",
        thumbnail: "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&w=640&q=80",
        duration: "10:45",
        durationSeconds: 645,
        publishedAt: getPastDateString(3, "08:00:00Z"), // 오늘 기준 3일 전 (이번 달 - 6월)
        description: "NH투자증권 리서치본부가 전망하는 2026 중기 금융 전망 라이브! 기준 금리 동결 및 점진적 인하 사이클 속에서 채권, 리츠, 고배당주 포트폴리오의 비중 최적화 방식을 제시해 드립니다.",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      },
      {
        id: "nh-v2",
        title: "미국 장기채 레버리지 ETF 투자 시 횡보장에서 나타나는 'Vol Drag(음의 복리 효과)'의 실체",
        thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=640&q=80",
        duration: "13:12",
        durationSeconds: 792,
        publishedAt: getPastDateString(11, "09:00:00Z"), // 오늘 기준 11일 전 (지난달 - 5월)
        description: "금리 인하 베팅을 위해 3배 레버리지 장기채 ETF에 장기 투자하면 계좌 녹는다는 경고, 다 이유가 있습니다. 기초 지수가 등락을 거듭하며 횡보할 때 가치가 갉아먹히는 계량적 메커니즘을 상세히 예시로 설명해 드립니다.",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      },
      {
        id: "nh-s1",
        title: "[Shorts] 금 투자 실물 골드바 vs 금 ETF vs KRX금시장, 세금 혜택 승자는?",
        thumbnail: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=640&q=80",
        duration: "00:50",
        durationSeconds: 50,
        publishedAt: getPastDateString(17, "17:00:00Z"), // 오늘 기준 17일 전 (지난달 - 5월)
        description: "대표적인 안전자산 금! 하지만 투자 방식에 따라 배당소득세(15.4%)가 부과되거나 비과세가 될 수 있다는 사실 아셨나요? 실무적으로 가장 경제적인 투자 통로를 알려드립니다! #shorts #금투자 #재테크 #절세",
        type: "shorts",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      },
      {
        id: "nh-v3",
        title: "자녀에게 세금 없이 합법적으로 주식 증여하는 팁! 비과세 증여 한도 및 국세청 자금출처조사 대비 요령",
        thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=640&q=80",
        duration: "19:40",
        durationSeconds: 1180,
        publishedAt: getPastDateString(42, "09:30:00Z"), // 오늘 기준 42일 전 (2달 전 - 4월)
        description: "미성년 자녀에게 10년 단위로 공제받는 증여 비과세 한도 2,000만 원(성년 5,000만 원)을 120% 활용하는 증여 매니지먼트. 주가가 저평가되어 있는 우량 성장주를 사전 증여해 주었을 때의 절세 장점과 증여신고 홈택스 매뉴얼을 안내합니다.",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      }
    ]
  }
];
