import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const carsApi = createApi({
  reducerPath: 'carsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/cars',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    }
  }),
  tagTypes: ['Car'],
  endpoints: (builder) => ({
    getCars: builder.query<CarsResponse, CarsFilter>({
      query: (filters) => ({
        url: '',
        params: filters
      }),
      providesTags: ['Car']
    }),
    getCarById: builder.query<Car, string>({
      query: (id) => `/${id}`,
      providesTags: ['Car']
    }),
    createCar: builder.mutation<Car, CreateCarRequest>({
      query: (car) => ({
        url: '',
        method: 'POST',
        body: car
      }),
      invalidatesTags: ['Car']
    })
  })
})

export const { 
  useGetCarsQuery, 
  useGetCarByIdQuery, 
  useCreateCarMutation 
} = carsApi