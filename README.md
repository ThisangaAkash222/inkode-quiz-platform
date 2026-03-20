# Inkode Quiz Platform

A full-stack web application built for the Inkode Founding Team Challenge. This platform allows Admins to create and manage quizzes, and Students to take timed quizzes and view their results.

## Tech Stack
* **Frontend:** Standard HTML, CSS (Custom Glassmorphism UI), Vanilla JavaScript
* **Backend:** Python with Flask
* **Database:** SQLite (Lightweight, file-based)

## Features Included
* Role-based authentication (Admin/Student)
* Single-page Application (SPA) feel using Vanilla JS DOM manipulation
* Admin: Create quizzes with custom durations and marks
* Admin: Add Single-answer and Multiple-answer MCQs
* Student: Browse available quizzes
* Student: Take quizzes with a live countdown timer that auto-submits
* Student: View immediate score calculations

## Setup Instructions (Local)
1. Ensure Python 3 is installed.
2. Clone this repository.
3. Install Flask: `pip install flask`
4. Run the server: `python app.py`
5. Open a browser and navigate to `http://127.0.0.1:5000`

## AI Usage Statement
In accordance with the challenge guidelines, AI (Google Gemini) was leveraged as a pair-programming tool. It was used primarily to rapidly generate boilerplate HTML/CSS layouts, structure the Flask routing, and debug frontend-to-backend JSON payload errors under the tight time constraint. All core logic flows (timer functionality, database schema, role routing) were actively guided and reviewed.