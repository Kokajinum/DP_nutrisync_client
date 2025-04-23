/**
 * Odloží provedení kódu o daný počet milisekund.
 *
 * @param ms Počet milisekund, po které má být kód odložen.
 * @returns Promise, který se vyřeší po uplynutí daného času.
 */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Převádí libovolnou hodnotu na instanci třídy Error.
 *
 * Pokud je vstup již instancí Error, vrátí ho beze změny.
 * Pokud není, pokusí se hodnotu převést na řetězec a vytvoří novou instanci Error.
 *
 * @param value Libovolná hodnota, která byla vyhozena jako výjimka.
 * @returns Instance Error reprezentující zadanou hodnotu.
 *
 * @see https://medium.com/with-orus/the-5-commandments-of-clean-error-handling-in-typescript-93a9cbdf1af5
 */
export const ensureError = (value: unknown): Error => {
  if (value instanceof Error) return value;

  let stringified = "[Unable to stringify the thrown value]";
  try {
    stringified = JSON.stringify(value);
  } catch {}

  const error = new Error(`This value was thrown as is, not through an Error: ${stringified}`);
  return error;
};

type WeightUnit = "kg" | "lbs";
type HeightUnit = "cm" | "ft";

/**
 * Převádí hodnotu hmotnosti mezi kilogramy (kg) a librami (lbs).
 *
 * @param value - Číselná hodnota k převodu.
 * @param from - Výchozí jednotka ('kg' nebo 'lbs').
 * @param to - Cílová jednotka ('kg' nebo 'lbs').
 * @param decimals - (Volitelné) počet desetinných míst pro zaokrouhlení výsledku.
 * @returns Převáděná (a případně zaokrouhlená) hodnota v cílové jednotce.
 * @throws Pokud je požadována nepodporovaná konverze.
 */
export const convertWeight = (
  value: number,
  from: WeightUnit,
  to: WeightUnit,
  decimals?: number
): number => {
  const kgToLbs = 2.20462;

  if (from === to) {
    return decimals !== undefined ? roundToDecimals(value, decimals) : value;
  }

  let result: number;

  if (from === "kg" && to === "lbs") {
    result = value * kgToLbs;
  } else if (from === "lbs" && to === "kg") {
    result = value / kgToLbs;
  } else {
    throw new Error(`Unsupported weight conversion from ${from} to ${to}`);
  }

  return decimals !== undefined ? roundToDecimals(result, decimals) : result;
};

/**
 * Převádí hodnotu výšky mezi centimetry (cm) a stopami (ft).
 *
 * @param value - Číselná hodnota k převodu.
 * @param from - Výchozí jednotka ('cm' nebo 'ft').
 * @param to - Cílová jednotka ('cm' nebo 'ft').
 * @param decimals - (Volitelné) počet desetinných míst pro zaokrouhlení výsledku.
 * @returns Převáděná (a případně zaokrouhlená) hodnota v cílové jednotce.
 * @throws Pokud je požadována nepodporovaná konverze.
 */
export const convertHeight = (
  value: number,
  from: HeightUnit,
  to: HeightUnit,
  decimals?: number
): number => {
  const cmToFeet = 0.0328084;

  if (from === to) {
    return decimals !== undefined ? roundToDecimals(value, decimals) : value;
  }

  let result: number;

  if (from === "cm" && to === "ft") {
    result = value * cmToFeet;
  } else if (from === "ft" && to === "cm") {
    result = value / cmToFeet;
  } else {
    throw new Error(`Unsupported height conversion from ${from} to ${to}`);
  }

  return decimals !== undefined ? roundToDecimals(result, decimals) : result;
};

export const roundToDecimals = (value: number, decimals: number = 2): number => {
  if (isNaN(value) || value === undefined || value === null) {
    return 0;
  }

  if (decimals > 10) {
    decimals = 10;
  }

  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};
