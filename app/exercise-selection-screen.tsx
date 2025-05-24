import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";
import { db } from "@/utils/sqliteHelper";
import { useActivityDiaryStore } from "@/stores/activityDiaryStore";
import { ThemedStackScreen } from "@/components/ThemedStackScreen";

interface Exercise {
  id: string;
  name: string;
  description: string;
  equipment: string;
}

const ExerciseSelectionScreen = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { addExercise } = useActivityDiaryStore();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Theme colors
  const textColor = useThemeColor({}, "onSurface");
  const cardColor = useThemeColor({}, "surface");
  const primaryColor = useThemeColor({}, "primary");
  const borderColor = useThemeColor({}, "outline");

  // Load exercises from database
  useEffect(() => {
    const loadExercises = async () => {
      try {
        setLoading(true);
        const currentLocale = i18n.language || "en";

        // Get exercises with localizations
        const exerciseData = await db.getAllAsync<Exercise>(
          `SELECT e.id, COALESCE(el.name, e.name) as name, 
                  COALESCE(el.description, e.description) as description, 
                  e.equipment
           FROM exercises e
           LEFT JOIN exercise_localizations el ON e.id = el.exercise_id AND el.locale = ?
           ORDER BY name`,
          [currentLocale]
        );

        setExercises(exerciseData);
        setFilteredExercises(exerciseData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load exercises:", error);
        setLoading(false);
      }
    };

    loadExercises();
  }, [i18n.language]);

  // Filter exercises based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredExercises(exercises);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = exercises.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(query) ||
          exercise.description.toLowerCase().includes(query) ||
          exercise.equipment.toLowerCase().includes(query)
      );
      setFilteredExercises(filtered);
    }
  }, [searchQuery, exercises]);

  const handleBackPress = () => {
    router.back();
  };

  const handleExerciseSelect = async (exercise: Exercise) => {
    await addExercise(exercise.id, exercise.name);
    router.back();
  };

  const getEquipmentIcon = (equipment: string) => {
    switch (equipment) {
      case "barbell":
        return "barbell-outline";
      case "dumbbell":
        return "fitness-outline";
      case "machine":
        return "cog-outline";
      case "cable":
        return "git-network-outline";
      case "bodyweight":
        return "body-outline";
      case "kettlebell":
        return "basketball-outline";
      default:
        return "fitness-outline";
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedStackScreen
        options={{
          title: t(TranslationKeys.food_creation_header),
          headerLeft: () => (
            <Pressable
              onPress={() => router.push("/(tabs)/activity-diary-screen")}
              style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.7 : 1 }]}>
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </Pressable>
          ),
        }}
      />

      {/* Search Bar */}
      <View style={[styles.searchContainer, { borderColor }]}>
        <Ionicons name="search" size={20} color={textColor} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder={t(TranslationKeys.activity_diary_search_exercises)}
          placeholderTextColor={`${textColor}80`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={textColor} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      ) : (
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.exerciseCard, { backgroundColor: cardColor, borderColor }]}
              onPress={() => handleExerciseSelect(item)}>
              <View style={styles.exerciseCardContent}>
                <View style={[styles.iconContainer, { backgroundColor: `${primaryColor}20` }]}>
                  <Ionicons
                    name={getEquipmentIcon(item.equipment)}
                    size={24}
                    color={primaryColor}
                  />
                </View>
                <View style={styles.exerciseInfo}>
                  <ThemedText style={styles.exerciseName}>{item.name}</ThemedText>
                  <ThemedText style={styles.exerciseDescription} numberOfLines={2}>
                    {item.description}
                  </ThemedText>
                </View>
                <Ionicons name="add-circle" size={24} color={primaryColor} />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                {t(TranslationKeys.activity_diary_no_exercises_found)}
              </ThemedText>
            </View>
          }
        />
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  exerciseCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  exerciseCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.7,
  },
  headerButton: {
    padding: 8,
    marginHorizontal: 8,
  },
});

export default ExerciseSelectionScreen;
