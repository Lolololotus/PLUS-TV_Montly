"use client";

import React, { useState, useEffect } from 'react';
import { ChannelInfo, VideoItem } from '@/lib/mockData';
import { getDashboardData } from '@/lib/youtube';

// 최근 N개월간의 리포팅 월간 목록을 계산하는 헬퍼 함수
interface ReportingMonth {
  id: string;
  label: string;
  start: Date;
  end: Date;
}

function generateReportingMonths(count: number = 5): ReportingMonth[] {
  const months: ReportingMonth[] = [];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const target = new Date(today.getFullYear(), today.getMonth() - i, 1);
    
    const year = target.getFullYear();
    const month = target.getMonth(); // 0-indexed
    
    const start = new Date(year, month, 1, 0, 0, 0, 0);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999); // last day of month
    
    let suffix = '';
    if (i === 0) suffix = ' (이번 달)';
    else if (i === 1) suffix = ' (지난달)';
    
    const label = `${year}년 ${month + 1}월` + suffix;
    
    months.push({
      id: `${year}-${month + 1}`,
      label,
      start,
      end
    });
  }
  
  return months;
}

export default function DashboardPage() {
  const [channels, setChannels] = useState<ChannelInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // 필터 1: 비디오 형식 필터 (전체/동영상/Shorts)
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'shorts'>('all');
  
  // 필터 2: 채널별 필터 (전체/PLUS/삼성/미래/NH)
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'plus' | 'samsung' | 'smart' | 'nh'>('all');
  
  // 동적 리포팅 월간 옵션 목록 (최근 5개월)
  const [reportingMonths, setReportingMonths] = useState<ReportingMonth[]>([]);
  const [selectedMonthId, setSelectedMonthId] = useState<string>('');

  const loadData = async (isRefresh: boolean = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // 서버 API Route를 호출하여 실시간 데이터를 안전하게 조회 (타임스탬프로 캐시 무력화)
      const res = await fetch(`/api/dashboard?t=${Date.now()}`);
      if (!res.ok) {
        throw new Error(`API 응답 실패: ${res.status}`);
      }
      const data = await res.json();
      setChannels(data.channels);
    } catch (error) {
      console.error("데이터 로드 실패 (실시간 연동 실패), 가데이터로 폴백합니다:", error);
      try {
        // API 호출 에러 시 클라이언트 측에서 직접 getDashboardData를 호출하여 가데이터 폴백 수행
        const fallbackData = await getDashboardData();
        setChannels(fallbackData.channels);
      } catch (fbError) {
        console.error("가데이터 폴백 에러:", fbError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 이번 달과 지난달의 업로드 통계를 상시 비교 분석하는 헬퍼 함수
  const getComparisonStats = (channel: ChannelInfo) => {
    const months = generateReportingMonths(2); // [이번달, 지난달]
    if (months.length < 2) return { thisMonth: 0, lastMonth: 0, diff: 0 };
    
    const thisMonthVideos = getFilteredVideosForSelectedMonth(channel.videos, months[0]);
    const lastMonthVideos = getFilteredVideosForSelectedMonth(channel.videos, months[1]);
    
    const thisMonth = thisMonthVideos.length;
    const lastMonth = lastMonthVideos.length;
    const diff = thisMonth - lastMonth;
    
    return { thisMonth, lastMonth, diff };
  };

  useEffect(() => {
    // 캘린더 월간 옵션 세팅 (최근 5개월)
    const months = generateReportingMonths(5);
    setReportingMonths(months);
    if (months.length > 0) {
      setSelectedMonthId(months[0].id); // 최초 진입 시 '이번 달'이 기본 선택되도록 설정
    }
    loadData();
  }, []);

  const handleRefresh = () => {
    loadData(true);
  };

  // 선택된 월간 객체 반환
  const getSelectedMonth = (): ReportingMonth | undefined => {
    return reportingMonths.find(m => m.id === selectedMonthId);
  };

  // 선택된 월간의 날짜 범위 필터에 맞는 비디오만 추출하는 함수
  const getFilteredVideosForSelectedMonth = (videos: VideoItem[], month: ReportingMonth | undefined): VideoItem[] => {
    if (!month) return videos;
    return videos.filter(v => {
      const pubDate = new Date(v.publishedAt);
      return pubDate >= month.start && pubDate <= month.end;
    });
  };

  // 모든 채널의 비디오를 하나의 목록으로 통합 후 selectedMonth 기준 필터링 및 정렬
  const getAllVideos = (): (VideoItem & { channelName: string; channelLogo: string; isCompany: boolean; handle: string })[] => {
    const all: any[] = [];
    const selectedMonth = getSelectedMonth();

    channels.forEach(ch => {
      // 각 채널 비디오 중 selectedMonth 기간 내 영상만 1차 필터링
      const monthFiltered = getFilteredVideosForSelectedMonth(ch.videos, selectedMonth);
      
      monthFiltered.forEach(v => {
        all.push({
          ...v,
          channelName: ch.name,
          channelLogo: ch.logo,
          isCompany: ch.isCompany,
          handle: ch.handle
        });
      });
    });
    return all.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  };

  // 1차 월간 필터링된 비디오 목록에 대하여 채널 필터 및 비디오 형식 필터 결합 적용
  const filteredVideos = getAllVideos().filter(v => {
    // 1. 비디오 형식 필터 적용
    const formatMatch = activeTab === 'all' || v.type === activeTab;
    
    // 2. 채널별 필터 적용
    let channelMatch = true;
    if (selectedChannel === 'plus') {
      channelMatch = v.isCompany; // 자사 PLUS TV 여부
    } else if (selectedChannel === 'samsung') {
      channelMatch = v.channelName.includes('삼성증권');
    } else if (selectedChannel === 'smart') {
      channelMatch = v.channelName.includes('스마트머니');
    } else if (selectedChannel === 'nh') {
      channelMatch = v.channelName.toLowerCase().includes('nh투자증권') || v.channelName.toLowerCase().includes('nh');
    }
    
    return formatMatch && channelMatch;
  });

  // 선택된 월간에 따른 채널별 업로드 통계(Video/Shorts 분리) 계산
  const getUploadStatsForMonth = (channel: ChannelInfo) => {
    const selectedMonth = getSelectedMonth();
    const monthVideos = getFilteredVideosForSelectedMonth(channel.videos, selectedMonth);
    
    const videos = monthVideos.filter(v => v.type === 'video').length;
    const shorts = monthVideos.filter(v => v.type === 'shorts').length;
    return { videos, shorts, total: videos + shorts };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* 헤더 영역 - 깔끔하고 직관적인 프로덕션 모드 */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* 한화 PLUS 상징 오렌지 로고 블록 */}
            <div className="bg-plus-orange text-white px-3 py-1.5 rounded font-black tracking-widest text-lg">
              PLUS TV
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">유튜브 경쟁사 월간 모니터링 대시보드</h1>
              <p className="text-xs text-slate-500 mt-0.5">PLUS TV 마케팅 의사결정 지원 플랫폼</p>
            </div>
          </div>

          {/* 컨트롤 영역: 월간 캘린더 드롭박스 & 새로고침 */}
          <div className="flex items-center gap-3 self-start md:self-auto w-full md:w-auto">
            {/* 리포팅 월간 선택 드롭박스 */}
            <div className="relative flex-1 md:flex-none">
              <select
                value={selectedMonthId}
                onChange={(e) => setSelectedMonthId(e.target.value)}
                className="w-full md:w-[320px] bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200/40 focus:outline-none focus:ring-2 focus:ring-plus-orange transition-all appearance-none cursor-pointer pr-10 shadow-sm"
              >
                {reportingMonths.map(month => (
                  <option key={month.id} value={month.id}>
                    {month.label}
                  </option>
                ))}
              </select>
              {/* 드롭박스 아이콘 화살표 */}
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* 새로고침 버튼 */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white hover:bg-slate-50 border border-slate-200/80 shadow-sm text-slate-700 p-2.5 rounded-xl flex items-center justify-center transition-colors disabled:opacity-60 cursor-pointer text-xs font-bold gap-1.5"
              title="데이터 실시간 동기화"
            >
              <svg 
                className={`w-4 h-4 text-slate-500 ${refreshing ? 'animate-spin text-plus-orange' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
              </svg>
              <span>새로고침</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {loading ? (
          /* 로딩 스켈레톤 UI */
          <div className="space-y-10 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white h-48 rounded-2xl border border-slate-100"></div>
              ))}
            </div>
            <div className="bg-white h-96 rounded-2xl border border-slate-100"></div>
          </div>
        ) : (
          <>
            {/* [섹션 1] 종합 스코어보드 */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-1 h-4 bg-plus-dark rounded-full"></span>
                월간 유튜브 스코어보드
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {channels.map(channel => {
                  const stats = getUploadStatsForMonth(channel);
                  const compStats = getComparisonStats(channel);
                  
                  return channel.isCompany ? (
                    /* PLUS TV 자사 카드 - 압도적인 시각화 */
                    <div 
                      key={channel.id} 
                      className="bg-white border-2 border-plus-orange rounded-2xl p-5 shadow-md relative overflow-hidden flex flex-col justify-between h-52 transition-all duration-300 hover:shadow-lg cursor-pointer"
                      onClick={() => setSelectedChannel('plus')}
                      title="클릭 시 하단 테이블을 한화 PLUS TV 콘텐츠로 필터링합니다"
                    >
                      {/* 로고 및 채널명 */}
                      <div className="flex items-center gap-3">
                        <img 
                          src={channel.logo} 
                          alt={channel.name} 
                          className="w-10 h-10 rounded-full border border-plus-orange/20 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=80&q=80"
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-slate-900 text-sm leading-none">{channel.name.replace("한화자산운용 ", "")}</h3>
                            <span className="bg-plus-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide shrink-0">
                              자사
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">{channel.handle}</span>
                        </div>
                      </div>

                      {/* 주요 성과 수치 */}
                      <div className="grid grid-cols-2 gap-4 mt-3 border-t border-slate-100 pt-3">
                        <div>
                          <p className="text-[11px] text-slate-400 font-medium leading-none">총 구독자 수</p>
                          <p className="text-2xl font-black text-plus-orange mt-1 tracking-tight">
                            {channel.subscribersText}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400 font-medium leading-none">선택 월간 업로드</p>
                          <div className="flex items-baseline gap-1 mt-1">
                            <p className="text-2xl font-black text-plus-orange tracking-tight">{stats.total}건</p>
                            <span className="text-[10px] text-slate-500 font-medium shrink-0">
                              ({stats.videos}/{stats.shorts})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 이번 달 vs 지난달 비교 지표 상시 출력 */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-50/60 font-semibold">
                        <div className="flex gap-2">
                          <span>이번달: <strong className="text-plus-orange">{compStats.thisMonth}건</strong></span>
                          <span className="text-slate-200">|</span>
                          <span>지난달: <strong className="text-slate-600">{compStats.lastMonth}건</strong></span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-tighter ${
                          compStats.diff > 0 
                            ? 'bg-red-50 text-red-600 border border-red-100/50' 
                            : compStats.diff < 0 
                              ? 'bg-blue-50 text-blue-600 border border-blue-100/50' 
                              : 'bg-slate-50 text-slate-500 border border-slate-200/50'
                        }`}>
                          {compStats.diff > 0 ? `▲ 이번달 +${compStats.diff}건` : compStats.diff < 0 ? `▼ 이번달 -${Math.abs(compStats.diff)}건` : '전달과 동일'}
                        </span>
                      </div>
                      
                      {/* 백그라운드 PLUS TV 오렌지 포인트 */}
                      <div className="absolute right-0 top-0 h-full w-1.5 bg-plus-orange"></div>
                    </div>
                  ) : (
                    /* 경쟁사 카드 - 차분하게 톤다운 처리 */
                    <div 
                      key={channel.id} 
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-52 transition-all duration-300 hover:shadow-md cursor-pointer relative"
                      onClick={() => setSelectedChannel(
                        channel.name.includes('삼성') ? 'samsung' : 
                        channel.name.includes('스마트') ? 'smart' : 'nh'
                      )}
                      title={`클릭 시 하단 테이블을 ${channel.name} 콘텐츠로 필터링합니다`}
                    >
                      {/* 로고 및 채널명 */}
                      <div className="flex items-center gap-3">
                        <img 
                          src={channel.logo} 
                          alt={channel.name} 
                          className="w-10 h-10 rounded-full border border-slate-100 object-cover grayscale opacity-85"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=80&q=80"
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-slate-700 text-sm leading-none">{channel.name}</h3>
                          </div>
                          <span className="text-xs text-slate-400">{channel.handle}</span>
                        </div>
                      </div>

                      {/* 주요 성과 수치 */}
                      <div className="grid grid-cols-2 gap-4 mt-3 border-t border-slate-100 pt-3">
                        <div>
                          <p className="text-[11px] text-slate-400 font-medium leading-none">총 구독자 수</p>
                          <p className="text-xl font-bold text-slate-600 mt-1 tracking-tight">
                            {channel.subscribersText}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400 font-medium leading-none">선택 월간 업로드</p>
                          <div className="flex items-baseline gap-1 mt-1">
                            <p className="text-xl font-bold text-slate-600 tracking-tight">{stats.total}건</p>
                            <span className="text-[10px] text-slate-400 font-medium shrink-0">
                              ({stats.videos}/{stats.shorts})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 이번 달 vs 지난달 비교 지표 상시 출력 */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100 font-semibold">
                        <div className="flex gap-2">
                          <span>이번달: <strong className="text-slate-600">{compStats.thisMonth}건</strong></span>
                          <span className="text-slate-200">|</span>
                          <span>지난달: <strong className="text-slate-500">{compStats.lastMonth}건</strong></span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-tighter ${
                          compStats.diff > 0 
                            ? 'bg-red-50/70 text-red-600 border border-red-100/30' 
                            : compStats.diff < 0 
                              ? 'bg-blue-50/70 text-blue-600 border border-blue-100/30' 
                              : 'bg-slate-50 text-slate-400 border border-slate-200/30'
                        }`}>
                          {compStats.diff > 0 ? `▲ 이번달 +${compStats.diff}건` : compStats.diff < 0 ? `▼ 이번달 -${Math.abs(compStats.diff)}건` : '전달과 동일'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* [섹션 2] 상세 분석 테이블 */}
            <section className="space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200/60 pb-3">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-1 h-4 bg-plus-dark rounded-full"></span>
                  콘텐츠 업로드 상세 현황
                </h2>

                {/* 이중 필터 영역 (채널 필터 + 비디오 포맷 필터) */}
                <div className="flex flex-wrap items-center gap-3">
                  
                  {/* 채널별 선택 필터 (Chips 형태) */}
                  <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/50">
                    <button
                      onClick={() => setSelectedChannel('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedChannel === 'all'
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      전체 채널
                    </button>
                    <button
                      onClick={() => setSelectedChannel('plus')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        selectedChannel === 'plus'
                          ? 'bg-plus-orange text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      PLUS TV (자사)
                    </button>
                    <button
                      onClick={() => setSelectedChannel('samsung')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedChannel === 'samsung'
                          ? 'bg-slate-750 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      삼성증권
                    </button>
                    <button
                      onClick={() => setSelectedChannel('smart')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedChannel === 'smart'
                          ? 'bg-slate-650 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      미래에셋
                    </button>
                    <button
                      onClick={() => setSelectedChannel('nh')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedChannel === 'nh'
                          ? 'bg-slate-550 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      NH투자증권
                    </button>
                  </div>

                  <span className="text-slate-300 hidden lg:inline">|</span>

                  {/* 비디오 포맷 필터 탭 */}
                  <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/50">
                    <button
                      onClick={() => setActiveTab('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'all'
                          ? 'bg-white text-plus-orange shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      전체 형식
                    </button>
                    <button
                      onClick={() => setActiveTab('video')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'video'
                          ? 'bg-white text-plus-orange shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      동영상만
                    </button>
                    <button
                      onClick={() => setActiveTab('shorts')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'shorts'
                          ? 'bg-white text-plus-orange shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Shorts만
                    </button>
                  </div>
                  
                </div>
              </div>

              {/* 상세 분석 테이블 리스트 */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs font-bold tracking-tight">
                        <th className="py-4 px-6 w-52">채널</th>
                        <th className="py-4 px-4 w-24 text-center">구분</th>
                        <th className="py-4 px-4 w-40">썸네일 (클릭 시 재생)</th>
                        <th className="py-4 px-6">영상 제목</th>
                        <th className="py-4 px-4 w-28 text-center">러닝타임</th>
                        <th className="py-4 px-4 w-32 text-center">업로드 일시</th>
                        <th className="py-4 px-6 w-80">영상 설명 요약 (설명란)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredVideos.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-16 text-slate-400 font-medium">
                            {selectedChannel !== 'all' || activeTab !== 'all' ? (
                              <div className="space-y-1">
                                <p>선택하신 조건에 부합하는 영상이 없습니다.</p>
                                <button 
                                  onClick={() => { setSelectedChannel('all'); setActiveTab('all'); }} 
                                  className="text-xs text-plus-orange font-bold underline cursor-pointer mt-1"
                                >
                                  필터 초기화하기
                                </button>
                              </div>
                            ) : (
                              "선택하신 리포팅 월 내에 등록된 영상 내역이 존재하지 않습니다."
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredVideos.map((video) => (
                          <tr 
                            key={video.id} 
                            className={`group hover:bg-slate-50/40 transition-colors ${
                              video.isCompany ? 'bg-plus-light-bg/20' : ''
                            }`}
                          >
                            {/* 채널 정보 */}
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-2.5">
                                <img 
                                  src={video.channelLogo} 
                                  alt={video.channelName} 
                                  className={`w-7 h-7 rounded-full object-cover ${!video.isCompany && 'grayscale'}`}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=80&q=80"
                                  }}
                                />
                                <div>
                                  <div className="font-semibold text-slate-800 leading-snug flex items-center gap-1">
                                    <span className={video.isCompany ? 'text-plus-orange font-bold' : 'text-slate-600 font-medium'}>
                                      {video.channelName.replace("한화자산운용 ", "")}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400">{video.handle}</span>
                                </div>
                              </div>
                            </td>

                            {/* 영상 구분 배지 */}
                            <td className="py-5 px-4 text-center">
                              {video.type === 'shorts' ? (
                                <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Shorts
                                </span>
                              ) : (
                                <span className="bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Video
                                </span>
                              )}
                            </td>

                            {/* 썸네일 (클릭 시 새창 이동) */}
                            <td className="py-5 px-4">
                              <a 
                                href={video.videoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block aspect-video w-32 rounded-lg object-cover overflow-hidden bg-slate-100 border border-slate-200/50 shadow-sm relative group"
                              >
                                <img 
                                  src={video.thumbnail} 
                                  alt={video.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=160&q=80"
                                  }}
                                />
                                {/* 재생 마스크 호버 레이어 */}
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </a>
                            </td>

                            {/* 영상 제목 */}
                            <td className="py-5 px-6">
                              <a 
                                href={video.videoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`font-semibold hover:underline block leading-snug line-clamp-2 ${
                                  video.isCompany ? 'text-slate-900 group-hover:text-plus-orange' : 'text-slate-700 hover:text-slate-900'
                                }`}
                              >
                                {video.title}
                              </a>
                            </td>

                            {/* 러닝타임 */}
                            <td className="py-5 px-4 text-center font-mono text-xs text-slate-500">
                              {video.duration}
                            </td>

                            {/* 업로드 일시 */}
                            <td className="py-5 px-4 text-center text-xs text-slate-500 leading-tight">
                              {new Date(video.publishedAt).toLocaleDateString('ko-KR', {
                                month: '2-digit',
                                day: '2-digit'
                              })}
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(video.publishedAt).toLocaleTimeString('ko-KR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                                })}
                              </div>
                            </td>

                            {/* 설명란 및 툴팁 팝업 */}
                            <td className="py-5 px-6 relative tooltip-trigger">
                              <div className="text-xs text-slate-500 leading-relaxed line-clamp-3 select-none">
                                {video.description || <span className="text-slate-300 italic">설명이 없는 동영상입니다.</span>}
                              </div>
                              
                              {/* 설명란 마우스 오버 툴팁 */}
                              {video.description && (
                                <div className="tooltip-content absolute z-50 right-6 bottom-full mb-2 w-80 bg-slate-900/95 border border-slate-700/60 rounded-xl p-4 shadow-2xl opacity-0 visibility-hidden transition-all duration-200 pointer-events-none backdrop-blur-md">
                                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-plus-orange">
                                      영상 설명란 전문
                                    </span>
                                    <span className="text-[9px] text-slate-500 font-mono">
                                      Length: {video.description.length}자
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-300 font-medium leading-relaxed max-h-48 overflow-y-auto pr-1 whitespace-pre-wrap select-text">
                                    {video.description}
                                  </p>
                                  <div className="absolute right-6 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900/95"></div>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-slate-100 py-8 mt-16 text-center text-xs text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p>© 2026 PLUS TV YouTube Competitor Dashboard. All rights reserved.</p>
          <p>이 대시보드는 모니터링 편의 목적으로 YouTube Data API v3를 활용하여 제작되었습니다.</p>
        </div>
      </footer>
    </div>
  );
}
