import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { uploadImage } from "./lib/cloudinary";
import { createDraft } from "./lib/drafts";

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
          <Text style={styles.permissionText}>We need your permission to use the camera</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current && !isCreatingDraft) {
      try {
        setIsCreatingDraft(true);
        const photo = await cameraRef.current.takePictureAsync({
          base64: false, // Explicitly disable base64 to save memory
        });

        if (!photo?.uri) {
          throw new Error("Неуспешно заснемане на снимка.");
        }

        console.log("Uploading image to Cloudinary...");
        // Upload to Cloudinary
        const imageUrl = await uploadImage(photo.uri);
        console.log("Image uploaded successfully:", imageUrl);

        // Create draft with the Cloudinary URL
        console.log("Creating draft with URL...");
        const draftId = await createDraft(imageUrl);
        console.log("Draft created successfully, ID:", draftId);

        // Navigate to price screen with draftId
        router.push({ pathname: "/price", params: { draftId } });
      } catch (error) {
        console.error("Error in takePicture flow:", error);
        const message = error instanceof Error ? error.message : "Възникна грешка. Моля, опитайте отново.";
        Alert.alert("Грешка", message);
      } finally {
        setIsCreatingDraft(false);
      }
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
            source={require("../assets/images/icons/nav/arrow-back.svg")}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Top Section - Camera Icon and Lens Frame */}
        <View style={styles.topSection}>
          <View style={styles.topLeft}>
            <Ionicons name="camera" size={32} color="#fff" />
          </View>
          <View style={styles.topCenter}>
            <Image
              source={require("../assets/images/lens.png")}
              style={styles.lensFrame}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Corner Framing Guides */}
        <View style={styles.frameContainer}>
          {/* Top Left Corner */}
          <View style={[styles.corner, styles.topLeftCorner]} />
          {/* Top Right Corner */}
          <View style={[styles.corner, styles.topRightCorner]} />
          {/* Bottom Left Corner */}
          <View style={[styles.corner, styles.bottomLeftCorner]} />
          {/* Bottom Right Corner */}
          <View style={[styles.corner, styles.bottomRightCorner]} />
        </View>

        {/* Tips Overlay */}
        {showTips && (
          <View style={styles.tipsOverlay}>
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Tips for better photos:</Text>
              <Text style={styles.tipsText}>• Use good lighting</Text>
              <Text style={styles.tipsText}>• Keep the product centered</Text>
              <Text style={styles.tipsText}>• Ensure the product is in focus</Text>
              <Text style={styles.tipsText}>• Use a clean background</Text>
            </View>
          </View>
        )}

        {/* Bottom Control Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomBarContent}>
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
              <Text style={styles.tipsButtonText}>?</Text>
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
    backgroundColor: "#000",
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
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#1374F6",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#fff",
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
    tintColor: "#fff",
  },
  topSection: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 100,
  },
  topLeft: {
    flex: 1,
  },
  topCenter: {
    flex: 1,
    alignItems: "center",
  },
  lensFrame: {
    width: 60,
    height: 60,
  },
  frameContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#000",
    borderWidth: 4,
  },
  topLeftCorner: {
    top: FRAME_OFFSET,
    left: FRAME_OFFSET,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRightCorner: {
    top: FRAME_OFFSET,
    right: FRAME_OFFSET,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeftCorner: {
    bottom: FRAME_OFFSET + 120, // Account for bottom bar
    left: FRAME_OFFSET,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRightCorner: {
    bottom: FRAME_OFFSET + 120, // Account for bottom bar
    right: FRAME_OFFSET,
    borderLeftWidth: 0,
    borderTopWidth: 0,
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
    backgroundColor: "#121212",
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 40,
    borderWidth: 1,
    borderColor: "#4D4D4D",
  },
  tipsTitle: {
    color: "#f2f2f2",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  tipsText: {
    color: "#f2f2f2",
    fontSize: 16,
    marginBottom: 12,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#000",
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
  tipsButton: {
    position: "absolute",
    right: 40,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4D4D4D",
    justifyContent: "center",
    alignItems: "center",
  },
  tipsButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
});
