import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import { useActivityDiaryStore } from "../stores/activityDiaryStore";
import { ExerciseSet, ActivityDiaryEntry } from "../models/interfaces/ActivityDiary";
import CDivider from "../components/CDivider";
import { useThemeColor } from "../hooks/useThemeColor";
import { ThemedText } from "../components/ThemedText";
import { ThemedView } from "../components/ThemedView";
import CCard from "../components/cards/CCard";
import CButton from "../components/button/CButton";
import CNumberInput from "../components/input/CNumberInput";
import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import { TranslationKeys } from "@/translations/translations";
import { t } from "i18next";

const GymSessionDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getSessionById, activeSession, updateSessionNotes, addSet, updateSet, completeSession } =
    useActivityDiaryStore();
  const [session, setSession] = useState(activeSession);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);
  const { width: screenWidth } = Dimensions.get("window");

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "onSurface");
  const cardColor = useThemeColor({}, "surface");
  const primaryColor = useThemeColor({}, "primary");
  const secondaryColor = useThemeColor({}, "secondary");
  const borderColor = useThemeColor({}, "outline");
  const iconColor = useThemeColor({}, "onBackground");

  useEffect(() => {
    const loadSession = async () => {
      if (id) {
        const loadedSession = await getSessionById(id);
        if (loadedSession) {
          setSession(loadedSession);
          setNotes(loadedSession.notes || "");
        }
      } else if (activeSession) {
        setSession(activeSession);
        setNotes(activeSession.notes || "");
      }
      setLoading(false);
    };

    loadSession();
  }, [id, activeSession, getSessionById]);

  const handleBackPress = () => {
    router.push("/(tabs)/activity-diary-screen");
  };

  const handleCompleteSession = async () => {
    if (await completeSession()) {
      router.back();
    }
  };

  const handleNotesChange = (text: string) => {
    setNotes(text);
    updateSessionNotes(text);
  };

  const handleAddExercise = () => {
    // Navigate to exercise selection screen
    router.push("/exercise-selection-screen");
  };

  const handleAddSet = (entryId: string) => {
    // Create a new empty set
    const newSet: ExerciseSet = {
      reps: 0,
      weight_kg: 0,
    };

    addSet(entryId, newSet);
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
      {/* Header */}
      <ThemedStackScreen
        options={{
          title: t(TranslationKeys.gym_session_detail_header),
          headerLeft: () => (
            <Pressable
              onPress={handleBackPress}
              style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.7 : 1 }]}>
              <MaterialIcons name="arrow-back" size={24} color={iconColor} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={handleCompleteSession}
              style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.7 : 1 }]}>
              <Ionicons name="checkmark-circle-outline" size={28} color={primaryColor} />
            </Pressable>
          ),
        }}
      />

      <ScrollView style={styles.content}>
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
    </ThemedView>
  );
};

interface ExerciseCardProps {
  entry: ActivityDiaryEntry;
  onAddSet: () => void;
  cardColor: string;
  textColor: string;
  borderColor: string;
  primaryColor: string;
}

// Exercise Card Component for Carousel
const ExerciseCard: React.FC<ExerciseCardProps> = ({
  entry,
  onAddSet,
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
      <ThemedText style={styles.exerciseName}>{entry.exercise_name}</ThemedText>

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

      <TouchableOpacity
        style={[styles.addSetButton, { borderColor: primaryColor }]}
        onPress={onAddSet}>
        <ThemedText style={[styles.addSetText, { color: primaryColor }]}>
          {t(TranslationKeys.gym_session_detail_add_set)}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginVertical: 16,
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
  exerciseName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
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
});

export default GymSessionDetailScreen;
