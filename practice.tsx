import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Calculator {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: string;
}

const calculators: Calculator[] = [
  {
    id: 'compound',
    title: 'Compound Interest',
    description: 'See how your money grows over time',
    icon: 'trending-up',
    type: 'compound_interest',
  },
  {
    id: 'simple',
    title: 'Simple Interest',
    description: 'Calculate basic interest on loans/deposits',
    icon: 'calculator',
    type: 'simple_interest',
  },
  {
    id: 'emi',
    title: 'EMI Calculator',
    description: 'Calculate your loan monthly payments',
    icon: 'card',
    type: 'emi_calculator',
  },
  {
    id: 'sip',
    title: 'SIP Calculator',
    description: 'Plan your systematic investments',
    icon: 'wallet',
    type: 'sip_calculator',
  },
  {
    id: 'budget',
    title: 'Budget Builder',
    description: 'Create and track your monthly budget',
    icon: 'pie-chart',
    type: 'budget_builder',
  },
];

export default function PracticeScreen() {
  const [selectedCalc, setSelectedCalc] = useState<string | null>(null);
  const [inputs, setInputs] = useState<any>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    if (!selectedCalc) return;

    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/simulations/calculate`, {
        simulation_type: selectedCalc,
        inputs: inputs,
        outputs: {},
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error calculating:', error);
      alert('Error performing calculation');
    } finally {
      setLoading(false);
    }
  };

  const renderInputs = () => {
    switch (selectedCalc) {
      case 'compound_interest':
        return (
          <View style={styles.inputsContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Principal Amount (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="10000"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={inputs.principal?.toString() || ''}
                onChangeText={(text) => setInputs({ ...inputs, principal: parseFloat(text) || 0 })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Annual Interest Rate (%)</Text>
              <TextInput
                style={styles.input}
                placeholder="8"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={inputs.rate?.toString() || ''}
                onChangeText={(text) => setInputs({ ...inputs, rate: parseFloat(text) || 0 })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time Period (Years)</Text>
              <TextInput
                style={styles.input}
                placeholder="5"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={inputs.time?.toString() || ''}
                onChangeText={(text) => setInputs({ ...inputs, time: parseFloat(text) || 0 })}
              />
            </View>
          </View>
        );

      case 'simple_interest':
        return (
          <View style={styles.inputsContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Principal Amount (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="10000"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={inputs.principal?.toString() || ''}
                onChangeText={(text) => setInputs({ ...inputs, principal: parseFloat(text) || 0 })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Annual Interest Rate (%)</Text>
              <TextInput
                style={styles.input}
                placeholder="6"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={inputs.rate?.toString() || ''}
                onChangeText={(text) => setInputs({ ...inputs, rate: parseFloat(text) || 0 })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time Period (Years)</Text>
              <TextInput
                style={styles.input}
                placeholder="3"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={inputs.time?.toString() || ''}
                onChangeText={(text) => setInputs({ ...inputs, time: parseFloat(text) || 0 })}
              />
            </View>
          </View>
        );

      case 'emi_calculator':
        return (
          <View style={styles.inputsContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Loan Amount (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="500000"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={inputs.principal?.toString() || ''}
                onChangeText={(text) => setInputs({ ...inputs, principal: parseFloat(text) || 0 })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Annual Interest Rate (%)</Text>
              <TextInput
                style={styles.input}
                placeholder="10"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={inputs.rate?.toString() || ''}
                onChangeText={(text) => setInputs({ ...inputs, rate: parseFloat(text) || 0 })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Loan Tenure (Months)</Text>
              <TextInput
                style={styles.input}
                placeholder="60"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={inputs.months?.toString() || ''}
                onChangeText={(text) => setInputs({ ...inputs, months: parseFloat(text) || 0 })}
              />
            </View>
          </View>
        );

      case 'sip_calculator':
        return (
          <View style={styles.inputsContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Monthly Investment (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="1000"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={inputs.monthly_investment?.toString() || ''}
                onChangeText={(text) =>
                  setInputs({ ...inputs, monthly_investment: parseFloat(text) || 0 })
                }
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Expected Annual Return (%)</Text>
              <TextInput
                style={styles.input}
                placeholder="12"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={inputs.rate?.toString() || ''}
                onChangeText={(text) => setInputs({ ...inputs, rate: parseFloat(text) || 0 })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Investment Period (Months)</Text>
              <TextInput
                style={styles.input}
                placeholder="60"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={inputs.months?.toString() || ''}
                onChangeText={(text) => setInputs({ ...inputs, months: parseFloat(text) || 0 })}
              />
            </View>
          </View>
        );

      case 'budget_builder':
        return (
          <View style={styles.inputsContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Monthly Income (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="30000"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={inputs.income?.toString() || ''}
                onChangeText={(text) => setInputs({ ...inputs, income: parseFloat(text) || 0 })}
              />
            </View>
            <Text style={styles.sectionLabel}>Expenses</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Rent (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="10000"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={inputs.expenses?.rent?.toString() || ''}
                onChangeText={(text) =>
                  setInputs({
                    ...inputs,
                    expenses: { ...inputs.expenses, rent: parseFloat(text) || 0 },
                  })
                }
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Food (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="5000"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={inputs.expenses?.food?.toString() || ''}
                onChangeText={(text) =>
                  setInputs({
                    ...inputs,
                    expenses: { ...inputs.expenses, food: parseFloat(text) || 0 },
                  })
                }
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Transport (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="2000"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={inputs.expenses?.transport?.toString() || ''}
                onChangeText={(text) =>
                  setInputs({
                    ...inputs,
                    expenses: { ...inputs.expenses, transport: parseFloat(text) || 0 },
                  })
                }
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Other (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="3000"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={inputs.expenses?.other?.toString() || ''}
                onChangeText={(text) =>
                  setInputs({
                    ...inputs,
                    expenses: { ...inputs.expenses, other: parseFloat(text) || 0 },
                  })
                }
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Results</Text>
        {Object.entries(result).map(([key, value]) => (
          <View key={key} style={styles.resultRow}>
            <Text style={styles.resultLabel}>
              {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </Text>
            <Text style={styles.resultValue}>
              {typeof value === 'number' ? `₹${value.toLocaleString()}` : value}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  if (selectedCalc) {
    const calculator = calculators.find((c) => c.type === selectedCalc);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            setSelectedCalc(null);
            setInputs({});
            setResult(null);
          }} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#F9FAFB" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{calculator?.title}</Text>
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.description}>{calculator?.description}</Text>
          {renderInputs()}
          <TouchableOpacity
            style={styles.calculateButton}
            onPress={handleCalculate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.calculateButtonText}>Calculate</Text>
            )}
          </TouchableOpacity>
          {renderResult()}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Practice & Simulate</Text>
          <Text style={styles.headerSubtitle}>
            Use interactive calculators to understand financial concepts
          </Text>
        </View>

        <View style={styles.calculatorsGrid}>
          {calculators.map((calc) => (
            <TouchableOpacity
              key={calc.id}
              style={styles.calculatorCard}
              onPress={() => setSelectedCalc(calc.type)}
            >
              <View style={styles.calculatorIconContainer}>
                <Ionicons name={calc.icon as any} size={32} color="#10B981" />
              </View>
              <Text style={styles.calculatorTitle}>{calc.title}</Text>
              <Text style={styles.calculatorDescription}>{calc.description}</Text>
            </TouchableOpacity>
          ))}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    marginRight: 12,
  },
  headerSection: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 20,
  },
  calculatorsGrid: {
    gap: 12,
  },
  calculatorCard: {
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  calculatorIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#374151',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  calculatorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  calculatorDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  inputsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginTop: 8,
  },
  input: {
    backgroundColor: '#374151',
    color: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  calculateButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  calculateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  resultLabel: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
});
