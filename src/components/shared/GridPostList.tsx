import { Models } from "appwrite"
import { useUserContext } from "../../context/AuthContext"


type GridPostListProps = {
    posts: Models.Document[]
}

const GridPostList = ({ posts }: GridPostListProps) => {

    const { user } = useUserContext();

    return (
    <div>GridPostList</div>
  )
}

export default GridPostList