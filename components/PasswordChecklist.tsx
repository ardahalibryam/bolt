import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../app/constants/Colors";
import { validatePassword } from "../lib/passwordValidation";

interface PasswordChecklistProps {
    password: string;
}

const RULES: { key: string; label: string }[] = [
    { key: "minLength", label: "Поне 8 символа" },
    { key: "uppercase", label: "Поне 1 главна буква (A-Z)" },
    { key: "lowercase", label: "Поне 1 малка буква (a-z)" },
    { key: "number", label: "Поне 1 цифра (0-9)" },
    { key: "specialChar", label: "Поне 1 специален символ (!@#$...)" },
];

export default function PasswordChecklist({ password }: PasswordChecklistProps) {
    if (!password) return null;

    const rules = validatePassword(password);

    return (
        <View style={styles.container}>
            {RULES.map((rule) => {
                const passed = rules[rule.key as keyof typeof rules];
                return (
                    <View key={rule.key} style={styles.row}>
                        <Text style={[styles.icon, passed && styles.iconPassed]}>
                            {passed ? "✓" : "○"}
                        </Text>
                        <Text style={[styles.label, passed && styles.labelPassed]}>
                            {rule.label}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    icon: {
        fontSize: 14,
        color: Colors.inactive,
        width: 20,
    },
    iconPassed: {
        color: "#34C759",
    },
    label: {
        fontSize: 13,
        color: Colors.inactive,
    },
    labelPassed: {
        color: "#34C759",
    },
});
