import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import { CSegmentedButton } from "@/components/button/CSegmentedButton";
import CSearchInput from "@/components/input/CSearchInput";
import CButton from "@/components/button/CButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useFoodRepository } from "@/hooks/useFoodRepository";
import { FoodData } from "@/models/interfaces/FoodData";
import { MealTypeEnum } from "@/models/enums/enums";
import { useDateStore } from "@/stores/dateStore";
import CFoodSearchResultCard from "@/components/cards/CFoodSearchResultCard";

// Helper function to determine meal type based on current time
const getMealTypeFromTime = (): MealTypeEnum => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) {
    return MealTypeEnum.BREAKFAST;
  } else if (hour >= 11 && hour < 15) {
    return MealTypeEnum.LUNCH;
  } else if (hour >= 15 && hour < 19) {
    return MealTypeEnum.DINNER;
  } else {
    return MealTypeEnum.SNACK;
  }
};

// Helper function to convert meal type enum to index
const mealTypeToIndex = (mealType: MealTypeEnum): number => {
  switch (mealType) {
    case MealTypeEnum.BREAKFAST:
      return 0;
    case MealTypeEnum.LUNCH:
      return 1;
    case MealTypeEnum.DINNER:
      return 2;
    case MealTypeEnum.SNACK:
      return 3;
    default:
      return 0;
  }
};

// Helper function to convert index to meal type enum
const indexToMealType = (index: number): MealTypeEnum => {
  switch (index) {
    case 0:
      return MealTypeEnum.BREAKFAST;
    case 1:
      return MealTypeEnum.LUNCH;
    case 2:
      return MealTypeEnum.DINNER;
    case 3:
      return MealTypeEnum.SNACK;
    default:
      return MealTypeEnum.BREAKFAST;
  }
};

