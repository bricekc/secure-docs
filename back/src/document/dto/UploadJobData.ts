export interface UploadFileJob {
  name: string;
  fileBuffer: { type: 'Buffer'; data: number[] };
  originalFilename: string;
  userId: number;
  userEmail: string;
}

export interface UpdateFileJob {
  id: number;
  fileBuffer: { type: 'Buffer'; data: number[] };
  originalFilename: string;
  userEmail: string;
}
