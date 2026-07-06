import type { Comment } from "../interfaces";

export default function CommentCard({ comment }: { comment: Comment }) {
    return (
        <div>
            <p>{comment.content}</p>
            <p>{comment.userId}</p>
            <p>{comment.createdAt.toLocaleDateString()}</p>
            <p>{comment.updatedAt.toLocaleDateString()}</p>
        </div>
    );
}