export default function FoodDiaryEntryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { searchFoods, getAllLocalFoods } = useFoodRepository();

  const iconColor = useThemeColor({}, "onBackground");
  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "outline");
  const primaryColor = useThemeColor({}, "primary");

  // State for meal type selection - automatically set based on time of day
  const [selectedMealTypeIndex, setSelectedMealTypeIndex] = useState(() =>
    mealTypeToIndex(getMealTypeFromTime())
  );
  const mealTypes = [
    t(TranslationKeys.food_diary_entry_breakfast),
    t(TranslationKeys.food_diary_entry_lunch),
    t(TranslationKeys.food_diary_entry_dinner),
    t(TranslationKeys.food_diary_entry_snack),
  ];

  // State for search
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<FoodData[]>([]);
  const [historyItems, setHistoryItems] = useState<FoodData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Load history items on mount
  useEffect(() => {
    loadHistoryItems();
  }, []);

  // Load history items from local storage
  const loadHistoryItems = async () => {
    try {
      const items = await getAllLocalFoods();
      setHistoryItems(items);
    } catch (error) {
      console.error("Error loading history items:", error);
    }
  };

  // Handle search query change with debounce
  useEffect(() => {
    if (searchQuery.length >= 4) {
      performSearch(1);
    } else if (searchQuery.length === 0) {
      setSearchResults([]);
      setCurrentPage(1);
      setHasMoreResults(false);
      setTotalCount(0);
    }
  }, [searchQuery]);

  // Perform search
  const performSearch = async (page: number) => {
    if (searchQuery.length < 4) return;

    try {
      if (page === 1) {
        setIsSearching(true);
      }

      const result = await searchFoods({
        query: searchQuery,
        page,
        limit: 10,
      });

      if (page === 1) {
        setSearchResults(result.items);
      } else {
        setSearchResults((prev) => [...prev, ...result.items]);
      }

      setCurrentPage(page);
      setHasMoreResults(result.hasMore);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error("Error searching foods:", error);
    } finally {
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  };

  // Load more search results
  const handleLoadMore = () => {
    if (hasMoreResults && !isLoadingMore) {
      setIsLoadingMore(true);
      performSearch(currentPage + 1);
    }
  };

  // Navigate to food details screen
  const navigateToFoodDetails = useCallback(
    (food: FoodData) => {
      console.log("Navigating to food details for:", food.name);

      // Get the current meal type
      const mealType = indexToMealType(selectedMealTypeIndex);

      // Navigate to food details screen with food data as params
      router.push({
        pathname: "/food-details-screen",
        params: {
          id: food.id || "",
          name: food.name,
          category: food.category || "",
          brand: food.brand || "",
          barcode: food.barcode || "",
          calories: food.calories || "0",
          protein: food.protein || "0",
          carbs: food.carbs || "0",
          fats: food.fats || "0",
          sugar: food.sugar || "0",
          fiber: food.fiber || "0",
          salt: food.salt || "0",
          servingSizeValue: food.servingSizeValue || "100",
          servingSizeUnit: food.servingSizeUnit || "g",
          mealType: mealType,
        },
      });
    },
    [router, selectedMealTypeIndex]
  );

  // Render food item
  const renderFoodItem = ({ item }: { item: FoodData }) => (
    <CFoodSearchResultCard
      item={item}
      onPress={(food) => {
        console.log("Food item pressed:", food.name);
        navigateToFoodDetails(food);
      }}
    />
  );

  // Render list header
  const renderListHeader = useCallback(() => {
    const isSearchMode = searchQuery.length >= 4;
    const headerText = isSearchMode
      ? t(TranslationKeys.food_diary_entry_search_results)
      : t(TranslationKeys.food_diary_entry_history);

    const items = isSearchMode ? searchResults : historyItems;
    const isEmpty = items.length === 0;

    return (
      <View style={styles.listHeader}>
        <ThemedText type="subtitle" style={styles.listHeaderText}>
          {headerText}
          {isSearchMode && totalCount > 0 && ` (${totalCount})`}
        </ThemedText>

        {isEmpty && !isSearching && (
          <ThemedText style={styles.emptyText}>
            {isSearchMode
              ? t(TranslationKeys.food_diary_entry_no_results)
              : t(TranslationKeys.food_diary_entry_no_history)}
          </ThemedText>
        )}
      </View>
    );
  }, [searchQuery, searchResults, historyItems, totalCount, isSearching, t]);

  // Render list footer
  const renderListFooter = useCallback(() => {
    if (isSearching && searchQuery.length >= 4 && currentPage === 1) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      );
    }

    if (isLoadingMore) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={primaryColor} />
        </View>
      );
    }

    if (hasMoreResults && searchResults.length > 0) {
      return (
        <View style={styles.loadMoreContainer}>
          <CButton
            title={t(TranslationKeys.food_diary_entry_load_more)}
            onPress={handleLoadMore}
            backgroundLightColor="#FFFFFF"
            backgroundDarkColor="#333333"
            textLightColor={primaryColor}
            textDarkColor={primaryColor}
            style={[styles.loadMoreButton, { borderWidth: 1, borderColor: primaryColor }]}
          />
        </View>
      );
    }

    return null;
  }, [
    isSearching,
    isLoadingMore,
    hasMoreResults,
    searchResults,
    searchQuery,
    currentPage,
    primaryColor,
    t,
  ]);

  return (
    <ThemedView style={styles.container}>
      <ThemedStatusBar />
      <ThemedStackScreen
        options={{
          title: t(TranslationKeys.food_diary_entry_header),
        }}
      />

      <View style={styles.content}>
        {/* Meal type selector */}
        <View style={styles.segmentedButtonContainer}>
          <CSegmentedButton
            segments={mealTypes}
            currentIndex={selectedMealTypeIndex}
            onChange={setSelectedMealTypeIndex}
            buttonWidth={350}
          />
        </View>

        {/* Search input */}
        <View style={styles.searchContainer}>
          <CSearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t(TranslationKeys.food_diary_entry_search_placeholder)}
          />
        </View>

        {/* Food list */}
        <FlatList
          data={searchQuery.length >= 4 ? searchResults : historyItems}
          renderItem={renderFoodItem}
          keyExtractor={(item) => item.id || `temp-${item.name}`}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderListFooter}
          onEndReached={() => {
            if (searchQuery.length >= 4 && hasMoreResults && !isLoadingMore) {
              handleLoadMore();
            }
          }}
          onEndReachedThreshold={0.5}
        />

        {/* Create new food button */}
        <View style={styles.createButtonContainer}>
          <CButton
            title={t(TranslationKeys.food_diary_entry_create_new)}
            onPress={() => router.push("/food-creation-screen")}
            style={styles.createButton}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerButton: {
    padding: 8,
    marginHorizontal: 8,
  },
  segmentedButtonContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  listHeader: {
    marginBottom: 12,
  },
  listHeaderText: {
    marginBottom: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    opacity: 0.7,
  },
  loaderContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadMoreContainer: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  loadMoreButton: {
    minWidth: 150,
  },
  createButtonContainer: {
    marginTop: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  createButton: {
    minWidth: 200,
  },
});
