from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import openai
import os
import shelve
from dotenv import load_dotenv
import time

app = Flask(__name__)
CORS(app) 

load_dotenv()
OPEN_AI_API_KEY = os.getenv("OPEN_AI_API_KEY")
client = openai.OpenAI(api_key=OPEN_AI_API_KEY)
assistant_id = "Your Assitant ID" 


def get_or_create_thread():
    with shelve.open("thread_db") as db:
        thread_id = db.get("thread_id")
        if not thread_id:
            thread = client.beta.threads.create()
            thread_id = thread.id
            db["thread_id"] = thread_id
        return thread_id

def run_assistant(thread_id):
    run = client.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=assistant_id,
    )

    while run.status != "completed":
        time.sleep(0.5)
        run = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)

    messages = client.beta.threads.messages.list(thread_id=thread_id)
    if messages.data:
        # 0 or -1
        new_message = messages.data[0].content[0].text.value
        return new_message
    else:
        raise Exception("No messages found in the thread response.")

@app.route('/api/message', methods=['POST'])
def handle_message():
    data = request.get_json()
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    thread_id = get_or_create_thread()

    try:
        client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=user_message,
        )
        assistant_reply = run_assistant(thread_id)
        
        return jsonify({"response": assistant_reply})

    except Exception as e:
        print(f"Error communicating with OpenAI API: {e}")
        return jsonify({"response": "We're having a hard time connecting with our system to handle your request."}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)