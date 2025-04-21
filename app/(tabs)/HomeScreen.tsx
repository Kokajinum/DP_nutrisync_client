import { View, Text, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import CAccordion from "@/components/text/CAccordion";
import { MaterialIcons } from "@expo/vector-icons";
import { CCheckCard } from "@/components/cards/CCheckCard";
import CStepIndicator from "@/components/indicators/CStepIndicator";
import CCard from "@/components/cards/CCard";
import { useAuth } from "@/context/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ensureError } from "@/utils/methods";
import { useRestManager } from "@/context/RestManagerProvider";
import { fetchUserProfile } from "@/utils/api/apiClient";
import { CSegmentedButton } from "@/components/button/CSegmentedButton";

const HomeScreen = () => {
  const [selected, setSelected] = useState(false);
  const { session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const restManager = useRestManager();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedSegmentedIndex, setSelectedSegmentedIndex] = useState(0);
  const segments = ["První", "Druhý", "Třetí"];
  const segments2 = ["Kg", "Lbs"];

  // const fetchUserProfile = async (): Promise<UserProfileData | null> => {
  //   try {
  //     const response = await restManager.get<UserProfileData>("/users/profile");
  //     return response.data;
  //   } catch (exception) {
  //     const error: Error = ensureError(exception);
  //     console.error(error.message);
  //     return null;
  //   }
  // };

  useEffect(() => {
    const getProfileData = async () => {
      console.log(session);

      const profile = await queryClient.fetchQuery({
        queryKey: ["profileData"],
        queryFn: () => fetchUserProfile(restManager),
      });

      if (profile) {
        console.log(profile);
      } else {
        console.log("chyba");
      }
    };

    getProfileData();
  }, [session]);

  return (
    <ScrollView style={{ paddingHorizontal: 20 }}>
      <Text>HomeScreen</Text>
      <CAccordion
        title="Training plan"
        content="Zde můžeš zobrazit detailní informace o tréninkovém plánu."
        leftIcon={<MaterialIcons name="fitness-center" size={24} />}
      />

      <CAccordion
        title="Height, weight, age or birthday"
        content="To understand your basic stats like age, height, and weight, which are crucial for our algorithms to calculate your calorie needs and goals."
        leftIcon={<MaterialIcons name="rocket-launch" size={24} />}
      />

      <CCheckCard
        icon={<MaterialIcons name="fitness-center" size={24} />}
        label="Lose fat"
        checked={selected}
        onPress={() => setSelected((prev) => !prev)}
      />
      <CStepIndicator status="done" />
      <CStepIndicator status="inProgress" />
      <CStepIndicator status="notStarted" />
      <CCard
        key="0"
        title="Beginner"
        description="I’m just starting with exercise or have limited experience..."
        leftIcon={<MaterialIcons name="fitness-center" size={24} />}
        isSelected={selectedIndex === 0}
        onPress={() => setSelectedIndex(0)}
      />

      <CCard
        key="1"
        title="Experienced"
        description="I have been working out regularly for months or years..."
        leftIcon={<MaterialIcons name="fitness-center" size={24} />}
        isSelected={selectedIndex === 1}
        onPress={() => setSelectedIndex(1)}
      />

      {/* <CSegmentedButton
        segments={segments}
        currentIndex={selectedSegmentedIndex}
        onChange={setSelectedSegmentedIndex}></CSegmentedButton> */}

      <CSegmentedButton
        segments={segments2}
        currentIndex={selectedSegmentedIndex}
        onChange={setSelectedSegmentedIndex}
        containerStyle={{ width: "50%" }}></CSegmentedButton>
    </ScrollView>
  );
};

export default HomeScreen;
