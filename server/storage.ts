// Storage interface for future use
// Currently the video calling app uses Stream.io for all user management
// This storage layer is kept for potential future enhancements

export interface IStorage {
  // Placeholder for future storage needs
}

export class MemStorage implements IStorage {
  // Currently unused - Stream.io handles all user data
}

export const storage = new MemStorage();
