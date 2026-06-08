from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import posts
from fastapi.staticfiles import StaticFiles


app = FastAPI(title="Post Management API (MVC Architecture)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach the modularized endpoint router
app.include_router(posts.router)

# app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="frontend")
