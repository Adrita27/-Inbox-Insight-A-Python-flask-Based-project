import sqlite3

# Connect to your SQLite database
conn = sqlite3.connect('emails.db')

# Create a cursor object to execute SQL statements
cursor = conn.cursor()

# Execute a SELECT statement to fetch data from the temp_emails table
cursor.execute("SELECT * FROM emails")

# Fetch all rows returned by the SELECT statement
rows = cursor.fetchall()

# Iterate over the rows to print column information
for row in rows:
    print(row)

# Close the cursor and connection
cursor.close()
conn.close()
