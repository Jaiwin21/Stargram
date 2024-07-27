import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
    QueryFunctionContext,
    QueryKey
} from '@tanstack/react-query';
import { createPost, createUserAccount, deletePost, deleteSavePost, getCurrentUser, getInfinitePosts, getPostById, getRecentPosts, likePost, savePost, searchPosts, signInAccount, signOutAccount, updatePost } from '../appwrite/api';
import { INewPost, INewUser, IUpdatePost } from '../../types';
import { QUERY_KEYS } from './queryKeys';

import { Models } from 'appwrite';

export const useCreateUserAccount = () => {
    return useMutation ({
        mutationFn: (user: INewUser) => createUserAccount(user)
    }); 
}

export const useSignInAccount = () => {
    return useMutation ({
        mutationFn: ( user: {
            email: string;
            password: string;
    }) => signInAccount(user)
    });
}

export const useSignOutAccount = () => {
    return useMutation ({
        mutationFn: signOutAccount
    });
}


// export const useCreatePost = () => {
//     const queryClient = useQueryClient();
    
//     return useMutation({
//       mutationFn: (post: INewPost) => createPost(post), // Ensure createPost is a function returning a promise
//       onSuccess: () => {
//         queryClient.invalidateQueries({
//           queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
//         });
//       },
//     });
//   };

export const useCreatePost = () => {
    const queryClient = useQueryClient();

    return useMutation ({
        mutationFn: (post: INewPost) => createPost(post),
        onSuccess: () => {
            queryClient.invalidateQueries ({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
        }
    })
}

export const useGetRecentPosts = () => {
    return useQuery ({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        queryFn: getRecentPosts,
    })
}

export const useLikePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, likesArray }: { postId: string; likesArray: string[] }) => likePost(postId, likesArray),
        onSuccess: (data) => {
            queryClient.invalidateQueries ({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id]
            })
            queryClient.invalidateQueries ({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            queryClient.invalidateQueries ({
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            queryClient.invalidateQueries ({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })
}

export const useSavePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, userId }: { postId: string; userId: string }) => savePost(postId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries ({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            queryClient.invalidateQueries ({
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            queryClient.invalidateQueries ({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })
}

export const useDeleteSavedPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (savedRecordId: string) => deleteSavePost(savedRecordId),
        onSuccess: () => {
            queryClient.invalidateQueries ({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            queryClient.invalidateQueries ({
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            queryClient.invalidateQueries ({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })
}

export const useGetCurrentUser = () => {
    return useQuery ({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        queryFn: getCurrentUser
    })
}

export const useGetPostById = (postId: string) => {
    return useQuery ({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
        queryFn: () => getPostById(postId),
        enabled: !!postId
    })
}

export const useUpdatePost = () => {
    const queryClient = useQueryClient();
    
    return useMutation ({
        mutationFn: (post: IUpdatePost) => updatePost(post),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id]
            })
        }
    })
}

// Requires work
export const useDeletePost = () => {
    const queryClient = useQueryClient();
    
    return useMutation ({
        mutationFn: ({ postId, imageId}: { postId: string, imageId: string}) => deletePost(postId, imageId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
        }
    })
}


export const useGetPosts = () => {
    return useInfiniteQuery<Models.DocumentList<Models.Document>, Error>({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
        queryFn: async ({ pageParam }: QueryFunctionContext<QueryKey, unknown>) => {
            // Ensure pageParam is handled as unknown initially and then cast appropriately
            const cursor = pageParam as string | undefined;
            return getInfinitePosts({ pageParam: cursor });
        },
        getNextPageParam: (lastPage) => {
            if (!lastPage || !lastPage.documents || lastPage.documents.length === 0) return null;
            const lastDocument = lastPage.documents[lastPage.documents.length - 1];
            return lastDocument.$id;
        },
        initialPageParam: undefined,
    });
};



export const useSearchPosts = (searchTeam: string) => {
    return useQuery ({
        queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTeam],
        queryFn: () => searchPosts(searchTeam),
        enabled: !!searchTeam
    })
}