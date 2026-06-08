from fastapi import HTTPException, status
from pydantic import BaseModel, Field
from typing import List

# Data Models
class PostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    body: str = Field(..., min_length=1)

class Post(PostBase):
    id: int

# Controller Business Logic State
class PostController:
    def __init__(self):
        self.posts_db: List[Post] = []
        self.current_id: int = 1

    def get_all_posts(self) -> List[Post]:
        """Business logic for retrieving all items."""
        return self.posts_db

    def create_new_post(self, post_in: PostBase) -> Post:
        """Business logic for saving a record and managing IDs."""
        new_post = Post(id=self.current_id, title=post_in.title, body=post_in.body)
        self.posts_db.append(new_post)
        self.current_id += 1
        return new_post

    def delete_single_post(self, post_id: int) -> None:
        """Business logic for evaluating existance and removal."""
        post_exists = any(post.id == post_id for post in self.posts_db)
        
        if not post_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Post with ID {post_id} does not exist."
            )
        
        self.posts_db = [post for post in self.posts_db if post.id != post_id]

# Singleton instance of controller to persist state across router calls
post_controller = PostController()