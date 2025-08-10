import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: ["Exam"],
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    login: builder.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    startExam: builder.mutation({
      query: (body) => ({ url: "/exam/start", method: "POST", body }),
    }),
    getSession: builder.query({
      query: (id) => `/exam/session/${id}`,
      providesTags: ["Exam"],
    }),
    autosave: builder.mutation({
      query: (body) => ({ url: "/exam/autosave", method: "POST", body }),
    }),
    submit: builder.mutation({
      query: (body) => ({ url: "/exam/submit", method: "POST", body }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useStartExamMutation,
  useGetSessionQuery,
  useAutosaveMutation,
  useSubmitMutation,
} = api;
