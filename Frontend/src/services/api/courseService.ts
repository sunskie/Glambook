// // Frontend/src/services/api/courseService.ts
// import api from '../../utils/api';

// export interface CreateCourseData {
//   title: string;
//   description: string;
//   category: string;
//   price: number;
//   discountPrice?: number;
//   duration: number;
//   level: string;
//   whatYouWillLearn: string[];
//   requirements: string[];
//   courseFormat: {
//     theoryHours: number;
//     practicalHours: number;
//     onlineContent: boolean;
//     physicalClasses: boolean;
//   };
//   instructorName: string;
//   instructorBio?: string;
//   certificateIncluded: boolean;
//   lessons?: any[];
//   batches?: any[];
// }

// export interface CourseFilters {
//   category?: string;
//   level?: string;
//   minPrice?: number;
//   maxPrice?: number;
//   search?: string;
// }

// const courseService = {
//   // Get all courses with filters
//   getAllCourses: async (filters?: CourseFilters) => {
//     const params = new URLSearchParams();
    
//     if (filters) {
//       Object.entries(filters).forEach(([key, value]) => {
//         if (value !== undefined && value !== null && value !== '') {
//           params.append(key, value.toString());
//         }
//       });
//     }

//     const queryString = params.toString();
//     const url = queryString ? `/courses?${queryString}` : '/courses';
    
//     const response = await api.get(url);
//     return response.data;
//   },

//   // Get single course by ID
//   getCourseById: async (id: string) => {
//     const response = await api.get(`/courses/${id}`);
//     return response.data;
//   },

//   // Get vendor's courses
//   getMyCourses: async () => {
//     const response = await api.get('/courses/vendor/my-courses');
//     return response.data;
//   },

//   // Create course (Vendor)
//   createCourse: async (courseData: FormData) => {
//     const response = await api.post('/courses', courseData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response;
//   },

//   // Update course (Vendor)
//   updateCourse: async (id: string, courseData: FormData) => {
//     const response = await api.put(`/courses/${id}`, courseData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response;
//   },

//   // Delete course
//   deleteCourse: async (id: string) => {
//     const response = await api.delete(`/courses/${id}`);
//     return response;
//   },

//   // Add lesson to course
//   addLesson: async (courseId: string, lessonData: any) => {
//     const response = await api.post(`/courses/${courseId}/lessons`, lessonData);
//     return response;
//   },

//   // Add batch to course
//   addBatch: async (courseId: string, batchData: any) => {
//     const response = await api.post(`/courses/${courseId}/batches`, batchData);
//     return response;
//   },
// };

// export default courseService;



import api from '../../utils/api';

export interface CourseFilters {
  category?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

const courseService = {
  // GET /courses  → { success, count, data: Course[] }
  getAllCourses: async (filters?: CourseFilters) => {
    const params: Record<string, any> = {};
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params[k] = v;
      });
    }
    const response = await api.get('/courses', { params });
    return response; // callers: res.data for the array
  },

  // GET /courses/:id  → { success, data: Course }
  getCourseById: async (id: string) => {
    const response = await api.get(`/courses/${id}`);
    return response; // callers: res.data for the course object
  },

  // GET /courses/vendor/my-courses  → { success, count, data: Course[] }
  getMyCourses: async () => {
    const response = await api.get('/courses/vendor/my-courses');
    return response; // callers: res.data for the array
  },

  // POST /courses (multipart)
  createCourse: async (courseData: FormData) => {
    const response = await api.post('/courses', courseData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  },

  // PUT /courses/:id (multipart)
  updateCourse: async (id: string, courseData: FormData) => {
    const response = await api.put(`/courses/${id}`, courseData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  },

  // DELETE /courses/:id
  deleteCourse: async (id: string) => {
    const response = await api.delete(`/courses/${id}`);
    return response;
  },

  // POST /courses/:id/lessons
  addLesson: async (courseId: string, lessonData: any) => {
    const response = await api.post(`/courses/${courseId}/lessons`, lessonData);
    return response;
  },

  // POST /courses/:id/batches
  addBatch: async (courseId: string, batchData: any) => {
    const response = await api.post(`/courses/${courseId}/batches`, batchData);
    return response;
  },
};

export default courseService;