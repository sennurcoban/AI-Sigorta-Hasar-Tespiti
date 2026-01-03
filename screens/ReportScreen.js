import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../constants/colors';
import { analyzeDamage, detectVehicle } from '../services/DamageService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; // Make sure to handle icon library if not installed, but standard Expo includes this.

export default function ReportScreen({ route, navigation }) {
    const { imageUri } = route.params;
    const [report, setReport] = useState(null);
    const [status, setStatus] = useState('scanning'); // 'scanning', 'analyzing', 'complete', 'error'
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        startAnalysisProcess();
    }, []);

    const startAnalysisProcess = async () => {
        try {
            // Step 1: Scanning & Analysis (Combined for efficiency with Real Backend)
            setStatus('scanning');

            // We call the main analysis directly. 
            // The backend will first check for vehicle (YOLO), then calculate damage.
            const result = await analyzeDamage(imageUri);

            setReport(result);
            setStatus('complete');

        } catch (error) {
            // Check if it is the specific "Vehicle Not Found" error
            // Note: We need to match the exact string thrown by DamageService
            if (error.message.includes("Araç tespit edilemedi")) {
                setStatus('error');
                setErrorMsg('Üzgünüz, bu fotoğrafta bir araç tespit edemedik. Lütfen aracın net bir fotoğrafını yükleyiniz.');
            } else {
                // Technical or connection errors show Alert
                Alert.alert('Hata', 'Analiz sırasında teknik bir sorun oluştu: ' + error.message);
                navigation.goBack();
            }
        }
    }


    const renderLoadingState = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>
                {status === 'scanning' ? 'Araç Taranıyor...' : 'Hasar Analiz Ediliyor...'}
            </Text>
            <Text style={styles.loadingSubText}>
                {status === 'scanning' ? 'Yapay zeka görseli doğruluyor' : 'Parça ve maliyet hesabı yapılıyor'}
            </Text>
        </View>
    );

    const renderErrorState = () => (
        <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>🚫</Text>
            <Text style={styles.errorTitle}>Araç Bulunamadı</Text>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity
                style={styles.retryButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.retryButtonText}>Farklı Fotoğraf Dene</Text>
            </TouchableOpacity>
        </View>
    );

    if (status === 'scanning' || status === 'analyzing') {
        return (
            <SafeAreaView style={styles.container}>{renderLoadingState()}</SafeAreaView>
        );
    }

    if (status === 'error') {
        return (
            <SafeAreaView style={styles.container}>{renderErrorState()}</SafeAreaView>
        );
    }

    if (!report) return null;

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Image source={{ uri: imageUri }} style={styles.reportImage} />

                <View style={styles.successHeader}>
                    <Text style={styles.successIcon}>✅</Text>
                    <Text style={styles.successText}>Araç Doğrulandı</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tespit Edilen Hasarlar</Text>
                    {report.detectedParts.map((part, index) => (
                        <View key={index} style={styles.partItem}>
                            <View>
                                <Text style={styles.partName}>{part.name}</Text>
                                <Text style={styles.partAction}>{part.repairType}</Text>
                            </View>
                            <Text style={styles.partCost}>{part.cost} {report.currency}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Maliyet Özeti</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Parça Toplamı</Text>
                        <Text style={styles.summaryValue}>{report.totalCost - report.laborCost} {report.currency}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>İşçilik</Text>
                        <Text style={styles.summaryValue}>{report.laborCost} {report.currency}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Toplam Tahmini Tutar</Text>
                        <Text style={styles.totalValue}>{report.totalCost} {report.currency}</Text>
                    </View>
                </View>

                <View style={styles.confidenceContainer}>
                    <Text style={styles.confidenceText}>AI Güven Skoru: %{(report.confidence * 100).toFixed(0)}</Text>
                </View>

                <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => navigation.popToTop()}
                >
                    <Text style={styles.doneButtonText}>Yeni Analiz Yap</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.secondary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 12,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    retryButton: {
        backgroundColor: COLORS.text,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingText: {
        marginTop: 20,
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
    },
    loadingSubText: {
        marginTop: 8,
        color: '#666',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    reportImage: {
        width: '100%',
        height: 250,
        resizeMode: 'cover',
    },
    successHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: '#E8F5E9',
        borderBottomWidth: 1,
        borderBottomColor: '#C8E6C9',
    },
    successIcon: {
        marginRight: 8,
        fontSize: 18,
    },
    successText: {
        color: '#2E7D32',
        fontWeight: 'bold',
        fontSize: 14,
    },
    section: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: COLORS.text,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingBottom: 8,
    },
    partItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    partName: {
        fontSize: 16,
        fontWeight: '600',
    },
    partAction: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    partCost: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 15,
        color: '#666',
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '600',
    },
    totalRow: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    confidenceContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    confidenceText: {
        color: '#999',
        fontSize: 12,
    },
    doneButton: {
        backgroundColor: COLORS.success,
        marginHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
