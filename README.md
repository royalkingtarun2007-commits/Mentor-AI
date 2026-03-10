# Task Management Backend API

A backend REST API built using FastAPI that allows users to create and manage tasks.

## Tech Stack
- Python
- FastAPI
- Pydantic
- Uvicorn

## Features
- Health check endpoint
- Create users
- Create tasks
- List all tasks
- Automatic API documentation (Swagger)

## API Endpoints
- GET /health
- POST /users
- POST /tasks
- GET /tasks

## How to Run
1. Install dependencies:
   pip install fastapi uvicorn
2. Run server:
   uvicorn main:app --reload
3. Open browser:
   http://127.0.0.1:8000/docs
