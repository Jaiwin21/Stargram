import { INewUser } from "../../types";
import { ID, Query } from "appwrite";
import { account, appwriteConfig, avatars, databases } from "./config";

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