import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { finalizeDraft } from "../lib/drafts";
import { Colors } from "./constants/Colors";

export default function ReviewScreen() {
    const { draftId, title: initialTitle, description: initialDescription } = useLocalSearchParams<{
        draftId: string;
        title: string;
        description: string;
    }>();

    const [title, setTitle] = useState(initialTitle || "");
    const [description, setDescription] = useState(initialDescription || "");
    const [submitting, setSubmitting] = useState(false);

    const handlePublish = async () => {
        if (!title.trim()) {
            Alert.alert("Грешка", "Моля, въведете заглавие.");
            return;
        }
        if (!description.trim()) {
            Alert.alert("Грешка", "Моля, въведете описание.");
            return;
        }

        const id = Array.isArray(draftId) ? draftId[0] : draftId;
        if (!id) {
            Alert.alert("Грешка", "Липсва ID на обявата.");
            return;
        }

        setSubmitting(true);
        try {
            const { listingId } = await finalizeDraft(id, {
                finalTitle: title.trim(),
                finalDescription: description.trim()
            });

            router.push(`/listing/${listingId}?created=true`);
        } catch (error) {
            console.error("Finalize error:", error);
            Alert.alert("Грешка", "Неуспешно публикуване. Моля, опитайте отново.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Преглед</Text>
                <View style={{ width: 60 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.label}>Заглавие</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Въведете заглавие..."
                        placeholderTextColor="#666"
                        maxLength={100}
                    />

                    <Text style={styles.label}>Описание</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Въведете описание..."
                        placeholderTextColor="#666"
                        multiline
                        numberOfLines={8}
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        style={[styles.publishButton, submitting && styles.buttonDisabled]}
                        onPress={handlePublish}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.publishButtonText}>Публикувай</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.black,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: "bold",
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    label: {
        color: Colors.textSecondary,
        fontSize: 14,
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: Colors.surface,
        color: Colors.white,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        fontSize: 16,
    },
    textArea: {
        minHeight: 150,
        paddingTop: 16,
    },
    publishButton: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 32,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    publishButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: "bold",
    },
});

