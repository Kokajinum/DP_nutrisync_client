import { useEffect, useState } from "react";
import { TextStyle, View, ViewStyle, StyleSheet, Text } from "react-native";
import WheelPicker from "@quidone/react-native-wheel-picker";

export interface NumberPickerProps {
  min: number;
  max: number;
  step?: number;
  showDecimal?: boolean;
  value?: number;
  onChange: (value: number) => void;
  wholeLabel?: string;
  decimalLabel?: string;

  style?: ViewStyle;
  wheelStyle?: ViewStyle;
  labelStyle?: TextStyle;
}

export const NumberPicker: React.FC<NumberPickerProps> = ({
  min,
  max,
  step = 1,
  showDecimal = false,
  value = min,
  onChange,
  wholeLabel = "Whole",
  decimalLabel = "Decimal",
  style,
  wheelStyle,
  labelStyle,
}) => {
  const integers = Array.from(
    { length: Math.floor((max - min) / step) + 1 },
    (_, i) => min + i * step
  );
  const decimals = Array.from({ length: 10 }, (_, i) => i);

  const [intPart, setIntPart] = useState<number>(Math.floor(value));
  const [decPart, setDecPart] = useState<number>(
    showDecimal ? Math.round((value - intPart) * 10) : 0
  );

  useEffect(() => {
    const iv = Math.floor(value);
    const dv = showDecimal ? Math.round((value - iv) * 10) : 0;
    setIntPart(iv);
    setDecPart(dv);
  }, [value, showDecimal]);

  const emit = (i: number, d: number) => {
    const v = showDecimal ? i + d / 10 : i;
    onChange(parseFloat(v.toFixed(showDecimal ? 1 : 0)));
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.wheelContainer}>
        {wholeLabel ? <Text style={[styles.label, labelStyle]}>{wholeLabel}</Text> : null}
        <WheelPicker
          data={integers.map((i) => ({ label: i.toString(), value: i }))}
          value={intPart}
          onValueChanged={({ item }) => {
            setIntPart(item.value);
            emit(item.value, decPart);
          }}
          itemHeight={48}
          style={[styles.wheel, wheelStyle]}
        />
      </View>

      {showDecimal && (
        <View style={styles.wheelContainer}>
          {decimalLabel ? <Text style={[styles.label, labelStyle]}>{decimalLabel}</Text> : null}
          <WheelPicker
            data={decimals.map((d) => ({ label: d.toString(), value: d }))}
            value={decPart}
            onValueChanged={({ item }) => {
              setDecPart(item.value);
              emit(intPart, item.value);
            }}
            itemHeight={48}
            style={[styles.wheel, wheelStyle]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  wheelContainer: {
    flex: 1,
    alignItems: "center",
  },
  wheel: {
    width: "100%",
    height: 150,
  },
  label: {
    fontSize: 12,
    color: "#555",
    marginBottom: 4,
  },
});
