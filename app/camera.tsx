import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { uploadImage } from "../lib/cloudinary";
import { createDraft } from "../lib/drafts";
import { Colors } from "./constants/Colors";

const { width, height } = Dimensions.get("window");
const FRAME_SIZE = width * 0.7; // 70% of screen width
const FRAME_OFFSET = (width - FRAME_SIZE) / 2;

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [showTips, setShowTips] = useState(false);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Нужен е достъп до камерата</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Разрешете достъп</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Shared handler for processing an image URI (from camera or gallery)
   */
  const handleImageSelected = async (uri: string) => {
    try {
      setIsCreatingDraft(true);

      console.log("Uploading image to Cloudinary...");
      const imageUrl = await uploadImage(uri);
      console.log("Image uploaded successfully:", imageUrl);

      console.log("Creating draft with URL...");
      const draftId = await createDraft(imageUrl);
      console.log("Draft created successfully, ID:", draftId);

      router.push({ pathname: "/price", params: { draftId } });
    } catch (error) {
      console.error("Error in image processing flow:", error);
      const message = error instanceof Error ? error.message : "Възникна грешка. Моля, опитайте отново.";
      Alert.alert("Грешка", message);
    } finally {
      setIsCreatingDraft(false);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current && !isCreatingDraft) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: false,
        });

        if (!photo?.uri) {
          throw new Error("Неуспешно заснемане на снимка.");
        }

        await handleImageSelected(photo.uri);
      } catch (error) {
        console.error("Error in takePicture:", error);
        const message = error instanceof Error ? error.message : "Възникна грешка. Моля, опитайте отново.";
        Alert.alert("Грешка", message);
      }
    }
  };

  /**
   * Pick an image from the device gallery
   */
  const pickImage = async () => {
    if (isCreatingDraft) return;

    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Нужен е достъп",
        "Моля, разрешете достъп до галерията, за да изберете снимка.",
        [{ text: "OK" }]
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      await handleImageSelected(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Image
            source={require("../assets/images/icons/nav/arrow-back.png")}
            style={styles.backIcon}
            tintColor={Colors.white}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Tips Overlay */}
        {showTips && (
          <View style={styles.tipsOverlay}>
            <View style={styles.tipsContainer}>
              <TouchableOpacity
                style={styles.tipsCloseButton}
                onPress={() => setShowTips(false)}
              >
                <Image
                  source={require("../assets/images/icons/camera/close.png")}
                  style={styles.tipsCloseIcon}
                  tintColor={Colors.textPrimary}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text style={styles.tipsTitle}>Съвети за по-добри снимки:</Text>
              <Text style={styles.tipsText}>• Използвайте добро осветление</Text>
              <Text style={styles.tipsText}>• Дръжте продукта в центъра</Text>
              <Text style={styles.tipsText}>• Уверете се, че продуктът е на фокус</Text>
              <Text style={styles.tipsText}>• Използвайте чист фон</Text>
            </View>
          </View>
        )}

        {/* Loading Overlay - shown while processing image */}
        {isCreatingDraft && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Обработване...</Text>
          </View>
        )}

        {/* Bottom Control Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomBarContent}>
            {/* Gallery Button */}
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={pickImage}
              disabled={isCreatingDraft}
            >
              <Image
                source={require("../assets/images/icons/camera/gallery.png")}
                style={styles.galleryIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {/* Snap Button */}
            <TouchableOpacity
              style={[styles.snapButton, isCreatingDraft && styles.snapButtonDisabled]}
              onPress={takePicture}
              disabled={isCreatingDraft}
            >
              {isCreatingDraft ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <Image
                  source={require("../assets/images/snap.png")}
                  style={styles.snapIcon}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>

            {/* Tips Toggle Button */}
            <TouchableOpacity
              style={styles.tipsButton}
              onPress={() => setShowTips(!showTips)}
            >
              <Image
                source={require("../assets/images/icons/camera/help.png")}
                style={styles.tipsIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    color: Colors.white,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: Colors.white,
    fontSize: 16,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 1000,
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  tipsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 200,
  },
  tipsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    paddingTop: 40,
    marginHorizontal: 40,
    borderWidth: 1,
    borderColor: Colors.border,
    position: "relative",
  },
  tipsCloseButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  tipsCloseIcon: {
    width: 20,
    height: 20,
    transform: [{ rotate: "180deg" }],
  },
  tipsTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  tipsText: {
    color: Colors.textPrimary,
    fontSize: 16,
    marginBottom: 12,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.black,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  bottomBarContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 40,
  },
  snapButton: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  snapIcon: {
    width: 80,
    height: 80,
  },
  snapButtonDisabled: {
    opacity: 0.5,
  },
  galleryButton: {
    position: "absolute",
    left: 40,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryIcon: {
    width: 30,
  },
  tipsButton: {
    position: "absolute",
    right: 40,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  tipsIcon: {
    width: 30,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 300,
  },
  loadingText: {
    color: Colors.white,
    fontSize: 18,
    marginTop: 16,
    fontWeight: "500",
  },
});

