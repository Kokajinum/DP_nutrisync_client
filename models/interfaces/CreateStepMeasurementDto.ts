export interface CreateStepMeasurementDto {
  start_time: string;
  end_time: string;
  step_count: number;
  source?: string;
}

export interface StepMeasurementResponseDto {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  step_count: number;
  source: string;
  created_at: string;
  updated_at: string;
}
