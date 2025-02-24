import json

# Load the JSON files
try:
    with open('questions.json', 'r') as f:
        questions_data = json.load(f)
except:
    print("Error: Cannot find questions.json file")
    exit(1)

try:
    with open('answers.json', 'r') as f:
        answers_data = json.load(f)
except:
    answers_data = {}

print(f"The user was asked the folling questions. A response of 'NO RESPONSE' indicates that the user did not respond to the question.\n")

# Create a dictionary mapping question names to their titles
questions = {q['name']: q['title'] for q in questions_data['elements']}

# Format and display each question with its answer
for q_name, title in questions.items():
    print(f"\n# {title}")
    
    # Get the corresponding answer if it exists
    answer_data = answers_data.get(q_name, {})
    user_answer = answer_data.get('value', 'NO RESPONSE')
    expected_answer = answer_data.get('correctAnswer', 'Unknown')
    is_correct = answer_data.get('isCorrect', False)
    
    # Print formatted results
    print(f"- user response: {user_answer}")
    print(f"- expected response: {expected_answer}")
    print(f"- is correct? {'yes' if is_correct else 'no'}")
