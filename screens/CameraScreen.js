import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CameraScreen({ navigation }) {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // Reverting to fix crash
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Yetki Hatası', 'Kamera erişim izni gerekiyor.');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;

        // Simulate analysis start
        setLoading(true);

        // We are not calling the service here directly to avoid blocking UI thread with a sync call if it was real,
        // but typically we'd call it here. For the report screen, we will satisfy the request.
        // Actually, passing the image URI to the Report screen and letting it "load" the data is a good UX pattern,
        // or we can fetch here. Let's fetch here for better error handling before navigation.

        // For this MVP, we'll navigate immediately to ReportScreen and let it handle the "Analysis" loading state
        // to show a cool loading animation there.
        setLoading(false);
        navigation.navigate('Report', { imageUri: image });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Hasar Fotoğrafı</Text>
                <Text style={styles.subtitle}>Aracın hasarlı bölgesini net bir şekilde çekin veya yükleyin.</Text>
            </View>

            <View style={styles.previewContainer}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderIcon}>📷</Text>
                        <Text style={styles.placeholderText}>Fotoğraf Yok</Text>
                    </View>
                )}
            </View>

            <View style={styles.controls}>
                {!image ? (
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={pickImage}>
                            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Galeriden Seç</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={takePhoto}>
                            <Text style={styles.buttonText}>Fotoğraf Çek</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.actionColumn}>
                        <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze}>
                            <Text style={styles.analyzeButtonText}>⚠️ Ekspertiz Başlat</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.retakeButton} onPress={() => setImage(null)}>
                            <Text style={styles.retakeButtonText}>Vazgeç / Yeniden Seç</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.secondary,
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
    previewContainer: {
        flex: 1,
        backgroundColor: '#000',
        borderRadius: 16,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    placeholder: {
        alignItems: 'center',
    },
    placeholderIcon: {
        fontSize: 48,
        marginBottom: 10,
        opacity: 0.5,
    },
    placeholderText: {
        color: '#fff',
        opacity: 0.7,
    },
    controls: {
        paddingBottom: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    button: {
        flex: 1,
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    secondaryButton: {
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    secondaryButtonText: {
        color: COLORS.primary,
    },
    actionColumn: {
        gap: 12,
    },
    analyzeButton: {
        backgroundColor: COLORS.accent, // Use accent (red) for the main action
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    analyzeButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    retakeButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    retakeButtonText: {
        color: '#666',
        fontSize: 16,
    }
});
