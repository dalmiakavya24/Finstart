import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons_count: number;
  order: number;
  is_locked: boolean;
}

export default function LearnScreen() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchModules = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/modules`);
      setModules(response.data);
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchModules();
  };

  const handleModulePress = (module: Module) => {
    if (module.is_locked) {
      alert('Complete previous modules to unlock this one!');
      return;
    }
    router.push(`/module/${module.id}`);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>FinStart</Text>
          <Text style={styles.headerSubtitle}>Your Journey to Financial Freedom</Text>
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Ionicons name="rocket" size={40} color="#10B981" />
          <Text style={styles.welcomeTitle}>Welcome to FinStart!</Text>
          <Text style={styles.welcomeText}>
            Learn practical money skills through bite-sized lessons, interactive simulations, and
            real-world examples. No ads, no signup - just education.
          </Text>
        </View>

        {/* Learning Path */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Roadmap</Text>
          <Text style={styles.sectionSubtitle}>9 modules • Beginner to Advanced</Text>
        </View>

        {/* Modules */}
        {modules.map((module, index) => (
          <TouchableOpacity
            key={module.id}
            style={[
              styles.moduleCard,
              module.is_locked && styles.moduleCardLocked,
            ]}
            onPress={() => handleModulePress(module)}
            disabled={module.is_locked}
          >
            <View style={styles.moduleHeader}>
              <View style={styles.moduleIconContainer}>
                <Text style={styles.moduleIcon}>{module.icon}</Text>
              </View>
              <View style={styles.moduleInfo}>
                <View style={styles.moduleTitleRow}>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  {module.is_locked && (
                    <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
                  )}
                </View>
                <Text style={styles.moduleDescription}>{module.description}</Text>
                <View style={styles.moduleMeta}>
                  <Ionicons name="book" size={14} color="#9CA3AF" />
                  <Text style={styles.moduleMetaText}>
                    {module.lessons_count} lessons
                  </Text>
                </View>
              </View>
            </View>
            {!module.is_locked && (
              <Ionicons name="chevron-forward" size={24} color="#10B981" />
            )}
          </TouchableOpacity>
        ))}

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>✓ 100% Free • No Ads • Privacy First</Text>
          <Text style={styles.footerText}>✓ Works Offline • No Signup Required</Text>
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
  welcomeCard: {
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginTop: 12,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  moduleCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moduleCardLocked: {
    opacity: 0.6,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  moduleIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#374151',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moduleIcon: {
    fontSize: 28,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  moduleDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 8,
    lineHeight: 18,
  },
  moduleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moduleMetaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  footer: {
    marginTop: 24,
    marginBottom: 16,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
  },
});
