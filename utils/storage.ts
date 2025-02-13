import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getStorageItem<T>(key: string): Promise<T | null> 
{
    try {
        const value = await AsyncStorage.getItem(key);
        if (value === null)
            return null;

        return JSON.parse(value) as T;
    }
    catch (error) {
        console.error("Error getting item " + key + " from AsyncStorage", error);
        return null;
    }
}

export async function setStorageItem<T>(key: string, value: T): Promise<void> {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    }
    catch (error) {
        console.error("Error setting item " + key + " to AsyncStorage", error);
    }
}