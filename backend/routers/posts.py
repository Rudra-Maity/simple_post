from fastapi import APIRouter, status
from typing import List
from controllers.posts import post_controller, Post, PostBase

router = APIRouter(
    prefix="/posts",
    tags=["posts"]
)

@router.get("", response_model=List[Post], status_code=status.HTTP_200_OK)
def get_posts():
    # Route directly to the controller layer
    return post_controller.get_all_posts()

@router.post("", response_model=Post, status_code=status.HTTP_201_CREATED)
def create_post(post_in: PostBase):
    # Route directly to the controller layer
    return post_controller.create_new_post(post_in)

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int):
    # Route directly to the controller layer
    post_controller.delete_single_post(post_id)
    return