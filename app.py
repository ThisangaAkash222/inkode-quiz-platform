from flask import Flask, request, jsonify
import sqlite3
import json
import os

app = Flask(__name__, static_folder='.', static_url_path='')

# --- 1. Database Setup ---
def init_db():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (email TEXT UNIQUE, password TEXT, role TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS quizzes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, module TEXT, type TEXT, duration INTEGER, marks INTEGER)''')
    c.execute('''CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY AUTOINCREMENT, quiz_id INTEGER, type TEXT, text TEXT, options TEXT, correct_answers TEXT)''')
    
    # NEW: Table to store student scores
    c.execute('''CREATE TABLE IF NOT EXISTS submissions (id INTEGER PRIMARY KEY AUTOINCREMENT, student_name TEXT, quiz_title TEXT, score INTEGER, total INTEGER)''')
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def home():
    return app.send_static_file('index.html')

@app.route('/<path:path>')
def serve_html(path):
    return app.send_static_file(path)

# --- 2. Auth Endpoints ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    try:
        conn = sqlite3.connect('database.db')
        c = conn.cursor()
        c.execute("INSERT INTO users (email, password, role) VALUES (?, ?, ?)", (data['email'], data['password'], data['role']))
        conn.commit()
        return jsonify({"status": "success"})
    except sqlite3.IntegrityError:
        return jsonify({"status": "error", "message": "Email exists."}), 400
    finally:
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("SELECT role FROM users WHERE email=? AND password=?", (data['email'], data['password']))
    user = c.fetchone()
    conn.close()
    if user: return jsonify({"status": "success", "role": user[0]})
    return jsonify({"status": "error", "message": "Invalid credentials."}), 401

# --- 3. Quiz Endpoints ---
@app.route('/api/quizzes', methods=['POST'])
def create_quiz():
    data = request.json
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("INSERT INTO quizzes (title, module, type, duration, marks) VALUES (?, ?, ?, ?, ?)",
              (data['title'], data['module'], data['type'], data['duration'], data['marks']))
    quiz_id = c.lastrowid 
    for q in data.get('questions', []):
        c.execute("INSERT INTO questions (quiz_id, type, text, options, correct_answers) VALUES (?, ?, ?, ?, ?)",
                  (quiz_id, q['type'], q['text'], json.dumps(q['options']), json.dumps(q['correct_answers'])))
    conn.commit()
    conn.close()
    return jsonify({"status": "success", "message": "Quiz saved!"})

# NEW: Send all quizzes to the student page
@app.route('/api/get_quizzes', methods=['GET'])
def get_quizzes():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM quizzes")
    quizzes = [dict(row) for row in c.fetchall()]
    
    for qz in quizzes:
        c.execute("SELECT * FROM questions WHERE quiz_id=?", (qz['id'],))
        qz['questions'] = [dict(row) for row in c.fetchall()]
        for q in qz['questions']:
            q['options'] = json.loads(q['options'])
            q['correct_answers'] = json.loads(q['correct_answers'])
    conn.close()
    return jsonify(quizzes)

# NEW: Save a student's final score
@app.route('/api/submit_score', methods=['POST'])
def submit_score():
    data = request.json
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("INSERT INTO submissions (student_name, quiz_title, score, total) VALUES (?, ?, ?, ?)",
              (data['student_name'], data['quiz_title'], data['score'], data['total']))
    conn.commit()
    conn.close()
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)