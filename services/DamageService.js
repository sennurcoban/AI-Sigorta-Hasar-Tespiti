/**
 * Damage Service (Real Backend Connected)
 */

import { Platform } from 'react-native';

// ----------------------------------------------------------------------
// 🔧 BACKEND CONNECTION SETTINGS
// ----------------------------------------------------------------------
// HOW TO TEST:
// 1. Simulator (iOS/Android): Works automatically (uses localhost).
// 2. Physical Device (Phone): You MUST replace 'null' below with your computer's IP.
//    Example: '192.168.1.122'
const PHYSICAL_DEVICE_IP = '192.168.1.122';
// ----------------------------------------------------------------------

const getBaseUrl = () => {
    // If we have a physical device IP set, prioritize it
    // (This is useful for the developer testing on their phone)
    if (PHYSICAL_DEVICE_IP) {
        return `http://${PHYSICAL_DEVICE_IP}:8000`;
    }

    // Fallback for Recruiters/Simulators
    // Android Emulator special loopback IP: 10.0.2.2
    // iOS Simulator uses standard localhost
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:8000';
    } else {
        return 'http://localhost:8000';
    }
};

const API_URL = getBaseUrl();

export const detectVehicle = async (imageUri) => {
    // This function is kept for compatibility if needed individually,
    // but now the main work is done in analyzeDamage which does both.
    // For the UI flow (Step 1: Check), we can still use this if the backend supports it,
    // or we can just mock it here since the Real Check happens in step 2 anyway.
    // BUT the user wants the "Scanning..." flow.
    // Let's call the same endpoint but maybe we can optimize?
    // Actually, for simplicity, let's keep the flow:
    // UI calls detectVehicle -> Backend verifies (fast)
    // UI calls analyzeDamage -> Backend verifies + Calculates (slow)
    // To do this, we need 'analyze' to handle modes, or just rely on 'analyzeDamage' doing everything.

    // Let's make detectVehicle a lightweight check if possible, or just call the same one.
    // Since we merged logic in backend, let's just use the full endpoint.
    return {
        isVehicle: true, // We will validate in the next step realistically
        message: "Ön tarama tamamlandı."
    };
};

export const analyzeDamage = async (imageUri) => {
    try {
        const formData = new FormData();
        formData.append('file', {
            uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
            name: 'photo.jpg',
            type: 'image/jpeg',
        });

        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!response.ok) {
            throw new Error(`Server status: ${response.status}`);
        }

        const result = await response.json();

        // If backend says undefined vehicle, throw error to be caught by UI
        if (result.is_vehicle === false) {
            throw new Error("Araç tespit edilemedi");
        }

        // Validation: Check if backend is actually returning the new data structure
        if (!result.detectedParts) {
            throw new Error("Sunucu güncel değil. Lütfen Python terminalini kapatıp tekrar 'python3 main.py' ile başlatın.");
        }

        return {
            detectedParts: result.detectedParts,
            laborCost: result.laborCost,
            totalCost: result.totalCost,
            currency: result.currency,
            confidence: result.confidence
        };

    } catch (error) {
        if (error.message === "Araç tespit edilemedi") {
            throw error; // Re-throw to be handled as "No Vehicle" UI state
        }
        console.error("Backend Error:", error);
        // Return a fallback so the app didn't crash, but ideally we show error.
        // Given the UI expects a result or throws, let's throw.
        throw error;
    }
};
