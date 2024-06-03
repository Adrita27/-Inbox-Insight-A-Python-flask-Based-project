from flask import Flask, request, jsonify,g
from flask_cors import CORS
import re
import google.generativeai as genai
import sqlite3
import hashlib
import imaplib
import email
from email.header import decode_header
from email.utils import parsedate_to_datetime


app = Flask(__name__)
cors = CORS(app)


def fetch_emails(email_address, password):
    # IMAP settings
    IMAP_SERVER = 'imap.gmail.com'

    # Connect to Gmail server
    mail = imaplib.IMAP4_SSL(IMAP_SERVER)
    mail.login(email_address, password)
    
    # Select the INBOX mailbox
    mail.select('INBOX')

    # Search for emails in the primary inbox category (excluding other categories)
    # Use the X-GM-RAW search criteria
    result, data = mail.search(None, '(X-GM-RAW "category:primary")')
    
    # Extract email IDs from search results
    email_ids = data[0].split()

    # Fetch the last two emails
    if len(email_ids) >= 2:
        last_two_ids = email_ids[-5:]
    else:
        last_two_ids = email_ids

    # Fetch the last two emails
    emails = []
    for num in last_two_ids:
        # Fetch the email data
        result, data = mail.fetch(num, '(RFC822)')
        raw_email = data[0][1]

        # Parse raw email
        msg = email.message_from_bytes(raw_email)

        # Append email to the list
        emails.append(msg)

    # Close the connection
    mail.close()
    mail.logout()

    return emails

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect('emails.db')
        create_table_if_not_exists(db)
    return db

def get_user_db():
    db = getattr(g,'_database',None)
    if db is None:
        db = g._database = sqlite3.connect('users.db')
        create_user_table_if_not_exists(db)
    return db

def get_email_temp_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect('temp_emails.db')
        create_emails_table_if_not_exists(db)
    return db
# Function to create the 'emails' table if it doesn't exist
def create_table_if_not_exists(db):
    cursor = db.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS emails
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      email_time TEXT UNIQUE,
                      sender_name TEXT,
                      receiver_name TEXT,
                      receiver_cc TEXT,
                      body_summary TEXT UNIQUE,
                      subject TEXT,
                      status TEXT DEFAULT 'Pending')''')
    db.commit()
    cursor.close()

def create_user_table_if_not_exists(db):
    cursor = db.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS users
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      email TEXT UNIQUE,
                      password TEXT)''')
    db.commit()
    cursor.close()

