export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Post {
    id: number;
    title: string;
    content: string;
    userId: number;
    createdAt: Date;
    updatedAt: Date;        
}

export interface Comment{
    id: number;
    content: string;
    userId: number;
    postId: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Company {
    id: number;
    name: string;
    address: string;
    employeeCount: number;
    budget: number;
}

export type AuditActionType = "login" | "logout" | "upload_audio";

export interface AuditEntry {
    id: number;
    userId: number;
    userName: string;
    action: AuditActionType;
    timestamp: Date;
    details?: string;
}