# AI Perspicio - 모바일 앱 개발 가이드

## 📱 앱 정보
- **앱 이름**: AI Perspicio
- **의미**: 라틴어 "perspicio" (명확하게 보다, 통찰하다) + "아는 만큼 보인다"
- **플랫폼**: iOS & Android
- **기술**: React Native (Expo)

## 🚀 빠른 시작

### 1. 사전 요구사항
```bash
# Node.js 설치 (v18 이상 권장)
# https://nodejs.org

# Expo CLI 설치
npm install -g expo-cli
```

### 2. 프로젝트 생성
```bash
# 프로젝트 루트에서
npx create-expo-app ai-perspicio-mobile --template blank-typescript
cd ai-perspicio-mobile
```

### 3. 필요한 패키지 설치
```bash
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install axios
npm install @tanstack/react-query
npm install @react-native-async-storage/async-storage
npm install react-native-svg
```

### 4. 개발 서버 실행
```bash
npm start
```

## 📁 프로젝트 구조

```
ai-perspicio-mobile/
├── app/
│   ├── screens/
│   │   ├── DashboardScreen.tsx
│   │   ├── HuggingFaceScreen.tsx
│   │   ├── YouTubeScreen.tsx
│   │   ├── PapersScreen.tsx
│   │   ├── NewsScreen.tsx
│   │   ├── GitHubScreen.tsx
│   │   └── SystemScreen.tsx
│   ├── components/
│   │   ├── CategoryCard.tsx
│   │   ├── StatCard.tsx
│   │   ├── KeywordCloud.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorView.tsx
│   ├── api/
│   │   ├── client.ts
│   │   └── endpoints.ts
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── theme/
│   │   ├── colors.ts
│   │   └── typography.ts
│   └── types/
│       └── index.ts
├── assets/
│   ├── icon.png (1024x1024)
│   └── splash.png (1242x2436)
├── app.json
├── package.json
└── tsconfig.json
```

## 🎨 앱 디자인 시스템

### 색상 팔레트
```typescript
// app/theme/colors.ts
export const colors = {
  primary: '#3B82F6',      // Blue
  secondary: '#8B5CF6',    // Purple
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Yellow
  danger: '#EF4444',       // Red

  // Gradients
  gradients: {
    dashboard: ['#9333EA', '#EC4899'],  // Purple to Pink
    huggingface: ['#FBBF24', '#F97316'], // Yellow to Orange
    youtube: ['#EF4444', '#DC2626'],     // Red
    papers: ['#3B82F6', '#4F46E5'],      // Blue to Indigo
    news: ['#10B981', '#059669'],        // Green to Emerald
    github: ['#374151', '#111827'],      // Gray to Black
    system: ['#06B6D4', '#2563EB'],      // Cyan to Blue
  },

  // Neutral
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
};
```

## 🔌 API 클라이언트 설정

### API Client (app/api/client.ts)
```typescript
import axios from 'axios';

const API_BASE_URL = 'https://ai-trend-tracker-production.up.railway.app/api/v1';
const API_KEY = 'test1234';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log('Request:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

### API Endpoints (app/api/endpoints.ts)
```typescript
import { apiClient } from './client';

