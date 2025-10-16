import z from "zod";
import { DesiredStatus, Installation, Models, Status } from "./project";

const MAX_INSTALLATIONS = 20;

export const analysisFormSchema = z.object({
    projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Project ID format').optional(),
    repository: z.string().url('Invalid URL.').min(1, 'URL is required.'),
    advancedOptions: z.object({
        aiModels: z.object({
            utility: z.array(z.object({ provider: z.string(), model: z.string() })).default([]),
            low: z.array(z.object({ provider: z.string(), model: z.string() })).default([]),
            medium: z.array(z.object({ provider: z.string(), model: z.string() })).default([]),
            high: z.array(z.object({ provider: z.string(), model: z.string() })).default([]),
            super: z.array(z.object({ provider: z.string(), model: z.string() })).default([]),
            backup: z.array(z.object({ provider: z.string(), model: z.string() })).default([]),
        }),
        installations: z.array(
            z.object({ name: z.string().min(1) })
        ).max(MAX_INSTALLATIONS, `Cannot add more than ${MAX_INSTALLATIONS} installations.`),
    }),
});

export interface AnalysisFormData {
    projectId?: string;
    repository: string;
    advancedOptions: {
        aiModels: Models;
        installations: { name: string }[];
    }
}

export interface TestReport {
    content: string;
}

export interface BuildReport {
    content: string;
}

export interface RunReport {
    content: string;
}

export interface Analysis {
    _id: string;
    userId: string;
    projectId?: string;
    repository: string;
    installations?: Installation[];
    models?: Models;
    cost: number;
    descriptions: Node[];
    
    testReport?: TestReport;
    buildReport?: BuildReport;
    runReport?: RunReport;
    
    free?: boolean;
    status: Status;
    desiredStatus: DesiredStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface Node {
    name: string;
    isContainer: boolean;
    description?: string;
    fingerprint?: number;
    
    // Fields for IDescriptionNode (Branch)
    children?: Node[];

    // Fields for IFileNode (Leaf)
    externalDependencies?: string[];
    internalDependencies?: string[];
    potentialBugs?: string[];
    styleIssues?: string[];
    securityConcerns?: string[];
    incompleteCode?: string[];
    performanceConcerns?: string[];
    
    // Mongoose timestamps
    createdAt: Date;
    updatedAt: Date;
}

export interface GetAnalysisResponse {
    success: boolean;
    data: Analysis;
}
