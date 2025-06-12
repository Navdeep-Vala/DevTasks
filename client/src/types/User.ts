export type User  = {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string; // Optional, in case the user does not have an avatar
    createdAt: Date; // Date when the user was created
    updatedAt: Date; // Date when the user was last updated
    isActive: boolean; // Indicates if the user is currently active
}