import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Progress {
  completed_lessons: string[];
  quiz_scores: { [key: string]: number };
  simulations_completed: string[];
}

export default function ProgressScreen() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProgress = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/progress`);
      setProgress(response.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProgress();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const completedCount = progress?.completed_lessons.length || 0;
  const quizCount = Object.keys(progress?.quiz_scores || {}).length;
  const avgScore =
    quizCount > 0
      ? Object.values(progress?.quiz_scores || {}).reduce((a, b) => a + b, 0) / quizCount
      : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Progress</Text>
          <Text style={styles.headerSubtitle}>Track your financial learning journey</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={40} color="#10B981" />
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Lessons Completed</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="trophy" size={40} color="#F59E0B" />
            <Text style={styles.statValue}>{quizCount}</Text>
            <Text style={styles.statLabel}>Quizzes Taken</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="star" size={40} color="#8B5CF6" />
            <Text style={styles.statValue}>{avgScore.toFixed(0)}%</Text>
            <Text style={styles.statLabel}>Average Score</Text>
          </View>
        </View>

        {/* Achievement Banner */}
        <View style={styles.achievementBanner}>
          <Ionicons name="rocket" size={32} color="#10B981" />
          <View style={styles.achievementText}>
            <Text style={styles.achievementTitle}>Keep Going!</Text>
            <Text style={styles.achievementDescription}>
              {completedCount === 0
                ? "Start your first lesson to begin your journey"
                : completedCount < 10
                ? "You're building great habits!"
                : "You're becoming a financial expert!"}
            </Text>
          </View>
        </View>

        {/* Learning Streak */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Stats</Text>
          <View style={styles.statsList}>
            <View style={styles.statsListItem}>
              <Ionicons name="book" size={20} color="#10B981" />
              <Text style={styles.statsListText}>Total Lessons: {completedCount}</Text>
            </View>
            <View style={styles.statsListItem}>
              <Ionicons name="calculator" size={20} color="#10B981" />
              <Text style={styles.statsListText}>
                Simulations: {progress?.simulations_completed.length || 0}
              </Text>
            </View>
            <View style={styles.statsListItem}>
              <Ionicons name="bulb" size={20} color="#10B981" />
              <Text style={styles.statsListText}>Daily Tips Learned: {completedCount}</Text>
            </View>
          </View>
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyCard}>
          <Ionicons name="shield-checkmark" size={24} color="#10B981" />
          <View style={styles.privacyText}>
            <Text style={styles.privacyTitle}>Privacy First</Text>
            <Text style={styles.privacyDescription}>
              Your progress is stored locally. No personal data collected. No signup required.
            </Text>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <TouchableOpacity style={styles.infoCard}>
            <Ionicons name="information-circle" size={32} color="#3B82F6" />
            <Text style={styles.infoTitle}>About FinStart</Text>
            <Text style={styles.infoDescription}>
              A free, ad-free educational app for ages 13-25 to learn practical money skills.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoCard}>
            <Ionicons name="help-circle" size={32} color="#8B5CF6" />
            <Text style={styles.infoTitle}>Need Help?</Text>
            <Text style={styles.infoDescription}>
              For personalized financial or legal advice, please consult a professional.
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  achievementBanner: {
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  achievementText: {
    marginLeft: 16,
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 12,
  },
  statsList: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  statsListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statsListText: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  privacyCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  privacyText: {
    marginLeft: 12,
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  privacyDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  infoSection: {
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginTop: 12,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});
