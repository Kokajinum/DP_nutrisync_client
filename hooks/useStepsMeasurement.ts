import { useState, useEffect } from "react";
import { initialize, requestPermission, readRecords } from "react-native-health-connect";
import { useRestManager } from "@/context/RestManagerProvider";
import { saveStepMeasurement } from "@/utils/api/apiClient";
import { CreateStepMeasurementDto } from "@/models/interfaces/CreateStepMeasurementDto";

export const useStepsMeasurement = () => {
  const [steps, setSteps] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const restManager = useRestManager();

  useEffect(() => {
    const fetchStepsData = async () => {
      try {
        setLoading(true);

        const isInitialized = await initialize();
        if (!isInitialized) {
          throw new Error("Health Connect client could not be initialized");
        }

        const grantedPermissions = await requestPermission([
          { accessType: "read", recordType: "Steps" },
        ]);

        const stepsPermissionGranted = grantedPermissions.some(
          (permission) => permission.recordType === "Steps" && permission.accessType === "read"
        );

        setPermissionGranted(stepsPermissionGranted);

        if (!stepsPermissionGranted) {
          throw new Error("Steps permission not granted");
        }

        // Get current date
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch steps data
        const { records } = await readRecords("Steps", {
          timeRangeFilter: {
            operator: "between",
            startTime: startOfDay.toISOString(),
            endTime: endOfDay.toISOString(),
          },
        });

        console.log("Health Connect result:", JSON.stringify(records, null, 2));

        // Calculate total steps
        let totalSteps = 0;
        if (records && records.length > 0) {
          totalSteps = records.reduce((sum, record) => sum + record.count, 0);

          // Send data to backend
          const stepData: CreateStepMeasurementDto = {
            start_time: startOfDay.toISOString(),
            end_time: endOfDay.toISOString(),
            step_count: totalSteps,
            source: "health-connect",
          };

          await saveStepMeasurement(restManager, stepData);
        }

        setSteps(totalSteps);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching steps data:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    };

    fetchStepsData();
  }, []);

  return { steps, loading, error, permissionGranted };
};
