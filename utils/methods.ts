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
    if (value instanceof Error) return value

    let stringified = '[Unable to stringify the thrown value]'
    try {
      stringified = JSON.stringify(value)
    } catch {}
  
    const error = new Error(`This value was thrown as is, not through an Error: ${stringified}`)
    return error
}