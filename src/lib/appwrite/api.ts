import { INewUser, IUploadedFile } from "../../types";
import { ID, Query } from "appwrite";
import { account, appwriteConfig, avatars, databases, storage } from "./config";
import { INewPost } from "../../types";

export async function createUserAccount (user: INewUser) {
    try {
       const newAccount = await account.create (
            ID.unique(),
            user.email,
            user.password,
            user.name
       ) 

       if (!newAccount) throw Error;

       const avatarUrl = avatars.getInitials(user.name); 
       
       const newUser = await saveUserToDB({
        accountId: newAccount.$id,
        name: newAccount.name,
        email: newAccount.email,
        username: user.username,
        imageUrl: avatarUrl,
       })

       return newUser;
    }
    catch (error){
        console.log(error);
        return error;
    }
    
}

export async function saveUserToDB (user: {

    accountId: string;
    email: string;
    name: string;
    imageUrl: URL;
    username?: string;

}) {

    try {

        const newUser = await databases.createDocument (
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user,
        )

        return newUser;

    } catch (error) {
        console.log(error);
    }
}

export async function signInAccount(user: { email: string; password: string }) {
    try {
      // Ensure user is logged out
      try {
        await account.deleteSession('current');
      } catch (logoutError) {
        // If there's an error, it might be because no session exists; ignore it
        console.error("Logout error (likely no active session):", logoutError);
      }
  
      // Create a new session
      const session = await account.createEmailPasswordSession(user.email, user.password);
      return session;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  }

export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments (
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )
        if (!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
    }
}

export async function signOutAccount() {
    try {
        const session = await account.deleteSession("current");
        return session;
    } catch (error) {
        console.log(error);
    }
}


export const createPost = async (post: INewPost) => {
    try {
      // Upload files to storage and get imageUrl and imageId for each file
      const uploadedFiles = await Promise.all(post.files.map(file => uploadFile(file)));
  
      // Map uploaded files to the format expected by your database
      const filesData = uploadedFiles.map(file => ({
        imageUrl: file.imageUrl,
        imageId: file.imageId,
      }));
  
      // Construct the new post object to be stored in the database
      const newPost = {
        caption: post.caption,
        location: post.location,
        tags: post.tags.split(','), // Convert tags string to array
        // Add other attributes as needed by your collection schema
      };
  
      // Create document in the database
      const createdPost = await databases.createDocument(
        '6689c1e9000b929ee942', // Replace with your database ID
        '6689c24700108fe45a5c', // Replace with your collection ID
        ID.unique(), // Unique ID, or provide your own
        newPost // Pass the constructed new post object
      );
  
      return createdPost; // Return the created post document
    } catch (error) {
      console.error('Failed to create post:', error);
      throw new Error('Failed to create post'); // Throw an error if creation fails
    }
  };
  

  export async function uploadFile(file: File): Promise<IUploadedFile> {
    try {
      // Upload file to Appwrite storage
      const response = await storage.createFile('6689c186003124c10cf3', ID.unique(), file);
  
      // Construct the imageUrl based on your Appwrite configuration
      const imageUrl = storage.getFileView('6689c186003124c10cf3', response.$id).href;
  
      return {
        imageId: response.$id,
        imageUrl: imageUrl,
      };
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw new Error('Failed to upload file');
    }
  }