def create_emails_table_if_not_exists(db):
    cursor = db.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS temp_emails
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      email_time TEXT UNIQUE,
                      sender_name TEXT,
                      receiver_name TEXT,
                      receiver_cc TEXT,
                      body_summary TEXT UNIQUE,
                      subject TEXT UNIQUE,
                      shown INTEGER DEFAULT 1)''')
    db.commit()
    cursor.close()

@app.route('/summarize_emails', methods=['POST'])
def summarize_emails():
    data = request.get_json()
    # emails = fetch_emails("adian57011@gmail.com", "yvtk euow ayjc dgcm")
    emails = fetch_emails(data["email"],data["password"])
    results = []

    for email in emails:
        # Extract text content from email object
        # email_text = email.as_string()
                # Extract plain text body
                # Extract plain text body
        # payload = email.get_payload(decode=True)
        # email_text = payload.decode("utf-8") if payload else ""

        for part in email.walk():
            if part.get_content_type() == "text/plain":
                email_text = part.get_payload(decode=True).decode(part.get_content_charset())
                break
            else:
                email_text = ""

        # Parse email content
        sender_match = email["From"] if "From" in email else "Sender not found"
        sender_name = email["From"] if "From" in email else "Sender not found"

        receiver_match = email["To"] if "To" in email else "Receiver not found"
        receiver_name = email["To"] if "To" in email else "Receiver not found"

        receiver_match_1 = re.search(r"Cc: (.+)", email_text)
        receiver_name_1 = email["Cc"] if "Cc" in email else "Receiver not found"

        #Extract Subject 
        subject = email["Subject"] if email["Subject"] else "Subject not found"

        # Extract time from email headers
        time = email['Date']
        if time:
            time = parsedate_to_datetime(time).strftime("%a %m/%d/%Y %H:%M")
        else:
            time = "Time not found"

        # Generate summary of email body using GenerativeAI
        genai.configure(api_key="AIzaSyA3sAtKjuu-kCLnGsY4uXG_G8a11cSP3Ok")
        model = genai.GenerativeModel('gemini-pro')
        # response = model.generate_content("Make a very short summarization of the email body: " + email_text)
        response = model.generate_content("Make a short summary in two lines of the following email '" + email_text + "'")

        # Verify GenerativeAI response structure and extract body summary
        if hasattr(response, '_result') and response._result and hasattr(response._result, 'candidates') and response._result.candidates:
            body_summary = response._result.candidates[0].content.parts[0].text
            results.append([sender_name, receiver_name, receiver_name_1, time, body_summary,subject])

    num_results = len(results)
    print("Number of elements in results:", num_results)
    try:
        db = get_email_temp_db()
        cursor = db.cursor()
        for entry in results:
            cursor.execute('''INSERT OR IGNORE INTO temp_emails 
                          (email_time, sender_name, receiver_name, receiver_cc, body_summary,subject) 
                          VALUES (?, ?, ?, ?, ?,?)''',
                           (entry[3], entry[0], entry[1], entry[2], entry[4],entry[5]))

        db.commit()
        print("Data Inserted in the temp_db column")
        return jsonify({"message": "OK"})
    except Exception as e:
        db.rollback()
        print("Error:", e)
        return jsonify({"message": "Failed", "error": str(e)})
    finally:
        cursor.close()
        db.close()


@app.route('/get_emails', methods=['GET'])
def get_emails():
    try:
        db = get_email_temp_db()
        cursor = db.cursor()
        cursor.execute('''SELECT * FROM temp_emails WHERE shown = ?''', (1,))
        emails = cursor.fetchall()
        cursor.close()
        return jsonify(emails)
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500


# Route to save email
@app.route('/save_email', methods=['POST'])
def save_email():
    data = request.get_json()  # Get the JSON data from the request
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute('''INSERT or IGNORE INTO emails (email_time, sender_name, receiver_name, receiver_cc, body_summary,subject)
                           VALUES (?, ?, ?, ?, ?,?)''',
                       (data['Email Time'], data['Sender Name'], data['Receiver Name'], data['Receiver CC'], data['Body Summary'],data['Subject']))
        db.commit()
        return jsonify({"message": "Email saved successfully"})
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()

@app.route('/delete_email', methods=['POST'])
def delete_email():
    data = request.get_json()
    print(data)
    if 'Email Time' in data and 'Sender Name' in data and 'Subject' in data:
        try:
            db = get_email_temp_db()
            cursor = db.cursor()
            cursor.execute('''UPDATE temp_emails 
                              SET shown = 0 
                              WHERE email_time = ? 
                              AND sender_name = ? 
                              AND subject = ?''',
                           (data['Email Time'], data['Sender Name'], data['Subject']))
            db.commit()
            return jsonify({"message": "OK"})
        except Exception as e:
            db.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            cursor.close()
    else:
        return jsonify({"error": "Email Time, Sender Name, and Body Summary are required"}), 400


@app.route('/update_processing', methods=['POST'])
def update_processing():
    data = request.get_json()
    print(data)
    if 'Email Time' in data and 'Sender Name' in data and 'Subject' in data:
        try:
            db = get_db()
            cursor = db.cursor()
            cursor.execute('''UPDATE emails 
                              SET status = 'Processing' 
                              WHERE email_time = ? 
                              AND sender_name = ? 
                              AND subject = ?''',
                           (data['Email Time'], data['Sender Name'], data['Subject']))
            db.commit()
            return jsonify({"message": "OK"})
        except Exception as e:
            db.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            cursor.close()
    else:
        return jsonify({"error": "Email Time, Sender Name, and Body Summary are required"}), 400

@app.route('/get_saved_emails', methods=['GET'])
def get_saved_emails():
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''SELECT * FROM emails ''')
        emails = cursor.fetchall()
        cursor.close()
        return jsonify(emails)
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # Hash the password before storing it in the database
    hashed_password = hashlib.sha256(password.encode()).hexdigest()

    db = get_user_db()
    cursor = db.cursor()
    try:
        cursor.execute('''INSERT INTO users (email, password)
                          VALUES (?, ?)''',
                       (email, hashed_password))
        db.commit()
        return jsonify({"message": "OK"})
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    db = get_user_db()
    cursor = db.cursor()
    cursor.execute('''SELECT * FROM users WHERE email = ?''', (email,))
    user = cursor.fetchone()

    if user:
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        if user[2] == hashed_password:
            return jsonify({"message": "OK", "email": email})
        else:
            return jsonify({"error": "Incorrect password"}), 401
    else:
        return jsonify({"error": "User not found"}), 404



if __name__ == '__main__':
    app.run(debug=True)
