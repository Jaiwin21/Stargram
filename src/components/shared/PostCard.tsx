import { Models } from "appwrite"
import { Link } from "react-router-dom";
import { formatDateString } from "../../lib/utils";
import { useUserContext } from "../../context/AuthContext";


type PostCardProps = {
    post: Models.Document;
}


const PostCard = ({ post }: PostCardProps) => {
   
    const { user } = useUserContext();

    if(!post.creator) return;

   
    // Ensure that creator is not null or undefined
    if (!post.creator) {
        return null; // or render a placeholder/error message
    }

    const creatorId = post.creator.$id || "unknown"; // Handle undefined creator ID
    const creatorImageUrl = post.creator.imageUrl || '/assets/icons/profile-placeholder.svg'; // Handle undefined creator image URL
  
    return (
      <div className="post-card">
        <div className="flex-between">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${creatorId}`}>
              <img 
                src={creatorImageUrl}
                alt="creator"
                className="rounded-full w-12 lg:h-12" 
              />
            </Link>

            <div className="flex flex-col">
                <p className="base-medium lg:body-body text-light-1">
                    {post.creator.name}
                </p>
            <div className="flex-center gap-2 text-light-3">
                <p className="subtle-semibold lg:small-regular">
                    {formatDateString(post.$createdAt)}
                </p>
                -
                <p className="subtle-semibold lg:small-regular">
                    {post.location}
                </p>
            </div>
            </div>
          </div>

            <Link to={`/update-post/${post.$id}`}
            // Hides the edit button from posts that are not yours
            className={`${user.id !== post.creator.$id} && hidden`}
            >
            <img src="/assets/icons/edit.svg" alt="edit" width={20} height={20} />
            </Link>

        </div>
      </div>
    );
  }
  
  export default PostCard;