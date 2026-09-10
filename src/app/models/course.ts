export interface CourseScheduleSlot {

  day: number;

  start: string;

  end: string;

}

export interface Course {

  id: string;

  code: string;

  name: string;

  schedule?: CourseScheduleSlot[];

}