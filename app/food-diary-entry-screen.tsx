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

export default function FoodDiaryEntryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { searchFoods, getAllLocalFoods } = useFoodRepository();

  const iconColor = useThemeColor({}, "onBackground");
  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "outline");
  const primaryColor = useThemeColor({}, "primary");

  // State for meal type selection
  const [selectedMealTypeIndex, setSelectedMealTypeIndex] = useState(0);
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

  // Render food item
  const renderFoodItem = ({ item }: { item: FoodData }) => (
    <Pressable
      style={({ pressed }) => [
        styles.foodItem,
        { backgroundColor: surfaceColor, borderColor },
        pressed && { opacity: 0.7 },
      ]}
      onPress={() => handleSelectFood(item)}>
      <View style={styles.foodItemContent}>
        <ThemedText type="subtitle" style={styles.foodName}>
          {item.name}
        </ThemedText>
        {item.brand && <ThemedText style={styles.foodBrand}>{item.brand}</ThemedText>}
        <View style={styles.foodDetails}>
          <ThemedText style={styles.foodCalories}>{item.calories} kcal</ThemedText>
          <View style={styles.macros}>
            <ThemedText style={styles.macroText}>P: {item.protein}g</ThemedText>
            <ThemedText style={styles.macroText}>C: {item.carbs}g</ThemedText>
            <ThemedText style={styles.macroText}>F: {item.fats}g</ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );

  // Handle food selection
  const handleSelectFood = (food: FoodData) => {
    //todo
    router.back();
  };

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
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.7 : 1 }]}>
              <MaterialIcons name="arrow-back" size={24} color={iconColor} />
            </Pressable>
          ),
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
  foodItem: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  foodItemContent: {
    padding: 12,
  },
  foodName: {
    marginBottom: 4,
  },
  foodBrand: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  foodDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  foodCalories: {
    fontSize: 14,
    fontWeight: "500",
  },
  macros: {
    flexDirection: "row",
  },
  macroText: {
    fontSize: 14,
    marginLeft: 8,
    opacity: 0.8,
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
