import { View, Text } from "react-native";
import React, { useState } from "react";
import CAccordion from "@/components/text/CAccordion";
import { MaterialIcons } from "@expo/vector-icons";
import { CCheckCard } from "@/components/cards/CCheckCard";
import CIndicator from "@/components/indicators/CStepIndicator";
import CStepIndicator from "@/components/indicators/CStepIndicator";
import CCard from "@/components/cards/CCard";

const HomeScreen = () => {
  const [selected, setSelected] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <View style={{ paddingHorizontal: 20 }}>
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
    </View>
  );
};

export default HomeScreen;
