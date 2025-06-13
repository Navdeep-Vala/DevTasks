export type status = 'Pending' | 'In-progress' | 'Completed' | 'On-hold';

export type Task = {
    id: string;
    titile: string;
    description: string;
    project: string;
    status : status,
    dueDate: Date;
}