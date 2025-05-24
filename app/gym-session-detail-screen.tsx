import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthProvider";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ActivityDiarySyncHandler } from "@/components/ActivityDiarySyncHandler";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import { useActivityDiaryStore } from "../stores/activityDiaryStore";
import { ExerciseSet, ActivityDiaryEntry } from "../models/interfaces/ActivityDiary";
import CDivider from "../components/CDivider";
import { useThemeColor } from "../hooks/useThemeColor";
import { ThemedText } from "../components/ThemedText";
import { ThemedView } from "../components/ThemedView";
import CButton from "../components/button/CButton";
import CNumberInput from "../components/input/CNumberInput";
import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import { TranslationKeys } from "@/translations/translations";
import { t } from "i18next";
import { useNetInfo } from "@react-native-community/netinfo";

const GymSessionDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const {
    getSessionById,
    activeSession,
    updateSessionNotes,
    addSet,
    completeSession,
    loadActiveSession,
    removeLastSet,
  } = useActivityDiaryStore();
  const [session, setSession] = useState(activeSession);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [completedSessionId, setCompletedSessionId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const carouselRef = useRef(null);
  const { width: screenWidth } = Dimensions.get("window");

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "onSurface");
  const cardColor = useThemeColor({}, "surface");
  const primaryColor = useThemeColor({}, "primary");
  const borderColor = useThemeColor({}, "outline");

  useEffect(() => {
    const loadSession = async () => {
      try {
        // If we have an ID, try to load that specific session
        if (id) {
          const loadedSession = await getSessionById(id);
          if (loadedSession) {
            setSession(loadedSession);
            setNotes(loadedSession.notes || "");
            // Check if session is already completed
            if (loadedSession.end_at) {
              setIsCompleted(true);
            }
          }
        }
        // If no ID but we have an active session in the store, use that
        else if (activeSession) {
          setSession(activeSession);
          setNotes(activeSession.notes || "");
          // Check if session is already completed
          if (activeSession.end_at) {
            setIsCompleted(true);
          }
        }
        // If no active session in the store, try to load it from the database
        else if (user?.id) {
          // Load the active session into the store
          await loadActiveSession(user.id);

          // Get the store state again after loading
          const { activeSession: updatedActiveSession } = useActivityDiaryStore.getState();

          if (updatedActiveSession) {
            setSession(updatedActiveSession);
            setNotes(updatedActiveSession.notes || "");
            // Check if session is already completed
            if (updatedActiveSession.end_at) {
              setIsCompleted(true);
            }
          }
        }
      } catch (error) {
        console.error("Error loading session:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [id, activeSession, getSessionById, loadActiveSession, user?.id]);

  const handleBackPress = () => {
    router.push("/(tabs)/activity-diary-screen");
  };

  const handleCompleteSession = async () => {
    const { isConnected } = useNetInfo();
    if (isConnected) {
      // Show confirmation dialog
      Alert.alert(
        t(TranslationKeys.gym_session_detail_complete_title),
        t(TranslationKeys.gym_session_detail_complete_message),
        [
          {
            text: t(TranslationKeys.cancel),
            style: "cancel",
          },
          {
            text: t(TranslationKeys.gym_session_detail_complete),
            onPress: async () => {
              const result = await completeSession();
              if (result) {
                // If result is a string, it's the session ID
                if (typeof result === "string") {
                  setCompletedSessionId(result);
                  setIsCompleted(true);
                  setIsSynced(true);
                }
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        t(TranslationKeys.gym_session_detail_complete_title),
        t(TranslationKeys.internet_required),
        [
          {
            text: t(TranslationKeys.cancel),
            style: "cancel",
          },
        ]
      );
    }
  };

  const handleNotesChange = (text: string) => {
    setNotes(text);
    updateSessionNotes(text);
  };

  const handleAddExercise = () => {
    router.push("/exercise-selection-screen");
  };

  const handleAddSet = (entryId: string) => {
    const newSet: ExerciseSet = {
      reps: 0,
      weight_kg: 0,
    };

    addSet(entryId, newSet);
  };

  const handleRemoveLastSet = (entryId: string) => {
    removeLastSet(entryId);
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "";
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>{t(TranslationKeys.gym_session_detail_loading)}</ThemedText>
      </ThemedView>
    );
  }

  if (!session) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>{t(TranslationKeys.gym_session_detail_not_found)}</ThemedText>
        <CButton
          title={t(TranslationKeys.gym_session_detail_go_back)}
          onPress={handleBackPress}
          style={styles.backButton}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* ActivityDiarySyncHandler - invisible component that handles syncing */}
      <ActivityDiarySyncHandler onSessionId={completedSessionId} />

      {/* Header */}
      <ThemedStackScreen
        options={{
          title: t(TranslationKeys.gym_session_detail_header),
          headerRight: () =>
            isCompleted ? (
              <View style={styles.headerButton}>
                <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
              </View>
            ) : null,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}>
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollViewContent}>
          {/* Session Times */}
          <View style={styles.timesContainer}>
            <View style={styles.timeBlock}>
              <ThemedText style={styles.timeLabel}>
                {t(TranslationKeys.gym_session_detail_start_time)}
              </ThemedText>
              <ThemedText style={styles.timeValue}>{formatTime(session.start_at)}</ThemedText>
            </View>
            {session.end_at && (
              <View style={styles.timeBlock}>
                <ThemedText style={styles.timeLabel}>
                  {t(TranslationKeys.gym_session_detail_end_time)}
                </ThemedText>
                <ThemedText style={styles.timeValue}>{formatTime(session.end_at)}</ThemedText>
              </View>
            )}
          </View>

          <CDivider />

          {/* Notes */}
          <View style={styles.notesContainer}>
            <ThemedText style={styles.sectionTitle}>
              {t(TranslationKeys.gym_session_detail_notes)}
            </ThemedText>
            <TextInput
              style={[styles.notesInput, { color: textColor, borderColor: borderColor }]}
              value={notes}
              onChangeText={handleNotesChange}
              placeholder={t(TranslationKeys.gym_session_detail_notes_placeholder)}
              placeholderTextColor={textColor + "80"}
              multiline
            />
          </View>

          {/* Exercises Section */}
          <View style={[styles.exercisesCard, { backgroundColor: cardColor, borderRadius: 12 }]}>
            <View style={styles.exercisesHeader}>
              <ThemedText style={styles.exercisesTitle}>
                {t(TranslationKeys.gym_session_detail_exercises)} • {session.entries?.length || 0}
              </ThemedText>
              <TouchableOpacity onPress={handleAddExercise} style={styles.addExerciseButton}>
                <Ionicons name="add" size={24} color={primaryColor} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Exercise Carousel */}
          {session.entries && session.entries.length > 0 ? (
            <View style={styles.carouselContainer}>
              <Carousel
                ref={carouselRef}
                loop={false}
                width={screenWidth}
                height={420}
                data={session.entries}
                scrollAnimationDuration={500}
                renderItem={({ item }) => (
                  <ExerciseCard
                    entry={item}
                    onAddSet={() => handleAddSet(item.id)}
                    onRemoveLastSet={() => handleRemoveLastSet(item.id)}
                    cardColor={cardColor}
                    textColor={textColor}
                    borderColor={borderColor}
                    primaryColor={primaryColor}
                  />
                )}
              />
            </View>
          ) : (
            <ThemedView style={styles.noExercisesContainer}>
              <ThemedText style={styles.noExercisesText}>
                {t(TranslationKeys.gym_session_detail_no_exercises)}
              </ThemedText>
            </ThemedView>
          )}
        </ScrollView>

        {/* Complete Workout Button */}
        {!isCompleted && (
          <View style={[styles.completeWorkoutButtonContainer, { backgroundColor }]}>
            <CButton
              title={t(TranslationKeys.gym_session_detail_complete)}
              onPress={handleCompleteSession}
              style={styles.completeWorkoutButton}
              icon={
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="white"
                  style={{ marginRight: 8 }}
                />
              }
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

interface ExerciseCardProps {
  entry: ActivityDiaryEntry;
  onAddSet: () => void;
  onRemoveLastSet: () => void;
  cardColor: string;
  textColor: string;
  borderColor: string;
  primaryColor: string;
}

// Exercise Card Component for Carousel
const ExerciseCard: React.FC<ExerciseCardProps> = ({
  entry,
  onAddSet,
  onRemoveLastSet,
  cardColor,
  textColor,
  borderColor,
  primaryColor,
}) => {
  const { updateSet } = useActivityDiaryStore();
  const sets: ExerciseSet[] = JSON.parse(entry.sets_json || "[]");

  const handleWeightChange = (index: number, value: number) => {
    const updatedSet: ExerciseSet = {
      ...sets[index],
      weight_kg: value,
    };
    updateSet(entry.id, index, updatedSet);
  };

  const handleRepsChange = (index: number, value: number) => {
    const updatedSet: ExerciseSet = {
      ...sets[index],
      reps: value,
    };
    updateSet(entry.id, index, updatedSet);
  };

  return (
    <View style={[styles.exerciseCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
      <View style={styles.exerciseNameRow}>
        <ThemedText style={styles.exerciseName}>{entry.exercise_name}</ThemedText>
        <View style={styles.setButtonsContainer}>
          <TouchableOpacity onPress={onRemoveLastSet} style={styles.setButton}>
            <Ionicons name="remove" size={24} color={primaryColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onAddSet} style={styles.setButton}>
            <Ionicons name="add" size={24} color={primaryColor} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.setsContainer}>
        {/* Header Row */}
        <View style={styles.setRow}>
          <ThemedText style={[styles.setHeader, { flex: 0.2 }]}>
            {t(TranslationKeys.gym_session_detail_set)}
          </ThemedText>
          <ThemedText style={[styles.setHeader, { flex: 0.4 }]}>
            {t(TranslationKeys.gym_session_detail_weight)}
          </ThemedText>
          <ThemedText style={[styles.setHeader, { flex: 0.4 }]}>
            {t(TranslationKeys.gym_session_detail_reps)}
          </ThemedText>
        </View>

        {/* Sets */}
        {sets.map((set: ExerciseSet, index: number) => (
          <View key={index} style={[styles.setRow, { borderBottomColor: borderColor }]}>
            <ThemedText style={[styles.setText, { flex: 0.2 }]}>{index + 1}</ThemedText>
            <View style={[styles.setInputContainer, { flex: 0.4 }]}>
              <CNumberInput
                value={set.weight_kg}
                onChange={(value) => handleWeightChange(index, value)}
                style={styles.setInput}
              />
            </View>
            <View style={[styles.setInputContainer, { flex: 0.4 }]}>
              <CNumberInput
                value={set.reps}
                onChange={(value) => handleRepsChange(index, value)}
                style={styles.setInput}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  completeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  timesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  timeBlock: {
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  notesContainer: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
  },
  exercisesCard: {
    marginVertical: 0,
  },
  exercisesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exercisesTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addExerciseButton: {
    padding: 8,
  },
  carouselContainer: {
    marginVertical: 0,
    alignItems: "center",
  },
  noExercisesContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  noExercisesText: {
    textAlign: "center",
    opacity: 0.7,
  },
  exerciseCard: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    height: "100%",
    width: "90%",
    alignSelf: "center",
  },
  exerciseNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  setButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  setButton: {
    marginLeft: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  setsContainer: {
    flex: 1,
    marginBottom: 16,
  },
  setRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  setHeader: {
    fontWeight: "bold",
    fontSize: 14,
  },
  setText: {
    fontSize: 14,
    textAlign: "center",
  },
  setInputContainer: {
    paddingHorizontal: 4,
  },
  setInput: {
    height: 40,
  },
  addSetButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addSetText: {
    fontWeight: "bold",
  },
  headerButton: {
    padding: 8,
    marginHorizontal: 8,
  },
  completeWorkoutButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completeWorkoutButton: {
    borderRadius: 8,
  },
});

export default GymSessionDetailScreen;
