import { INewUser, IUpdatePost, IUploadedFile } from "../../types";
import { ID, ImageGravity, Query } from "appwrite";
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


export async function createPost(post: INewPost) {
    try {
        const uploadedFile = await uploadFile(post.file[0]);
        if (!uploadedFile) throw new Error("File upload failed");

        const fileUrl = await getFilePreview(uploadedFile.$id);
        if (!fileUrl) {
            await deleteFile(uploadedFile.$id);
            throw new Error("Failed to get file preview URL");
        }

        const tags = post.tags.replace(/ /g, '').split(',');

        const newPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            ID.unique(),
            {
                creator: post.userId,
                caption: post.caption,
                imageUrl: fileUrl.href, // Ensure fileUrl is a string
                imageId: uploadedFile.$id,
                location: post.location,
                tags: tags,
            }
        );

        if (!newPost) {
            await deleteFile(uploadedFile.$id);
            throw new Error("Failed to create post");
        }

        return newPost;
    } catch (error) {
        console.error("Failed to create post:", error);
        throw error;
    }
}

export async function uploadFile(file: File) {
    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file
        );
        return uploadedFile;
    } catch (error) {
        console.error("File upload failed:", error);
        throw error;
    }
}

export async function getFilePreview(fileId: string) {
    try {
        const fileUrl = storage.getFilePreview(
            appwriteConfig.storageId,
            fileId,
            2000,
            2000,
            'center' as ImageGravity,
            100
        );
        return fileUrl;
    } catch (error) {
        console.error("Failed to get file preview:", error);
        throw error;
    }
}

export async function deleteFile(fileId: string) {
    try {
        await storage.deleteFile(appwriteConfig.storageId, fileId);
        return { status: 'Ok' };
    } catch (error) {
        console.error("Failed to delete file:", error);
        throw error;
    }
}



export async function getRecentPosts() {
    const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        [Query.orderDesc('$createdAt'), Query.limit(20)]
    )

    if(!posts) throw Error;

    return posts
}


export async function likePost(postId: string, likesArray: string[]) {
    try {

        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,
            {
                likes: likesArray
            }
        )

        if(!updatedPost) throw Error;
        return updatedPost;
    } catch (error) {
        console.log(error);
    }
}



export async function savePost(postId: string, userId: string) {
    try {

        const updatedPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            ID.unique(),
            {
                user: userId,
                post: postId,
            }
        )

        if(!updatedPost) throw Error;
        return updatedPost;
    } catch (error) {
        console.log(error);
    }
}


export async function deleteSavePost(savedRecordId: string) {
    try {

        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            savedRecordId,
        )

        if(!statusCode) throw Error;
        return { status: "ok" }
    } catch (error) {
        console.log(error);
    }
}


export async function getPostById(postId: string) {
    try {
        const post = await databases.getDocument (
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        )
        return post;
    } catch (error) {
        console.log(error);
    }
}



export async function updatePost(post: IUpdatePost) {
    const hasFileToUpdate = post.file.length > 0;
    try {
        
        let image = {
            imageUrl: post.imageUrl,
            imageId: post.imageId,
        }

        if (hasFileToUpdate) {
            const uploadedFile = await uploadFile(post.file[0]); 
            if (!uploadedFile) throw new Error("File upload failed");

            const fileUrl = await getFilePreview(uploadedFile.$id);
            if (!fileUrl) {
                await deleteFile(uploadedFile.$id);
                throw new Error("Failed to get file preview URL");
            }

            image = {...image, imageUrl: fileUrl, imageId: uploadedFile.$id}
        }

        
        



        const tags = post.tags?.replace(/ /g, '').split(',');

        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            post.postId,
            {
                caption: post.caption,
                imageUrl: image.imageUrl, // Ensure fileUrl is a string
                imageId: image.imageId,
                location: post.location,
                tags: tags,
            }
        );

        if (!updatedPost) {
            await deleteFile(post.imageId);
            throw new Error("Failed to create post");
        }

        return updatedPost;
    } catch (error) {
        console.error("Failed to create post:", error);
        throw error;
    }
}














// export const createPost = async (post: INewPost) => {
//     try {
//       const uploadedFiles = await Promise.all(post.files.map(file => uploadFile(file)));
  
//       const filesData = uploadedFiles.map(file => ({
//         imageUrl: file.imageUrl,
//         imageId: file.imageId,
//       }));
  
//       const newPost = {
//         caption: post.caption,
//         location: post.location,
//         tags: post.tags.split(','), 
//         creator: post.userId, 
//         imageUrl: filesData[0]?.imageUrl, 
//         imageId: filesData[0]?.imageId,   
//       };
  
//       // Create document in the database
//       const createdPost = await databases.createDocument(
//         '6689c1e9000b929ee942', 
//         '6689c24700108fe45a5c', 
//         ID.unique(), 
//         newPost // Pass the constructed new post object
//       );
  
//       return createdPost; // Return the created post document
//     } catch (error) {
//       console.error('Failed to create post:', error);
//       throw new Error('Failed to create post'); // Throw an error if creation fails
//     }
//   };
  

//   export async function uploadFile(file: File): Promise<IUploadedFile> {
//     try {
//       // Upload file to Appwrite storage
//       const response = await storage.createFile('6689c186003124c10cf3', ID.unique(), file);
  
//       // Construct the imageUrl based on your Appwrite configuration
//       const imageUrl = storage.getFileView('6689c186003124c10cf3', response.$id).href;
  
//       return {
//         imageId: response.$id,
//         imageUrl: imageUrl,
//       };
//     } catch (error) {
//       console.error('Failed to upload file:', error);
//       throw new Error('Failed to upload file');
//     }
//   }