import { FoodCategoryEnum } from "@/models/enums/enums";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";

export const getFoodCategoryOptions = () => {
  const { t } = useTranslation();

  return [
    { label: t(TranslationKeys.fruit), value: FoodCategoryEnum.FRUIT },
    { label: t(TranslationKeys.vegetables), value: FoodCategoryEnum.VEGETABLES },
    { label: t(TranslationKeys.meat), value: FoodCategoryEnum.MEAT },
    { label: t(TranslationKeys.fish_and_seafood), value: FoodCategoryEnum.FISH_AND_SEAFOOD },
    { label: t(TranslationKeys.dairy), value: FoodCategoryEnum.DAIRY },
    { label: t(TranslationKeys.eggs), value: FoodCategoryEnum.EGGS },
    { label: t(TranslationKeys.bread_and_bakery), value: FoodCategoryEnum.BREAD_AND_BAKERY },
    { label: t(TranslationKeys.cereals_and_grains), value: FoodCategoryEnum.CEREALS_AND_GRAINS },
    { label: t(TranslationKeys.legumes), value: FoodCategoryEnum.LEGUMES },
    { label: t(TranslationKeys.nuts_and_seeds), value: FoodCategoryEnum.NUTS_AND_SEEDS },
    { label: t(TranslationKeys.fats_and_oils), value: FoodCategoryEnum.FATS_AND_OILS },
    { label: t(TranslationKeys.sweets), value: FoodCategoryEnum.SWEETS },
    { label: t(TranslationKeys.snacks), value: FoodCategoryEnum.SNACKS },
    { label: t(TranslationKeys.beverages), value: FoodCategoryEnum.BEVERAGES },
    { label: t(TranslationKeys.alcohol), value: FoodCategoryEnum.ALCOHOL },
    { label: t(TranslationKeys.condiments), value: FoodCategoryEnum.CONDIMENTS },
    { label: t(TranslationKeys.prepared_meals), value: FoodCategoryEnum.PREPARED_MEALS },
    { label: t(TranslationKeys.other), value: FoodCategoryEnum.OTHER },
  ];
};