export const api = {
  // System
  getSystemStatus: () => apiClient.get('/system/status'),
  getKeywords: (limit: number = 30) => apiClient.get(`/system/keywords?limit=${limit}`),

  // Hugging Face
  getHuggingFaceModels: (page: number = 1, pageSize: number = 30) =>
    apiClient.get(`/huggingface/?page=${page}&page_size=${pageSize}`),

  // GitHub
  getGitHubProjects: (skip: number = 0, limit: number = 30) =>
    apiClient.get(`/github/projects?skip=${skip}&limit=${limit}`),

  // YouTube
  getYouTubeVideos: (skip: number = 0, limit: number = 30) =>
    apiClient.get(`/youtube/videos?skip=${skip}&limit=${limit}`),

  // Papers
  getPapers: (skip: number = 0, limit: number = 30) =>
    apiClient.get(`/papers/papers?skip=${skip}&limit=${limit}`),

  // News
  getNews: (skip: number = 0, limit: number = 30) =>
    apiClient.get(`/news/news?skip=${skip}&limit=${limit}`),
};
```

## 🧭 네비게이션 설정

### App Navigator (app/navigation/AppNavigator.tsx)
```typescript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import HuggingFaceScreen from '../screens/HuggingFaceScreen';
import YouTubeScreen from '../screens/YouTubeScreen';
import PapersScreen from '../screens/PapersScreen';
import NewsScreen from '../screens/NewsScreen';
import GitHubScreen from '../screens/GitHubScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.gray[400],
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopWidth: 1,
            borderTopColor: colors.gray[200],
            paddingBottom: 5,
            height: 60,
          },
          headerStyle: {
            backgroundColor: colors.white,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: colors.gray[200],
          },
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: '대시보드',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="stats-chart" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="HuggingFace"
          component={HuggingFaceScreen}
          options={{
            title: 'Hugging Face',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="happy" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="GitHub"
          component={GitHubScreen}
          options={{
            title: 'GitHub',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="logo-github" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="News"
          component={NewsScreen}
          options={{
            title: '뉴스',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="newspaper" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

## 📱 주요 화면 구현

### Dashboard Screen (app/screens/DashboardScreen.tsx)
```typescript
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { api } from '../api/endpoints';
import { colors } from '../theme/colors';
import StatCard from '../components/StatCard';
import KeywordCloud from '../components/KeywordCloud';

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [keywords, setKeywords] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statusRes, keywordsRes] = await Promise.all([
        api.getSystemStatus(),
        api.getKeywords(30),
      ]);

      setSystemStatus(statusRes.data);
      setKeywords(keywordsRes.data);
    } catch (err: any) {
      setError(err.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>AI Perspicio</Text>
        <Text style={styles.subtitle}>AI 트렌드를 한눈에</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="전체 데이터"
          value={systemStatus?.total_items?.toLocaleString() || '0'}
          color={colors.primary}
        />
        <StatCard
          title="활성 카테고리"
          value={`${systemStatus?.healthy_categories || 0}/${systemStatus?.total_categories || 0}`}
          color={colors.success}
        />
        <StatCard
          title="고유 키워드"
          value={keywords?.unique_keywords?.toLocaleString() || '0'}
          color={colors.secondary}
        />
        <StatCard
          title="서버 상태"
          value="온라인"
          color={colors.success}
        />
      </View>

      {/* Top Keywords */}
      {keywords?.top_keywords && keywords.top_keywords.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>인기 키워드 TOP 10</Text>
          {keywords.top_keywords.slice(0, 10).map((keyword: any, index: number) => (
            <View key={index} style={styles.keywordItem}>
              <Text style={styles.keywordRank}>#{index + 1}</Text>
              <Text style={styles.keywordText}>{keyword.keyword}</Text>
              <Text style={styles.keywordCount}>{keyword.count}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Keyword Cloud */}
      {keywords?.all_keywords && keywords.all_keywords.length > 0 && (
        <KeywordCloud keywords={keywords.all_keywords.slice(0, 30)} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  header: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  section: {
    backgroundColor: colors.white,
    margin: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 12,
  },
  keywordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  keywordRank: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.gray[400],
    width: 30,
  },
  keywordText: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[700],
  },
  keywordCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.gray[600],
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
```

## 🎯 앱 스토어 배포 준비

### 1. 앱 아이콘 & 스플래시 스크린
```javascript
// app.json
{
  "expo": {
    "name": "AI Perspicio",
    "slug": "ai-perspicio",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#3B82F6"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.aiperspicio",
      "buildNumber": "1.0.0"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#3B82F6"
      },
      "package": "com.yourcompany.aiperspicio",
      "versionCode": 1
    }
  }
}
```

### 2. iOS 빌드
```bash
# EAS Build 설치
npm install -g eas-cli

# EAS 로그인
eas login

# iOS 빌드 생성
eas build --platform ios

# App Store에 제출
eas submit --platform ios
```

### 3. Android 빌드
```bash
# Android 빌드 생성
eas build --platform android

# Play Store에 제출
eas submit --platform android
```

## 📝 앱 스토어 정보

### App Store (iOS)
**앱 이름**: AI Perspicio

**부제목**: AI 트렌드 인사이트

**설명**:
```
AI Perspicio는 최신 AI 트렌드를 실시간으로 추적하고 분석하는 필수 앱입니다.

주요 기능:
• 실시간 AI 트렌드 대시보드
• Hugging Face 최신 모델 탐색
• GitHub AI 프로젝트 트렌딩
• AI 논문 및 뉴스 수집
• 키워드 분석 및 시각화

아는 만큼 보입니다. AI Perspicio와 함께 AI 세계를 명확하게 보세요.
```

**키워드**: AI, Machine Learning, Deep Learning, 트렌드, 인공지능

**카테고리**: 생산성, 뉴스

### Google Play Store (Android)
동일한 정보 사용

## 🔐 개인정보 처리방침
앱 스토어 제출 시 필수입니다. 다음 내용을 포함한 웹페이지를 만드세요:

- 수집하는 데이터: 없음 (외부 API만 사용)
- 데이터 보관 기간
- 사용자 권리
- 문의처

## ✅ 체크리스트

### 개발
- [ ] React Native 프로젝트 생성
- [ ] 네비게이션 설정
- [ ] API 클라이언트 구현
- [ ] 모든 화면 구현
- [ ] 에러 처리 및 로딩 상태
- [ ] 다크 모드 지원 (선택사항)

### 디자인
- [ ] 앱 아이콘 제작 (1024x1024px)
- [ ] 스플래시 스크린 제작
- [ ] 스크린샷 촬영 (5-8장)
- [ ] 프로모션 이미지 제작

### 배포
- [ ] Apple Developer 계정 ($99/년)
- [ ] Google Play Console 계정 ($25)
- [ ] 개인정보 처리방침 웹페이지
- [ ] 앱 설명 작성 (한국어, 영어)
- [ ] TestFlight 베타 테스트 (iOS)
- [ ] Internal Testing (Android)
- [ ] App Store 제출
- [ ] Play Store 제출

## 🚀 다음 단계

1. Node.js 설치
2. 프로젝트 생성 및 패키지 설치
3. 화면별 구현
4. 테스트
5. 앱 스토어 제출

궁금한 점이 있으면 언제든지 물어보세요!
