export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T,
    errors: string[]
}

export interface ApiListResponse<T> {
    success: boolean
    message: string
    data: {
        items: T[]
        pageNumber: number
        pageSize: number
        totalCount: number
        totalPages: number
        hasPreviousPage: boolean
        hasNextPage: boolean
    },
    errors: string[]
}