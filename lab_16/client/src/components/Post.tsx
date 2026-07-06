import type { Comment, Post } from "../interfaces";
import CommentCard from "./Comment";

export default function PostCard({
    post,
    comments = [],
}: {
    post: Post;
    comments?: Comment[];
}) {
    const postComments = comments.filter((comment) => comment.postId === post.id);

    return (
        <div>
            <h1>{post.title}</h1>
            <p>{post.content}</p>
            <p>{post.userId}</p>
            <p>{post.createdAt.toLocaleDateString()}</p>
            <p>{post.updatedAt.toLocaleDateString()}</p>
            {postComments.length > 0 && (
                <section>
                    <h2>Comments</h2>
                    {postComments.map((comment) => (
                        <CommentCard key={comment.id} comment={comment} />
                    ))}
                </section>
            )}
        </div>
    );
}